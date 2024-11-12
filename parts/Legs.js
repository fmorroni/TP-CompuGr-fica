import * as THREE from 'three';
import { makePhongMesh } from '../helpers/utils';

export function legObj3D(length, width, thickness, feetRadius, feetHeight) {
  const obj3D = new THREE.Object3D();
  const legGeom = new THREE.BoxGeometry(width, thickness, length);

  const feetGeom = new THREE.CylinderGeometry(feetRadius, feetRadius / 2, feetHeight);
  feetGeom.rotateX(-Math.PI / 2).translate(0, 0, -length / 2);

  obj3D.add(makePhongMesh(legGeom, 'green'), makePhongMesh(feetGeom, 'blue'));

  return obj3D;
}
