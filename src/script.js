import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'
import { laneToPos } from './Helpers/logichelpers.js';

var gui, canvas, scene, camera, controls, renderer;
var groundCylinder;
var speed = 1.2;
var worldSize = 7;
var fogDensity = 0.5;
var guisettings = {
    Fog: true,
    Speed: speed
};


init();

function init(){
    createScene();
    // createTempObjects();
    addGround();
    animate();
}

function createScene(){
    // Debug
    gui = new dat.GUI();
    gui.add(guisettings, 'Speed', 1, 20).onChange((v) => {
        speed = v;
    });

    // Canvas
    canvas = document.querySelector('canvas.webgl');

    // Scene
    scene = new THREE.Scene()
    scene.background = new THREE.Color( 0xc4e6ff );
    scene.fog = new THREE.FogExp2( 0x096b20, fogDensity );

    gui.add(guisettings, 'Fog').onChange(() => {
        scene.fog.density==fogDensity ? scene.fog.density=0 : scene.fog.density=fogDensity;
        console.log(scene.fog.density);
    });

    // Lights
    const pointLight = new THREE.PointLight(0xffffff, 0.1)
    pointLight.position.x = 2
    pointLight.position.y = 3
    pointLight.position.z = 4
    scene.add(pointLight);

    /**
     * Sizes
     */
    const sizes = {
        width: window.innerWidth,
        height: window.innerHeight
    }

    window.addEventListener('resize', () =>
    {
        // Update sizes
        sizes.width = window.innerWidth
        sizes.height = window.innerHeight

        // Update camera
        camera.aspect = sizes.width / sizes.height
        camera.updateProjectionMatrix()

        // Update renderer
        renderer.setSize(sizes.width, sizes.height)
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    })

    /**
     * Camera
     */
    // Base camera
    camera = new THREE.PerspectiveCamera(100, sizes.width / sizes.height, 0.1, 1000)
    camera.position.x = 0
    camera.position.y = 7
    camera.position.z = 2.5
    scene.add(camera)

    // Controls
    // controls = new OrbitControls(camera, canvas)
    // controls.enableRotate = false;
    // controls.enableDamping = true
    

    //axis helper for dev
    const axesHelper = new THREE.AxesHelper( 10 );
    scene.add( axesHelper );

    /**
     * Renderer
     */
    renderer = new THREE.WebGLRenderer({
        canvas: canvas
    })
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
}

function addGround(){
    const geometry = new THREE.CylinderGeometry( worldSize, worldSize, 10, 30 );
    const material = new THREE.MeshBasicMaterial( {color: 0x03fc3d} );
    groundCylinder = new THREE.Mesh( geometry, material );
    console.log("Ground created?");
    groundCylinder.rotation.z = Math.PI / 2;
    scene.add( groundCylinder );
    var cone1 = addTree(1);
    var cone2 = addTree(2);
    var cone3 = addTree(3);
    cone2.material.color = new THREE.Color( 0x01fccc );
    cone3.material.color = new THREE.Color( 0x4456ee );
    console.log("Cone1: ", cone1.position);
    console.log("Cone2: ", cone2.position);
    console.log("Cone3: ", cone3.position);
}

function addTree(lane){
    const posY = laneToPos(lane);
    const geometry = new THREE.ConeGeometry( 0.5, 1, 6 );
    const material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
    const cone = new THREE.Mesh( geometry, material );
    cone.rotation.z = Math.PI / 2;
    cone.position.x = -worldSize;
    cone.position.y = posY;
    groundCylinder.add( cone );
    return cone;
}

function createTempObjects(){
    // Objects
    const geometry = new THREE.TorusGeometry( .7, .2, 16, 100 );

    // Materials
    const material = new THREE.MeshBasicMaterial()
    material.color = new THREE.Color(0xff0000)

    // Mesh
    const sphere = new THREE.Mesh(geometry,material)
    scene.add(sphere)

    //Ground
    const groundGeom = new THREE.PlaneGeometry(5, 5, 1, 1);
    const groundMat = new THREE.MeshBasicMaterial({ color: 0xc4ffcc, side: THREE.DoubleSide });

    const ground = new THREE.Mesh(groundGeom, groundMat);
    ground.position.y = -0.5;
    ground.rotation.x = Math.PI / 2;
    scene.add(ground);

}

function animate(){
    /**
     * Animate
     */

     const clock = new THREE.Clock()

     const tick = () =>
     {
 
         const elapsedTime = clock.getElapsedTime()
 
         // Update objects
         groundCylinder.rotation.x = .5 * elapsedTime * speed;
        //  console.log(groundCylinder.rotation.x);
 
        //  Update Orbital Controls
        if(controls) controls.update()
 
         // Render
         renderer.render(scene, camera)
 
         // Call tick again on the next frame
         window.requestAnimationFrame(tick)
     }
 
     tick()
}


