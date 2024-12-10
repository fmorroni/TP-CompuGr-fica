import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Drone } from './parts/Drone';
import { floorMesh } from './parts/Floor';

let debugCameraActive = false;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.shadowMap.enabled = true;

const scene = new THREE.Scene();
scene.add(new THREE.AmbientLight(0xffffff, 2));
const dirLight = new THREE.DirectionalLight(0xffffaa, 3);
dirLight.castShadow = true;
const side = 140;
dirLight.shadow.camera.left = -side;
dirLight.shadow.camera.right = side;
dirLight.shadow.camera.bottom = -side;
dirLight.shadow.camera.top = side;
dirLight.shadow.camera.far = side * 10;
scene.add(dirLight, dirLight.target);
scene.add(floorMesh());

// const cameraHelper = new THREE.CameraHelper(dirLight.shadow.camera);
// scene.add(cameraHelper);

const debugCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 3000);
debugCamera.up.set(0, 0, 1);

const controls = new OrbitControls(debugCamera, renderer.domElement);

let forwards = false;
let backward = false;
let left = false;
let right = false;
let up = false;
let down = false;
let closeLegs = false;
let extendRamp = false;
let extendArms = true;

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
  if (ev.code === 'KeyH') extendArms = !extendArms;
});

let time = 0;
const deltaTime = 5;
const drone = new Drone();
drone.obj3D.translateZ(1000).translateX(1000);
scene.add(drone.obj3D);
debugCamera.position.copy(drone.obj3D.position);
debugCamera.position.z += 100;
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
    if (extendArms && !drone.armsExtended) drone.extendArms();
    if (!extendArms && drone.armsExtended) drone.retractArms();

    drone.move();
    controls.target.copy(drone.obj3D.position);
    dirLight.position.copy(drone.obj3D.position.clone().add(new THREE.Vector3(-30, -30, 70)));
    dirLight.target.position.copy(drone.obj3D.position.clone().add(new THREE.Vector3(0, 0, -100)));
    controls.update();
    drone.cubeCamera.update(renderer, scene);
    renderer.render(scene, debugCameraActive ? debugCamera : drone.camera);
  }
}

animate();
