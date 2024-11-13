import * as THREE from 'three';
import { propellerBladeGeometry, propellerBladesObj3D, propellerCoverGeometry, propellerCoverOjb3D } from './Propeller';
import { bodyObj3D, propellerHolderObj3D } from './Body';
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

    this.armsExtended = true;
    this.armsPos = new THREE.Vector3(0, 0, 0);
    this.maxArmsPos = new THREE.Vector3(Math.PI / 2, 0, Math.PI / 2.5);
    const armSteps = 100;
    this.armsSpeed = new THREE.Vector3(this.maxArmsPos.x / armSteps, 0, this.maxArmsPos.z / armSteps);

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
      offset: new THREE.Vector3(0, -500, 250),
    };
    this.lateralFollowCam = {
      camera: camera.clone(),
      offset: new THREE.Vector3(-700, 0, 150),
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

    this.#addPropellers();

    this.bladesAngularSpeed = 0.5;

    this.#addBody();
    this.#addRamp();

    this.obj3D.translateZ(this.height + 10);
  }

  #addPropellers() {
    const bladeMaterial = new THREE.MeshPhongMaterial({ color: 'green' });
    const propCoverMaterial = new THREE.MeshPhongMaterial({ color: 'red' });

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
    const blades2 = blades1.clone();
    const blades3 = blades1.clone();
    const blades4 = blades1.clone();

    const prop1 = new THREE.Object3D();
    prop1.add(propCoverObj3D.clone(), blades1);
    prop1.translateX(this.width / 2 + pcRadius);

    const prop2 = new THREE.Object3D();
    prop2.add(propCoverObj3D.clone(), blades2);
    prop2.translateX(this.width / 2 + pcRadius);

    const prop3 = new THREE.Object3D();
    prop3.add(propCoverObj3D.clone(), blades3);
    prop3.translateX(this.width / 2 + pcRadius);

    const prop4 = new THREE.Object3D();
    prop4.add(propCoverObj3D.clone(), blades4);
    prop4.translateX(this.width / 2 + pcRadius);

    const propHolder = propellerHolderObj3D(this.length, this.width);

    this.propHolderFR = propHolder.clone();
    this.propHolderFR.add(prop1);
    this.propHolderFR
      .translateY(this.length / 7)
      .translateX(this.width / 2)
      .translateZ(this.height / 2);

    this.propHolderFL = propHolder.clone();
    this.propHolderFL.add(prop2);
    this.propHolderFL.scale.x = -1;
    this.propHolderFL
      .translateY(this.length / 7)
      .translateX(-this.width / 2)
      .translateZ(this.height / 2);

    this.propHolderBL = propHolder.clone();
    this.propHolderBL.add(prop3);
    this.propHolderBL.scale.x = -1;
    this.propHolderBL
      .translateY(-this.length / 2.5)
      .translateX(-this.width / 2)
      .translateZ(this.height / 2);

    this.propHolderBR = propHolder.clone();
    this.propHolderBR.add(prop4);
    this.propHolderBR
      .translateY(-this.length / 2.5)
      .translateX(this.width / 2)
      .translateZ(this.height / 2);

    this.obj3D.add(this.propHolderFR, this.propHolderFL, this.propHolderBL, this.propHolderBR);

    // this.propHolderFR.rotateZ(Math.PI / 2.5).rotateX(Math.PI / 2);
    // this.propHolderFL.rotateZ(Math.PI / 2.5).rotateX(Math.PI / 2);
    // this.propHolderBR.rotateZ(Math.PI / 2.5).rotateX(Math.PI / 2);
    // this.propHolderBL.rotateZ(Math.PI / 2.5).rotateX(Math.PI / 2);

    addAxes(this.propHolderFR, 30);
    addAxes(this.propHolderFL, 30);
    addAxes(this.propHolderBR, 30);
    addAxes(this.propHolderBL, 30);

    this.propellerBlades = [blades1, blades2, blades3, blades4];
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
    this.#propellerForwardRotation(this.propHolderFL);
    this.#propellerForwardRotation(this.propHolderFR);
    this.#propellerForwardRotation(this.propHolderBL);
    this.#propellerForwardRotation(this.propHolderBR);
  }
  #propellersBackwardRotation() {
    this.#propellerBackwardRotation(this.propHolderFL);
    this.#propellerBackwardRotation(this.propHolderFR);
    this.#propellerBackwardRotation(this.propHolderBL);
    this.#propellerBackwardRotation(this.propHolderBR);
  }

  accelerateForward() {
    if (this.armsExtended) this.#propellersForwardRotation();
    this.#acceleratePositive('y');
  }
  accelerateBackward() {
    if (this.armsExtended) this.#propellersBackwardRotation();
    this.#accelerateNegative('y');
  }
  decelerateY() {
    if (this.armsExtended && this.propHolderFL.rotation.x < 0) {
      this.#propellersBackwardRotation();
    } else if (this.armsExtended && this.propHolderFL.rotation.x > 0) {
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

  extendArms() {
    if (!this.armsExtended) {
      this.armsPos.sub(this.armsSpeed);
      this.propHolderFR.rotateZ(-this.armsSpeed.z).rotateX(-this.armsSpeed.x);
      this.propHolderFL.rotateZ(this.armsSpeed.z).rotateX(-this.armsSpeed.x);
      this.propHolderBR.rotateZ(-this.armsSpeed.z).rotateX(-this.armsSpeed.x);
      this.propHolderBL.rotateZ(this.armsSpeed.z).rotateX(-this.armsSpeed.x);
      if (this.armsPos.x <= 0 || this.armsPos.z <= 0) this.armsExtended = true;
    }
  }

  retractArms() {
    if (this.armsExtended) {
      this.armsPos.add(this.armsSpeed);
      this.propHolderFR.rotateZ(this.armsSpeed.z).rotateX(this.armsSpeed.x);
      this.propHolderFL.rotateZ(-this.armsSpeed.z).rotateX(this.armsSpeed.x);
      this.propHolderBR.rotateZ(this.armsSpeed.z).rotateX(this.armsSpeed.x);
      this.propHolderBL.rotateZ(-this.armsSpeed.z).rotateX(this.armsSpeed.x);
      if (this.armsPos.x >= this.maxRampPos.x || this.armsPos.z >= this.maxArmsPos.z) this.armsExtended = false;
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
