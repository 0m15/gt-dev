
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


const objects = []

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

const beatsByTime = getBeatsByTime()
const segmentsByTime = getSegmentsByTime()
const barsByTime = getBarsByTime()
const tatumsByTime = getTatumsByTime()

export function init() {

  // scene
  scene = new THREE.Scene()
  
  scene.fog = new THREE.Fog( 0xEB5033, 0.9, 1600 )
  scene.add( new THREE.AmbientLight( 0xffffff) );

  // lights
  light = new THREE.DirectionalLight( 0xffffff, 1.0 );
  light.position.set(0, 0, 700)

  scene.add(light)
  
  // camera
  camera = new THREE.PerspectiveCamera( 85, screenX / screenY, 1, 2000)
  
  camera.position.z = 750
  camera.lookAt( scene.position );
  

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
    wireframe: true,
    transparent: true,
    opacity: 0.25
    //shading: THREE.FlatShading,

  });
  const materials = [customMaterial, material]
  //mesh = new THREE.Mesh( geometry, customMaterial);
  mesh = THREE.SceneUtils.createMultiMaterialObject(geometry, materials)

  

  object3d = new THREE.Object3D()
  scene.add(object3d)

  //scene.add(mesh)

  // particles
  particleSystem = drawParticles(3)
  particleSystem.sortParticles = true

  scene.add(particleSystem)


  //renderer
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
  });
  

  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( screenX, screenY );
  //renderer.setClearColor(0x121212)

  // append canvas
  document.getElementById('visualization').appendChild( renderer.domElement );

  // play audio
  audio.play()
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
  

function addSegment(segment, multiplyScalar=10) {
  // loudness 0-1
  const loudnessMax = ((-100 - segment.loudnessMax) * -1) / 100
  
  for(var i = 0; i < 12; i++) {
    const timbre = segment.timbre[i]
    const radius = 20//timbre
    var geometry = loudnessMax > 0.9 ? new THREE.IcosahedronGeometry( radius*2 ) : new THREE.SphereGeometry( radius, 1, 1 );
    const material = new THREE.MeshPhongMaterial({
      color: 0xF30A49, 
      transparent: true,
      opacity: Math.random()*1,
      shading: THREE.FlatShading,
      //wireframe: segment.loudnessMax < 6
    })

    var customMaterial = new THREE.ShaderMaterial({
      uniforms: {  },
      vertexShader:   document.getElementById( 'vertexShader'   ).textContent,
      fragmentShader: document.getElementById( 'fragmentShader' ).textContent,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true
    });

    const materials = [material]
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
    tweenSegment(_mesh, timbre, segment.duration)
    
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

function tweenSegment(m, loudness, duration, remove=true) {
  m.scale.set(.25,.25,.25)
  const scale = loudness/50
  var tween = new TWEEN
    .Tween({ scale: 1, opacity: 1, y: m.position.y })
    .to({ scale: scale, opacity: 0, y: m.position.y-600 }, (duration)*1000)
    .easing(TWEEN.Easing.Exponential.In)
    .onUpdate(function(t) {
      m.scale.set(this.scale*2, this.scale*2, this.scale*2)
    })
    .onComplete(function() {
      new TWEEN
        .Tween({ scale: scale, y: m.position.y })
        .to({ scale: 3, y: m.position.y-600 }, 4000)
        .easing(TWEEN.Easing.Exponential.Out)
        .onUpdate(function(t) {
          m.scale.set(this.scale, this.scale, this.scale)
          //m.position.setZ(this.y)
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

audio.currentTime=50

const barInterval = 1 / (audioData.info.bpm / 60)
let lastTime = 0

export function animate(time) {
  var segment = segmentsByTime[audio.currentTime.toFixed(1)]
  
  //light.intensity = 1.0

  document.getElementById('bpm-helper').innerHTML = "LOUDNESS:"

  if(segment) {

    //light.intensity = segment ? segment.loudnessMax * -1 * 0.5 : 0.5

    

    if(segment.loudnessMax > -20 && !tweening) {
      tweenLight(light, segment.loudnessMax*-1, segment.duration)
      //tweenSegment(mesh, segment, false)
    }

    if(segment.loudnessMax > -8 && segment.loudnessMax < -5 && segment.start != lastSegment.start) {
      document.getElementById('bpm-helper').innerHTML = "LOUDNESS: "+ segment.loudnessMax
      addSegment(segment)
      lastSegment = segment
    }

    if(segment.loudnessMax > -22 && segment.loudnessMax < -8) {
      addSegment(segment, 3000)
    }

  }

  // tempo bpm
  if(!lastTime || audio.currentTime - lastTime >= barInterval) {
    lastTime = audio.currentTime
  }

  //object3d.rotation.y += 0.01
  //particleSystem.rotation.y += 0.0075

  //camera.position.z -= 1
  //scene.rotation.y = light.rotation.y += 0.0025

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