import * as THREE from "three";

export function floorMesh() {
  const planeSize = 400;
  const loader = new THREE.TextureLoader();
  const texture = loader.load(
    "../resources/checker.png",
    () => console.log("Texture loaded successfully"),
    undefined,
    (err) => console.error("Error loading texture:", err),
  );
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.magFilter = THREE.NearestFilter;
  texture.colorSpace = THREE.SRGBColorSpace;
  const repeats = planeSize / (2 * 10);
  texture.repeat.set(repeats, repeats);
  const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
  const planeMat = new THREE.MeshPhongMaterial({
    map: texture,
    side: THREE.DoubleSide,
  });
  return new THREE.Mesh(planeGeo, planeMat);
  // mesh.receiveShadow = true;
}
