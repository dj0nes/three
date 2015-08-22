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
var model;

var ops = {
  face_loaded: false
}

var THE_SPHERE;

// Object rotation vars
var euler_direction = "YXZ";
var x_axis = new THREE.Vector3(1,0,0);
var y_axis = new THREE.Vector3(0,1,0);
var z_axis = new THREE.Vector3(0,0,1);


init();
animate();


function init(){
    renderer = new THREE.WebGLRenderer( { antialias: true });
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

        ops.model = object;
        scene.add( ops.model );

        ops.face_loaded = true;

        ops.uniforms = {
            "opacity" : { type: "f", value: 1.0, range: [0,1] },
            "amplitude" : { type: "f", value: 1.0, range: [-1,5] },
            "offset" : { type: "f", value: 0.0, range: [-2.0,2.0] },
            "red_channel" : { type: "f", value: 1.0, range: [-1,2] },
            "green_channel" : { type: "f", value: 1.0, range: [-1,2] },
            "blue_channel" : { type: "f", value: 1.0, range: [-1,2] },
            "time" : { type: "f", value: 0.0, range: [0,10000] },
        };

        ops.attributes = {
          "time" : { type: "f", value: 0.0, range: [0,10000] },
        };

        ops.vertexShader = [
            "varying vec3 vNormal;",
            "varying vec4 Position;",
            THREE.ShaderChunk[ "common" ],
            THREE.ShaderChunk[ "morphtarget_pars_vertex" ],
            THREE.ShaderChunk[ "logdepthbuf_pars_vertex" ],

            "void main() {",
            "   vNormal = normalize( normalMatrix * normal );",
                THREE.ShaderChunk[ "morphtarget_vertex" ],
                THREE.ShaderChunk[ "default_vertex" ],
                THREE.ShaderChunk[ "logdepthbuf_vertex" ],
                "Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
                // "ctime = time;",
            "}"
        ].join("\n");

        ops.fragmentShader = [
            "uniform float opacity;",
            "uniform float amplitude;",
            "uniform float offset;",
            "uniform float red_channel;",
            "uniform float green_channel;",
            "uniform float blue_channel;",
            "uniform float time;",
            "varying vec3 vNormal;",
            "varying vec4 Position;",
            "precision highp float;",



            THREE.ShaderChunk[ "common" ],
            THREE.ShaderChunk[ "logdepthbuf_pars_fragment" ],

            "float snoise(in vec2 co){", //https://www.shadertoy.com/view/ltB3zD
              "return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);",
            "}",

            "void main() {",
            "   vec4 shutupwebgl = Position;",
            "   const float timestep = 50.0;", // interval in ms to change opacity. Decrease for smoother opacity increase.
            "   const float duration = 6000.0;", // cutoff time value in ms, after which opacity skips to 1
            "   float opacity_magnitude = 0.0;", // value store for final opacity in this draw
            "   if( time > duration) { opacity_magnitude = 1.0; } else {", // if opacity has been increasing for longer than the cutoff, skip for loop and set opacity to 1
            "     for(float i = 0.0; i < duration; i += timestep) {", /// use for loop to calculate opacity for every timestep - this is to preserve opacity between frames
            "       if( i > time) { break; } else {", // this is where the loop will actually break
            "         float randval = snoise( vec2(vNormal.z, i) );", // -1 <= randval <= 1
            "         float sf = pow(1.0+abs(vNormal.y),8.0);",
            // scale adjacent faces with similar normals at different rates
            "         float apparent_randomness = pow(mod(randval * 100.0, 31.0),4.0);", // pow helps magnify difference between similar vNormal values
            "         float denominator =  apparent_randomness * sf + 1.0;", // bigger denominator = slower increase in opacity, + 1 to avoid div/0
            // acceleration of opacity growth
            "         float time_scale = pow(3.0 * i/(duration), 26.0);", // as i->duration, increase acceleration of opacity growth by scaling numerator
            "         float numerator = time_scale * abs(randval);", // abs(randval) to disallow decreasing opacity, potentially remove for greater diversity
            "         opacity_magnitude += numerator/denominator;",
            "       }",
            "     }",
            "    }",
            "   gl_FragColor = vec4( amplitude * normalize( vNormal ) + offset, opacity_magnitude * opacity);",
            "   gl_FragColor.r = gl_FragColor.r * red_channel;",
            "   gl_FragColor.g = gl_FragColor.g * green_channel;",
            "   gl_FragColor.b = gl_FragColor.b * blue_channel;",
                THREE.ShaderChunk[ "logdepthbuf_fragment" ],

            "}"

        ].join("\n");

        ops.model.children[0].material = new THREE.ShaderMaterial({
            transparent: true,
            // side: THREE.DoubleSide,
            side: THREE.FrontSide,
            uniforms: ops.uniforms,
            attributes: ops.attributes,
            vertexShader: ops.vertexShader,
            fragmentShader: ops.fragmentShader
        });

        setupControls(ops.uniforms);
        THREE.Clock(true);

    }, onProgress, onError );


}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    // var time = THREE.Clock.getDelta();
    // console.log(time);

    framestep = .01;
    frame += framestep;

    if (ops.face_loaded) {
      ops.uniforms["time"].value = clock.oldTime - clock.startTime;
    }

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
    for (key in ops.uniforms) {
        gui.add(ops.uniforms[key], "value", ops.uniforms[key].range[0], ops.uniforms[key].range[1]).name(key);
    }

    var butob = {
        'Vertex Shader code': function(){
            picoModal({
                content: '<h3 style="margin: 5px; padding: 0px 0px 10px; font-family: sans-serif;">Vertex Shader</h3>' +
                '<pre style="overflow: scroll; height: 470px; margin: 5px;">'+ops.vertexShader+'</pre>',
                closeButton: true,
                width: "75%",
            }).show();
        },
        'Fragment Shader code': function(){

            picoModal({
                content: '<h3 style="margin: 5px; padding: 0px 0px 10px; font-family: sans-serif;">Fragment Shader</h3>' +
                '<pre style="overflow: scroll; height: 470px; margin: 5px;">'+ops.fragmentShader+'</pre>',
                closeButton: true,
                width: "75%"
            }).show();
        }
    };
    gui.add(butob, 'Vertex Shader code');
    gui.add(butob, 'Fragment Shader code');

    var w = window,
        d = document,
        e = d.documentElement,
        g = d.getElementsByTagName('body')[0],
        x = w.innerWidth || e.clientWidth || g.clientWidth,
        y = w.innerHeight|| e.clientHeight|| g.clientHeight;

    if( x < 700 || y < 700 ) {
        gui.close();
    }


    //gui.add(ops.uniforms.opacity, "value", 0, 1).name("Opacity");

    // var sceneFolder = gui.addFolder('Scene');
    // var geoController = sceneFolder.add({Geometry:"box"}, 'Geometry', [ 'box', 'sphere', 'torusknot' ] );
    // geoController.onChange(changeGeometry);
    // var uniformsFolder = gui.addFolder('Uniforms');

    // gui.add(sceneFolder, "opacity", 0, 1);

    // for(key in ob) {
    //     if(ob[key].type == 'f'){
    //         var controller = uniformsFolder.add(ob[key], 'value').name(key);
    //         if(typeof ob[key].min != 'undefined'){
    //             controller.min(ob[key].min).name(key);
    //         }
    //         if(typeof ob[key].max != 'undefined'){
    //             controller.max(ob[key].max).name(key);
    //         }
    //         controller.onChange(function(value){
    //             this.object.value = parseFloat(value);
    //             ops.uniforms.opacity = value;
    //         });
    //     }else if(ob[key].type == 'c'){
    //         ob[key].guivalue = [ob[key].value.r * 255, ob[key].value.g * 255, ob[key].value.b * 255];
    //         var controller = uniformsFolder.addColor(ob[key], 'guivalue').name(key);
    //         controller.onChange(function(value){
    //             this.object.value.setRGB(value[0]/255, value[1]/255, value[2]/255);
    //         });
    //     }
    // }

    // var attributesFolder = gui.addFolder('Attributes');

    // uniformsFolder.open();
    // var sourceFolder = gui.addFolder('Source');
    // var butob = {
    //     'view vertex shader code': function(){
    //         TINY.box.show({html:'<div style="width: 500px; height: 500px;"><h3 style="margin: 0px; padding-bottom: 5px;">Vertex Shader</h3><pre style="overflow: scroll; height: 470px;">'+document.getElementById('vertexShader').text+'</pre></div>',animate:false,close:false,top:5})
    //     },
    //     'view fragment shader code': function(){
    //         TINY.box.show({html:'<div style="width: 500px; height: 500px;"><h3 style="margin: 0px; padding-bottom: 5px;">Fragment Shader</h3><pre style="overflow: scroll; height: 470px;">'+document.getElementById('fragmentShader').text+'</pre></div>',animate:false,close:false,top:5})
    //     }
    // };
    // sourceFolder.add(butob, 'view vertex shader code');
    // sourceFolder.add(butob, 'view fragment shader code');

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
