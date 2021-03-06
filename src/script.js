import './style.css';
import * as THREE from 'three';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { laneToPos, DarkenColor } from './Helpers/logichelpers.js';
import { spawnPosition } from './Helpers/angleCalculator.js';
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

//ASSETS
import { sparkleAudio } from './sounds/sparkle.wav';
import { collectAudio } from './sounds/collect.wav';
import { dedAudio } from './sounds/ded.wav';
import { tone1 } from './sounds/htone1.wav';
import { tone2 } from './sounds/htone2.wav';
import { tone3 } from './sounds/htone3.wav';
import { clickAudio } from './sounds/click.wav';
import { clickNegativeAudio } from './sounds/clickNegative.wav';
import { bonkIncomingAudio } from './sounds/bonk-incoming1.wav';

var canvas, scene, camera, controls, renderer, outlinePassPlayer, composer, animationFrame;
var player;
var listener, listener2;
var playerLane = 2;
var groundCylinder;
var obstaclePool = [];
var collectablePool = [];
var collisionDistance = 0.4;
var fov = 50;

var points = 0;
var speed = 0.8;
var worldSize = 7;
var fogDensity = 0.2;

var collectSound, collideSound, stepSound1, stepSound2, stepSound3;
var ringIndicatorSound, coneIndicatorSound;
var buttonAudioNegative, buttonAudio;

var gameIsOver = false;
var gamePlaying = false;
window.settingsOpen = false;
var make;

//controls
var playerPositionGoal;
var playerMovingRight = false;
var playerMovingLeft = false;

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("mousemove", mouseMoveHandler, false);

window.userData = {};

//Default settings data
if(!localStorage.getItem('userData')){
    setDefault();
    localStorage.setItem("userData", 
        JSON.stringify(window.userData));
}

//Loading userData
if(localStorage.getItem('userData')){
    loadUserData();
}

applyUserData();

var groundColor = 0x009e74; 
var backgroundColor = 0x56b4e9;

if(window.userData.highContrast){
    groundColor = DarkenColor(groundColor, 0x99);
    backgroundColor = DarkenColor(backgroundColor, 0x99);
    fogDensity = 0;
}
if(window.userData.outline){
    fogDensity = 0;
}


init();

function init(){
    createScene();
    addPlayer();
    addListener();
    setSounds();
    addGround();
    animate();
}

function createScene(){
    // Canvas
    canvas = document.querySelector('canvas.webgl');

    // Scene
    scene = new THREE.Scene()
    scene.background = new THREE.Color( backgroundColor );
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

    const planeAspectRatio = 16 / 9;

    window.addEventListener('resize', () =>
    {
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
        renderer.setSize(sizes.width, sizes.height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        composer.setSize(sizes.width, sizes.height);

        composer.render();
    })

    /**
     * Camera
     */

    // Base camera
    if (sizes.width / sizes.height > planeAspectRatio) {
        // window too narrow
        camera = new THREE.PerspectiveCamera(fov, sizes.width / sizes.height, 0.1, 1000);
    } else {
        // window too large
        const cameraHeight = Math.tan(MathUtils.degToRad(fov / 2));
        const ratio = (sizes.width / sizes.height) / planeAspectRatio;
        const newCameraHeight = cameraHeight / ratio;
        const customfov = MathUtils.radToDeg(Math.atan(newCameraHeight)) * 2;
        camera = new THREE.PerspectiveCamera(customfov, sizes.width / sizes.height, 0.1, 1000);
    }

    //normal camera
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

    /**
     * post-processing
     */
    composer = new EffectComposer( renderer );
    composer.addPass( new RenderPass( scene, camera ) );

    outlinePassPlayer = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), scene, camera);
    outlinePassPlayer.edgeStrength = 5;
    outlinePassPlayer.visibleEdgeColor.set('#ffffff');
    composer.addPass( outlinePassPlayer );
}

