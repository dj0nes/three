/**
 *
 * WebGL With Three.js - Lesson 3
 * http://www.script-tutorials.com/webgl-with-three-js-lesson-3/
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 * 
 * Copyright 2013, Script Tutorials
 * http://www.script-tutorials.com/
 */

// load texture
var texture = THREE.ImageUtils.loadTexture('images/texture.png');
texture.repeat.set(10, 10);
texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
texture.anisotropy = 16;
texture.needsUpdate = true;

var textureBump = THREE.ImageUtils.loadTexture('images/bump.png');
textureBump.repeat.set(10, 10);
textureBump.wrapS = textureBump.wrapT = THREE.RepeatWrapping;
textureBump.anisotropy = 16;
textureBump.needsUpdate = true;

var lesson3 = {
    scene: null,
    camera: null,
    renderer: null,
    container: null,
    controls: null,
    clock: null,
    stats: null,
    step: 0,
    GRID_SIZE: 20,
    CUBE_COUNT: 1000,
    cubes: [],
    cube_speeds: [],
    cube_angles: [],
    cube_positions: [],

    init: function() { // Initialization

        // create main scene
        this.scene = new THREE.Scene();

        var SCREEN_WIDTH = window.innerWidth,
            SCREEN_HEIGHT = window.innerHeight;

        // prepare camera
        var VIEW_ANGLE = 90, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 1, FAR = 1000;
        this.camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR);
        this.scene.add(this.camera);
        this.camera.position.set(0, lesson3.GRID_SIZE + 5, 0);
        this.camera.lookAt(new THREE.Vector3(0,0,0));

        // prepare renderer
        this.renderer = new THREE.WebGLRenderer({antialias:true, alpha: true});
        this.renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
        this.renderer.setClearColor(0xffffff);

        // this.renderer.shadowMapEnabled = true;
        // this.renderer.shadowMapSoft = true;

        // prepare container
        this.container = document.createElement('div');
        document.body.appendChild(this.container);
        this.container.appendChild(this.renderer.domElement);

        // events
        THREEx.WindowResize(this.renderer, this.camera);
        // document.addEventListener( 'keydown', onKeyDown, false );

        // prepare controls (OrbitControls)
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.target = new THREE.Vector3(0, 0, 0);

        // prepare clock
        this.clock = new THREE.Clock();

        // prepare stats
        this.stats = new Stats();
        this.stats.domElement.style.position = 'absolute';
        this.stats.domElement.style.bottom = '0px';
        this.stats.domElement.style.zIndex = 10;
        this.container.appendChild( this.stats.domElement );

        // add hemisphere light
        var hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 1); 
        //hemiLight.color.setHSL(0.6, 1, 0.6);
        //hemiLight.groundColor.setHSL(0.095, 1, 0.75);
        hemiLight.position.set(-200, 400, -200);
        this.scene.add(hemiLight);
/*
        // add point light
        var pointLight = new THREE.PointLight(0xffff00, 1.0);
        pointLight.position.set(300,300,300);
        this.scene.add(pointLight);*/

/*        // add spot light
        var spotLight = new THREE.SpotLight(0xffffff);
        spotLight.position.set(-300,400,300);
        spotLight.castShadow = true;
        spotLight.shadowCameraFov = 60;
        this.scene.add(spotLight);*/








        var material = new THREE.LineBasicMaterial({
            color: 0x00ff00
        });


        var geometry = new THREE.Geometry();
        geometry.vertices.push(new THREE.Vector3(0, 0.01, 0));
        geometry.vertices.push(new THREE.Vector3(0, 0.01, lesson3.GRID_SIZE));
        geometry.vertices.push(new THREE.Vector3(1, 0.01, lesson3.GRID_SIZE - 1));
        geometry.vertices.push(new THREE.Vector3(0, 0.01, lesson3.GRID_SIZE));
        geometry.vertices.push(new THREE.Vector3(-1, 0.01, lesson3.GRID_SIZE - 1));

        var line = new THREE.Line(geometry, material);

        this.scene.add(line);



        var material = new THREE.LineBasicMaterial({
            color: 0xff0000
        });


        var geometry = new THREE.Geometry();
        geometry.vertices.push(new THREE.Vector3(0, 0.01, 0));
        geometry.vertices.push(new THREE.Vector3(lesson3.GRID_SIZE, 0.01, 0));
        geometry.vertices.push(new THREE.Vector3(lesson3.GRID_SIZE - 1, 0.01, 1));
        geometry.vertices.push(new THREE.Vector3(lesson3.GRID_SIZE, 0.01, 0));
        geometry.vertices.push(new THREE.Vector3(lesson3.GRID_SIZE - 1, 0.01, -1));

        var line = new THREE.Line(geometry, material);

        this.scene.add(line);


        for( var i = 0; i < lesson3.CUBE_COUNT; i++) {
            lesson3.cubes[i] = make_a_box();
            lesson3.cube_positions[i] = Math.random() * (lesson3.GRID_SIZE - .5 - .5) + .5;
            lesson3.cube_angles[i] = Math.random() * ( lesson3.GRID_SIZE - .05 ) + .05;
            lesson3.cube_speeds[i] = (Math.random() * ( .1 - .05 ) + .05) / ( 2 + lesson3.cube_positions[i]);
            this.scene.add(lesson3.cubes[i]);
        }




