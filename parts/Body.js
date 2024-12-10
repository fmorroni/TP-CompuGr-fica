import * as THREE from 'three';
import { makePhongMesh } from '../helpers/utils';
import { TextureLoader } from './TextureLoader';

export function bodyObj3D(width, length, height, envMap) {
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

  const textureLoader = new TextureLoader();
  const bodyTextures = textureLoader.loadAll(
    '../resources/futuristic-panels1/futuristic-panels1-albedo.png',
    '../resources/futuristic-panels1/futuristic-panels1-normal-dx.png',
    '../resources/futuristic-panels1/futuristic-panels1-roughness.png',
    '../resources/futuristic-panels1/futuristic-panels1-ao.png',
    '../resources/futuristic-panels1/futuristic-panels1-metallic.png'
  );
  bodyTextures.forEach((texture) => {
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(0.01, 0.01);
  });
  const [colorMap, normalMap, roughnessMap, aoMap, metalnessMap] = bodyTextures;
  const bodyMat = new THREE.MeshStandardMaterial({
    map: colorMap,
    normalMap,
    roughnessMap,
    roughness: 0.3,
    aoMap,
    metalnessMap,
    metalness: 0.8,
    envMap,
    // displacementMap doesn't work for low poly geometries as it will basically just
    // end up pushing the whole plane (no "inside" vertices to displace).
    // displacementMap: heightMap,
    // displacementScale: 1,
  });

  const accentTextures = textureLoader.loadAll(
    '../resources/military-panel1/military-panel1_albedo.png',
    '../resources/military-panel1/military-panel1_normal-dx.png',
    '../resources/military-panel1/military-panel1_roughness.png',
    '../resources/military-panel1/military-panel1_ao.png',
    '../resources/military-panel1/military-panel1_metallic.png',
    '../resources/military-panel1/military-panel1_emissive_power.png'
  );
  accentTextures.forEach((texture) => {
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(0.01, 0.01);
  });
  const accentMat = new THREE.MeshStandardMaterial({
    map: accentTextures[0],
    normalMap: accentTextures[1],
    roughnessMap: accentTextures[2],
    roughness: 0.1,
    aoMap: accentTextures[3],
    metalnessMap: accentTextures[4],
    metalness: 1,
    envMap,
    emissiveMap: accentTextures[5],
    emissive: 0xeded00,
    emissiveIntensity: 30,
  });

  const bodyGeom = new THREE.ExtrudeGeometry(shape, { steps: 1, depth: length });
  bodyGeom.translate(0, 0, -length / 2);

  const accentFrontGeom = new THREE.ExtrudeGeometry(shape, { steps: 1, depth: length / 7 });
  accentFrontGeom.scale(1.3, 1.3, 1.3);
  accentFrontGeom.translate(0, 0, length / 1.8 - length / 2);
  const accentBackGeom = new THREE.ExtrudeGeometry(shape, { steps: 1, depth: length / 5 });
  accentBackGeom.scale(1.3, 1.3, 1.3);
  accentBackGeom.translate(0, 0, -length / 2 - 1);

  const obj3D = new THREE.Object3D();

  const bodyMesh = new THREE.Mesh(bodyGeom, bodyMat);
  bodyMesh.geometry.attributes.uv2 = bodyMesh.geometry.attributes.uv;
  bodyMesh.castShadow = true;
  const accentMeshBack = new THREE.Mesh(accentBackGeom, accentMat);
  accentMeshBack.geometry.attributes.uv2 = accentMeshBack.geometry.attributes.uv;
  const accentMeshFront = new THREE.Mesh(accentFrontGeom, accentMat);
  accentMeshFront.geometry.attributes.uv2 = accentMeshFront.geometry.attributes.uv;
  obj3D.add(bodyMesh, accentMeshBack, accentMeshFront);

  obj3D.rotateZ(Math.PI).rotateX(Math.PI / 2);

  return obj3D;
}

export function propellerHolderObj3D(length, width) {
  const obj3D = new THREE.Object3D();

  const sphere = new THREE.SphereGeometry(length / 24, length / 6, length / 6);

  const len = width / 2;
  const holder = new THREE.CylinderGeometry(length / 36, length / 72, len);
  holder.rotateZ(Math.PI / 2).translate(len / 2, 0, 0);

  obj3D.add(makePhongMesh(sphere, 0xd4b300), makePhongMesh(holder, 'gray'));

  return obj3D;
}
