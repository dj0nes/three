var camera, scene, renderer, controls;
var mesh, material;
var GRID_SIZE = 2;
var clock = new THREE.Clock();
var labels = [];
var frame = 0;
var uniforms, attributes;
var cubes = [];
var normals = [];
var NUM_CUBES = 1;
var TRIANGLE_SIZE = 1;
var ROWS = 1;
var COLS = 1;

var THE_SPHERE;

// Object rotation vars
var euler_direction = "YXZ";
var x_axis = new THREE.Vector3(1,0,0);
var y_axis = new THREE.Vector3(0,1,0);
var z_axis = new THREE.Vector3(0,0,1);


init();
animate();


function init(){
    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, .1, 1000);
    camera.position.x = 2.5;
    camera.position.y = 2;
    camera.position.z = 5.5;
    // camera.lookAt(new THREE.Vector3(0,0,0));

    scene = new THREE.Scene();

    var light = new THREE.AmbientLight( 0x404040 ); // soft white light
    scene.add( light );
    
    var directionalLight = new THREE.DirectionalLight(0xffffff);
    directionalLight.position.set(1, 1, 1).normalize();
    scene.add(directionalLight);
    
    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.bottom = '0px';
    document.body.appendChild( stats.domElement );
    
    setupControls(uniforms);
    
    window.addEventListener('resize', onWindowResize, false);

    // 1. GridHelper
    var gridHelper = new THREE.GridHelper(GRID_SIZE, 1); // first number is grid size, second is grid step
    gridHelper.position = new THREE.Vector3(0, 0, 0);
    gridHelper.rotation = new THREE.Euler(0, 0, 0);
    gridHelper.setColors( 0x0000ff, 0x8d8d8d);
    scene.add(gridHelper);

    var axisHelper = new THREE.AxisHelper( GRID_SIZE );
    scene.add( axisHelper );
    addAxisLabels();

    // prepare controls (OrbitControls)
    controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    controls.target = new THREE.Vector3(0, 2, 0);



    var manager = new THREE.LoadingManager();
    manager.onProgress = function ( item, loaded, total ) {

        console.log( item, loaded, total );

    };


    var onProgress = function ( xhr ) {
        if ( xhr.lengthComputable ) {
            var percentComplete = xhr.loaded / xhr.total * 100;
            console.log( Math.round(percentComplete, 2) + '% downloaded' );
        }
    };

    var onError = function ( xhr ) {
        console.error("effed up");
    };
    // model

    var loader = new THREE.OBJLoader( manager );
    loader.load( './js/face.obj', function ( object ) {

        // object.traverse( function ( child ) {

        //     if ( child instanceof THREE.Mesh ) {


    if (typeof object == "undefined" ) {
        debugger;
    }

        //object.position.y = - 80;
        scene.add( object );

        //         child.material.map = texture;

        //     }

        // } );
        //object.children[0].material = new THREE.MeshNormalMaterial();

        object.children[0].material = new THREE.ShaderMaterial( {

            uniforms: {
                "opacity" : { type: "f", value: 1.0 }
            },
            attributes: {
                
            },
            vertexShader: [
                "varying vec3 vNormal;",
                THREE.ShaderChunk[ "common" ],
                THREE.ShaderChunk[ "morphtarget_pars_vertex" ],
                THREE.ShaderChunk[ "logdepthbuf_pars_vertex" ],

                "void main() {",
                "   vNormal = normalize( normalMatrix * normal );",
                    THREE.ShaderChunk[ "morphtarget_vertex" ],
                    THREE.ShaderChunk[ "default_vertex" ],
                    THREE.ShaderChunk[ "logdepthbuf_vertex" ],
                "}"
            ].join("\n"),
            fragmentShader: [
                "uniform float opacity;",
                "varying vec3 vNormal;",
                THREE.ShaderChunk[ "common" ],
                THREE.ShaderChunk[ "logdepthbuf_pars_fragment" ],

                "void main() {",
                "   gl_FragColor = vec4( 1.5 * normalize( vNormal ) + 0.25, opacity );",
                "   gl_FragColor.r = gl_FragColor.r * 0.95;",
                "   gl_FragColor.g = gl_FragColor.g * 0.85;",
                "   gl_FragColor.b = gl_FragColor.b * 0.95;",
                    THREE.ShaderChunk[ "logdepthbuf_fragment" ],

                "}"

            ].join("\n")

        } );
    }, onProgress, onError );

        //



    // var geometry = new THREE.BoxGeometry( ROWS, COLS, 1 );
    // var material = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
    // var parent_cube = new THREE.Mesh( geometry, material );
    // scene.add( parent_cube );

    // parent_cube.position.x = ROWS/2;
    // parent_cube.position.x = COLS/2;

    // parent_cube.position.y = 1/2;




    // var geometry = new THREE.BoxGeometry( 1, 1, 1 );
    // var material = new THREE.MeshNormalMaterial();

    

    // for( var i = 0; i < ROWS; i++) {
    //     for(var j = 0; j < COLS; j++) {

    //         var cube = new THREE.Mesh( geometry, material );
            
    //         // cube.position.x = j + cube.scale.x/2;
    //         // cube.position.z = -i - cube.scale.z/2;
    //         // cube.position.y = - cube.scale.y/2;
    //         // cube.scale.y = 1;
    //         cube.timescale = Math.random();

    //         cubes.push(cube);
    //         parent_cube.add(cube);

    //     }

        
    // }
    
    // var geometry = new THREE.SphereGeometry( .1, 32, 32 );
    // var material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
    // THE_SPHERE = new THREE.Mesh( geometry, material );
    // THE_SPHERE.position.set(0, 2, 0);
    // scene.add( THE_SPHERE );

    
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    var time = performance.now();

    framestep = .01;
    frame += framestep;

    // THE_SPHERE.position.set(0, 2, Math.sin(frame/10));

    // for(var i = 0; i < cubes.length; i++) {
    //     cubes[i].position.y = Math.cos( frame * Math.PI/4);
    //     // cubes[i].timescale
    // }
    
    renderer.render(scene, camera);
    controls.update(clock.getDelta());
    labels.map(arrLook);
    stats.update();

}

