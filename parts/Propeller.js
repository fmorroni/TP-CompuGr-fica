import * as THREE from "three";

export function propellerCoverGeometry(radius, height, thickness) {
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

  return new THREE.LatheGeometry(points);
}
