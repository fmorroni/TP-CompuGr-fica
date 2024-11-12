import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import GUI from "lil-gui";
import { addAxes, makePhongMesh, makeXYZGUI } from "./helpers/utils";
import { drone } from "./parts/Drone";
import { floorMesh } from "./parts/Floor";

// const gui = new GUI();

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.shadowMap.enabled = true;

const scene = new THREE.Scene();
addAxes(scene, 100);
scene.add(new THREE.AmbientLight(0xffffff, 2));
scene.add(floorMesh());

const freeCamera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);
freeCamera.position.set(0, 0, 150);
freeCamera.up.set(0, 0, 1);
freeCamera.lookAt(0, 0, 0);

const controls = new OrbitControls(freeCamera, renderer.domElement);
controls.target.set(0, 5, 0);
controls.update();

const playerCamera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);

const cameras = [freeCamera, playerCamera];

const droneObject = drone();
scene.add(droneObject);

let forwards = false;
let backwards = false;
let left = false;
let rigth = false;

window.addEventListener("keydown", (ev) => {
  if (ev.code === "KeyW") forwards = true;
  if (ev.code === "KeyS") backwards = true;
  if (ev.code === "KeyA") left = true;
  if (ev.code === "KeyD") rigth = true;
});

window.addEventListener("keyup", (ev) => {
  if (ev.code === "KeyW") forwards = false;
  if (ev.code === "KeyS") backwards = false;
  if (ev.code === "KeyA") left = false;
  if (ev.code === "KeyD") rigth = false;
});

function animate() {
  requestAnimationFrame(animate);

  // if (forwards)
  renderer.render(scene, freeCamera);
}

animate();

function updatePlayerCamera() {
  const offset = new THREE.Vector3(0, 10, -20);

  const dronePosition = droneObject.position.clone();
  playerCamera.position.copy(dronePosition).add(offset);

  playerCamera.lookAt(dronePosition);
}
