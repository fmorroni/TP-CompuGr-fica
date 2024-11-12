import * as THREE from "three";
import { makePhongMesh } from "../helpers/utils";
import { propellerCoverGeometry } from "./Propeller";

export function drone() {
  const droneLength = 45 * 6;
  const droneWidth = 45 * 3;
  const drone = new THREE.Object3D();

  const propCoverGeom = propellerCoverGeometry(droneLength / 5, 15, 1);
  propCoverGeom.rotateX(Math.PI/2)

  const propCover1 = makePhongMesh(propCoverGeom, 0xff0000);
  propCover1.translateX(droneLength / 3).translateY(droneWidth);

  const propCover2 = makePhongMesh(propCoverGeom, 0xff0000);
  propCover2.translateX(-droneLength / 3).translateY(droneWidth);

  const propCover3 = makePhongMesh(propCoverGeom, 0xff0000);
  propCover3.translateX(-droneLength / 3).translateY(-droneWidth);

  const propCover4 = makePhongMesh(propCoverGeom, 0xff0000);
  propCover4.translateX(droneLength / 3).translateY(-droneWidth);

  drone.add(propCover1, propCover2, propCover3, propCover4);

  return drone;
}
