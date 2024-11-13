import * as THREE from 'three';
import { makePhongMesh } from '../helpers/utils';

export function bodyObj3D(width, length, height, bodyColor, accentColor) {
  const shape = new THREE.Shape(
    [
      [-width / 2, 0],
      [-width / 4, (2 * height) / 3],
      [width / 4, (2 * height) / 3],
      [width / 2, 0],
      [width / 4, -height / 3],
      [-width / 4, -height / 3],
      [-width / 2, 0],
    ].map((p) => new THREE.Vector2(...p))
  );

  const bodyMat = new THREE.MeshPhongMaterial({ color: bodyColor });
  const accentMat = new THREE.MeshPhongMaterial({ color: accentColor });

  const bodyGeom = new THREE.ExtrudeGeometry(shape, { steps: 1, depth: length });
  bodyGeom.translate(0, 0, -length / 2);

  const accentFrontGeom = new THREE.ExtrudeGeometry(shape, { steps: 1, depth: length / 7 });
  accentFrontGeom.scale(1.3, 1.3, 1.3);
  accentFrontGeom.translate(0, 0, length / 1.8 - length / 2);
  const accentBackGeom = new THREE.ExtrudeGeometry(shape, { steps: 1, depth: length / 5 });
  accentBackGeom.scale(1.3, 1.3, 1.3);
  accentBackGeom.translate(0, 0, -length / 2 - 1);

  const propHolder = propellerHolderObj3D(length, width);
  propHolder.rotateZ(-Math.PI).rotateX(-Math.PI / 2);

  const propHolder1 = propHolder
    .clone()
    .translateY(length / 2.7)
    .translateX(width / 2)
    .translateZ(-height / 2);
  const propHolder2 = propHolder1.clone().translateY(-length / 1.95);
  const propHolder3 = propHolder
    .clone()
    .translateY(length / 2.7)
    .translateX(-width / 2)
    .translateZ(-height / 2);
  propHolder3.scale.x = -1;
  const propHolder4 = propHolder3.clone().translateY(-length / 1.95);

  const obj3D = new THREE.Object3D();

  obj3D.add(
    new THREE.Mesh(bodyGeom, bodyMat),
    new THREE.Mesh(accentFrontGeom, accentMat),
    new THREE.Mesh(accentBackGeom, accentMat)
  );

  obj3D.rotateZ(Math.PI).rotateX(Math.PI / 2);

  obj3D.add(propHolder1, propHolder2, propHolder3, propHolder4);

  return obj3D;
}

function propellerHolderObj3D(length, width) {
  const obj3D = new THREE.Object3D();

  const cyl = new THREE.CylinderGeometry(15, 15, length / 6);

  const len = width / 2;
  const holder = new THREE.CylinderGeometry(10, 5, len);
  holder.rotateZ(Math.PI / 2).translate(len / 2, 0, 0);

  obj3D.add(makePhongMesh(cyl, 0xd4b300), makePhongMesh(holder, 'gray'));

  return obj3D;
}
