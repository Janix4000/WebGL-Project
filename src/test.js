
let scene;


let camera;

let christmasTree = [];
let car = [];


initializeScene();


animateScene();

/**
 * Initialize the scene.
 */
function initializeScene() {

    renderer = new THREE.WebGLRenderer({
        antialias: true
    });


    renderer.setClearColor(0x000000, 1);


    canvasWidth = window.innerWidth;
    canvasHeight = window.innerHeight;

    renderer.setSize(canvasWidth, canvasHeight);

    document.getElementById("WebGLCanvas").appendChild(renderer.domElement);

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(45, canvasWidth / canvasHeight, 1, 100);
    camera.position.set(0, 2, 10);
    camera.lookAt(scene.position);
    scene.add(camera);

    let triangleMesh; {
        const a = new THREE.Vector3(0.0, 1.0, 0.0);
        const b = new THREE.Vector3(-1.0, -1.0, 0.0);
        const c = new THREE.Vector3(1.0, -1.0, 0.0);
        triangleMesh = createTriangle(a, b, c, 0xAAAAAA);
    }
    triangleMesh.position.set(-1.5, 0.0, 4.0);
    scene.add(triangleMesh);

    let squareGeometry = new THREE.BufferGeometry();
    const points = [
        new THREE.Vector3(-1.0, 1.0, 0.0),
        new THREE.Vector3(1.0, 1.0, 0.0),
        new THREE.Vector3(1.0, -1.0, 0.0),

        new THREE.Vector3(1.0, -1.0, 0.0),
        new THREE.Vector3(-1.0, -1.0, 0.0),
        new THREE.Vector3(-1.0, 1.0, 0.0),
    ];
    // squareGeometry.faces.push(new THREE.Face3(0, 1, 2));
    // squareGeometry.faces.push(new THREE.Face3(0, 2, 3));

    const RECT_COLOR = 0xFF0000;

    let squareMaterial = new THREE.MeshBasicMaterial({
        color: RECT_COLOR,
        side: THREE.DoubleSide
    });

    let squareMesh;
    {
        const a = new THREE.Vector3(-1.0, 1.0, 0.0);
        const b = new THREE.Vector3(1.0, 1.0, 0.0);
        const c = new THREE.Vector3(1.0, -1.0, 0.0);
        const d = new THREE.Vector3(-1.0, -1.0, 0.0);
        squareMesh = createRectangle(a, b, c, d, 0xFF0000);
    }
    squareMesh.position.set(1.0, 1.0, -10.0);
    scene.add(squareMesh);

    let squareMesh2;
    {
        const a = new THREE.Vector3(-1.0, 1.0, 0.0);
        const b = new THREE.Vector3(1.0, 1.0, 0.0);
        const c = new THREE.Vector3(1.0, -1.0, 0.0);
        const d = new THREE.Vector3(-1.0, -1.0, 0.0);
        squareMesh2 = createRectangle(a, b, c, d, 0xFFFF00);
    }
    squareMesh2.position.set(3.0, 2.0, -8.0);
    scene.add(squareMesh2);

    addHome(scene);

    car = addCar(scene, new THREE.Vector3(-3, 2, 3));

    christmasTree = addChristmasTree(scene, new THREE.Vector3(5, -3, 0));
}

function animateScene() {


    for (let i = 0; i < christmasTree.length; i++) {
        tree = christmasTree[i];
        tree.rotation.y += 0.04;
    }

    for (let i = 0; i < car.length; i++) {
        segment = car[i];
        segment.position.x += 0.01;
    }
    for (let i = 1; i < car.length; i++) {
        wheel = car[i];
        wheel.rotation.z -= 0.01;
    }




    requestAnimationFrame(animateScene);


    renderScene();
}

/**
 * Render the scene. Map the 3D world to the 2D screen.
 */
function renderScene() {
    renderer.render(scene, camera);

}

function createTriangle(a, b, c, color) {
    const points = [
        a, b, c
    ];
    const triangleGeometry = new THREE.BufferGeometry().setFromPoints(points);

    // triangleGeometry.faces.push(new THREE.Face3(0, 1, 2));

    let triangleMaterial = new THREE.MeshBasicMaterial({
        color: color,
        side: THREE.DoubleSide
    });

    return new THREE.Mesh(triangleGeometry, triangleMaterial);
}

function createRectangle(a, b, c, d, color) {
    const points = [
        a, b, c, d
    ];
    let squareGeometry = new THREE.BufferGeometry().setFromPoints(points);


    // squareGeometry.faces.push(new THREE.Face3(0, 1, 2));
    // squareGeometry.faces.push(new THREE.Face3(0, 2, 3));




    let squareMaterial = new THREE.MeshBasicMaterial({
        color: color,
        side: THREE.DoubleSide
    });



    return new THREE.Mesh(squareGeometry, squareMaterial);
}

function createCircle(radius, color) {

    let geometry = new THREE.CircleGeometry(radius, Math.ceil(radius * 50));
    let squareMaterial = new THREE.MeshBasicMaterial({
        color: color,
        side: THREE.DoubleSide
    });



    return new THREE.Mesh(geometry, squareMaterial);

}

function addHome(scene) {
    let mesh = createRectangle(new THREE.Vector3(0, 0, 0), new THREE.Vector3(1, 0, 0), new THREE.Vector3(1, 1, 0), new THREE.Vector3(0, 1, 0), '#0000FF');
    mesh.position.set(3.0, 2.0, 1);
    scene.add(mesh);

    mesh = createRectangle(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.25, 0, 0), new THREE.Vector3(0.25, 0.25, 0), new THREE.Vector3(0, 0.25, 0), '#00FFFF');
    mesh.position.set(3.1, 2.5, 1.1);
    scene.add(mesh);

    mesh = createRectangle(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.25, 0, 0), new THREE.Vector3(0.25, 0.25, 0), new THREE.Vector3(0, 0.25, 0), '#00FFFF');
    mesh.position.set(3.6, 2.5, 1.1);
    scene.add(mesh);

    mesh = createTriangle(new THREE.Vector3(0, 1, 0), new THREE.Vector3(1, 1, 0), new THREE.Vector3(0.5, 1.41, 0), '#FF00FF');
    mesh.position.set(3.0, 2.0, 1);
    scene.add(mesh);
}

function addChristmasTree(scene, position) {
    let meshes = [];
    let height = 0;
    let scale = 1;
    for (let i = 0; i < 6; i++) {
        let mesh = createTriangle(new THREE.Vector3(-scale, height, 0), new THREE.Vector3(scale, height, 0), new THREE.Vector3(0, height + scale, 0), '#00BB00');
        mesh.position.set(position.x, position.y, position.z)
        scene.add(mesh);
        height += scale;
        scale -= 1 / (i + 4);
        meshes.push(mesh);
    }
    return meshes;
}

function addCar(scene, position) {
    let meshes = [];

    let mesh = createRectangle(new THREE.Vector3(0, 0, 0), new THREE.Vector3(2, 0, 0), new THREE.Vector3(2, 1, 0), new THREE.Vector3(0, 1, 0), '#0000FF');
    mesh.position.set(position.x, position.y, position.z);
    scene.add(mesh);
    meshes.push(mesh);

    mesh = createCircle(0.3, '#00FFFF');
    mesh.position.set(position.x + 0.1, position.y + 0.1, position.z + 0.1);
    scene.add(mesh);
    meshes.push(mesh);

    mesh = createCircle(0.3, '#00FFFF');
    mesh.position.set(position.x + 1.8, position.y + 0.1, position.z + 0.1);
    scene.add(mesh);
    meshes.push(mesh);

    return meshes;
}















