import * as THREE from 'three';
import { propellerBladeGeometry, propellerBladesObj3D, propellerCoverGeometry, propellerCoverOjb3D } from './Propeller';
import { bodyObj3D } from './Body';
import { legObj3D } from './Legs';
import { addAxes, makePhongMesh } from '../helpers/utils';

export class Drone {
  constructor() {
    this.obj3D = new THREE.Object3D();
    this.unit = 45;
    this.length = this.unit * 8;
    this.width = this.unit * 3.5;
    this.height = this.unit * 1.5;

    this.legsClosed = false;
    this.legsCloseSpeed = 0.01;
    this.legsAngle = 0;

    this.rampExtended = false;
    this.rampSpeed = 1;
    this.rampPos = 0;
    this.doorLength = this.height;
    this.maxRampPos = this.doorLength / 1.5;

    this.baseSpeed = new THREE.Vector3(1, 0.7, 0.5);
    this.baseAngularSpeed = 0.02;
    this.currentSpeed = new THREE.Vector3(0, 0, 0);
    this.maxSpeed = new THREE.Vector3(10, 10, 5);
    this.maxPropellerRotation = (30 * Math.PI) / 180;
    this.propellerBaseRotation = 0.01;

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.up.set(0, 0, 1);

    this.backFollowCam = {
      camera: camera.clone(),
      offset: new THREE.Vector3(0, -300, 250),
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
    this.propellerFrontObj3D.translateY(this.length / 2 - 2.8 * this.unit).translateZ(this.height / 2);
    this.propellerBackObj3D = new THREE.Object3D();
    this.propellerBackObj3D.translateY(-this.length / 2 + this.unit).translateZ(this.height / 2);
    this.obj3D.add(this.propellerFrontObj3D, this.propellerBackObj3D);
    this.#addPropellers();

    this.bladesAngularSpeed = 0.5;

    this.#addBody();
    this.#addRamp();

    this.obj3D.translateZ(this.height + 10);
  }

  #addPropellers() {
    const bladeMaterial = new THREE.MeshPhongMaterial({ color: 'green' });
    const propCoverMaterial = new THREE.MeshPhongMaterial({ color: 'red' });

    const offsetX = this.width + this.unit;

    const pcRadius = this.unit;
    const cylRadius = 5;
    const resolution = 20;
    const height = 10;
    const bladeGeom = propellerBladeGeometry(pcRadius - 2 * cylRadius, height / 2, 0.2, cylRadius);

    const propCoverGeom = propellerCoverGeometry(pcRadius, height, 3, resolution);
    const cylinder = new THREE.CylinderGeometry(cylRadius, cylRadius, height, resolution);
    cylinder.rotateX(Math.PI / 2);
    const propCoverObj3D = propellerCoverOjb3D(propCoverGeom, cylinder, propCoverMaterial);

    const blades1 = propellerBladesObj3D(bladeGeom, bladeMaterial, 10);
    blades1.translateX(offsetX);
    const prop1 = new THREE.Object3D();
    prop1.add(propCoverObj3D.clone().translateX(offsetX), blades1);

    const blades2 = propellerBladesObj3D(bladeGeom, bladeMaterial, 10);
    blades2.translateX(-offsetX);
    const prop2 = new THREE.Object3D();
    prop2.add(propCoverObj3D.clone().translateX(-offsetX), blades2);

    const blades3 = propellerBladesObj3D(bladeGeom, bladeMaterial, 10);
    blades3.translateX(offsetX);
    const prop3 = new THREE.Object3D();
    prop3.add(propCoverObj3D.clone().translateX(offsetX), blades3);

    const blades4 = propellerBladesObj3D(bladeGeom, bladeMaterial, 10);
    blades4.translateX(-offsetX);
    const prop4 = new THREE.Object3D();
    prop4.add(propCoverObj3D.clone().translateX(-offsetX), blades4);

    this.propellerBlades = [blades1, blades2, blades3, blades4];

    this.propellerFrontObj3D.add(prop1, prop2);
    this.propellerBackObj3D.add(prop3, prop4);
  }

