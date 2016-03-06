
import THREE from 'three'
import TWEEN from 'tween'
import fft from '../lib/fft'

window.THREE = THREE
// threejs effects & plugins
require('../vendor') 


var screenX = window.innerWidth
var screenY = window.innerHeight

var scene;
var camera;
var renderer;
var plane;
var particleSystem;
var particleSystem1;
var renderer;
var mesh;
var mesh1;
var composer;
var hblur;
var vblur;
var targetRotationX = 0;
var targetRotationY = 0;
var mouseX = 0;
var mouseY = 0;
var stereo;
var tweening = false
var tween;
var controls;
var videoTexture;
var spotLight;
var light;
var object3d;
var lastSegment = { start:0 };
var { audio } = fft()
var cameraZ = 0
var sunlight;
var camControls;
var sky;
var terrainMesh;

const objects = []

import { audioData, getBeatsByTime, getSegmentsByTime, getBarsByTime, getTatumsByTime, getScenesByTime } from '../lib/audio-data'

const beatsByTime = getBeatsByTime()
const segmentsByTime = getSegmentsByTime()
const barsByTime = getBarsByTime()
const tatumsByTime = getTatumsByTime()
const scenesByTime = getScenesByTime()


// SCALES

function logScale(domain=[0,100], values=[100,1000], value=1) {
  // position will be between 0 and 100
  var minp = domain[0];
  var maxp = domain[1];

  var minv = Math.log(values[0]);
  var maxv = Math.log(values[1]);

  // calculate adjustment factor
  var scale = (maxv-minv) / (maxp-minp);

  return Math.exp(minv + scale*(value-minp));
}


function initSky() {

  var urlPrefix = "assets/textures/milkway";
  var urls = [ 
      urlPrefix + "_posx.jpg", urlPrefix + "_negx.jpg",
      urlPrefix + "_posy.jpg", urlPrefix + "_negy.jpg",
      urlPrefix + "_posz.jpg", urlPrefix + "_negz.jpg"];

  var textureCube = new THREE.CubeTextureLoader().load( urls );
  var shader = THREE.ShaderLib["cube"];

  shader.uniforms['tCube'].value = textureCube;   // textureCube has been init before
  
  var shaderMaterial = new THREE.ShaderMaterial({
      fragmentShader: shader.fragmentShader,
      vertexShader: shader.vertexShader,
      uniforms: shader.uniforms,
      depthWrite: false,
      side: THREE.BackSide
  });

  var material = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    // wireframe: true
  });

  // build the skybox Mesh 
  const skyboxMesh = new THREE.Mesh( 
    new THREE.BoxGeometry( 100000, 100000, 100000), 
    shaderMaterial 
  );

  skyboxMesh.position.z = -80000
  //skyboxMesh.rotation.x = 2
  // skyboxMesh.position.multiplyScalar(1000)
  
  // add it to the scene
  return skyboxMesh
}


