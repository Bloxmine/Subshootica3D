import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// container is the div element that will contain the three.js scene
const container = document.querySelector('#threejs-container');
const width = container.clientWidth;
const height = container.clientHeight;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x9bbc0f);
const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);

// Set the renderer's size to match the container's size
const renderer = new THREE.WebGLRenderer();
renderer.setSize(width, height);
container.appendChild(renderer.domElement);

const light = new THREE.PointLight(0xffffff, 1);
light.position.set(0, 0, 5);
scene.add(light);

const material = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
const loader = new GLTFLoader();
loader.load('../models/submarine.glb', function(gltf) {
    gltf.scene.traverse(function(child) {
        if (child.isMesh) {
            child.material = material;
        }
    });
    scene.add(gltf.scene);
}, undefined, function(error) {
    console.error(error);
});

// set the camera position
camera.position.z = 5;

const animate = function() {
    requestAnimationFrame(animate);
    
    renderer.render(scene, camera);
}

animate();