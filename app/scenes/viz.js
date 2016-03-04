
import THREE from 'three'
import TWEEN from 'tween'
import audioData from '../lib/audio-data'
import fft from '../lib/fft'

window.THREE = THREE

require('../vendor/js/ShaderPass.js')
require('../vendor/js/BleachBypassShader.js')
require('../vendor/js/BlendShader.js')
require('../vendor/js/FXAAShader.js')
require('../vendor/js/CopyShader.js')
require('../vendor/js/HorizontalTiltShiftShader.js')
require('../vendor/js/VerticalTiltShiftShader.js')
require('../vendor/js/TriangleBlurShader.js')
require('../vendor/js/VignetteShader.js')
require('../vendor/js/ConvolutionShader.js')
require('../vendor/js/DotScreenShader.js')
require('../vendor/js/RGBShiftShader.js')
require('../vendor/js/EffectComposer.js')
require('../vendor/js/RenderPass.js')
require('../vendor/js/BloomPass.js')
require('../vendor/js/MaskPass.js')
require('../vendor/js/StereoEffect.js')
require('../vendor/js/OrbitControls.js')
require('../vendor/js/ImprovedNoise.js')
require('../vendor/js/SkyShader.js')
require('../vendor/js/FirstPersonControls.js')
require('../vendor/js/FresnelShader.js')

var PARTICLE_COUNT = 250

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
var { analyser, audio } = fft()
var cameraZ = 0
var sunlight;
var camControls;
var sky;

const objects = []

// SCALES

function logScale(domain=[0,100], values=[100,1000], value=1) {
  // position will be between 0 and 100
  var minp = domain[0];
  var maxp = domain[1];

  // The result should be between 100 an 10000000
  var minv = Math.log(values[0]);
  var maxv = Math.log(values[1]);

  // calculate adjustment factor
  var scale = (maxv-minv) / (maxp-minp);

  return Math.exp(minv + scale*(value-minp));
}


// AUDIO STUFF

function getBeatsByTime() {
  const beats = {}
  audioData.beats.forEach(b => {
    beats[b.start.toFixed(1)] = { duration: b.duration, end: b.start + b.duration, confidence: b.confidence}
  })
  return beats
}

function getTatumsByTime() {
  const tatums = {}
  audioData.tatums.forEach(b => {
    tatums[b.start.toFixed(1)] = { duration: b.duration, end: b.start + b.duration, confidence: b.confidence}
  })
  return tatums
}

function getBarsByTime() {
  const bars = {}
  audioData.bars.forEach(b => {
    bars[b.start.toFixed(1)] = { 
      duration: b.duration, end: b.start + b.duration, confidence: b.confidence
    }
  })
  return bars
}

function getSegmentsByTime() {
  const segments = {}
  audioData.segments.forEach(b => {
    segments[b.start.toFixed(1)] = { 
      start: b.start,
      duration: b.duration, 
      end: b.start + b.duration, 
      confidence: b.confidence,
      loudnessStart: b.loudness_start,
      loudnessMax: b.loudness_max,
      loudnessMaxTime: b.loudness_max_time,
      timbre: b.timbre
    }
  })
  return segments
}

function getScenesByTime() {
  const scenes = {}
  audioData.scenes.forEach(b => {
    scenes[b.start.toFixed(0)] = { 
      start: b.start,
      duration: b.duration, 
      end: b.start + b.duration,
      confidence: b.confidence,
      key: b.key,
      loudness: b.loudness,
    }
  })
  return scenes
}

const beatsByTime = getBeatsByTime()
const segmentsByTime = getSegmentsByTime()
const barsByTime = getBarsByTime()
const tatumsByTime = getTatumsByTime()
const scenesByTime = getScenesByTime()

function initSky() {

  // Add Sky Mesh
  sky = new THREE.Sky();
  scene.add( sky.mesh );

  // Add Sun Helper
  var sunSphere = new THREE.Mesh(
    new THREE.SphereBufferGeometry( 2000, 16, 8 ),
    new THREE.MeshBasicMaterial( { color: 0xff6600 } )
  );

  sunSphere.position.y = 100;
  sunSphere.visible = true;
  //scene.add( sunSphere );

  /// GUI

  var effectController  = {
    turbidity: 1,
    reileigh: 0,
    mieCoefficient: 0.0011,
    mieDirectionalG: 0.8,
    luminance: 1,
    inclination: 0.42, // elevation / inclination
    azimuth: 0.25, // Facing front,
    sun: true
  };

  var distance = 4000;

  // function guiChanged() {

  var uniforms = sky.uniforms;
  uniforms.turbidity.value = effectController.turbidity;
  uniforms.reileigh.value = effectController.reileigh;
  uniforms.luminance.value = effectController.luminance;
  uniforms.mieCoefficient.value = effectController.mieCoefficient;
  uniforms.mieDirectionalG.value = effectController.mieDirectionalG;

  var theta = Math.PI * ( 0.47 - 0.5 );
  var phi = 2 * Math.PI * ( 0.25 - 0.5 );

  sunSphere.position.x = distance * Math.cos( phi );
  sunSphere.position.y = distance * Math.sin( phi ) * Math.sin( theta );
  sunSphere.position.z = distance * Math.sin( phi ) * Math.cos( theta );

  sunSphere.visible = effectController.sun;

  sky.uniforms.sunPosition.value.copy( sunSphere.position );

}

