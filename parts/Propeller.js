import * as THREE from "three";

export function propellerCoverGeometry(radius, height, thickness, resolution = 20) {
  const curveHeight = 1;
  const curve1 = new THREE.CubicBezierCurve(
    new THREE.Vector2(-thickness, height - curveHeight),
    new THREE.Vector2(-thickness, height),
    new THREE.Vector2(thickness, height),
    new THREE.Vector2(thickness, height - curveHeight),
  );
  const curve2 = curve1.clone();

  const matrix1 = new THREE.Matrix3().translate(-radius, 0);
  curve1.v0.applyMatrix3(matrix1);
  curve1.v1.applyMatrix3(matrix1);
  curve1.v2.applyMatrix3(matrix1);
  curve1.v3.applyMatrix3(matrix1);

  const matrix2 = new THREE.Matrix3().rotate(Math.PI).translate(-radius, 0);
  curve2.v0.applyMatrix3(matrix2);
  curve2.v1.applyMatrix3(matrix2);
  curve2.v2.applyMatrix3(matrix2);
  curve2.v3.applyMatrix3(matrix2);

  const curveResolution = 50;
  const points = curve1
    .getPoints(curveResolution)
    .concat(curve2.getPoints(curveResolution));
  points.push(curve1.v0.clone());

  const pcGeom = new THREE.LatheGeometry(points, resolution);
  pcGeom.rotateX(Math.PI / 2);
  return pcGeom;
}

export function propellerBladeGeometry(
  length,
  width,
  thickness,
  offsetCenter = 0,
) {
  const shape = new THREE.Shape(
    [
      [-width / 2, 0],
      [-width / 2, length],
      [width / 2, length],
      [width / 2, 0],
    ].map((p) => new THREE.Vector2(...p)),
  );

  const extrudeSettings = {
    steps: 1,
    depth: thickness,
  };

  const blade = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  blade.translate(0, offsetCenter, 0).rotateY((20 * Math.PI) / 180);
  return blade;
}

/**
 *  @param {THREE.BufferGeometry} bladeGeometry
 */
export function propellerBladesObj3D(bladeGeometry, material, count) {
  const obj3D = new THREE.Object3D();
  const rotationAngle = (2 * Math.PI) / count;
  let angle = 0;
  for (let i = 0; i < count; ++i) {
    const mesh = new THREE.Mesh(bladeGeometry, material);
    mesh.rotateZ(angle);
    angle += rotationAngle;
    obj3D.add(mesh);
  }
  return obj3D;
}
