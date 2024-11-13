import * as THREE from 'three';
import { makePhongMesh } from '../helpers/utils';

export function doorMesh(length, height, thickness) {
  const doorGeom = new THREE.BoxGeometry(length, height, thickness);
  return makePhongMesh(doorGeom, 'pink');
}
