import * as THREE from 'three';

export function bodyGeometry(width, length, height) {
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

  const extrudeSettings = {
    steps: 1,
    depth: length,
  };

  const body = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  body.translate(0, 0, -length / 2).rotateX(Math.PI / 2);
  return body;
}
