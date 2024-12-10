import * as THREE from 'three';

export class TextureLoader {
  constructor() {
    this.loadManager = new THREE.LoadingManager();
    this.loader = new THREE.TextureLoader(this.loadManager);
    this.loadManager.onLoad = () => console.log('Textures loaded successfully');
    this.loadManager.onError = (err) => console.error('Error loading texture:', err);
  }

  /**
   * @param {string[]} paths
   * @returns {THREE.Texture[]}
   */
  loadAll(...paths) {
    const textures = [];
    paths.forEach((path) => textures.push(this.loader.load(path)));
    return textures;
  }
}
