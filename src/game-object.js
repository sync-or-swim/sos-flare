import * as THREE from 'three';


export default class GameObject {
  constructor(scene, model) {
    this.transform = new THREE.Group();
    this.transform.add(model);
    scene.add(this.tranform);
  }
}
