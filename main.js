import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { addAxes } from './helpers/utils';
import { Drone } from './parts/Drone';
import { floorMesh } from './parts/Floor';
import { doorMesh } from './parts/Door';

let debugCameraActive = true;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.shadowMap.enabled = true;

const scene = new THREE.Scene();
addAxes(scene, 100);
scene.add(new THREE.AmbientLight(0xffffff, 2));
const l = new THREE.DirectionalLight(0xffffaa, 5);
l.position.set(1000, 1000, 500);
scene.add(l);
scene.add(floorMesh());


const debugCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
debugCamera.position.set(-500, 0, 100);
debugCamera.up.set(0, 0, 1);

const controls = new OrbitControls(debugCamera, renderer.domElement);
controls.target.set(0, 0, 0);
controls.update();

let forwards = false;
let backward = false;
let left = false;
let right = false;
let up = false;
let down = false;
let closeLegs = false;
let extendRamp = false;

window.addEventListener('keydown', (ev) => {
  if (ev.code === 'KeyW') {
    forwards = true;
    backward = false;
  }
  if (ev.code === 'KeyS') {
    backward = true;
    forwards = false;
  }
  if (ev.code === 'KeyA') {
    left = true;
    right = false;
  }
  if (ev.code === 'KeyD') {
    right = true;
    left = false;
  }
  if ((!ev.shiftKey && ev.code === 'Space') || ev.code === 'KeyQ') {
    up = true;
    down = false;
  }
  if ((ev.shiftKey && ev.code === 'Space') || ev.code === 'KeyE') {
    down = true;
    up = false;
  }
});

window.addEventListener('keyup', (ev) => {
  if (ev.code === 'KeyW') forwards = false;
  if (ev.code === 'KeyS') backward = false;
  if (ev.code === 'KeyA') left = false;
  if (ev.code === 'KeyD') right = false;
  if ((!ev.shiftKey && ev.code === 'Space') || ev.code === 'KeyQ') up = false;
  if ((ev.shiftKey && ev.code === 'Space') || ev.code === 'KeyE') down = false;
});

window.addEventListener('keypress', (ev) => {
  if (ev.code === 'Digit1') {
    drone.useGroundFollowCam();
    debugCameraActive = false;
  }
  if (ev.code === 'Digit2') {
    drone.useBackFollowCam();
    debugCameraActive = false;
  }
  if (ev.code === 'Digit3') {
    drone.useLateralFollowCam();
    debugCameraActive = false;
  }
  if (ev.code === 'Digit4') {
    drone.useTopFollowCam();
    debugCameraActive = false;
  }
  if (ev.code === 'Digit5') debugCameraActive = true;
  if (ev.code === 'KeyT') closeLegs = !closeLegs;
  if (ev.code === 'KeyP') extendRamp = !extendRamp;
});

let time = 0;
const deltaTime = 5;
const drone = new Drone();
scene.add(drone.obj3D);
function animate(frameTime = 0) {
  requestAnimationFrame(animate);

  if (time < frameTime) {
    time = frameTime + deltaTime;

    if (forwards) drone.accelerateForward();
    else if (backward) drone.accelerateBackward();
    else drone.decelerateY();
    if (left) drone.rotateLeft();
    else if (right) drone.rotateRight();
    if (up) drone.accelerateUp();
    else if (down) drone.accelerateDown();
    else drone.decelerateZ();

    if (closeLegs && !drone.legsClosed) drone.closeLegs();
    if (!closeLegs && drone.legsClosed) drone.openLegs();
    if (extendRamp && !drone.rampExtended) drone.extendRamp();
    if (!extendRamp && drone.rampExtended) drone.retractRamp();

    drone.move();
    renderer.render(scene, debugCameraActive ? debugCamera : drone.camera);
  }
}

animate();
