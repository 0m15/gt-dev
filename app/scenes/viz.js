
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

console.log('scenesByTime', scenesByTime)


export function init() {

  // scene
  scene = new THREE.Scene()
  
  scene.fog = new THREE.Fog( 0x000000, 0.8, 1600 )
  scene.add( new THREE.AmbientLight( 0xffffff) );

  // lights
  light = new THREE.DirectionalLight( 0xffffff, 1.0 );
  light.position.set(0, 0, 100)

  scene.add(light)
  
  // camera
  camera = new THREE.PerspectiveCamera( 85, screenX / screenY, 1, 2000)
  
  camera.position.z = 750
  camera.lookAt( scene.position );
    
  // terrain
  var terrainMesh = terrain()
  terrainMesh.position.setY(-1000)
  scene.add(terrainMesh)

  // main object
  const geometry = new THREE.IcosahedronGeometry( 160 );
  //const geometry = new THREE.SphereGeometry( 160 );
  var customMaterial = new THREE.ShaderMaterial({
    uniforms: {  

    },
    vertexShader:   document.getElementById( 'vertexShader'   ).textContent,
    fragmentShader: document.getElementById( 'fragmentShader' ).textContent,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
    transparent: true
  });
  const material = new THREE.MeshPhongMaterial( { 
    color: 0xffffff, 
    wireframe: false,
    transparent: true,
    opacity: 0.25
    //shading: THREE.FlatShading,

  });


  const materials = [customMaterial, material]
  //mesh = new THREE.Mesh( geometry, customMaterial);
  mesh = THREE.SceneUtils.createMultiMaterialObject(geometry, materials)

  

  object3d = new THREE.Object3D()
  scene.add(object3d)

  // const _meshGlow = new THREE.Mesh( object3d.geometry, customMaterial.clone() );
  // _meshGlow.position.setX(_mesh.position.x)
  // _meshGlow.position.setY(_mesh.position.y)
  // _meshGlow.position.setZ(_mesh.position.z)

  //scene.add(mesh)

  // particles
  particleSystem = drawParticles(3)
  particleSystem.sortParticles = true

  //scene.add(particleSystem)


  //renderer
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    // alpha: true
  });
  

  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( screenX, screenY );
  //renderer.setClearColor(0x121212)

  // append canvas
  document.getElementById('visualization').appendChild( renderer.domElement );

  // play audio
  audio.play()
}

function generateHeight( width, height ) {

  var size = width * height, data = new Uint8Array( size ),
  perlin = new ImprovedNoise(), quality = 1, z = Math.random() * 100;

  for ( var j = 0; j < 4; j ++ ) {

    for ( var i = 0; i < size; i ++ ) {

      var x = i % width, y = ~~ ( i / width );
      data[ i ] += Math.abs( perlin.noise( x / quality, y / quality, z ) * quality * 1.75 );

    }

    quality *= 5;

  }

  return data;

}

function terrain() {
  var worldWidth = 256
  var worldDepth = 256
  var worldHalfWidth = worldWidth / 2, worldHalfDepth = worldDepth / 2;
  var data = generateHeight( worldWidth, worldDepth );
  var geometry = new THREE.PlaneBufferGeometry( 7500, 20000, worldWidth - 1, worldDepth - 1 );
  geometry.rotateX( - Math.PI / 2 );


  var vertices = geometry.attributes.position.array;

  for ( var i = 0, j = 0, l = vertices.length; i < l; i ++, j += 3 ) {
    vertices[ j + 1 ] = data[ i ] * 10;

  }

  var material = new THREE.MeshPhongMaterial( {
    color: 0xffffff,
    wireframe: false,
  });

  return new THREE.Mesh(geometry, material)
}

function drawParticles(size=6) {
  const range = screenX
  const geometry = new THREE.Geometry();
  const textureLoader = new THREE.TextureLoader()
  const texture = THREE.ImageUtils.loadTexture('/assets/tests/particle-1.png');
  const material = new THREE.PointsMaterial({
      size: size,
      transparent: true,
      opacity: 1,
      map: texture,
      fog: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
      color: 0x9AE17B
    })
 
  for (var i = 0; i < 400; i++) {
    const particle = new THREE.Vector3(0, 0, 0)
    particle.x = Math.random() * screenX - screenX / 2, 
    particle.y = Math.random() * screenY - screenY / 2, 
    particle.z = Math.random() * 400 - 400 / 2;
    
    //drawParticle(particle)
    geometry.vertices.push(particle)

    //scene.add(particle)
  }

  var system = new THREE.Points(geometry, material);
  return system
}
  

function __addSegment(segment, radius=10, multiplyScalar=10) {
  // loudness 0-1
  const loudnessMax = ((-100 - segment.loudnessMax) * -1) / 100
  
  for(var i = 0; i < 1; i++) {
    const timbre = segment.timbre[i]
    const radius = timbre//timbre
    var geometry = new THREE.SphereGeometry( radius, 1, 1 );
    const material = new THREE.MeshPhongMaterial({
      color: 0xff3870, 
      transparent: true,
      opacity: 1,
      shading: THREE.FlatShading,
      wireframe: false
    })

    var customMaterial = new THREE.ShaderMaterial({
      uniforms: {  },
      vertexShader:   document.getElementById( 'vertexShader'   ).textContent,
      fragmentShader: document.getElementById( 'fragmentShader' ).textContent,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true
    });

    const materials = [customMaterial]
    //mesh = new THREE.Mesh( geometry, customMaterial);
    const _mesh = THREE.SceneUtils.createMultiMaterialObject(geometry, materials)
    //const mesh = new THREE.Mesh( geometry, material )
    _mesh.scale.set(1, 1, 1)
    //_mesh.scale.x = mesh.scale.y = mesh.scale.z = timbre*0.01;
    _mesh.position.set(
      Math.random() * 10 - 10 / 2,
      Math.random() * 10 - 10 / 2, 
      Math.random() * 10 - 10 / 2
    )
    _mesh.position.multiplyScalar( Math.random()*multiplyScalar );
    _mesh.rotation.set( Math.random() * 2, Math.random() * 2, Math.random() * 2 );
    
    
    object3d.add(_mesh)
    tweenSegment(_mesh, timbre, segment.duration, i*100)
    
  }
}


