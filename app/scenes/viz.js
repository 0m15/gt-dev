
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
  
var { analyser, audio } = fft()


// AUDIO STUFF

function getBeatsByTime() {
  const beats = {}
  audioData.beats.forEach(b => {
    beats[b.start.toFixed(1)] = { duration: b.duration, end: b.start + b.duration, confidence: b.confidence}
  })
  return beats
}

function getSegmentsByTime() {
  const segments = {}
  audioData.segments.forEach(b => {
    segments[b.start.toFixed(1)] = { 
      duration: b.duration, 
      end: b.start + b.duration, 
      confidence: b.confidence,
      loudnessStart: b.loudness_start,
      loudnessMax: b.loudness_max,
      loudnessMaxTime: b.loudness_max_time,
    }
  })
  return segments
}

const beatsByTime = getBeatsByTime()
const segmentsByTime = getSegmentsByTime()

export function init() {

  // scene
  scene = new THREE.Scene()
  
  scene.fog = new THREE.Fog( 0x121212, 0.9, 1600 )
  scene.add( new THREE.AmbientLight( 0xffffff) );

  // camera
  camera = new THREE.PerspectiveCamera( 70, screenX / screenY, 1, 2000)
  
  camera.position.z = 500
  camera.lookAt( scene.position );
  

  // main object
  const geometry = new THREE.IcosahedronGeometry( 320 );
  //const geometry = new THREE.TorusKnotGeometry(320, 40, 120, 4)
  const material = new THREE.MeshPhongMaterial( { 
    color: 0xffffff, 
    wireframe: true,
  });
  mesh = new THREE.Mesh( geometry, material);

  scene.add(mesh)

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




function tweenSegment(segment) {
  tweening=true
  
  const scale = segment.loudnessMax * -1 * 0.1

  var tween = new TWEEN
    .Tween(mesh.scale)
    .to({ x: scale, y: scale, z: scale }, (segment.duration-segment.loudnessMaxTime)*100)
    .easing(TWEEN.Easing.Quadratic.In)
    .onComplete(function() {
      new TWEEN
        .Tween(mesh.scale)
        .to({ x: 1, y: 1, z: 1 }, segment.loudnessMaxTime)
        .easing(TWEEN.Easing.Quadratic.Out)
        .onComplete(function() {
          tweening=false
        })
        .start()
    })
    .start()
}

audio.currentTime=100
export function animate(time) {
  var segment = segmentsByTime[audio.currentTime.toFixed(1)]
  
  if(segment && segment.duration > 0.125 && !tweening) {
    tweenSegment(segment)
  }

  mesh.rotation.x += 0.01
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