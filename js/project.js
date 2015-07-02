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

    for ( var i = 0; i < vertices.length; i ++ ) {
        vertices.setXYZ( i, Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5 );
    }

    geometry.addAttribute( 'position', vertices );
    var colors = new THREE.BufferAttribute(new Float32Array( triangles * 3 * 4 ), 4 );

    for ( var i = 0; i < colors.length; i ++ ) {
        colors.setXYZW( i, Math.random(), Math.random(), Math.random(), Math.random() );
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
    object.material.uniforms.time.value = time * 0.005;
    renderer.render( scene, camera );
}