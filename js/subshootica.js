// Description: This file contains the code for the 3D submarine model in the Subshootica game.
// Author: Hein Dijstelbloem
// Last updated: 2024-04-05
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Noise } from 'noisejs';

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

// lights
const spotlight = new THREE.SpotLight(0xffffff, 250, 100);
spotlight.position.set(5, 5, 5);
spotlight.angle = Math.PI/4;
spotlight.penumbra = 1;

const ambientLight = new THREE.AmbientLight(0xffffff, 0.2); // white color, 0.2 intensity
scene.add(ambientLight);

// SUBMARINE LOADER
const material = new THREE.MeshPhongMaterial({ color: 0x8bac0f });
let submarineModel; // Define submarineModel
let bombModel; // Define bombModel

const loader = new GLTFLoader();
// Create a second spotlight
const spotlight2 = new THREE.SpotLight(0xffffff, 1); // white color, full intensity
spotlight2.angle = Math.PI/4;
spotlight2.penumbra = 1;

// Load the submarine model
loader.load('../models/submarine.glb', function(gltf) {
    gltf.scene.traverse(function(child) {
        if (child.isMesh) {
            child.material = material;
            // scale down
            child.scale.set(-0.5, 0.5, 1.2); // scale to 50%
            submarineModel = child; // set the submarineModel

            // Attach the first spotlight to the submarine model
            submarineModel.add(spotlight);

            // Change the position of the first spotlight
            spotlight.position.set(0, 0, 0.5);

            // Attach the second spotlight to the submarine model
            submarineModel.add(spotlight2);

            // Change the position of the second spotlight
            spotlight2.position.set(0, 5, 0); // position the spotlight above the model

            // Set the target of the second spotlight to the model
            spotlight2.target = submarineModel;
        }
    });
    scene.add(gltf.scene);
});

// Load the bomb model
loader.load('../models/bomba.glb', function(gltf) {
    gltf.scene.traverse(function(child) {
        if (child.isMesh) {
            child.material = material;
            // scale down
            child.scale.set(0.5, 0.5, 0.5); // scale to 50%
            bombModel = child; // set the bombModel
        }
    });
    scene.add(gltf.scene);
}, undefined, function(error) {
    console.error(error);
});

// set the camera position
camera.position.z = 5;

// perlin noise map
const noise = new Noise(Math.random());

// planebuffergeometry has been deprecated, using planegeometry instead
const sandgeometry = new THREE.PlaneGeometry(100, 100, 100, 100);

// Get the positions attribute
const positions = sandgeometry.attributes.position;

// Loop through each vertex
for (let i = 0; i < positions.count; i++) {
    // Use Perlin noise to modify the z-coordinate of the vertex
    const x = positions.getX(i);
    const y = positions.getY(i);
    const z = noise.simplex2(x / 100, y / 100) * 10;
    positions.setZ(i, z);
}

sandgeometry.attributes.position.needsUpdate = true;
sandgeometry.computeVertexNormals();

// Create a material and a mesh
const sandmaterial = new THREE.MeshPhongMaterial({ color: 0x306230 });
const sand = new THREE.Mesh(sandgeometry, sandmaterial);

// Rotate the mesh and add it to the scene
sand.rotation.x = -Math.PI / 2;
scene.add(sand);

// Define an object to keep track of which keys are currently pressed
const keys = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
    z: false,
    x: false
};

// Add event listeners for the keydown and keyup events
window.addEventListener('keydown', (event) => {
    if (event.key in keys) {
        keys[event.key] = true;
    }
});

window.addEventListener('keyup', (event) => {
    if (event.key in keys) {
        keys[event.key] = false;
    }
});

// orbit temp
const controls = new OrbitControls(camera, renderer.domElement);
const animate = function() {
    requestAnimationFrame(animate);
    controls.update();

    // Update the submarine's position based on the arrow keys
    const speed = 0.01;
    const rotationSpeed = 0.01;
    if (keys.ArrowUp) submarineModel.position.x += speed;
    if (keys.ArrowDown) submarineModel.position.x -= speed;
    if (keys.ArrowLeft) submarineModel.rotation.y -= rotationSpeed;
    if (keys.ArrowRight) submarineModel.rotation.y += rotationSpeed;
    if (keys.z) submarineModel.position.y += speed; // move up
    if (keys.x) submarineModel.position.y -= speed; // move down

    // bobbing
    const bobbingSpeed = 0.005;
    const bobbingRange = 0.05;
    const bobbingOffset = Math.sin(Date.now() * bobbingSpeed) * bobbingRange;
    submarineModel.position.y = bobbingOffset;

    // move the bomb
    bombModel.position.x -= 0.01;
    if (bombModel.position.x < -5) {
        bombModel.position.x = 5;
    }

    // tilt the submarine model
    const tiltingSpeed = 0.002;
    const tiltingRange = 0.05;
    const tiltingOffset = Math.sin(Date.now() * tiltingSpeed) * tiltingRange;
    submarineModel.rotation.x = tiltingOffset;
    submarineModel.rotation.z = tiltingOffset;

    renderer.render(scene, camera);
}

animate();