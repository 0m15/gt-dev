(function (){

  var OBJECT_ARRAY = [];
  var _geo, _mat, _mesh;
  var object = new THREE.Object3D();

  //GLOBAL
  var camera, scene, renderer, composer;
  var object, light;
  var clock;
  var effect;
  var targetRotation = 0;
  var targetRotationX = 0;
  var targetRotationY = 0;
  var targetRotationOnMouseDown = 0;
  var targetReverse = 0;
  var mouseX = 0, mouseY = 0;
  var mouseXOnMouseDown = 0;
  var SCREEN_WIDTH = window.innerWidth
  var SCREEN_HEIGHT = window.innerHeight
  var windowHalfX = SCREEN_WIDTH / 2;
  var windowHalfY = SCREEN_HEIGHT / 2;
  var scrollY = 0
  var colors = [
    0xE04B5A,
    0xE49756,
    0x5B305A,
    0x9A4C68,
  ]
  clock = new THREE.Clock();
  var time, delta;

  init();
  animate();

  function intervalDrawer() {
    setTimeout(function() {
      clear()
      draw()
      intervalDrawer()
    }, Math.random() * 5000)
  }
  intervalDrawer()

  function clear() {
    for ( var i = 0; i < OBJECT_ARRAY.length; i ++ ) {
      var mesh = OBJECT_ARRAY[i]
      mesh.scale.x = mesh.scale.y = mesh.scale.z = Math.random() * 100;
      mesh.position.multiplyScalar( Math.random() * 250 );
      object.remove(mesh)
    }
  }

  function draw() {
    //GENERATE CENTER OBJECTS
    for ( var i = 0; i < 120; i ++ ) {
      var geometry = new THREE.SphereGeometry( 1, 1, 1 );
      var randColorIdx = parseInt(Math.random() * colors.length)
      var material = new THREE.MeshLambertMaterial( { 
      ///wireframe: true,
      wireframe: Boolean(parseInt(Math.random() * 4)),
      wireframeLinewidth: 0.1,
      color: colors[randColorIdx],//0xe6fcff, //0x8853ff, 
      //vertexColors: THREE.VertexColors,
      shading: THREE.FlatShading
    });
      var mesh = new THREE.Mesh( geometry, material );
      mesh.position.set( Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5 ).normalize();
      //mesh.position.multiplyScalar( Math.random() * 10 );
      mesh.rotation.set( Math.random() * 2, Math.random() * 2, Math.random() * 2 );
      mesh.scale.x = mesh.scale.y = mesh.scale.z = Math.random() * 100;
      object.add( mesh );
      OBJECT_ARRAY.push(mesh)
    }
  }

  function init() {

    renderer = new THREE.WebGLRenderer({
      antialias: true
    });
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( SCREEN_WIDTH, SCREEN_HEIGHT );
  
    renderer.setClearColor( 0x222222, 1);
    document.body.appendChild( renderer.domElement );
    
    camera = new THREE.PerspectiveCamera( 70, SCREEN_WIDTH / SCREEN_HEIGHT, 1, 2000 );
    camera.position.z = 1250
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog( 0x222222, 0.1, 2000 );
    
    scene.add( object );

    draw()
    

    //LIGHT
    scene.add( new THREE.AmbientLight( 0xffffff) );
    
    light = new THREE.DirectionalLight( 0xe6fcff);
    light.position.set( 1, 1, 1 );
    scene.add( light );

    light = new THREE.DirectionalLight( 0xffffff);
    light.position.set( 1, 1, 1 );
    scene.add( light );

    var rtParameters = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat, stencilBufer: true };
    var renderTarget = new THREE.WebGLRenderTarget( SCREEN_WIDTH, SCREEN_HEIGHT, rtParameters );

    //var effectBlend = new THREE.ShaderPass( THREE.BlendShader, "tDiffuse1" );
    var effectFXAA = new THREE.ShaderPass( THREE.FXAAShader );
    effectFXAA.uniforms[ 'resolution' ].value.set( 1 / SCREEN_WIDTH, 1 / SCREEN_HEIGHT );

    //var effectBleach = new THREE.ShaderPass( THREE.BleachBypassShader );

    // tilt shift
    var hblur = new THREE.ShaderPass( THREE.HorizontalTiltShiftShader );
    var vblur = new THREE.ShaderPass( THREE.VerticalTiltShiftShader );
    
    hblur.uniforms[ 'h' ].value = 3 / window.innerWidth;
    vblur.uniforms[ 'v' ].value = 3 / window.innerHeight;

    //var effectBloom = new THREE.BloomPass(0.3);
    //effectBloom.renderToScreen = true
    
    composer = new THREE.EffectComposer( renderer, renderTarget );
    vblur.renderToScreen = true

    composer = new THREE.EffectComposer( renderer, renderTarget );
    composer.addPass( new THREE.RenderPass( scene, camera ) );

    composer.addPass( effectFXAA );
    composer.addPass( hblur );
    composer.addPass( vblur );
    
    document.addEventListener( 'mousemove', onDocumentMouseMove, false );
    document.addEventListener( 'touchmove', onDocumentTouchMove, false );
    window.addEventListener( 'resize', onWindowResize, false );
    window.addEventListener('scroll', onWindowScroll, false)

  }

  function onWindowScroll() {
    scrollY = window.pageYOffset
  }

  function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );

  }


  //EVENTS
  function onDocumentMouseMove( event ) {
    mouseX = event.clientX - windowHalfX;
    mouseY = event.clientY - windowHalfY;
    // effect.uniforms[ 'amount' ].value = 0.02;
    targetRotationX = mouseX * 0.0002;
    targetRotationY = mouseY * 0.0002;
  }

  function onDocumentTouchMove( event ) {

    if ( event.touches.length === 1 ) {
      event.preventDefault();
      mouseX = event.touches[ 0 ].pageX - windowHalfX;
      mouseY = event.touches[ 0 ].pageY - windowHalfY;
      targetRotationX = mouseX * 0.005;
      targetRotationY = mouseY * 0.005;
    }

  }


  //RENDER
  

  function animate() {
    time = clock.getElapsedTime();    

    requestAnimationFrame( animate );
    //object.rotation.x = 0.0002 * window.pageYOffset;
    camera.position.setY(0.09 * scrollY*-1);
    object.rotation.y += 0.001;

    render();
    
    // if(parseInt(time) % 3 != 1) {
    //   animateCamera()
    // }

    //renderer.render(scene, camera)
    composer.render(scene, camera);
  }

  function animateCamera() {
    var camPosition = camera.position
    camera.position.setX(Math.random() * 8)
    camera.position.setY(Math.random() * 9)
  }


  var counter = 2;
  

  function render() {

    counter += 2;
    //effect.uniforms[ 'amount' ].value = 0.001;
    object.rotation.y += ( targetRotationX - object.rotation.y ) * 0.05;
    object.rotation.x += ( targetRotationY - object.rotation.x ) * 0.05;
    //effect.uniforms[ 'amount' ].value += targetRotation/500 ;
  }

})();