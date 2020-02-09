import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

import airplaneModel from './models/airplane.glb';
import earthModel from './models/earth.glb';


/**
 * Wraps a three.js loader in a promise.
 */
function promisifyLoader(loader, onProgress) {
  function promiseLoader(url) {
    return new Promise((resolve, reject) => {
      loader.load(url, resolve, onProgress, reject);
    });
  }

  return {
    originalLoader: loader,
    load: promiseLoader,
  };
}


export default async function loadModels() {
  const loader = promisifyLoader(new GLTFLoader());

  return {
    airplane: (await loader.load(airplaneModel)).scene,
    earth: (await loader.load(earthModel)).scene,
  };
}
