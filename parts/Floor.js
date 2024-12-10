import * as THREE from 'three';
import { TextureLoader } from './TextureLoader';

// export function floorMesh() {
//   const planeSize = 400;
//   const loader = new THREE.TextureLoader();
//   const texture = loader.load(
//     '../resources/checker.png',
//     () => console.log('Texture loaded successfully'),
//     undefined,
//     (err) => console.error('Error loading texture:', err)
//   );
//   texture.wrapS = THREE.RepeatWrapping;
//   texture.wrapT = THREE.RepeatWrapping;
//   texture.magFilter = THREE.NearestFilter;
//   texture.colorSpace = THREE.SRGBColorSpace;
//   const repeats = planeSize / (2 * 10);
//   texture.repeat.set(repeats, repeats);
//   const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
//   const planeMat = new THREE.MeshPhongMaterial({
//     map: texture,
//     side: THREE.DoubleSide,
//   });
//   return new THREE.Mesh(planeGeo, planeMat);
//   // mesh.receiveShadow = true;
// }

export function floorMesh() {
  const planeSize = 5000;
  const textureLoader = new TextureLoader();
  const [heightMap, colorMap, normalMap, roughnessMap, aoMap] = textureLoader.loadAll(
    '../resources/peacock-ore-ue/peacock-ore_height.png',
    '../resources/peacock-ore-ue/peacock-ore_albedo.png',
    '../resources/peacock-ore-ue/peacock-ore_normal-dx.png',
    '../resources/peacock-ore-ue/peacock-ore_roughness.png',
    '../resources/peacock-ore-ue/peacock-ore_ao.png'
  );

  // const heightMap2 = loader.load('../resources/heightmap.jpg');
  // heightMap.colorSpace = THREE.SRGBColorSpace;
  // const metalnessMap = loader.load('../resources/strata-rock1/strata-rock1_metallic.png');

  const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize, 500, 500);
  const planeMat = new THREE.MeshStandardMaterial({
    map: colorMap,
    normalMap,
    displacementMap: heightMap,
    displacementScale: 500,
    roughnessMap,
    // roughness: 0.3,
    aoMap,
    // metalnessMap,
    // metalness: 1,
  });
  const planeMesh = new THREE.Mesh(planeGeo, planeMat);
  // planeMesh.geometry.attributes.uv2 = planeMesh.geometry.attributes.uv;
  planeMesh.receiveShadow = true;
  return planeMesh;
}
