// import * as THREE from 'three';

// import { GUI } from './jsm/libs/lil-gui.module.min.js';

// import { OrbitControls } from './jsm/controls/OrbitControls.js';

import { OrbitControls } from "https://cdn.skypack.dev/three@0.132.2/examples/jsm/controls/OrbitControls.js";
import { GUI } from 'https://cdn.skypack.dev/lil-gui';

import { OctaTree } from './octatree.js'
import { Sphere, Cuboid } from './simple_3d_geometry.js'
import { Boid } from './boid.js'

let camera, scene, renderer;

let points = [];

let tree;
let findRegion;

const params = {
    clipIntersection: true,
    planeConstant: 0,
    showHelpers: false
};

const clipPlanes = [
    new THREE.Plane(new THREE.Vector3(1, 0, 0), 0),
    new THREE.Plane(new THREE.Vector3(0, - 1, 0), 0),
    new THREE.Plane(new THREE.Vector3(0, 0, - 1), 0)
];

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
    controls.maxDistance = 10;
    controls.enablePan = false;

    const light = new THREE.HemisphereLight(0xffffff, 0x080808, 1.5);
    light.position.set(- 1.25, 1, 1.25);
    scene.add(light);
}

function init_gui() {
    const gui = new GUI();

    tree = new OctaTree(
        new Cuboid(-2, -2, -2, 4, 4, 4),
        20, 5
    );

    gui.add(params, 'showHelpers').name('show helpers').onChange(function (value) {
        tree.helperBorder.visible = value;
        render();
    });

    // gui.add(params, 'planeConstant', - 1, 1).step(0.01).name('plane constant').onChange(function (value) {
    //     for (let j = 0; j < clipPlanes.length; j++) {
    //         clipPlanes[j].constant = value;
    //     }
    //     render();
    // });
}

function init() {
    init_control();
    init_gui();


    for (let i = 0; i < 1150; ++i) {
        const radius = Math.random() * 1;
        const alpha = Math.random() * Math.PI * 0.5;
        const theta = Math.random() * Math.PI * 1 + Math.PI;
        const x = Math.cos(theta) * Math.sin(alpha) * radius;
        const y = Math.sin(theta) * Math.sin(alpha) * radius;
        const z = Math.cos(alpha) * radius;

        const geometry = new THREE.SphereGeometry(0.01, 32, 24);
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

    findRegion = new Sphere(0, 0, 0, 0.6);
    {
        const geometry = new THREE.SphereGeometry(findRegion.r, 32, 24);
        const material = new THREE.MeshLambertMaterial({ color: 0x0000ff, transparent: true, opacity: 0.3 });
        const sphere = new THREE.Mesh(geometry, material);
        sphere.position.set(findRegion.x, findRegion.y, findRegion.z);
        scene.add(sphere);
    }


    // console.log(tree);

    window.addEventListener('resize', onWindowResize);
    update();
}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

    render();

}

var updateTree = 5;
var perceptionRadius = 0.3;

function update() {
    if (updateTree == 0) {
        tree.rebuild(points);
        updateTree = 20;
    }
    updateTree--;

    // const speed = 0.005;
    const origin = new THREE.Vector3(0, 0, 0);
    const maxDistanceFromOrigin = 1.5;

    for (const point of points) {
        // const x = point.position.x - speed / 2 + Math.random() * speed;
        // const y = point.position.y - speed / 2 + Math.random() * speed;
        // const z = point.position.z - speed / 2 + Math.random() * speed;
        // point.position.set(x, y, z);

        point.model.material.color.setHex(0x00ff00);
        if (!tree.contains(point)) {
            point.position.set(0, 0, 0);
        }

        const distanceFromOriginSq = point.position.distanceToSquared(origin);
        if (distanceFromOriginSq > maxDistanceFromOrigin * maxDistanceFromOrigin) {
            const correction = origin.clone().sub(point.position);
            correction.setLength(distanceFromOriginSq - maxDistanceFromOrigin * maxDistanceFromOrigin);
            correction.multiplyScalar(0.01);
            point.vel.add(correction);
        }

        const neighbors = tree.query(new Sphere(point.position, perceptionRadius));
        point.flock(neighbors);

        point.update(1.0 / 60.0);
    }

    const foundPoints = tree.query(findRegion);
    for (const point of foundPoints) {
        point.model.material.color.setHex(0xffff00);
    }

    render();
    requestAnimationFrame(update);
}

function render() {

    renderer.render(scene, camera);
}