/*
        var box1 = new THREE.BoxGeometry( 1, 1, 1 );
        var material = new THREE.MeshBasicMaterial( {
            color: 0x00ff00, 
            opacity: .6, 
            side: THREE.DoubleSide,
            transparent: true
        } );
        lesson3.cube = new THREE.Mesh( box1, material );
        lesson3.cube.position.y = .5;
        this.scene.add( lesson3.cube );

*/
        // add simple ground
        var groundGeometry = new THREE.PlaneGeometry(10, 10, 1, 1);
        ground = new THREE.Mesh(groundGeometry, new THREE.MeshLambertMaterial({
            color: 0xc42424,
            opacity: .6,
            side: THREE.DoubleSide, 
            transparent: true
        }));
        ground.position.y = -.01;
        ground.rotation.x = - Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);

/*        // create a new group (Object3D)
        var group = new THREE.Object3D();

        // add two spheres
        var sphere  = this.drawSphere(-100, 150, new THREE.MeshPhongMaterial({ map: texture, bumpMap: textureBump, color: 0x00ff00, specular: 0xff2200, emissive: 0x004000 }));
        var sphere2 = this.drawSphere( 100, 150, new THREE.MeshPhongMaterial({ map: texture, bumpMap: textureBump, color: 0x00ff00, specular: 0xff2200, shininess: 3 }));

        // and add them into the group
        group.add(sphere);
        group.add(sphere2);

        this.scene.add(group);*/

        // add helpers:

        // 1. GridHelper
        var gridHelper = new THREE.GridHelper(lesson3.GRID_SIZE, 1); // first number is grid size, second is grid step
        gridHelper.position = new THREE.Vector3(0, 0, 0);
        gridHelper.rotation = new THREE.Euler(0, 0, 0);
        gridHelper.setColors( 0x0000ff, 0x8d8d8d);
        this.scene.add(gridHelper);

        var gridHelper2 = gridHelper.clone();
        gridHelper2.rotation = new THREE.Euler(Math.PI / 2, 0, 0);
        this.scene.add(gridHelper2);

        /*var gridHelper2 = gridHelper.clone();
        gridHelper2.rotation = new THREE.Euler(Math.PI / 2, 0, 0);
        this.scene.add(gridHelper2);

        var gridHelper3 = gridHelper.clone();
        gridHelper3.rotation = new THREE.Euler(Math.PI / 2, 0, Math.PI / 2);
        this.scene.add(gridHelper3);*/
/*
        // 2. HemisphereLightHelper
        var hlightHelper = new THREE.HemisphereLightHelper(hemiLight, 50, 300); // 50 is sphere size, 300 is arrow length
        this.scene.add(hlightHelper);

        // 3. PointLightHelper
        var pointLightHelper = new THREE.PointLightHelper(pointLight, 50); // 50 is sphere size
        this.scene.add(pointLightHelper);

        // 4. SpotLightHelper
        var spotLightHelper = new THREE.SpotLightHelper(spotLight, 50); // 50 is sphere size
        this.scene.add(spotLightHelper);*/

    },
    drawSphere: function(x, z, material) {
        var sphere = new THREE.Mesh(new THREE.SphereGeometry(70, 70, 20), material);
        sphere.rotation.x = sphere.rotation.z = Math.PI * Math.random();
        sphere.position.x = x;
        sphere.position.y = 100;
        sphere.position.z = z;
        sphere.castShadow = sphere.receiveShadow = true;
        return sphere;
    }
};

// Animate the scene
function animate() {
    requestAnimationFrame(animate);
    render();
    update();

    // move the cubez, dammit!
    for( var i = 0; i < lesson3.CUBE_COUNT; i++) {
        lesson3.cube_angles[i] += lesson3.cube_speeds[i];
        lesson3.cubes[i].position.x = 0 + ( lesson3.cube_positions[i] * (Math.cos( lesson3.cube_angles[i] )) );
        lesson3.cubes[i].position.z = 0 + ( lesson3.cube_positions[i] * Math.sin( lesson3.cube_angles[i] ));

        //lesson3.cubes[i].rotation.x += lesson3.cube_speeds[i];
        lesson3.cubes[i].rotation.y -= lesson3.cube_speeds[i];
        //lesson3.cubes[i].rotation.z += lesson3.cube_speeds[i];
    }

}

// Update controls and stats
function update() {
    lesson3.controls.update(lesson3.clock.getDelta());
    lesson3.stats.update();
}

// Render the scene
function render() {
    if (lesson3.renderer) {
        lesson3.renderer.render(lesson3.scene, lesson3.camera);
    }
}

// Initialize lesson on page load
function initializeLesson() {
    lesson3.init();
    animate();
}


function make_a_box() {
    var box = new THREE.BoxGeometry( 1, 1, 1 );
    var material = new THREE.MeshBasicMaterial( {
        color: new THREE.Color().setStyle('#'+('00000'+(Math.random()*(1<<24)|0).toString(16)).slice(-6)), 
        opacity: .8, 
        side: THREE.FrontSide,
        transparent: false
    } );
    var cube = new THREE.Mesh( box, material );

/*    cube.position.x = 1;
    cube.position.z = 1;*/

    cube.position.y = Math.random() * (.55 - .5) + .5;

    return cube;
}

if (window.addEventListener)
    window.addEventListener('load', initializeLesson, false);
else if (window.attachEvent)
    window.attachEvent('onload', initializeLesson);
else window.onload = initializeLesson;
