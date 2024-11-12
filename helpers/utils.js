import * as THREE from "three";

/**
 * @param {THREE.BufferGeometry} geometry
 * @param {string | Number} color
 */
export function makePhongMesh(geometry, color) {
  const material = new THREE.MeshPhongMaterial({ color });
  return new THREE.Mesh(geometry, material);
}

export function addAxes(node, size) {
  const axes = new THREE.AxesHelper(size);
  axes.material.depthTest = false;
  axes.renderOrder = 1;
  node.add(axes);
}

export function makeXYZGUI(gui, min, max, vector3, name, onChangeFn) {
  const folder = gui.addFolder(name);
  folder.add(vector3, "x", min, max).onChange(onChangeFn);
  folder.add(vector3, "y", min, max).onChange(onChangeFn);
  folder.add(vector3, "z", min, max).onChange(onChangeFn);
  folder.open();
}
