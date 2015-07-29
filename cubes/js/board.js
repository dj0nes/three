////////////////////////////////////////////////////////////////////////////////
// Vertex Order Exercise                                                      //
// Your task is to determine the problem and fix the vertex drawing order.    //
// Check the function someObject()                                            //
// and correct the code that starts at line 17.                               //
////////////////////////////////////////////////////////////////////////////////
/*global THREE, Coordinates, $, document, window*/

var camera, scene, renderer;
var windowScale;

function someObject (material) {
	var geometry = new THREE.Geometry();
	
	// Student: some data below must be fixed 
	// for both triangles to appear !
	geometry.vertices.push( new THREE.Vector3( 3, 3, 0 ) );
	geometry.vertices.push( new THREE.Vector3( 7, 3, 0 ) );
	geometry.vertices.push( new THREE.Vector3( 7, 7, 0 ) );
	geometry.vertices.push( new THREE.Vector3( 3, 7, 0 ) );
	
	geometry.faces.push( new THREE.Face3( 0, 2, 3 ) );
	geometry.faces.push( new THREE.Face3( 0, 1, 2 ) );
	
	var mesh = new THREE.Mesh( geometry, material );
	
	scene.add( mesh );

	var size = 100;
	var step = 1;
	var gridHelper = new THREE.GridHelper( size, step );
	gridHelper.position = new THREE.Vector3(0, 0, 0);
	gridHelper.rotation = new THREE.Euler(0, 0, 0);
	scene.add( gridHelper );



}

function init() {
	//  Setting up some parameters
	var canvasWidth = $(window).width();
	var canvasHeight = $(window).height();
	var canvasRatio = canvasWidth / canvasHeight;
	// scene
	scene = new THREE.Scene();

	// Camera: Y up, X right, Z up
	windowScale = 1;
	var windowWidth = windowScale * canvasRatio;
	var windowHeight = windowScale;

	camera = new THREE.OrthographicCamera( windowWidth / - 2, windowWidth / 2,
		windowHeight / 2, windowHeight / - 2, 0, 40 );
	
	var focus = new THREE.Vector3( 0,0,0 );
	camera.position.x = focus.x;
	camera.position.y = focus.y;
	camera.position.z = 10;
	camera.lookAt( focus );

	renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true});
	renderer.gammaInput = true;
	renderer.gammaOutput = true;
	renderer.setSize( canvasWidth, canvasHeight );
	renderer.setClearColor(new THREE.Color(0xFFFFFF));

}

function addToDOM() {
    var container = document.getElementById('container');
    var canvas = container.getElementsByTagName('canvas');
    if (canvas.length>0) {
        container.removeChild(canvas[0]);
    }
    container.appendChild( renderer.domElement );
}

function showGrids() {
	// Background grid and axes. Grid step size is 1, axes cross at 0, 0
	//Coordinates.drawGrid({size:100,scale:1,orientation:"z"});
	Coordinates.drawAxes({axisLength:11,axisOrientation:"x",axisRadius:0.04});
	Coordinates.drawAxes({axisLength:11,axisOrientation:"y",axisRadius:0.04});
}

function render() {
	renderer.render( scene, camera );
}

function resize() {
		//  Setting up some parameters
	var canvasWidth = $(window).width();
	var canvasHeight = $(window).height();
	var canvasRatio = canvasWidth / canvasHeight;
	// Camera: Y up, X right, Z up
	windowScale = 1;
	var windowWidth = windowScale * canvasRatio;
	var windowHeight = windowScale;

	camera = new THREE.OrthographicCamera( windowWidth / - 2, windowWidth / 2,
		windowHeight / 2, windowHeight / - 2, 0, 40 );
	
	var focus = new THREE.Vector3( 5,4,0 );
	camera.position.x = focus.x;
	camera.position.y = focus.y;
	camera.position.z = 10;
	camera.lookAt( focus );

	renderer.setSize( canvasWidth, canvasHeight );
	render();
}

// Main body of the script
try {
	$(window).resize(resize);
  init();
  //showGrids();
  var material = new THREE.MeshBasicMaterial( { color: 0xF6831E, side: THREE.FrontSide, opacity: .5 } );
  someObject(material);
  addToDOM();
  render();
} catch(e) {
    var errorReport = "Your program encountered an unrecoverable error, can not draw on canvas. Error was:<br/><br/>";
    $('#container').append(errorReport+e);
}