export function init() {

  // SCENE
  scene = new THREE.Scene()
  
  scene.fog = new THREE.Fog( 0x121212, 0.1, 20000 )
  scene.add( new THREE.AmbientLight( 0xffffff) );


  // CAMERA
  camera = new THREE.PerspectiveCamera( 65, screenX / screenY, 1, 200000)
  
  camera.position.z = 20000
  
  // 0 
  //camera.position.y = 4000
  
  // 1 
  camera.position.y = 1200
  // 2 camera.position.y = 1200

  camera.lookAt( scene.position );

  // 0
  // camera.rotation.y = -0.8
  // camera.rotation.x = -0.5
  // camera.position.x = -4000

  // 1
  camera.rotation.y = 0.4
  camera.rotation.x = 0.1
  camera.position.x = 4000

  // 2
  //camera.rotation.y = 1
  // camera.rotation.x = -1.25
  // camera.position.x = 0
  // camera.position.y = 8000
  
  // LIGHTS
  light = new THREE.DirectionalLight( 0xffffff, 0.1 );
  //light.castShadow = true;
  light.position.set(0, 1200, -3000)
  light.shadow.camera.near = -9000;
  light.shadow.camera.far = 1000;
  light.shadow.camera.right = 1600;
  light.shadow.camera.left = -1600;
  light.shadow.camera.top  = 20000;
  light.shadow.camera.bottom = -12000;
  light.shadow.mapSize.width = 1024;
  light.shadow.mapSize.height = 1024;

  scene.add(light)
  scene.add(new THREE.CameraHelper( light.shadow.camera ))
  tweenLight()

  // MAIN OBJECT3D
  object3d = new THREE.Object3D()
  scene.add(object3d)
  

  // TERRAIN
  var terrainMesh = terrain()
  terrainMesh.position.setY(-400)
  terrainMesh.castShadow = false
  terrainMesh.receiveShadow = true
  scene.add(terrainMesh)

  //sky = initSky()
  //scene.add(sky)
  
  
  // RENDERER
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    //alpha: true
  });

  renderer.setPixelRatio( 1 );
  renderer.setSize( screenX, screenY );
  renderer.setClearColor(0x121212);

  // RENDERER SHADOW
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  // renderer.gammaInput = true
  // renderer.gammaOutput = true
  renderer.autoClear = false;

  // append canvas
  document.getElementById('visualization').appendChild( renderer.domElement );


  // RENDER PASS
  var rtParameters = { 
    minFilter: THREE.LinearFilter, 
    magFilter: THREE.LinearFilter, 
    format: THREE.RGBFormat, 
    stencilBuffer: true 
  };

  var renderTarget = new THREE.WebGLRenderTarget( screenX, screenY, rtParameters );

  var effectBlend = new THREE.ShaderPass( THREE.BlendShader, "tDiffuse1" );
  var effectFXAA = new THREE.ShaderPass( THREE.FXAAShader );
  
  effectFXAA.uniforms[ 'resolution' ].value.set( 1 / screenX, 1 / screenY );

  var effectBleach = new THREE.ShaderPass( THREE.BleachBypassShader );


  // tilt shift
  hblur = new THREE.ShaderPass( THREE.HorizontalTiltShiftShader );
  vblur = new THREE.ShaderPass( THREE.VerticalTiltShiftShader );
  
  hblur.uniforms[ 'h' ].value = 1 / window.innerWidth;
  vblur.uniforms[ 'v' ].value = 1 / window.innerHeight;

  var effectBloom = new THREE.BloomPass(1, 32, 5);
  effectBloom.renderToScreen = true
  
  composer = new THREE.EffectComposer( renderer, renderTarget );
  vblur.renderToScreen = true

  composer = new THREE.EffectComposer( renderer, renderTarget );
  composer.addPass( new THREE.RenderPass( scene, camera ) );

  composer.addPass( effectFXAA );
  composer.addPass( effectBloom );
  composer.addPass( hblur );
  composer.addPass( vblur );
  composer.addPass( effectBleach );


  // Mouse control
  // controls = new THREE.OrbitControls( camera, renderer.domElement );
  // controls.target.set( 0, 0, 0 );
  // controls.update();


  // PLAY AUDIO
  audio.play()
}

function generateHeight( width, height ) {

  var size = width * height
  var data = new Uint8Array( size )
  var perlin = new ImprovedNoise()
  var quality = 0.1
  var z = Math.random() * 100;

  for ( var j = 0; j < 4; j ++ ) {

    for ( var i = 0; i < size; i ++ ) {

      var x = i % width
      var y = ~~ ( i / width );

      data[ i ] += Math.abs( perlin.noise( x / quality, y / quality, z ) * quality * 1.75 );

    }

    quality *= 5;

  }

  return data;

}

function terrain() {
  var worldWidth = 256
  var worldDepth = 1024
  var worldHalfWidth = worldWidth / 2, worldHalfDepth = worldDepth / 2;
  var data = generateHeight( worldWidth, worldDepth );
  var geometry = new THREE.PlaneBufferGeometry( 40000, 500000, worldWidth-1, worldDepth-1);
  const texture = THREE.ImageUtils.loadTexture('/assets/textures/rock.jpg');

  //var geometry = new THREE.SphereBufferGeometry( 20000, worldWidth-1, worldDepth-1);
  geometry.rotateX( - Math.PI / 2 );

  var vertices = geometry.attributes.position.array;

  for ( var i = 0, j = 0, l = vertices.length; i < l; i ++, j += 3 ) {
    vertices[ j + 1 ] = data[ i ] * 10;

  }

  var material = new THREE.MeshPhongMaterial( {
    color: 0x343434,
    specular: 0x57385C,
    //shading: THREE.FlatShading,
    //wireframe: true,
    //vertexColors: THREE.VertexColors,
    map: texture
  });

  return new THREE.Mesh(geometry, material)

  // var groundGeo = new THREE.PlaneBufferGeometry( 10000, 20000 );
  // var groundMat = new THREE.MeshPhongMaterial( { color: 0xffffff, specular: 0x050505 } );
  // var ground = new THREE.Mesh( groundGeo, groundMat );
  // ground.rotation.x = -Math.PI/2;
  // ground.position.y = -200;
  // return ground
}


var loudnessMax;
var center;

