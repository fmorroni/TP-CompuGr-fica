import * as THREE from 'three';
import { propellerCoverGeometry } from './Propeller';

export class Drone {
  constructor() {
    this.obj3D = new THREE.Object3D();
    this.unit = 45;
    this.length = this.unit * 6;
    this.width = this.unit * 4;
    this.propellerCoverRadius = this.unit;

    this.baseSpeed = new THREE.Vector3(1, 0.7, 0.5);
    this.currentSpeed = new THREE.Vector3(0, 0, 0);
    this.maxSpeed = new THREE.Vector3(10, 10, 5);
    this.maxPropellerRotation = (30 * Math.PI) / 180;
    this.propellerBaseRotation = 0.01;

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.up.set(0, 0, 1);

    this.backFollowCam = {
      camera: camera.clone(),
      offset: new THREE.Vector3(0, -100, 150),
    };
    this.lateralFollowCam = {
      camera: camera.clone(),
      offset: new THREE.Vector3(-300, 0, 250),
    };
    this.topFollowCam = {
      camera: camera.clone(),
      offset: new THREE.Vector3(0, -1, 500),
    };
    this.groundFollowCam = {
      camera: camera.clone(),
      offset: null,
    };

    this.activeCamera = this.backFollowCam;

    this.propellerFrontObj3D = new THREE.Object3D();
    this.propellerFrontObj3D.translateY(this.length / 2);
    this.propellerBackObj3D = new THREE.Object3D();
    this.propellerBackObj3D.translateY(-this.length / 2);
    this.obj3D.add(this.propellerFrontObj3D, this.propellerBackObj3D);
    this.#addPropellerCovers();
  }

  #addPropellerCovers() {
    const bladeMaterial = new THREE.MeshPhongMaterial({ color: 'green' });
    const propCoverMaterial = new THREE.MeshPhongMaterial({ color: 'red' });

    const offsetX = this.width / 2;

    const propCoverGeom = propellerCoverGeometry(this.propellerCoverRadius, 13, 3);
    const propCover1 = new THREE.Mesh(propCoverGeom, propCoverMaterial);
    propCover1.translateX(offsetX);
    const propCover2 = new THREE.Mesh(propCoverGeom, propCoverMaterial);
    propCover2.translateX(-offsetX);
    const propCover3 = new THREE.Mesh(propCoverGeom, propCoverMaterial);
    propCover3.translateX(offsetX);
    const propCover4 = new THREE.Mesh(propCoverGeom, propCoverMaterial);
    propCover4.translateX(-offsetX);

    this.propellerFrontObj3D.add(propCover1, propCover2);
    this.propellerBackObj3D.add(propCover3, propCover4);
  }

  #updateCamera() {
    if (this.activeCamera !== this.groundFollowCam) {
      this.activeCamera.camera.position.copy(this.obj3D.position).add(this.activeCamera.offset);
    }

    this.activeCamera.camera.lookAt(this.obj3D.position);
  }

  useBackFollowCam() {
    this.activeCamera = this.backFollowCam;
  }
  useLateralFollowCam() {
    this.activeCamera = this.lateralFollowCam;
  }
  useTopFollowCam() {
    this.activeCamera = this.topFollowCam;
  }
  useGroundFollowCam() {
    this.activeCamera = this.groundFollowCam;
  }

  get camera() {
    return this.activeCamera.camera;
  }

  #acceleratePositive(axis) {
    this.currentSpeed[axis] = Math.min(this.currentSpeed[axis] + this.baseSpeed[axis], this.maxSpeed[axis]);
  }
  #accelerateNegative(axis) {
    this.currentSpeed[axis] = Math.max(this.currentSpeed[axis] - this.baseSpeed[axis], -this.maxSpeed[axis]);
  }
  #decelerateAxis(axis) {
    if (this.currentSpeed[axis] < 0) {
      this.currentSpeed[axis] = Math.min(this.currentSpeed[axis] + this.baseSpeed[axis], 0);
    } else if (this.currentSpeed[axis] > 0) {
      this.currentSpeed[axis] = Math.max(this.currentSpeed[axis] - this.baseSpeed[axis], 0);
    }
  }
  #propellerForwardRotation(propellerObj3D) {
    propellerObj3D.rotation.x = Math.max(
      -this.maxPropellerRotation,
      propellerObj3D.rotation.x - this.propellerBaseRotation
    );
  }
  #propellerBackwardRotation(propellerObj3D) {
    propellerObj3D.rotation.x = Math.min(
      this.maxPropellerRotation,
      propellerObj3D.rotation.x + this.propellerBaseRotation
    );
  }
  #propellersForwardRotation() {
    this.#propellerForwardRotation(this.propellerFrontObj3D);
    this.#propellerForwardRotation(this.propellerBackObj3D);
  }
  #propellersBackwardRotation() {
    this.#propellerBackwardRotation(this.propellerFrontObj3D);
    this.#propellerBackwardRotation(this.propellerBackObj3D);
  }

  accelerateForward() {
    this.#propellersForwardRotation();
    this.#acceleratePositive('y');
  }
  accelerateBackward() {
    this.#propellersBackwardRotation();
    this.#accelerateNegative('y');
  }
  decelerateY() {
    if (this.propellerFrontObj3D.rotation.x < 0) {
      this.#propellersBackwardRotation();
    } else if (this.propellerFrontObj3D.rotation.x > 0) {
      this.#propellersForwardRotation();
    }
    this.#decelerateAxis('y');
  }

  accelerateRight() {
    this.#acceleratePositive('x');
  }
  accelerateLeft() {
    this.#accelerateNegative('x');
  }
  decelerateX() {
    this.#decelerateAxis('x');
  }

  accelerateUp() {
    this.#acceleratePositive('z');
  }
  accelerateDown() {
    this.#accelerateNegative('z');
  }
  decelerateZ() {
    this.#decelerateAxis('z');
  }

  move() {
    this.#updateCamera();
    this.obj3D.position.add(this.currentSpeed);
    this.obj3D.position.z = Math.max(this.obj3D.position.z, 0);
  }
}
