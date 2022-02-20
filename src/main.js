// import * as THREE from 'three';

// import { GUI } from './jsm/libs/lil-gui.module.min.js';

// import { OrbitControls } from './jsm/controls/OrbitControls.js';

import { OrbitControls } from "https://cdn.skypack.dev/three@0.132.2/examples/jsm/controls/OrbitControls.js";
import { GUI } from 'https://cdn.skypack.dev/lil-gui';

import { OctaTree } from './octatree.js'
import { Sphere, Cuboid } from './simple_3d_geometry.js'
import { Boid } from './boid.js'

let camera, scene, renderer;
let shouldUpdateTree = 5;

let points = [];
const treeWidth = 6;

let tree;
let findRegion;

const params = {
    alignmentFactor: 4,
    cohesionFactor: 0.5,
    separationFactor: 4,

    perceptionRadius: 0.3,
    speed: 1.5,

    simulationIsRunning: true,

    showHelpers: false
};


init();
render();

function init_control() {
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.localClippingEnabled = true;
    document.body.appendChild(renderer.domElement);

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 200);

    camera.position.set(- 1.5, 2.5, 3.0);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.addEventListener('change', render); // use only if there is no animation loop
    controls.minDistance = 1;
    controls.maxDistance = 15;
    controls.enablePan = false;

    const light = new THREE.HemisphereLight(0xffffff, 0x080808, 1.5);
    light.position.set(- 1.25, 1, 1.25);
    scene.add(light);
}

function init_gui() {
    const gui = new GUI();

    gui.add(params, 'showHelpers').name('show octa tree').onChange(function (value) {
        tree.helperBorder.visible = value;
    });

    gui.add(params, 'simulationIsRunning').name('run simulation');

    gui.add(params, 'alignmentFactor', 0, 5).step(0.05).name('alignment');
    gui.add(params, 'cohesionFactor', 0, 5).step(0.05).name('cohesion');
    gui.add(params, 'separationFactor', 0, 5).step(0.05).name('separation');
    gui.add(params, 'perceptionRadius', 0, 2).step(0.05).name('perception radius');
    gui.add(params, 'speed', 0, 4).step(0.05).name('speed of boids').onChange(function (value) {
        for (const point of points) {
            point.speed = value;
        }
    });
}

function initTree() {
    tree = new OctaTree(
        new Cuboid(-treeWidth / 2, -treeWidth / 2, -treeWidth / 2, treeWidth, treeWidth, treeWidth),
        16, 6
    );

    tree.helperBorder.visible = false;

    shouldUpdateTree = 5;
}

function initBoids() {
    for (let i = 0; i < 3150; ++i) {
        const x = Math.random() * treeWidth - treeWidth / 2;
        const y = Math.random() * treeWidth - treeWidth / 2;
        const z = Math.random() * treeWidth - treeWidth / 2;

        const geometry = new THREE.ConeGeometry(0.01, 0.09, 10);//new THREE.SphereGeometry(0.01, 32, 24);
        const material = new THREE.MeshLambertMaterial({ color: 0x00ff00 });
        const sphere = new THREE.Mesh(geometry, material);
        sphere.position.set(x, y, z);

        scene.add(sphere);
        points.push(new Boid(sphere));
    }

    scene.add(tree.helperBorder);
    for (const point of points) {
        tree.insert(point);
    }
}

function initRegion() {
    findRegion = new Sphere(0, 0, 0, 0.6);
    const geometry = new THREE.SphereGeometry(findRegion.r, 32, 24);
    const material = new THREE.MeshLambertMaterial({ color: 0x0000ff, transparent: true, opacity: 0.3 });
    const sphere = new THREE.Mesh(geometry, material);
    sphere.position.set(findRegion.x, findRegion.y, findRegion.z);
    scene.add(sphere);
}

function init() {
    init_control();
    init_gui();
    initTree()
    initBoids();
    initRegion();

    window.addEventListener('resize', onWindowResize);
    update();
}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

    render();

}



function updateTree(dt) {
    if (shouldUpdateTree == 0) {
        tree.rebuild(points);
        shouldUpdateTree = 10;
    }
    shouldUpdateTree--;
}

function updatePoints(dt) {
    for (const point of points) {

        if (!tree.contains(point)) {
            let x = point.position.x;
            let y = point.position.y;
            let z = point.position.z;
            const dim = treeWidth;
            x -= Math.floor((x + dim / 2) / dim) * dim;
            y -= Math.floor((y + dim / 2) / dim) * dim;
            z -= Math.floor((z + dim / 2) / dim) * dim;
            point.position.set(x, y, z);
        }
        const neighbors = tree.query(new Sphere(point.position, params.perceptionRadius));
        point.flock(neighbors, params.alignmentFactor, params.cohesionFactor, params.separationFactor);

        point.update(dt);
    }
}

function colorPoints() {
    for (const point of points) {
        point.model.material.color.setHex(0x00ff00);
    }
    const foundPoints = tree.query(findRegion);
    for (const point of foundPoints) {
        point.model.material.color.setHex(0xffff00);
    }
}

function update() {
    const dt = 1.0 / 60.0;
    if (params.simulationIsRunning) {
        updatePoints(dt);
        updateTree(dt);
    }
    colorPoints();


    render();
    requestAnimationFrame(update);
}

function render() {

    renderer.render(scene, camera);
}