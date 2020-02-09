import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

import './styles/index.css';
import airplaneModel from './models/airplane.glb';
import earthModel from './models/earth.glb';


const INITIAL_CAMERA_POSITION = new THREE.Vector3(0, 0, 200);

const DEFAULT_EARTH_ROTATION = new THREE.Quaternion().setFromEuler(
  new THREE.Euler(Math.PI / 4, Math.PI / 1.8, 0, 'XYZ'),
);
const DEFAULT_CAMERA_POSITION = new THREE.Vector3(0, 0, 100);

const MINIMUM_CAMERA_POSITION = new THREE.Vector3(0, 0, 60);
const MAXIMUM_CAMERA_POSITION = new THREE.Vector3(0, 0, 300);


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

class Airplane {
  constructor(scene, earthCenter, earthRadius) {
    this.scene = scene;
    this.earthCenter = earthCenter;
    this.earthRadius = earthRadius;
  }

  setPosition(latitude, longitude) {
    const latitudeRads = (Math.PI / 2) - (latitude * (Math.PI / 180.0));
    const longitudeRads = longitude * (Math.PI / 180.0);
    this.scene.position.z = 0;

    this.scene.position.x = Math.sin(latitudeRads) * Math.sin(longitudeRads) * this.earthRadius;
    this.scene.position.y = Math.cos(latitudeRads) * this.earthRadius;
    this.scene.position.z = Math.sin(latitudeRads) * Math.cos(longitudeRads) * this.earthRadius;

    this.scene.rotation.x = Math.sin(longitudeRads);
    this.scene.rotation.z = Math.sin(latitudeRads);
    this.scene.rotation.z = Math.cos(longitudeRads);
  }
}

async function loadAirplane(loader) {
  const gltf = await loader.load(airplaneModel);
  gltf.scene.scale.multiplyScalar(0.1);
  return new Airplane(gltf.scene, new THREE.Vector3(0, 0, 0), 52);
}

async function main() {
  const clock = new THREE.Clock();

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 300);
  camera.position.copy(INITIAL_CAMERA_POSITION);

  const targetCameraPosition = DEFAULT_CAMERA_POSITION;
  const targetEarthRotation = DEFAULT_EARTH_ROTATION;

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const ambientLight = new THREE.AmbientLight(0xFFFFFF);
  scene.add(ambientLight);
  const pointLight = new THREE.PointLight(0xFFFFFF, 10, 299);
  pointLight.position.set(100, 100, 200);
  scene.add(pointLight);

  const loader = promisifyLoader(new GLTFLoader());

  const earthGroup = new THREE.Group();

  const earthGLTF = await loader.load(earthModel);
  const earth = earthGLTF.scene;
  earth.scale.multiplyScalar(0.1);
  earth.rotation.y = Math.PI;
  earthGroup.add(earth);

  const airplane = await loadAirplane(loader);
  earthGroup.add(airplane.scene);

  scene.add(earthGroup);

  renderer.domElement.addEventListener('wheel',
    (event) => {
      targetCameraPosition.z += event.deltaY / 10;
      if (targetCameraPosition.z < MINIMUM_CAMERA_POSITION.z) {
        targetCameraPosition.z = MINIMUM_CAMERA_POSITION.z;
      } else if (targetCameraPosition.z > MAXIMUM_CAMERA_POSITION.z) {
        targetCameraPosition.z = MAXIMUM_CAMERA_POSITION.z;
      }
      event.preventDefault();
    });
  renderer.domElement.addEventListener('mousemove',
    (event) => {
      if (event.buttons === 1) {
        const targetRotationEuler = new THREE.Euler().setFromQuaternion(targetEarthRotation);

        targetRotationEuler.y -= event.movementX / 1000;
        if (targetRotationEuler.y > Math.PI * 2) {
          targetRotationEuler.y -= Math.PI * 2;
        } else if (targetRotationEuler.y < 0) {
          targetRotationEuler.y += Math.PI * 2;
        }
        targetRotationEuler.x += event.movementY / 1000;
        if (targetRotationEuler.x > Math.PI * 2) {
          targetRotationEuler.x -= Math.PI * 2;
        } else if (targetRotationEuler.x < 0) {
          targetRotationEuler.x += Math.PI * 2;
        }

        targetEarthRotation.setFromEuler(targetRotationEuler);
      }
    });

  const latitude = 33.6266711;

  function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);

    const delta = clock.getDelta();

    camera.position.lerp(targetCameraPosition, 2 * delta);
    earthGroup.quaternion.slerp(targetEarthRotation, 2 * delta);

    airplane.setPosition(latitude, -112.1024665);
  }
  animate();
}


window.addEventListener('DOMContentLoaded', (event) => {
  main();
});