function addSegment(segment, radius=10, multiplyScalar=10) {
  // loudness 0-1
  loudnessMax = ((-100 - segment.loudnessMax) * -1) / 100

  center = new THREE.Vector3( 
    Math.random() * screenX - screenX / 2,
    Math.random() * screenY - screenY / 2, 
    (camera.position.z)-9000
  );

  var segmentLength = parseInt(segment.duration * 3) + 1

  for(var i = 0; i < segmentLength; i++) {
    const timbre = segment.timbre[i]
    const radius = logScale([0.72, 0.97], [1, 64], loudnessMax)//loudnessMax*12//timbre
    //var geometry1 = new THREE.SphereGeometry( radius, 8, 8);

    var shader = THREE.FresnelShader;
    var uniforms = THREE.UniformsUtils.clone( shader.uniforms );
    var parameters = { fragmentShader: shader.fragmentShader, vertexShader: shader.vertexShader, uniforms: uniforms };
    var materialA = new THREE.ShaderMaterial( parameters );

    var geometry1 = i > 0
      ? new THREE.SphereGeometry( radius, 32, 32) 
      : new THREE.CylinderGeometry(0, radius, radius*6)
    

    const material = new THREE.MeshPhongMaterial({
      //color: loudnessMax > 0.9 ? Math.random()*0xF30A49 : 0xF30A49, 
      color: Math.random()*0xF30A49, 
      transparent: true,
      opacity: loudnessMax,
      shading: THREE.FlatShading,
      specular: Math.random()*0xF30A49,
      //wireframe: true
    })

    var customMaterial = new THREE.ShaderMaterial({
      uniforms: {
        "c":   { type: "f", value: 1.0 },
        "p":   { type: "f", value: 1.4 },
        glowColor: { type: "c", value: new THREE.Color(0xff3300) },
        viewVector: { type: "v3", value: camera.position }
      },
      vertexShader:   document.getElementById( 'vertexShader'   ).textContent,
      fragmentShader: document.getElementById( 'fragmentShader' ).textContent,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true
    });

    const materials = [customMaterial, material]
    //const _mesh = THREE.SceneUtils.createMultiMaterialObject(geometry1, materials)
    const _mesh = new THREE.Mesh(geometry1, material)

    // _mesh.rotation.set( 
    //   Math.random() * 2, 
    //   Math.random() * 2, 
    //   Math.random() * 2)

    _mesh.position.set(
      center.x + Math.random() * 2400 - 1200, 
      loudnessMax <= 0.90 ? -screenY/2 : screenY/2, 
      center.z+800-(i*100))
    
    _mesh.castShadow = true
    _mesh.receiveShadow = false
  
    object3d.add(_mesh)
    tweenSegment(_mesh, loudnessMax, segment.duration, i*(segment.duration/3)*1000)

    
  }
}


function addTatum(tatum) {
  const geometry = new THREE.Geometry()
  geometry.vertices.push(
    new THREE.Vector3( 400, 100, camera.position.z-4000 ),
    new THREE.Vector3( 400, 600, camera.position.z-4000)
  )
  const material =  new THREE.LineBasicMaterial({
    color: Math.random() * 0xffffff
  });

  const mesh = new THREE.Line(geometry, material)
  object3d.add(mesh)
}

function tweenSegment(m, loudness, duration, delay=1, remove=true) {
  const loudnessMax = ((-100 - loudness) * -1) / 100

  m.scale.set(.25,.25,.25)
  var scale = loudnessMax*6
  var opacity = 1

  var easing = TWEEN.Easing.Quadratic.Out

  if(duration <= 0.25) {
    easing = TWEEN.Easing.Elastic.Out
  }

  // var tween = new TWEEN.Tween(m.position)
  //   .to({z: m.position.z+25 }, 3000)
  //   .easing(TWEEN.Easing.Elastic.Out)
  //   .start()


  var tween = new TWEEN
    .Tween({ scale: .1, opacity: 1, y: m.position.y })
    .delay(delay)
    .to({ scale: scale, opacity: opacity, y: -140 }, (duration)*1000)
    .easing(TWEEN.Easing.Elastic.InOut)
    .onUpdate(function(t) {
      m.scale.set(this.scale, this.scale, this.scale)
      //m.rotation.set()
      m.position.setY(this.y)
      m.material.opacity=this.opacity
      if(opacity==0.25) m.castShadow = false
    })
    .onComplete(function() {
      new TWEEN
        .Tween({ scale: scale, z: m.position.z, rotation:0, opacity: 1 })
        .to({ scale: 2, z: m.position.z+600,rotation: scale, opacity: 0 }, 3000)
        .easing(TWEEN.Easing.Exponential.Out)
        .onUpdate(function(t) {
          //m.scale.set(this.scale, this.scale, this.scale)
          //m.rotation.set(this.rotation, this.rotation, this.rotation)
          //m.material.opacity=this.opacity
        })  
        .onComplete(function() {
          if(remove) object3d.remove(m)
        })
        .start()
    })
    .start()
}

