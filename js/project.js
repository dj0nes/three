var  container, stats;
var camera, scene, renderer;

init();
animate();

function init() {

    container = document.getElementById( 'container' );
    camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 1, 10 );
    camera.position.z = 2;
    scene = new THREE.Scene();

    // geometry
    var triangles             = 1;
    var geometry = new THREE.BufferGeometry();
    var vertices = new THREE.BufferAttribute( new Float32Array( triangles * 3 * 3 ), 3 );
    // Just while I figure out what the heck is going on with the shader stuff
    var vals = [ 0.0, 0.0, 0.0, 0.5, 0.5, 0.0, .5, -0.5, 0.0 ];

    for ( var i = 0; i < vertices.length/vertices.itemSize; i ++ ) {
            // Just while I figure out what the heck is going on with the shader stuff
        // vertices.setXYZ( i, Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5 );
        vertices.setXYZ( i, vals[i * vertices.itemSize], vals[i * vertices.itemSize + 1], vals[i * vertices.itemSize + 2] );
    }

    geometry.addAttribute( 'position', vertices );
    var colors = new THREE.BufferAttribute(new Float32Array( triangles * 3 * 4 ), 4 );
    // var THE_COLOR = [Math.random(), Math.random(), Math.random(), Math.random()]
    var THE_COLOR = [1,0,0, 1] // full-on red

    for ( var i = 0; i < colors.length; i ++ ) {
        colors.setXYZW( i, THE_COLOR[0], THE_COLOR[1], THE_COLOR[2], THE_COLOR[3] );
    }

    geometry.addAttribute( 'color', colors );

    // material
    var material = new THREE.RawShaderMaterial( {
        uniforms: {
            time: { type: "f", value: 1.0 }
        },
        vertexShader: document.getElementById( 'vertexShader' ).textContent,
        fragmentShader: document.getElementById( 'fragmentShader' ).textContent,
        side: THREE.DoubleSide,
        transparent: true
    } );

    var mesh = new THREE.Mesh( geometry, material );
    scene.add( mesh );

    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor( 0x101010 );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    container.appendChild( renderer.domElement );

    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.top = '0px';
    container.appendChild( stats.domElement );

    window.addEventListener( 'resize', onWindowResize, false );
}

function onWindowResize( event ) {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

function animate() {
    requestAnimationFrame( animate );
    render();
    stats.update();
}

function render() {
    var time = performance.now();
    var object = scene.children[ 0 ];
    object.rotation.y = time * 0.0005;
    object.material.uniforms.time.value = time * 0.0005;
    renderer.render( scene, camera );
}