function setSounds(){
    /**
     * Sounds
     */

    listener = new THREE.AudioListener();
    player.add( listener );

    const audioLoader = new THREE.AudioLoader();

    stepSound1 = new THREE.PositionalAudio(listener);
    audioLoader.load('assets/audio/htone1.wav', function( buffer ) {
        stepSound1.setBuffer( buffer );
        stepSound1.setRefDistance(5);
        stepSound1.setVolume(window.userData.gameVolume);
    })

    stepSound2 = new THREE.PositionalAudio(listener);
    audioLoader.load('assets/audio/htone2.wav', function( buffer ) {
        stepSound2.setBuffer( buffer );
        stepSound2.setRefDistance(5);
        stepSound2.setVolume(window.userData.gameVolume);
    })

    stepSound3 = new THREE.PositionalAudio(listener);
    audioLoader.load('assets/audio/htone3.wav', function( buffer ) {
        stepSound3.setBuffer( buffer );
        stepSound3.setRefDistance(5);
        stepSound3.setVolume(window.userData.gameVolume);
    })

    if(!buttonAudio){
    //button clicks
    var UIbuttons = document.getElementsByTagName('button');
    var checkboxes = document.getElementsByClassName('form-check-input');

    buttonAudio = new THREE.Audio(listener);
    audioLoader.load('assets/audio/click.wav', function(buffer) {
        buttonAudio.setBuffer( buffer );
        buttonAudio.setVolume(window.userData.uiVolume);
    });

    buttonAudioNegative = new THREE.Audio(listener);
    audioLoader.load('assets/audio/clickNegative.wav', function(buffer) {
        buttonAudioNegative.setBuffer( buffer );
        buttonAudioNegative.setVolume(window.userData.uiVolume);
    });

    for(var btn of UIbuttons){
        if(btn.classList.contains('btn-negative-click')){
            btn.addEventListener('click', event => {
                buttonAudioNegative.play();
            })
        }
        else{
            btn.addEventListener('click', event => {
                buttonAudio.play();
            })
        }
    }

    for(var checkbox of checkboxes){
        checkbox.addEventListener('click', (e) => {
            if(e.target.checked){
                buttonAudio.play();
            }
            else{
                buttonAudioNegative.play();
            }
        })
    };

    }
}

function addGround(){
    const geometry = new THREE.CylinderGeometry( worldSize, worldSize, 10, 30 );
    const material = new THREE.MeshBasicMaterial( {color: groundColor} );
    groundCylinder = new THREE.Mesh( geometry, material );
    groundCylinder.rotation.z = Math.PI / 2;
    scene.add( groundCylinder );
}

function addObstacle(){
    const geometry = new THREE.ConeGeometry( 0.25, 0.5, 6 );
    const material = new THREE.MeshBasicMaterial( {color: 0xee00ff} );
    const cone = new THREE.Mesh( geometry, material );
    cone.spawnRotation = groundCylinder.rotation.x;
    cone.indicated = false;

    const audioLoader = new THREE.AudioLoader();
    collideSound = new THREE.PositionalAudio(listener);
    audioLoader.load( 'assets/audio/ded.wav', function( buffer ) {
        collideSound.setBuffer( buffer );
        collideSound.setRefDistance(10);
        collideSound.setVolume(window.userData.gameVolume);
        collideSound.name = "collider";
        cone.add(collideSound);
    });

    coneIndicatorSound = new THREE.PositionalAudio(listener2);
    audioLoader.load( 'assets/audio/bonk-incoming1.wav', function( buffer ) {
        coneIndicatorSound.setBuffer( buffer );
        coneIndicatorSound.setRefDistance(5);
        coneIndicatorSound.setVolume(window.userData.indicatorVolume);
        coneIndicatorSound.name = "indicator";
        cone.add(coneIndicatorSound);
    });

    if(window.userData.outline){
        var outlineMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000, side: THREE.BackSide } );
        var outlineMesh = new THREE.Mesh( geometry, outlineMaterial );
        outlineMesh.scale.multiplyScalar( 1.1 );
        cone.add( outlineMesh );
    }else{
        cone.scale.multiplyScalar( 1.1 );
    }

    return cone;
}

