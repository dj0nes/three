// load texture
/*var texture = THREE.ImageUtils.loadTexture('images/texture.png');
texture.repeat.set(10, 10);
texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
texture.anisotropy = 16;
texture.needsUpdate = true;

var textureBump = THREE.ImageUtils.loadTexture('images/bump.png');
textureBump.repeat.set(10, 10);
textureBump.wrapS = textureBump.wrapT = THREE.RepeatWrapping;
textureBump.anisotropy = 16;
textureBump.needsUpdate = true;*/

var page = {
    scene: null,
    camera: null,
    renderer: null,
    container: null,
    controls: null,
    clock: null,
    stats: null,
    step: 0,
    GRID_SIZE: 20,
    CUBE_SIZE: 1,
    CUBE_DIAGONAL: -1,
    CUBE_COUNT: 500,
    cubes: [],
    cube_speeds: [],
    cube_angles: [],
    cube_positions: [],

    init: function() { // Initialization

        page.CUBE_DIAGONAL = Math.sqrt(this.CUBE_SIZE + this.CUBE_SIZE); // pythagorean for diagonal distance

        // create main scene
        this.scene = new THREE.Scene();

        var SCREEN_WIDTH = window.innerWidth,
            SCREEN_HEIGHT = window.innerHeight;

        // prepare camera
        var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = .1, FAR = 1000;
        this.camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR);
        this.scene.add(this.camera);
        this.camera.position.set(0, page.GRID_SIZE * 3, 0);
        this.camera.lookAt(new THREE.Vector3(0,0,0));

        // prepare renderer
        this.renderer = new THREE.WebGLRenderer({antialias:true, alpha: true});
        this.renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
        //this.renderer.setClearColor(0xffffff);

        this.renderer.shadowMapEnabled = true;
        this.renderer.shadowMapSoft = true;

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




        // LIGHTING

        // add hemisphere light
        //var hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 1);
        //hemiLight.color.setHSL(0.6, 1, 0.6);
        //hemiLight.groundColor.setHSL(0.095, 1, 0.75);
        //hemiLight.position.set(-200, 400, -200);
        //this.scene.add(hemiLight);

/*
        // add point light
        var pointLight = new THREE.PointLight(0xffff00, 1.0);
        pointLight.position.set(300,300,300);
        this.scene.add(pointLight);*/

        // add spot light
/*        var spotLight = new THREE.SpotLight(0xffffff);
        spotLight.position.set(-300,400,300);
        spotLight.castShadow = true;
        spotLight.shadowCameraFov = 60;
        this.scene.add(spotLight);*/







        // add lines and arrows to mark x and z axes
        var material = new THREE.LineBasicMaterial({
            color: 0x00ff00
        });


        var geometry = new THREE.Geometry();
        geometry.vertices.push(new THREE.Vector3(0, 0.01, 0));
        geometry.vertices.push(new THREE.Vector3(0, 0.01, page.GRID_SIZE));
        geometry.vertices.push(new THREE.Vector3(1, 0.01, page.GRID_SIZE - 1));
        geometry.vertices.push(new THREE.Vector3(0, 0.01, page.GRID_SIZE));
        geometry.vertices.push(new THREE.Vector3(-1, 0.01, page.GRID_SIZE - 1));

        var line = new THREE.Line(geometry, material);

        this.scene.add(line);


        var material = new THREE.LineBasicMaterial({
            color: 0xff0000
        });

        var geometry = new THREE.Geometry();
        geometry.vertices.push(new THREE.Vector3(0, 0.01, 0));
        geometry.vertices.push(new THREE.Vector3(page.GRID_SIZE, 0.01, 0));
        geometry.vertices.push(new THREE.Vector3(page.GRID_SIZE - 1, 0.01, 1));
        geometry.vertices.push(new THREE.Vector3(page.GRID_SIZE, 0.01, 0));
        geometry.vertices.push(new THREE.Vector3(page.GRID_SIZE - 1, 0.01, -1));

        var line = new THREE.Line(geometry, material);

        this.scene.add(line);

        // generate a "unit box"
        page.cubes[0] = make_a_box();
        page.cube_positions[0] = .5;
        page.cube_angles[0] = 0;
        page.cube_speeds[0] = .005;
        page.cubes[0].position.x =  Math.cos( page.cube_positions[0] );
        page.cubes[0].position.z =  Math.sin( page.cube_positions[0] );
        page.cubes[0].position.y = .5;
        this.scene.add(page.cubes[0]);

        for( var i = 1; i < page.CUBE_COUNT; i++) {
            page.cubes[i] = make_a_box();
            page.cube_positions[i] = Math.random() * (page.GRID_SIZE - .5 - .5) + .5;
            //page.cube_positions[i] = Math.random() * (5 - .5 - .5) + .5;
            //page.cube_angles[i] = page.cubes[i].rotation.y = Math.PI / 4;
            //page.cubes[i].rotation.y = Math.PI;
            page.cube_angles[i] = 0;
            //page.cube_speeds[i] = (Math.random() * ( .1 - .05 ) + .05) / ( 2 + page.cube_positions[i]);
            //page.cube_speeds[i] = page.cube_positions[i] * Math.PI / (240 * 10);
            page.cube_speeds[i] = Math.random() * (.02 - .005) + .008;
            page.cubes[i].position.x =  Math.cos( page.cube_positions[i] );
            page.cubes[i].position.z =  Math.sin( page.cube_positions[i] );
            page.cubes[i].position.y = Math.random() * (.6 - .5) + .5; // randomize height in small interval to prevent z-fighting
            this.scene.add(page.cubes[i]);
        }




/*
        var box1 = new THREE.BoxGeometry( 1, 1, 1 );
        var material = new THREE.MeshBasicMaterial( {
            color: 0x00ff00, 
            opacity: .6, 
            side: THREE.DoubleSide,
            transparent: true
        } );
        page.cube = new THREE.Mesh( box1, material );
        page.cube.position.y = .5;
        this.scene.add( page.cube );

*/
        // add simple ground
/*        var groundGeometry = new THREE.PlaneGeometry(10, 10, 1, 1);
        ground = new THREE.Mesh(groundGeometry, new THREE.MeshLambertMaterial({
            color: 0xc42424,
            opacity: .6,
            side: THREE.DoubleSide,
            transparent: true
        }));
        ground.position.y = -.01;
        ground.rotation.x = - Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);*/

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
        var gridHelper = new THREE.GridHelper(page.GRID_SIZE, 1); // first number is grid size, second is grid step
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


var euler_direction = "YXZ";
var x_axis = new THREE.Vector3(1,0,0);
var y_axis = new THREE.Vector3(0,1,0);

// Animate the scene
function animate() {
    requestAnimationFrame(animate);

    // move the cubez, dammit!
    for( var i = 0; i < page.CUBE_COUNT; i++) {
        do_transforms(i);
    }

    render();
    update();

}

// Update controls and stats
function update() {
    page.controls.update(page.clock.getDelta());
    page.stats.update();
}

// Render the scene
function render() {
    if (page.renderer) {
        page.renderer.render(page.scene, page.camera);
    }
}

// Initialize lesson on page load
function initializeLesson() {
    page.init();
    animate();
}

function do_transforms(i) {
    page.cube_angles[i] += page.cube_speeds[i];
    page.cubes[i].position.x = 0 + ( page.cube_positions[i] * (Math.cos( page.cube_angles[i] )) ); // change 0 to change center of rotation
    page.cubes[i].position.z = 0 + ( page.cube_positions[i] * Math.sin( page.cube_angles[i] ));
    rotateAroundObjectAxis(page.cubes[i], x_axis, Math.PI * page.cube_speeds[i] + Math.sin( page.cube_speeds[i] ), euler_direction);
    rotateAroundWorldAxis(page.cubes[i], y_axis, -page.cube_speeds[i], euler_direction);

    // bounce factor
    page.cubes[i].position.y = .5 + Math.abs( Math.sin( (2 * page.cubes[i].rotation.x + 0 ) ) / 5 );
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
    return cube;
}

// Rotate an object around an arbitrary axis in object space
var rotObjectMatrix;
function rotateAroundObjectAxis(object, axis, radians, direction) {
    rotObjectMatrix = new THREE.Matrix4();
    rotObjectMatrix.makeRotationAxis(axis.normalize(), radians);
    object.matrix.multiply(rotObjectMatrix);
    object.rotation.setFromRotationMatrix(object.matrix, direction);
}

var rotWorldMatrix;
// Rotate an object around an arbitrary axis in world space       
function rotateAroundWorldAxis(object, axis, radians, direction) {
    rotWorldMatrix = new THREE.Matrix4();
    rotWorldMatrix.makeRotationAxis(axis.normalize(), radians);
    rotWorldMatrix.multiply(object.matrix);                // pre-multiply
    object.matrix = rotWorldMatrix;
    object.rotation.setFromRotationMatrix(object.matrix, direction);
}



if (window.addEventListener)
    window.addEventListener('load', initializeLesson, false);
else if (window.attachEvent)
    window.attachEvent('onload', initializeLesson);
else window.onload = initializeLesson;