export function init() {

  // SCENE
  scene = new THREE.Scene()
  
  //scene.fog = new THREE.Fog( 0x121212, 0.1, 200000 )
  scene.add( new THREE.AmbientLight( 0xffffff) );


  // CAMERA
  camera = new THREE.PerspectiveCamera( 65, screenX / screenY, 1, 2000000)
  camera.position.z = 1800
  //camera.position.x = -300
  camera.position.y = 300
  camera.lookAt( scene.position );
  

  // FIRST PERSON CONTROLS
  // camControls = new THREE.FirstPersonControls(camera);
  // camControls.lookSpeed = 0.1;
  // camControls.movementSpeed = 1;
  // camControls.noFly = true;
  // camControls.lookVertical = true;
  // camControls.constrainVertical = true;
  // camControls.verticalMin = 1.0;
  // camControls.verticalMax = 2.0;

  
  // LIGHTS
  light = new THREE.DirectionalLight( 0xffffff, 0.1 );
  light.castShadow = true;
  light.position.set(0, 1200, -3000)
  light.shadow.camera.near = -100000;
  light.shadow.camera.far = 10000;
  light.shadow.camera.right = 1600;
  light.shadow.camera.left = -1600;
  light.shadow.camera.top  = 20000;
  light.shadow.camera.bottom = -12000;
  light.shadow.mapSize.width = 1024;
  light.shadow.mapSize.height = 1024;

  scene.add(light)
  //scene.add(new THREE.CameraHelper( light.shadow.camera ))

  // MAIN OBJECT3D
  object3d = new THREE.Object3D()
  scene.add(object3d)


  // TERRAIN
  var terrainMesh = terrain()
  terrainMesh.position.setY(-400)
  terrainMesh.castShadow = false
  terrainMesh.receiveShadow = true
  scene.add(terrainMesh)

  //initSky()
  
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

  //var effectBleach = new THREE.ShaderPass( THREE.BleachBypassShader );

  // tilt shift
  hblur = new THREE.ShaderPass( THREE.HorizontalTiltShiftShader );
  vblur = new THREE.ShaderPass( THREE.VerticalTiltShiftShader );
  
  hblur.uniforms[ 'h' ].value = 1 / window.innerWidth;
  vblur.uniforms[ 'v' ].value = 1 / window.innerHeight;

  var effectBloom = new THREE.BloomPass(1, 25, 5);
  effectBloom.renderToScreen = true
  
  composer = new THREE.EffectComposer( renderer, renderTarget );
  vblur.renderToScreen = true

  composer = new THREE.EffectComposer( renderer, renderTarget );
  composer.addPass( new THREE.RenderPass( scene, camera ) );

  composer.addPass( effectFXAA );
  composer.addPass( effectBloom );
  composer.addPass( hblur );
  composer.addPass( vblur );


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
  var worldWidth = 64
  var worldDepth = 1024
  var worldHalfWidth = worldWidth / 2, worldHalfDepth = worldDepth / 2;
  var data = generateHeight( worldWidth, worldDepth );
  //var geometry = new THREE.PlaneBufferGeometry( 7500, 50000, worldWidth-1, worldDepth-1);
  var geometry = new THREE.PlaneBufferGeometry( 7500, 250000, worldWidth-1, worldDepth-1);
  geometry.rotateX( - Math.PI / 2 );

  var vertices = geometry.attributes.position.array;

  for ( var i = 0, j = 0, l = vertices.length; i < l; i ++, j += 3 ) {
    vertices[ j + 1 ] = data[ i ] * 10;

  }

  var material = new THREE.MeshPhongMaterial( {
    color: 0x111111,
    specular: 0x44FADD,
    shading: THREE.FlatShading,
    //wireframe: true
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
    (camera.position.z)-2000
  );


  for(var i = 0; i < 3; i++) {
    const timbre = segment.timbre[i]
    const radius = logScale([0.72, 0.97], [1, 64], loudnessMax)//loudnessMax*12//timbre
    //var geometry1 = new THREE.SphereGeometry( radius, 8, 8);

    var shader = THREE.FresnelShader;
    var uniforms = THREE.UniformsUtils.clone( shader.uniforms );
    var parameters = { fragmentShader: shader.fragmentShader, vertexShader: shader.vertexShader, uniforms: uniforms };
    var materialA = new THREE.ShaderMaterial( parameters );

    var geometry1 = i > 0
      ? new THREE.SphereGeometry( radius, 4, 4) 
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
    const _mesh = THREE.SceneUtils.createMultiMaterialObject(geometry1, materials)
    //const _mesh = new THREE.Mesh(geometry1, materials)

    // _mesh.rotation.set( 
    //   Math.random() * 2, 
    //   Math.random() * 2, 
    //   Math.random() * 2)

    _mesh.position.set(
      center.x + Math.random() * 180 - 180, 
      loudnessMax <= 0.90 ? -screenY/2 : screenY/2, 
      center.z-200-(i*100))
    
    _mesh.castShadow = true
    _mesh.receiveShadow = false
  
    object3d.add(_mesh)
    tweenSegment(_mesh, loudnessMax, segment.duration, i*(segment.duration/3)*1000)

    
  }
}


function tweenLight(light, loudness, duration) {
  tweening=true
  var tween = new TWEEN
    .Tween(light)
    .to({intensity: loudness*0.2}, duration*1000)
    .easing(TWEEN.Easing.Exponential.In)
    .onComplete(function() {
      tweening = false
      light.intensity = 1
    })
    .start()
  return tween
}

function tweenSegment(m, loudness, duration, delay=1, remove=true) {
  const loudnessMax = ((-100 - loudness) * -1) / 100

  m.scale.set(.25,.25,.25)
  const scale = loudnessMax*6

  var tween = new TWEEN.Tween(m.position)
    .to({z: m.position.z+25 }, 3000)
    .easing(TWEEN.Easing.Elastic.Out)
    .start()
  var tween = new TWEEN
    .Tween({ scale: .1, opacity: 1, y: m.position.y })
    .delay(delay)
    .to({ scale: scale, opacity: 0, y: -140 }, (duration)*1000)
    .easing(TWEEN.Easing.Quadratic.InOut)
    .onUpdate(function(t) {
      m.scale.set(this.scale, this.scale, this.scale)
      //m.rotation.set()
      m.position.setY(this.y)
    })
    .onComplete(function() {
      new TWEEN
        .Tween({ scale: scale, z: m.position.z, rotation:0, opacity: 1 })
        .to({ scale: 0, z: m.position.z+600,rotation: scale, opacity: 0 }, 3000)
        .easing(TWEEN.Easing.Exponential.Out)
        .onUpdate(function(t) {
          //m.scale.set(this.scale, this.scale, this.scale)
          //m.rotation.set(this.rotation, this.rotation, this.rotation)
          //m.children[0].material.opacity=this.opacity
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

function addScene(scene) {
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
}

audio.currentTime=0

const barInterval = 1 / (audioData.info.bpm / 60)
let lastTime = 0
var currentSegment;
var currentScene;
var lastScene;


var clock = new THREE.Clock( );
clock.start()

export function animate(time) {
  currentSegment = segmentsByTime[audio.currentTime.toFixed(1)]
  currentScene = scenesByTime[audio.currentTime.toFixed(0)]  

  //light.intensity = 1.0
  //particleSystem.scale.set(1, 1, 1)

  if(currentScene && currentScene != lastScene) {
    addScene(currentScene)
    lastScene = currentScene 
  } 

  if(currentSegment) {


    if(currentSegment.start != lastSegment.start) {
      console.log('i', loudnessMax)
      light.intensity = loudnessMax*0.6

      //document.getElementById('bpm-helper').innerHTML = "LOUDNESS: "+ currentSegment.loudnessMax
      //tweenLight(light, currentSegment.loudnessMax*-1, currentSegment.duration)
      addSegment(currentSegment, 60, 100)
      lastSegment = currentSegment
    }

    if(currentSegment.loudnessMax > -22) {
      //vblur.uniforms[ 'v' ].value = loudnessMax
      
      
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
    lastTime = audio.currentTime
  }
  
  cameraZ -= 16
  camera.position.z = cameraZ

  requestAnimationFrame(animate)
  //renderer.render(scene, camera)
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