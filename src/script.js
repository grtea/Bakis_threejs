import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { laneToPos } from './Helpers/logichelpers.js';
import { spawnPosition } from './Helpers/angleCalculator';
import './Helpers/settings';
import { Vector3 } from 'three';
import { MathUtils } from 'three';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/js/fontawesome'
import '@fortawesome/fontawesome-free/js/solid'
import '@fortawesome/fontawesome-free/js/regular'
import '@fortawesome/fontawesome-free/js/brands'
import { applyUserData, loadUserData, setDefault } from './Helpers/settings';

var canvas, scene, camera, controls, renderer;
var player;
var playerLane = 2;
var groundCylinder;
var treePool = [];
var collectablePool = [];
var collisionDistance = 0.4;
var fov = 50;

var points = 0;
var speed = 0.8;
var worldSize = 7;
var fogDensity = 0.2;

var gameOver = false;
var make;

//controls
var playerPositionGoal;
var playerMovingRight = false;
var playerMovingLeft = false;

document.addEventListener("keydown", keyDownHandler, false);

window.userData = {};

//Default settings data
if(!localStorage.getItem('userData')){
    setDefault();
}

//Loading userData
if(localStorage.getItem('userData')){
    loadUserData();
}

applyUserData();

init();

function init(){
    createScene();
    // controls = new OrbitControls(camera, canvas);
    addGround();
    addPlayer(0xff0000);
    animate();
}

function createScene(){
    // Canvas
    canvas = document.querySelector('canvas.webgl');

    // Scene
    scene = new THREE.Scene()
    scene.background = new THREE.Color( 0xc4e6ff );
    scene.fog = new THREE.FogExp2( 0x096b20, fogDensity );

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
        const fov = 50;
        const planeAspectRatio = 16 / 9;

        // Update sizes
        sizes.width = window.innerWidth
        sizes.height = window.innerHeight

        // Update camera
        camera.aspect = sizes.width / sizes.height
    
        if (camera.aspect > planeAspectRatio) {
            // window too narrow
            camera.fov = fov;
        } else {
            // window too large
            const cameraHeight = Math.tan(MathUtils.degToRad(fov / 2));
            const ratio = camera.aspect / planeAspectRatio;
            const newCameraHeight = cameraHeight / ratio;
            camera.fov = MathUtils.radToDeg(Math.atan(newCameraHeight)) * 2;
        }
        
        camera.updateProjectionMatrix();

        // Update renderer
        renderer.setSize(sizes.width, sizes.height)
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    })

    /**
     * Camera
     */
    // Base camera
    camera = new THREE.PerspectiveCamera(fov, sizes.width / sizes.height, 0.1, 1000)
    // camera = new THREE.OrthographicCamera(width / - 2, width / 2, height / 2, height / - 2, 1, 1000)
    camera.position.x = 0
    camera.position.y = 7
    camera.position.z = 3.8
    scene.add(camera)

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

function addTree(color){
    const geometry = new THREE.ConeGeometry( 0.5, 1, 6 );
    const material = new THREE.MeshBasicMaterial( {color: color} );
    const cone = new THREE.Mesh( geometry, material );
    cone.spawnRotation = groundCylinder.rotation.x;
    cone.justSpawned = true;
    return cone;
}