function addCollectable(){
    const geometry = new THREE.TorusGeometry(0.1, 0.05, 7, 13, 6.283185307179586);
    const material = new THREE.MeshBasicMaterial({color: 0xffff00}); //0xf59e42
    const torus = new THREE.Mesh( geometry, material );
    torus.spawnRotation = groundCylinder.rotation.x;
    torus.indicated = false;

    const audioLoader = new THREE.AudioLoader();
    collectSound = new THREE.PositionalAudio(listener);
    audioLoader.load( 'assets/audio/collect.wav', function( buffer ) {
        collectSound.setBuffer( buffer );
        collectSound.setRefDistance(5);
        collectSound.setVolume(window.userData.gameVolume);
        collectSound.name = "collider";
        torus.add(collectSound);
    });

    ringIndicatorSound = new THREE.PositionalAudio(listener2);
    audioLoader.load( 'assets/audio/sparkle.wav', function( buffer ) {
        ringIndicatorSound.setBuffer( buffer );
        ringIndicatorSound.setRefDistance(5);
        ringIndicatorSound.setVolume(window.userData.indicatorVolume);
        ringIndicatorSound.name = "indicator";
        torus.add(ringIndicatorSound);
    });

    if(window.userData.outline){
        var outlineMaterial = new THREE.MeshBasicMaterial( { color: 0x0000ff, side: THREE.BackSide } );
        var outlineMesh1 = new THREE.Mesh( geometry, outlineMaterial );
        outlineMesh1.scale.multiplyScalar( 1.1 );
        torus.add( outlineMesh1 );

        var outlineMesh2 = new THREE.Mesh( geometry, outlineMaterial );
        outlineMesh2.scale.multiplyScalar( 0.7 );
        torus.add( outlineMesh2 );
    }

    return torus;
}

function addPlayer() {
    const geometry = new THREE.SphereGeometry( 0.09, 32, 16 );
    const material = new THREE.MeshBasicMaterial( { color: 0xff0000 } );
    player = new THREE.Mesh( geometry, material );
    player.position.y = 6.8;
    player.position.x = laneToPos(playerLane);
    player.position.z = 2.3;
    player.rotation.x += Math.PI;
    scene.add(player);
}

function addListener(){
    const geometry = new THREE.SphereGeometry( 0.09, 32, 16 );
    const material = new THREE.MeshBasicMaterial( { color: 0xffffff } );
    const listenerObject = new THREE.Mesh( geometry, material );
    listenerObject.position.y = 6.8;
    listenerObject.position.x = laneToPos(2);
    player.position.z = 2.3;
    listenerObject.material.transparent = true;

    listener2 = new THREE.AudioListener();
    listenerObject.add(listener2);
    scene.add(listenerObject);
}

function spawnOnGround(obj, lane, r) {
    const posY = laneToPos(lane);
    var coords = spawnPosition(r, groundCylinder.rotation.x);
    
    obj.position.x += coords.x;
    obj.position.z += coords.z;
    obj.position.y = posY;

    groundCylinder.add( obj );
}

function despawn(objArray){
    objArray.forEach(obj => {
        if(obj.isCollided == true){
            groundCylinder.remove(obj);
            scene.remove(obj);
            objArray.splice(objArray.indexOf(obj), 1);
        }
    });
}

function periodicDespawn(objArray){
    for(let obj of objArray){
        if(hasTravelledDistance(obj, 5.5)){
            groundCylinder.remove(obj);
            scene.remove(obj);
            objArray.splice(objArray.indexOf(obj), 1);
        }
    }
}

function mouseMoveHandler(event){
    var zoneLength = window.innerWidth / 3
    var zone1 = zoneLength;
    var zone2 = zoneLength * 2;
    if(gamePlaying && !playerMovingLeft && !playerMovingRight && window.userData.mouseControls){
        if(event.clientX < zone1 && player.position.x > -1){
            //Leftmost
            playerMovingLeft = true;
            playerPositionGoal = player.position.x - 1;
        }
        else if (event.clientX >= zone1 && event.clientX < zone2 && player.position.x != 0){
            //Mid
            if(player.position.x < 1){
                playerMovingRight = true;
                playerPositionGoal = player.position.x + 1;
            }
            else if(player.position.x > -1){
                playerMovingLeft = true;
                playerPositionGoal = player.position.x - 1;
            }
        }
        else if (event.clientX >= zone2 && player.position.x < 1){
            //Rightmost
            playerMovingRight = true;
            playerPositionGoal = player.position.x + 1;
        }
    }
}