  #addBody() {
    const body = bodyObj3D(this.width, this.length, this.height, 0xadd8e6, 0x800080);

    const legLength = 50;
    const leg = legObj3D(legLength, 10, 2, 20, 5)
      .rotateZ(Math.PI / 2)
      .translateZ(-legLength / 2.5);
    const fronLeg1 = leg.clone();
    fronLeg1.translateY(this.width / 5);
    const fronLeg2 = leg.clone();
    fronLeg2.translateY(-this.width / 5);
    this.frontLegsObj3D = new THREE.Object3D();
    this.frontLegsObj3D.add(fronLeg1, fronLeg2);
    this.frontLegsObj3D.translateZ(-this.height / 2.5);
    this.backLegsObj3D = this.frontLegsObj3D.clone();

    this.frontLegsObj3D.translateY(this.length / 7);
    this.backLegsObj3D.translateY(-this.length / 3);

    this.obj3D.add(body, this.frontLegsObj3D, this.backLegsObj3D);
  }

  #addRamp() {
    const width = this.unit;
    const thickness = 3;
    const doorGeom = new THREE.BoxGeometry(width, this.doorLength, thickness);
    this.rampMesh = makePhongMesh(doorGeom, 'pink');
    this.rampMesh
      .rotateZ(Math.PI / 2)
      .translateY(this.width / 2)
      .translateX(-width)
      .rotateX(-Math.atan(((8 / 3) * this.height) / this.width))
      .translateZ(thickness / 2)
      .translateY(-this.doorLength / 2);

    addAxes(this.rampMesh, 50);
    this.obj3D.add(this.rampMesh);
  }

  #updateCamera() {
    if (this.activeCamera !== this.groundFollowCam) {
      this.activeCamera.camera.position.copy(
        this.activeCamera.offset.clone().applyQuaternion(this.obj3D.quaternion).add(this.obj3D.position)
      );
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

  rotateRight() {
    this.obj3D.rotateZ(-this.baseAngularSpeed);
  }
  rotateLeft() {
    this.obj3D.rotateZ(this.baseAngularSpeed);
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

  #rotateBlades() {
    this.propellerBlades.forEach((b) => {
      b.rotation.z += this.bladesAngularSpeed + this.currentSpeed.length() / this.maxSpeed.length();
    });
  }

  closeLegs() {
    if (!this.legsClosed) {
      this.legsAngle += this.legsCloseSpeed;
      this.frontLegsObj3D.rotateX(-this.legsCloseSpeed);
      this.backLegsObj3D.rotateX(this.legsCloseSpeed);
      if (this.legsAngle >= Math.PI / 2) this.legsClosed = true;
    }
  }

  openLegs() {
    if (this.legsClosed) {
      this.legsAngle -= this.legsCloseSpeed;
      this.frontLegsObj3D.rotateX(this.legsCloseSpeed);
      this.backLegsObj3D.rotateX(-this.legsCloseSpeed);
      if (this.legsAngle <= 0) this.legsClosed = false;
    }
  }

  extendRamp() {
    if (!this.rampExtended) {
      this.rampPos += this.rampSpeed;
      this.rampMesh.translateY(this.rampSpeed);
      if (this.rampPos >= this.maxRampPos) this.rampExtended = true;
    }
  }

  retractRamp() {
    if (this.rampExtended) {
      this.rampPos -= this.rampSpeed;
      this.rampMesh.translateY(-this.rampSpeed);
      if (this.rampPos <= 0) this.rampExtended = false;
    }
  }

  move() {
    this.#updateCamera();
    // this.#rotateBlades();
    this.obj3D.translateX(this.currentSpeed.x);
    this.obj3D.translateY(this.currentSpeed.y);
    this.obj3D.translateZ(this.currentSpeed.z);
    this.obj3D.position.z = Math.max(this.obj3D.position.z, 0);
  }
}
