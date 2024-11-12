import * as THREE from "three";

export class AxisGridHelper {
  static addToGui(gui, node, label, units) {
    const helper = new AxisGridHelper(node, units);
    gui.add(helper, "visible").name(label);
  }

  constructor(node, units = 10, axesSize = 10) {
    const axes = new THREE.AxesHelper(axesSize);
    axes.material.depthTest = false;
    axes.renderOrder = 2;
    node.add(axes);

    const grid = new THREE.GridHelper(units, units);
    grid.material.depthTest = false;
    grid.renderOrder = 1;
    node.add(grid);

    this.grid = grid;
    this.axes = axes;
    this.visible = false;
  }

  get visible() {
    return this._visible;
  }

  set visible(v) {
    this._visible = v;
    this.grid.visible = v;
    this.axes.visible = v;
  }
}

export class DimensionGUIHelper {
  constructor(obj, minProp, maxProp) {
    this.obj = obj;
    this.minProp = minProp;
    this.maxProp = maxProp;
  }
  get value() {
    return this.obj[this.maxProp] * 2;
  }
  set value(v) {
    this.obj[this.maxProp] = v / 2;
    this.obj[this.minProp] = v / -2;
  }
}
