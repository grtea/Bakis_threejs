import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'
import { laneToPos } from './Helpers/logichelpers.js';
import { spawnPosition } from './Helpers/angleCalculator';

var gui, canvas, scene, camera, controls, renderer;
var player;
var playerLane = 2;
var groundCylinder;
var speed = 0.8;
var worldSize = 7;
var fogDensity = 0.5;
var guisettings = {
    Fog: false,
    Speed: speed
};

//controls
var rightKey = 39;
var rightKeyPressed = false;
var leftKey = 37;
var leftKeyPressed = false;

document.addEventListener("keydown", keyDownHandler, false);	
document.addEventListener("keyup", keyUpHandler, false);


init();

function init(){
    createScene();
    // controls = new OrbitControls(camera, canvas);
    addGround();
    addPlayer(0xff0000);
    animate();

    var lane = 0;
    var make = setInterval(() => {
        // var randLane = Math.floor(Math.random() * (4 - 1) + 1);
        // console.log(randLane);
        lane += 1;
        addTree(lane, 0xffff00);
        console.log(lane);
    }, 3000);

    setTimeout(() => {
        clearInterval(make);
    }, 9500);
    
}

function createScene(){
    // Debug
    gui = new dat.GUI();
    gui.add(guisettings, 'Speed', 0.1, 20).onChange((v) => {
        speed = v;
    });

    // Canvas
    canvas = document.querySelector('canvas.webgl');

    // Scene
    scene = new THREE.Scene()
    scene.background = new THREE.Color( 0xc4e6ff );
    scene.fog = new THREE.FogExp2( 0x096b20, 0 );

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
    camera = new THREE.PerspectiveCamera(50, sizes.width / sizes.height, 0.1, 1000)
    // camera = new THREE.OrthographicCamera(width / - 2, width / 2, height / 2, height / - 2, 1, 1000)
    camera.position.x = 0
    camera.position.y = 7
    camera.position.z = 3.8
    scene.add(camera)

    // Controls
    
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
    groundCylinder.rotation.z = Math.PI / 2;
    scene.add( groundCylinder );
}

function addTree(lane, color){
    const posY = laneToPos(lane);
    const geometry = new THREE.ConeGeometry( 0.5, 1, 6 );
    const material = new THREE.MeshBasicMaterial( {color: color} );
    const cone = new THREE.Mesh( geometry, material );
    var coords = spawnPosition(worldSize, groundCylinder.rotation.x);
    cone.rotation.x = Math.PI / 2;
    cone.rotation.z = Math.PI / 2 + groundCylinder.rotation.x * -1;

    cone.position.x = coords.x;
    cone.position.z = coords.z;
    cone.position.y = posY;

    groundCylinder.add( cone );
    return cone;
}

function addPlayer(color) {
    const geometry = new THREE.SphereGeometry( 0.09, 32, 16 );
    const material = new THREE.MeshBasicMaterial( { color: color } );
    player = new THREE.Mesh( geometry, material );
    player.position.y = 6.8;
    player.position.x = laneToPos(playerLane);
    player.position.z = 2.3;
    scene.add(player);
}

function keyDownHandler(event){
    if(event.keyCode == rightKey && player.position.x < 1){
        player.position.x += 1;
    }
    else if(event.keyCode == leftKey && player.position.x > -1){
        player.position.x -= 1;
    }
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
         groundCylinder.rotation.x = elapsedTime*speed % THREE.Math.degToRad(360);
        //  console.log(THREE.Math.radToDeg(groundCylinder.rotation.x));

        var rot = THREE.Math.radToDeg(groundCylinder.rotation.x);
 
        //  Update Orbital Controls
        if(controls) controls.update()
        
         // Render
         renderer.render(scene, camera)
 
         // Call tick again on the next frame
         window.requestAnimationFrame(tick)
     }
 
     tick()
}


