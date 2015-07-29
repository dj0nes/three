if ( ! Detector.webgl ) {
            Detector.addGetWebGLMessage();
            document.getElementById( 'container' ).innerHTML = "";
        }

        var _container;
        var _camera, _controls, _scene, _renderer, _uniforms, _pointLight;
        var _mesh;
var _matrix = new THREE.Matrix4();

        var clock = new THREE.Clock();
        init();


        function init() {
            _container = document.getElementById( 'container' );
    
            _camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 20000 );
    
            _scene = new THREE.Scene();
            _controls = new THREE.OrbitControls( _camera, _container.domElement );
            _renderer =  new THREE.WebGLRenderer();
    
            _camera.position.x = -34; _camera.position.y = 3; _camera.position.z = -12;
            var axes = new THREE.AxisHelper( 5000 );
            _scene.add(axes);
                    
    
            _renderer.setSize( window.innerWidth, window.innerHeight );
    
            document.getElementById( 'container' ).innerHTML = "";
            _container.appendChild( _renderer.domElement );

            ///////// INITIAL SETUP CODE ///////////    
/*            var geo = new THREE.BoxGeometry(5,5,20,32);
            geo.applyMatrix( new THREE.Matrix4().makeRotationY( Math.PI/2 ) );
            geo.applyMatrix( new THREE.Matrix4().makeTranslation(0,-6,0) );
            _mesh = new THREE.Mesh(geo, new THREE.MeshNormalMaterial());
            _mesh.position.set(0,-12,0);
            _mesh.rotation.x -= Math.PI/8;
            _scene.add( _mesh);
            
            // put sphere at mesh origin
            var sphere = new THREE.Mesh(
                new THREE.SphereGeometry(1,20,20),
                new THREE.MeshNormalMaterial());
            sphere.position.set(_mesh.position.x,_mesh.position.y,_mesh.position.z);
            _scene.add(sphere);*/

            var geo = new THREE.BoxGeometry(5,5,20,32);
            _mesh = new THREE.Mesh(geo, new THREE.MeshNormalMaterial());
            _mesh.rotation.y = -Math.PI/2;
            _mesh.position.set(0,-6,0);    // _mesh will be the child

            _sphere = new THREE.Mesh(      // _sphere will be the parent
                new THREE.SphereGeometry(1,20,20),
                new THREE.MeshNormalMaterial());
            _sphere.position.set(0,-12,0);
            _sphere.rotation.x -= Math.PI/8;
            _sphere.add(_mesh);      // add child to parent
            _scene.add(_sphere);
            
            // put axes at mesh origin with mesh rotation
            _scene.add(drawAxes(10, _mesh.position, _mesh.rotation));
            ///////// END OF INITIAL SETUP CODE ///////////    

            animate();        
        }

        function animate() {
            requestAnimationFrame( animate );
            render(true);
        }
        var _tick = 0;
        function render(rotateBool) {
            //_camera.lookAt(new THREE.Vector3(-10,-10,-10));
            
            _controls.update( );
            _renderer.render( _scene, _camera );
            if (rotateBool) {
                ///////// RENDER CODE ///////////
                // _mesh.rotation.z = -_tick * Math.PI/128; 
                _sphere.rotation.z = -_tick * Math.PI/128;    
                ///////// END OF RENDER CODE ///////////
            }
            _tick++;
        }
        function drawAxes(size,position, rotation) {
            size = size || 1;
            var vertices = new Float32Array( [
            0, 0, 0, size, 0, 0,
            0, 0, 0, 0, size, 0,
            0, 0, 0, 0, 0, size
            ] );
            var colors = new Float32Array( [
            1, 0, 0, 1, 0.6, 0,
            0, 1, 0, 0.6, 1, 0,
            0, 0, 1, 0, 0.6, 1
            ] );
            var geometry = new THREE.BufferGeometry();
            geometry.addAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
            geometry.addAttribute( 'color', new THREE.BufferAttribute( colors, 3 ) );
            var material = new THREE.LineBasicMaterial( { vertexColors: THREE.VertexColors } );
            var mesh = new THREE.Line(geometry, material, THREE.LinePieces );
            mesh.position.set(position.x, position.y, position.z);
            mesh.rotation.set(rotation.x, rotation.y, rotation.z);
            return mesh;
        }