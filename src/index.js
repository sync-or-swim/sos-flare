import * as THREE from 'three';

import Earth from './earth';
import Airplane from './airplane';
import loadModels from './models';
import './styles/index.css';


const INITIAL_CAMERA_POSITION = new THREE.Vector3(0, 0, 200);

const DEFAULT_EARTH_ROTATION = new THREE.Quaternion().setFromEuler(
  new THREE.Euler(Math.PI / 4, Math.PI / 1.8, 0, 'XYZ'),
);
const DEFAULT_CAMERA_POSITION = new THREE.Vector3(0, 0, 100);

const MINIMUM_CAMERA_POSITION = new THREE.Vector3(0, 0, 60);
const MAXIMUM_CAMERA_POSITION = new THREE.Vector3(0, 0, 300);


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

  const models = await loadModels();

  const earthGroup = new THREE.Group();

  const earth = new Earth(scene, models.earth, 52);
  earth.transform.scale.multiplyScalar(0.1);
  earth.transform.rotation.y = Math.PI;

  const airplane = new Airplane(scene, models.airplane, earth);
  earthGroup.add(airplane.transform);

  earthGroup.add(earth.transform);
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


window.addEventListener('DOMContentLoaded', main);
