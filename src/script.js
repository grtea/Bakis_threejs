import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'

var gui, canvas, scene, camera, controls, renderer;
var groundCylinder;

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

    // Canvas
    canvas = document.querySelector('canvas.webgl');

    // Scene
    scene = new THREE.Scene()
    scene.background = new THREE.Color( 0xc4e6ff );
    scene.fog = new THREE.FogExp2( 0x096b20, 1 );

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
    camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
    camera.position.x = 0
    camera.position.y = 1
    camera.position.z = 2
    scene.add(camera)

    // Controls
    // controls = new OrbitControls(camera, canvas)
    // controls.enableRotate = false;
    // controls.enableDamping = true

    //axis helper for dev
    const axesHelper = new THREE.AxesHelper( 10 );
    // axesHelper.setColors(new THREE.Color(0xfc0303), new THREE.Color(0x0307fc), new THREE.Color(0x03fc3d));
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
    const geometry = new THREE.CylinderGeometry( 1.5, 1.5, 10, 30 );
    const material = new THREE.MeshBasicMaterial( {color: 0x03fc3d} );
    groundCylinder = new THREE.Mesh( geometry, material );
    console.log("Ground created?");
    groundCylinder.rotation.z = Math.PI / 2;
    scene.add( groundCylinder );
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
         groundCylinder.rotation.x = .5 * elapsedTime
 
        //  Update Orbital Controls
        //  controls.update()
 
         // Render
         renderer.render(scene, camera)
 
         // Call tick again on the next frame
         window.requestAnimationFrame(tick)
     }
 
     tick()
}