function addSegment(segment, radius=10, multiplyScalar=10) {
  // loudness 0-1
  const loudnessMax = ((-100 - segment.loudnessMax) * -1) / 100

  const center = new THREE.Vector3( 
    Math.random() * screenX - screenX / 2,
    Math.random() * screenY - screenY / 2, 
    (camera.position.z)-1000
  );


  for(var i = 0; i < 3; i++) {
    const timbre = segment.timbre[i]
    const radius = logScale([0.78, 0.97], [4, 64], loudnessMax)//loudnessMax*12//timbre
    var geometry = new THREE.SphereGeometry( radius, 32, 32 );
    var geometry1 = new THREE.SphereGeometry( radius, 1, 1);
    const material = new THREE.MeshPhongMaterial({
      color: loudnessMax > 0.9 ? Math.random()*0xF30A49 : 0xF30A49, 
      transparent: true,
      opacity: 1,
      shading: THREE.FlatShading,
      wireframe: false
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
      side: THREE.FrontSide,
      blending: THREE.AdditiveBlending,
      transparent: true
    });

    const materials = [material]
    //mesh = new THREE.Mesh( geometry, customMaterial);
    const _mesh = THREE.SceneUtils.createMultiMaterialObject(geometry1, materials)

    //const mesh = new THREE.Mesh( geometry, material )
    _mesh.scale.set(1, 1, 1)
    //_mesh.scale.x = mesh.scale.y = mesh.scale.z = timbre*0.01;
    _mesh.position.set(
      center.x+Math.random()*80-80/2, 
      center.y+Math.random()*80-80/2, 
      center.z)
    //_mesh.position.multiplyScalar( Math.random()*multiplyScalar );
    //_mesh.position.multiplyScalar( 2 );
    _mesh.rotation.set( Math.random() * 2, Math.random() * 2, Math.random() * 2 );
    object3d.add(_mesh)

    //_meshGlow.scale.multiplyScalar(1.2)

    
    
    //object3d.add(_meshGlow)
    

    //tweenSegment(_meshGlow, timbre, segment.duration, i*100)
    tweenSegment(_mesh, timbre, segment.duration, i*100)

    
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
  m.scale.set(.25,.25,.25)
  const scale = loudness/20
  // var tween = new TWEEN.Tween(m.position)
  //   .to({z: m.position.z+100 }, 1000)
  //   .easing(TWEEN.Easing.Exponential.Out)
  //   .start()
  var tween = new TWEEN
    .Tween({ scale: .1, opacity: 1, z: m.position.y })
    .delay(delay)
    .to({ scale: scale, opacity: 0, z: m.position.z+1200 }, (duration)*1000)
    .easing(TWEEN.Easing.Exponential.In)
    .onUpdate(function(t) {
      m.scale.set(this.scale, this.scale, this.scale)
      //m.rotation.set()
      //m.position.setZ(this.z)
    })
    .onComplete(function() {
      new TWEEN
        .Tween({ scale: scale, z: m.position.z, rotation:0 })
        .to({ scale: 1, z: m.position.z+600,rotation: scale }, 2000)
        .easing(TWEEN.Easing.Exponential.Out)
        .onUpdate(function(t) {
          //m.scale.set(this.scale, this.scale, this.scale)
          //m.rotation.set(this.rotation, this.rotation, this.rotation)
          m.children[0].material.opacity=1-t
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
  //   .Tween(object3d.scale)
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
  console.log('object3d.children', object3d.children.length)
  currentSegment = segmentsByTime[audio.currentTime.toFixed(1)]
  currentScene = scenesByTime[audio.currentTime.toFixed(0)]  

  //light.intensity = 1.0
  //particleSystem.scale.set(1, 1, 1)

  if(currentScene && currentScene != lastScene) {
    addScene(currentScene)
    lastScene = currentScene 
  }

  if(currentSegment) {

    //light.intensity = segment ? segment.loudnessMax * -1 * 0.5 : 0.5

    if(currentSegment.loudnessMax > -20 && !tweening) {
      
      //tweenSegment(mesh, segment, false)
    }

    if(currentSegment.loudnessMax > -22 && currentSegment.start != lastSegment.start) {
      document.getElementById('bpm-helper').innerHTML = "LOUDNESS: "+ currentSegment.loudnessMax
      tweenLight(light, currentSegment.loudnessMax*-1, currentSegment.duration)
      addSegment(currentSegment, 60, 100)
      lastSegment = currentSegment
    }

    if(currentSegment.loudnessMax < -8) {
      //addSegment(currentSegment, 2, 3000)
      //lastSegment = currentSegment
    }

  }

  // tempo bpm
  if(!lastTime || audio.currentTime - lastTime >= barInterval) {
    particleSystem.scale.set(1.1,1.1,1.1)
    lastTime = audio.currentTime
  }
  cameraZ -= 4
  camera.position.z = cameraZ

  requestAnimationFrame(animate)
  renderer.render(scene, camera)

  TWEEN.update()
}




//EVENTS

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}