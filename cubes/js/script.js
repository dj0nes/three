Modernizr.load([
	demo.url + '/three.min.js',
	{
		load: [
			demo.url + '/utils.js',
			demo.url + '/app.js',
			demo.url + '/world.js',
			demo.url + '/character.js'
		],
		complete: function () {
			basicScene = new BasicScene();
			function animate () {
				requestAnimationFrame(animate);
				basicScene.frame();
			}
			animate();
		}
	}
]);