function changeGeometry(type) {
    switch(type){
     case "box":
     var geometry = new THREE.BoxGeometry(200, 200, 200);
     break;
     case "sphere":
     var geometry = new THREE.SphereGeometry(200, 20, 20);
     break;
     case"torusknot":
     var geometry = new THREE.TorusKnotGeometry();
     break;
 }
 mesh.geometry = geometry;
}

function setupControls(ob) {
    var gui = new dat.GUI();
    var sceneFolder = gui.addFolder('Scene');
    var geoController = sceneFolder.add({Geometry:"box"}, 'Geometry', [ 'box', 'sphere', 'torusknot' ] );
    geoController.onChange(changeGeometry);
    var uniformsFolder = gui.addFolder('Uniforms');
    for(key in ob){
      if(ob[key].type == 'f'){
        var controller = uniformsFolder.add(ob[key], 'value').name(key);
        if(typeof ob[key].min != 'undefined'){
          controller.min(ob[key].min).name(key);
      }
      if(typeof ob[key].max != 'undefined'){
          controller.max(ob[key].max).name(key);
      }
      controller.onChange(function(value){
          this.object.value = parseFloat(value);
      });
  }else if(ob[key].type == 'c'){
    ob[key].guivalue = [ob[key].value.r * 255, ob[key].value.g * 255, ob[key].value.b * 255];
    var controller = uniformsFolder.addColor(ob[key], 'guivalue').name(key);
    controller.onChange(function(value){
      this.object.value.setRGB(value[0]/255, value[1]/255, value[2]/255);
  });
}
}
uniformsFolder.open();
var sourceFolder = gui.addFolder('Source');
var butob = {
    'view vertex shader code': function(){
      TINY.box.show({html:'<div style="width: 500px; height: 500px;"><h3 style="margin: 0px; padding-bottom: 5px;">Vertex Shader</h3><pre style="overflow: scroll; height: 470px;">'+document.getElementById('vertexShader').text+'</pre></div>',animate:false,close:false,top:5})
  },
  'view fragment shader code': function(){
   TINY.box.show({html:'<div style="width: 500px; height: 500px;"><h3 style="margin: 0px; padding-bottom: 5px;">Fragment Shader</h3><pre style="overflow: scroll; height: 470px;">'+document.getElementById('fragmentShader').text+'</pre></div>',animate:false,close:false,top:5})
}
};
sourceFolder.add(butob, 'view vertex shader code');
sourceFolder.add(butob, 'view fragment shader code');

}

function addAxisLabels() {
    var TEXT_SIZE = .1;
    var TEXT_COORD_OFFSET = -TEXT_SIZE/2;
    var TEXT_AXIS_OFFSET = GRID_SIZE + 1.0 * TEXT_SIZE

    axes = ["X", "Y", "Z"];
    for (i = 0; i < 3; i++) {
        var l = axes[i];

        var  textGeo = new THREE.TextGeometry(l, {
            size: TEXT_SIZE,
            height: .001,
            curveSegments: 6,
            font: "helvetiker",
            style: "normal"
        });
        var  color = new THREE.Color();
        color.setRGB(250 * ("X" == l), 250 * ("Y" == l), 250 * ("Z" == l));
        var  textMaterial = new THREE.MeshBasicMaterial({ color: color });
        var  text = new THREE.Mesh(textGeo , textMaterial);

        text.geometry.center();

        if(l == "X") {
            text.position.x = TEXT_AXIS_OFFSET;
        }
        else if (l == "Y") {
            text.position.y = TEXT_AXIS_OFFSET;
        }
        else {
            text.position.z = TEXT_AXIS_OFFSET;
        }
        
        text.rotation = camera.rotation;
        text.lookAt(camera.position);

        labels.push(text);

        scene.add(text);
    }
}

function arrLook(currentValue, index, array) {
    currentValue.lookAt(camera.position)
}