function tweenObject(obj, scale, duration) {
  var tween = new TWEEN
    .Tween(obj.scale)
    .to({ x: scale, y: scale, z: scale }, duration)
    .easing(TWEEN.Easing.Exponential.In)
    .onComplete(function() {
      new TWEEN
        .Tween(obj.scale)
        .to({ x: 1, y: 1, z: 1 }, duration/2)
        .easing(TWEEN.Easing.Exponential.Out)
        .start()
    })
    .start()

}

function tweenLight(x=4000, duration=2290, easing=TWEEN.Easing.Circular.InOut, returnBack=true) {
  var tween = new TWEEN
    .Tween(light.position)
    .to({ x }, duration/2)
    .easing(easing)
    .onComplete(function() {
      if(returnBack) tweenLight(x*-1, duration, TWEEN.Easing.Circular.InOut)
    })
    .start()
  return tween
}


var sceneIdx = 0

// position (x, y), rotation (x, y)
const cameraPositions = [
  new THREE.Vector2( -4000, 12000 ),
]

const cameraRotations = [

]

function addScene(scene) {

  console.log('scene', scene, sceneIdx)

  // move camera
  if(sceneIdx >= 1) {
    // camera.position.x = 4000
    // camera.position.y = 600
    // camera.rotation.y = -0.1  
  }
  

  // object3d.scale.set(1, 1, 1)

  // for(var i = 0; i < object3d.children.length;i++) {
  //   var child = object3d.children[i]
  //   object3d.remove(child)
  // }

  // var tween = new TWEEN
  //   .Tween(object3d.rotation)
  //   .to({ x: -1, y: -1, z: -1 }, scene.duration*1000)
  //   .easing(TWEEN.Easing.Exponential.In)
  //   .onComplete(function() {})
  //   .start()
  sceneIdx += 1;
}

audio.currentTime=0

const barInterval = 1 / (audioData.info.bpm / 60)
let lastTime = 0
var currentSegment;
var currentScene;
var lastScene;
var lastBar = {}
var currentBar = {};
var clock = new THREE.Clock( );
var barCount = 0;
var startTweenLight = false;
clock.start()

export function animate(time) {
  currentSegment = segmentsByTime[audio.currentTime.toFixed(1)]
  currentScene = scenesByTime[audio.currentTime.toFixed(0)]  
  currentBar = barsByTime[audio.currentTime.toFixed(1)]

  light.intensity = 1.0
  //particleSystem.scale.set(1, 1, 1)

  if(audio.currentTime == 0 && startTweenLight===false) {
    startTweenLight = true;
  }

  if(currentScene && currentScene != lastScene) {
    addScene(currentScene)
    lastScene = currentScene 
  } 


  if(currentBar && currentBar.start != lastBar.start) {
    


    lastBar = currentBar
    barCount += 1;
  } 


  if(currentSegment) {


    if(currentSegment.start != lastSegment.start) {
      //light.intensity = currentSegment.loudnessMax*2
      vblur.uniforms[ 'v' ].value = currentSegment.loudnessMax*0.001

      //document.getElementById('bpm-helper').innerHTML = "LOUDNESS: "+ currentSegment.loudnessMax
      //tweenLight(light, currentSegment.loudnessMax*-1, currentSegment.duration)
      addSegment(currentSegment, 60, 100)
      lastSegment = currentSegment
    }

    if(currentSegment.loudnessMax > -22) {
      
      
      
      //sky.uniforms.reileigh.intensity += audio.currentTime/1000000
      //addSegment(currentSegment, 2, 3000)
      //lastSegment = currentSegment
    }

  }
  
  //sky.uniforms.turbidity.value = audio.currentTime/100;
  // sky.uniforms.reileigh.value = ;
  // sky.uniforms.luminance.value = ;
  // sky.uniforms.mieCoefficient.value = ;
  // sky.uniforms.mieDirectionalG.value = ;

  //sky.uniforms.reileigh.value = 4 - (audio.currentTime/50)

  // tempo bpm
  if(!lastTime || audio.currentTime - lastTime >= barInterval) {
    //particleSystem.scale.set(1.1,1.1,1.1)
    //sky.uniforms.turbidity.value = 1.0
    addTatum()
    lastTime = audio.currentTime
  }
  
  cameraZ -= 36

  
  camera.position.z = cameraZ
  //camera.position.y += 0.1



  requestAnimationFrame(animate)
  //renderer.render(scene, camera)
  //camera.rotation.y += 0.01
  composer.render(renderer)
  //camControls.update(clock.getDelta())
  renderer.shadowMap.needsUpdate = true
  TWEEN.update()
}




//EVENTS

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}