function keyDownHandler(event){
    if(gamePlaying){
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
        //escape
        if(event.keyCode == 27){
            exitGameplay();
        }
    }
}
window.keyDownHandler = keyDownHandler;

function isCollision(objArray, player, cleanup = false){
    let isCollided = false;

    for(let obj of objArray) {
        if(obj.isCollided == true) break;
        var objWorldPos = new Vector3;
        obj.getWorldPosition(objWorldPos);

        if(objWorldPos.distanceTo(player.position)<=collisionDistance){
            obj.isCollided = true;
            isCollided = true;
            if(!cleanup){
                for (let child of obj.children){
                    if(child.name == "collider"){
                        child.play();
                    }
                }
            }
            break;
        }
        else{
            isCollided = false;
        }
    }
    return isCollided; 
}

function checkVisibility(objArray){
    for(let obj of objArray){
        if(hasTravelledDistance(obj, 2.8) && !obj.indicated){
            for (let child of obj.children){
                if(child.name == "indicator"){
                    child.play();
                }
            }
            obj.indicated = true;
        }
    }
}

function hasTravelledDistance(obj, distance){
    const roundedSpawnRot = Math.round(obj.spawnRotation * 1000)/1000;
    const roundedCurrentRot = Math.round(groundCylinder.rotation.x * 1000)/1000;
    const goalRot = roundedSpawnRot + distance;

    if(roundedCurrentRot >= goalRot){
        return true;
    }
    else{
        return false;
    }
}

function playStepSound(){
    //Movement sounds
    switch (player.position.x){
        case -1:
            stepSound1.play();
            break;
        case 0:
            stepSound2.play();
            break;
        case 1:
            stepSound3.play();
            break; 
    }
}

function animate(){
    /**
     * Animate
     */

    const clock = new THREE.Clock()

    const tick = () => {
        const elapsedTime = clock.getElapsedTime()

        // Update objects
        groundCylinder.rotation.x = elapsedTime*speed;

        //Player movement animation
        if(playerMovingRight && playerPositionGoal>player.position.x){
            player.position.x += 0.1;
        }
        if(playerMovingRight && playerPositionGoal<=player.position.x){
            playerMovingRight = false;
            player.position.x = playerPositionGoal;
            playStepSound();
        }
        if(playerMovingLeft && playerPositionGoal<player.position.x){
            player.position.x -= 0.1;
        }
        if(playerMovingLeft && playerPositionGoal>=player.position.x){
            playerMovingLeft = false;
            player.position.x = playerPositionGoal;
            playStepSound();
        }

        // Collision detection
        if(isCollision(obstaclePool, player)){
            gameIsOver = true;
        }

        if(isCollision(collectablePool, player)){
            points += 1;
            var pointCounter = document.getElementsByClassName("pointCount");
            for (var element of pointCounter){
                element.innerHTML = points;
            }
            despawn(collectablePool);
        }

        //Indicator sounds
        checkVisibility(collectablePool);
        checkVisibility(obstaclePool);

        //general cleanup jei blogai ispawnintu netycia XD
        obstaclePool.forEach(obstacle => {
            if(isCollision(collectablePool, obstacle, true)){
                console.log("cleanup");
                despawn(collectablePool);
            }
        })

        periodicDespawn(collectablePool);
        periodicDespawn(obstaclePool);

        if (gameIsOver){
            gameOver();
            return 0;
        }
        else{
            // Call tick again on the next frame
            animationFrame = window.requestAnimationFrame(tick);
        }

        if(gamePlaying){
            speed += 0.00001;
            collisionDistance = speed/2;
        }

        // Render
        // renderer.render(scene, camera);
        composer.render();
    }

    tick()
}

function gameOver(){
    var msg = new SpeechSynthesisUtterance();
    msg.text = "Game over. Final score " + points;
    msg.volume = window.userData.speechVolume;
    window.speechSynthesis.speak(msg);

    gamePlaying = false;
    var gameOverElements = document.getElementsByClassName("showOnDeath");
    for( var element of gameOverElements){
        element.style.display = 'inline';
    }
    var heightDiv = document.getElementsByClassName("showOnDeath2")[0];
    heightDiv.style.height = '100%';
    var showOnGameplay = document.getElementsByClassName("showOnGameplay");
    for( var element of showOnGameplay){
        element.style.display = 'none';
    }
    hideButtons();
    clearInterval(make);
}

