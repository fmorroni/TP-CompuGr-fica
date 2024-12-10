import * as THREE from 'three';
import { TextureLoader } from './TextureLoader';

export function doorMesh(length, height, thickness, envMap) {
  const doorGeom = new THREE.BoxGeometry(length, height, thickness);
  const textureLoader = new TextureLoader();
  const maps = textureLoader.loadAll(
    '../resources/futuristic-panels1/futuristic-panels1-height.png',
    '../resources/futuristic-panels1/futuristic-panels1-albedo.png',
    '../resources/futuristic-panels1/futuristic-panels1-normal-dx.png',
    '../resources/futuristic-panels1/futuristic-panels1-roughness.png',
    '../resources/futuristic-panels1/futuristic-panels1-ao.png',
    '../resources/futuristic-panels1/futuristic-panels1-metallic.png'
  );
  maps.forEach((texture) => {
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 1);
  });
  const [heightMap, colorMap, normalMap, roughnessMap, aoMap, metalnessMap] = maps;
  const doorMat = new THREE.MeshStandardMaterial({
    map: colorMap,
    normalMap,
    // displacementMap: heightMap,
    // displacementScale: 1,
    roughnessMap,
    roughness: 0.3,
    // aoMap,
    metalnessMap,
    metalness: 0.8,
    envMap,
  });
  const doorMesh = new THREE.Mesh(doorGeom, doorMat);
  doorMesh.geometry.attributes.uv2 = doorMesh.geometry.attributes.uv;
  return doorMesh;
}
