import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// container is the div element that will contain the three.js scene
const container = document.querySelector('#threejs-container');
const width = container.clientWidth;
const height = container.clientHeight;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x9bbc0f);
const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);

// renderer will render the scene using the camera
const renderer = new THREE.WebGLRenderer();
renderer.setSize(width, height);
container.appendChild(renderer.domElement);

const spotlight = new THREE.SpotLight(0xffffff, 250, 100);
spotlight.position.set(-6, 4, 5);
// spotlight.color.setRGB(0, 0, 1);
spotlight.angle = Math.PI/4;
spotlight.penumbra = 1;
scene.add(spotlight);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.2); // white color, 0.2 intensity
scene.add(ambientLight);

const material = new THREE.MeshPhongMaterial({ color: 0x8bac0f });
let submarineModel; // Define submarineModel

const loader = new GLTFLoader();
loader.load('../models/submarine.glb', function(gltf) {
    gltf.scene.traverse(function(child) {
        if (child.isMesh) {
            child.material = material;
            // scale down
            child.scale.set(-0.5, 0.5, 1.2); // scale to 50%
            submarineModel = child; // set the submarineModel
        }
    });
    scene.add(gltf.scene);
}, undefined, function(error) {
    console.error(error);
});

// set the camera position
camera.position.z = 5;

// orbit temp
const controls = new OrbitControls(camera, renderer.domElement);
const animate = function() {
    requestAnimationFrame(animate);
    controls.update();

    // bobbing
    const bobbingSpeed = 0.005;
    const bobbingRange = 0.05;
    const bobbingOffset = Math.sin(Date.now() * bobbingSpeed) * bobbingRange;
    submarineModel.position.y = bobbingOffset;

    // tilt the submarine model
    const tiltingSpeed = 0.002;
    const tiltingRange = 0.05;
    const tiltingOffset = Math.sin(Date.now() * tiltingSpeed) * tiltingRange;
    submarineModel.rotation.x = tiltingOffset;
    submarineModel.rotation.z = tiltingOffset;

    renderer.render(scene, camera);
}

animate();