/* FUNCTIONS FOR THE DOM */
function exitGameplay(){
    gameIsOver = true;
}
window.exitGameplay = exitGameplay;

function restartScene(){
    for(var obstacle in obstaclePool){
        scene.remove(obstacle);
    }
    obstaclePool = [];

    for(var collectable in collectablePool){
        scene.remove(collectable);
    }
    collectablePool = [];

    groundCylinder.remove.apply(groundCylinder, groundCylinder.children);
    scene.remove.apply(scene, scene.children);

    points = 0;
    var pointCounter = document.getElementsByClassName("pointCount");
    for (var element of pointCounter){
        element.innerHTML = points;
    }
    document.getElementsByClassName("gameOverScreen")[0].style.display = 'none';

    var showOnStart = document.getElementsByClassName("showOnStart");
    for(var element of showOnStart){
        element.style.display = 'inline';
    }
    gameIsOver = false;

    init();
};
window.restartScene = restartScene; //makes function global so index.html can see it !!!!

function startSpawn(){
    var msg = new SpeechSynthesisUtterance();
    msg.text = "Game start!";
    msg.volume = window.userData.speechVolume;
    window.speechSynthesis.speak(msg);

    gamePlaying = true;
    collisionDistance = speed/2;
    var showOnGameplay = document.getElementsByClassName("showOnGameplay");
    for( var element of showOnGameplay){
        element.style.display = 'inline';
    }
    var hideDuringGameplay = document.getElementsByClassName("hideDuringGameplay");
    for (var element of hideDuringGameplay){
        element.style.display = 'none';
    }
    var heightDiv = document.getElementsByClassName("hideDuringGameplay2")[0];
    heightDiv.style.height = 0;
    loadButtons();

    if(window.userData.outline){
        outlinePassPlayer.selectedObjects.push(player);
    }

    var spawnPeriod = 800/speed;
    make = setInterval(() => {
        var randLane1 = Math.floor(Math.random() * (4 - 1) + 1);
        var randLane2 = Math.floor(Math.random() * (4 - 1) + 1);
        while (randLane1==randLane2){
            randLane2 = Math.floor(Math.random() * (4 - 1) + 1);
        }

        var spawnTimeout1 = Math.floor(Math.random() * (spawnPeriod - 0 + 1));
        var spawnTimeout2 = Math.floor(Math.random() * (spawnPeriod - 0 + 1));
        while(spawnTimeout1==spawnTimeout2){
            spawnTimeout2 = Math.floor(Math.random() * (spawnPeriod - 0 + 1));
        }

        setTimeout(() => {
            var collectable = addCollectable();
            spawnOnGround(collectable, randLane1, worldSize+0.2);
            collectable.rotation.x = 0; // to make ring turned
            collectable.rotation.y = groundCylinder.rotation.x; //offset ground rotation
            collectablePool.push(collectable);
        }, spawnTimeout2);
        
        setTimeout(() => {
            var obstacle = addObstacle();
            spawnOnGround(obstacle, randLane2, worldSize+0.25);
            obstacle.rotation.x = Math.PI / 2; //rotate
            obstacle.rotation.z = Math.PI / 2 + groundCylinder.rotation.x * -1; //offset ground rotation
            obstaclePool.push(obstacle);
        }, spawnTimeout1);
    }, spawnPeriod);
}
window.startSpawn = startSpawn;

function loadButtons(){
    if(window.userData.onScreenButtons){
        document.getElementsByClassName('onScreenControls')[0].style.display = 'inline';
    }
}

function hideButtons(){
    if(window.userData.onScreenButtons){
        document.getElementsByClassName('onScreenControls')[0].style.display = 'none';
    }
}

//SPEED SLIDER
var speedSlider = document.getElementById('speedSlider');
speedSlider.addEventListener('change', () => {
    speed = parseFloat(speedSlider.value);
    var text = document.getElementById('difficultyText');
    text.innerHTML = Math.round(10*(speed-0.3));
});