function addCollectable(){
    const geometry = new THREE.TorusGeometry(0.1, 0.05, 7, 13, 6.283185307179586);
    const material = new THREE.MeshBasicMaterial({color: 0xf59e42});
    const torus = new THREE.Mesh( geometry, material );
    torus.spawnRotation = groundCylinder.rotation.x;
    torus.justSpawned = true;
    return torus;
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

function spawnOnGround(obj, lane, r) {
    const posY = laneToPos(lane);
    var coords = spawnPosition(r, groundCylinder.rotation.x);
    obj.rotation.x = Math.PI / 2;
    obj.rotation.z = Math.PI / 2 + groundCylinder.rotation.x * -1;

    obj.position.x += coords.x;
    obj.position.z += coords.z;
    obj.position.y = posY;

    groundCylinder.add( obj );
}

function despawn(objArray, despawnCase){
    switch (despawnCase){
        case "collision":
            objArray.forEach(obj => {
                if(obj.isCollided == true){
                    groundCylinder.remove(obj);
                    scene.remove(obj);
                    objArray.splice(objArray.indexOf(obj), 1);
                }
            });
            break;
        case "periodic":
            objArray.forEach(obj => {
                if((obj.spawnRotation + Math.PI) % THREE.Math.degToRad(360) <= groundCylinder.rotation.x){
                    obj.justSpawned = false;
                }
                var roundedSpawnRot = Math.round(obj.spawnRotation * 1000)/1000;
                var roundedCurrentRot = Math.round(groundCylinder.rotation.x * 100)/100

                if((roundedSpawnRot < roundedCurrentRot+0.01 && roundedSpawnRot > roundedCurrentRot-0.01) && !obj.justSpawned){
                    groundCylinder.remove(obj);
                    scene.remove(obj);
                    objArray.splice(objArray.indexOf(obj), 1);
                }
            });
            break;
    } 
}

function keyDownHandler(event){
    if(!playerMovingLeft && !playerMovingRight){
        if(event.keyCode == window.userData.rightKey && player.position.x < 1){
            playerMovingRight = true;
            playerPositionGoal = player.position.x + 1;
        }
        else if(event.keyCode == window.userData.leftKey && player.position.x > -1){
            playerMovingLeft = true;
            playerPositionGoal = player.position.x - 1;
        }
    }
}

function isCollision(objArray, player){
    let isCollided = false;

    for(let obj of objArray) {
        if(obj.isCollided == true) break;

        var objWorldPos = new Vector3;
        obj.getWorldPosition(objWorldPos);

        if(objWorldPos.distanceTo(player.position)<=collisionDistance){
            obj.isCollided = true;
            isCollided = true;
            break;
        }
        else{
            isCollided = false;
        }
    }
    return isCollided; 
}

function animate(){
    /**
     * Animate
     */

    const clock = new THREE.Clock()

    const tick = () => {
        const elapsedTime = clock.getElapsedTime()

        // Update objects
        groundCylinder.rotation.x = elapsedTime*speed % THREE.Math.degToRad(360);

        //Player movement animation
        if(playerMovingRight && playerPositionGoal>player.position.x){
            player.position.x += 0.1;
        }
        if(playerMovingRight && playerPositionGoal<=player.position.x){
            playerMovingRight = false;
            player.position.x = playerPositionGoal;
        }
        if(playerMovingLeft && playerPositionGoal<player.position.x){
            player.position.x -= 0.1;
        }
        if(playerMovingLeft && playerPositionGoal>=player.position.x){
            playerMovingLeft = false;
            player.position.x = playerPositionGoal;
        }

        // // console.log(groundCylinder.rotation);

        //  Update Orbital Controls
        if(controls) controls.update()

        // Collision detection
        if(isCollision(treePool, player)){
            gameOver = true;
        }

        if(isCollision(collectablePool, player)){
            points += 1;
            var pointCounter = document.getElementsByClassName("pointCount");
            for (var element of pointCounter){
                element.innerHTML = points;
            }
            despawn(collectablePool, "collision");
        }

        //general cleanup jei blogai ispawnintu netycia XD
        treePool.forEach(tree => {
            if(isCollision(collectablePool, tree)){
                despawn(collectablePool, "collision");
            }
        })

        despawn(collectablePool, "periodic");
        despawn(treePool, "periodic");
        
        // Render
        renderer.render(scene, camera);

        if (gameOver){
            var gameOverScreenElement = document.getElementsByClassName("gameOverScreen")[0];
            gameOverScreenElement.style.display = 'inline';
            clearInterval(make);
            return 0;
        }
        else{
            // Call tick again on the next frame
            window.requestAnimationFrame(tick);
        }
    }

    speed += 0.01;
    tick()
}

/* FUNCTIONS FOR THE DOM */

function restartScene(){
    treePool = [];
    collectablePool = [];
    gameOver = false;
    points = 0;
    var pointCounter = document.getElementsByClassName("pointCount");
    for (var element of pointCounter){
        element.innerHTML = points;
    }
    document.getElementsByClassName("gameOverScreen")[0].style.display = 'none';

    init();

    var startGameScreen = document.getElementsByClassName("startGameScreen")[0];
    startGameScreen.style.display = 'inline';
    
    console.log("RESTARTED");
};
window.restartScene = restartScene; //makes function global so index.html can see it !!!!

function startSpawnEasy(){
    var startGameScreen = document.getElementsByClassName("startGameScreen")[0];
    startGameScreen.style.display = 'none';

    speed = 0.4;
    collisionDistance = 0.2;

    make = setInterval(() => {
        var randLane1 = Math.floor(Math.random() * (4 - 1) + 1);
        var randLane2 = Math.floor(Math.random() * (4 - 1) + 1);
        while (randLane1==randLane2){
            randLane2 = Math.floor(Math.random() * (4 - 1) + 1);
        }

        var collectable = addCollectable();
        spawnOnGround(collectable, randLane1, worldSize+0.2);
        collectablePool.push(collectable);

        setTimeout(() => {
            var tree = addTree(0xffff00);
            spawnOnGround(tree, randLane2, worldSize);
            treePool.push(tree);
        }, 700);

        var worldPos = new Vector3;
        collectable.getWorldPosition(worldPos);
        // console.log("local: ", collectable.position);
        // console.log("world: ", worldPos);

    }, 1000);
}
window.startSpawnEasy = startSpawnEasy;

function startSpawnHard(){
    var startGameScreen = document.getElementsByClassName("startGameScreen")[0];
    startGameScreen.style.display = 'none';

    speed = 0.8;
    collisionDistance = 0.4;

    make = setInterval(() => {
        var randLane1 = Math.floor(Math.random() * (4 - 1) + 1);
        var randLane2 = Math.floor(Math.random() * (4 - 1) + 1);
        while (randLane1==randLane2){
            randLane2 = Math.floor(Math.random() * (4 - 1) + 1);
        }

        var collectable = addCollectable();
        spawnOnGround(collectable, randLane1, worldSize+0.2);
        collectablePool.push(collectable);

        setTimeout(() => {
            var tree = addTree(0xffff00);
            spawnOnGround(tree, randLane2, worldSize);
            treePool.push(tree);
        }, 700);

        var worldPos = new Vector3;
        collectable.getWorldPosition(worldPos);
        // console.log("local: ", collectable.position);
        // console.log("world: ", worldPos);

    }, 1000);
}
window.startSpawnHard = startSpawnHard;