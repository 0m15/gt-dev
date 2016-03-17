
import THREE from 'three'
import TWEEN from 'tween'

import * as particles from '../objects/particles'
import fft from '../lib/fft'

window.THREE = THREE
// threejs effects & plugins
require('../vendor') 

var chromaticAbberationPass, FXAAPass, bloomPass, invertPass, boxBlurPass, fullBoxBlurPass, zoomBlurPass, multiPassBloomPass, denoisePass, 
  sepiaPass, noisePass, vignettePass, vignette2Pass, CGAPass, sobelEdgeDetectionPass,
  dirtPass, blendPass, guidedFullBoxBlurPass, SSAOPass, pixelatePass, rgbSplitPass,
  artPass, chromaticAberrationPass, barrelBlurPass, oldVideoPass, dotScreenPass,
  circularBlur, poissonDiscBlur, cannyEdgeDetectionPass, freiChenEdgeDetectionPass,
  toonPass, fxaaPass, highPassPass, grayscalePass, asciiPass, guidedBoxPass,
  ledPass, halftonePass, halftoneCMYKPass;

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
var sphereMesh;
var sphereMaterial;
var loudnessMax;
var center;
var dirtPass;
var blendPass;
var playing = false
var textObject;
var tethraGeometry = new THREE.TetrahedronGeometry(1120, 4);
const objects = []

import { setupData, audioData, getBeatsByTime, getSegmentsByTime, getBarsByTime, getTatumsByTime, getScenesByTime } from '../lib/audio-data'
import { TextMesh } from '../objects/Text'

var beatsByTime;
var segmentsByTime;
var barsByTime;
var tatumsByTime;
var scenesByTime;

export function setupAudioData(trackData) {
  setupData(trackData)
  beatsByTime = getBeatsByTime()
  segmentsByTime = getSegmentsByTime()
  barsByTime = getBarsByTime()
  tatumsByTime = getTatumsByTime()
  scenesByTime = getScenesByTime()
}

// UTILS

function deg2rad() {

}

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


var sphereUniforms;

export function init() {

  // SCENE
  scene = new THREE.Scene()
  
  scene.fog = new THREE.Fog( 0x121212, 0.6, 12000 )
  scene.add( new THREE.AmbientLight( 0xffffff) );


  // CAMERA
  camera = new THREE.PerspectiveCamera( 200, screenX / screenY, 1, 20000)
  
  camera.position.z = 1750
  camera.position.y = 40

  camera.lookAt( scene.position );
  
  //camera.rotation.x = -1

  // LIGHTS
  scene.add(new THREE.AmbientLight( 0xffffff, 1.0 ))
  
  light = new THREE.DirectionalLight( 0x3FBAC2, 1.0 );
  light.castShadow = true;
  light.position.set(-80, 400, 4000)
  scene.add(light)

  var light1 = new THREE.DirectionalLight( 0xF64662, 1.0 );
  light1.position.set(80, 120, 4000)
  scene.add(light1)

  var light2 = new THREE.DirectionalLight( 0x92E0A9, 1.0 );
  light2.position.set(80, -120, 4000)
  scene.add(light2)
  //scene.add(new THREE.CameraHelper( light.shadow.camera ))


  // INTRO TEXT
  textObject = new THREE.Object3D()
  scene.add(textObject)

  const text1 = TextMesh('without')
  const text2 = TextMesh('a glass palace')
  const text3 = TextMesh('life')
  const text4 = TextMesh('would be')
  const text5 = TextMesh('a conviction')

  text2.position.y = 400
  text3.position.y = 800
  text4.position.y = 2000
  text5.position.y = 2800

  textObject.add(text1)
  textObject.add(text2)
  textObject.add(text3)
  textObject.add(text4)
  textObject.add(text5)

  // MAIN OBJECT3D
  object3d = new THREE.Object3D()
  object3d.position.z = 1200
  scene.add(object3d)
  
  // PARTICLES
  particleSystem = particles.setup()
  scene.add(particleSystem)

  // SPHERE
  sphereUniforms = {
      scale: { type: "f", value: 10.0 },
      displacement: { type: "f", value: 20.0}
  };
  var vertexShader = document.getElementById('vertexShader').text;
  var fragmentShader = document.getElementById('fragmentShader').text;
  var material = new THREE.ShaderMaterial(
      {
        uniforms : sphereUniforms,
        vertexShader : vertexShader,
        fragmentShader : fragmentShader,
        transparent: true,
        opacity: .25,
        depthWrite: false,
        side: THREE.DoubleSide,
        wireframe: true,
        //shading: THREE.FlatShading
      });
  
  var mat = new THREE.MeshPhongMaterial({
    //shading: THREE.FlatShading,
    transparent: true,
    opacity: .15,
    wireframe: true,
  });

  var geometry = new THREE.SphereGeometry( 1200, 8, 8 )
  //var geometry = new THREE.Geometry()
  // material = new THREE.MeshBasicMaterial();
  geometry.computeFaceNormals();
  geometry.computeVertexNormals();

  //sphereMesh = THREE.SceneUtils.createMultiMaterialObject(geometry, [material, mat])
  sphereMesh = new THREE.Mesh(geometry, material);
  //sphereMesh.position.z = -100
  
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
  renderer.autoClear = false;

  // append canvas
  document.getElementById('visualization').appendChild( renderer.domElement );

  composer = new WAGNER.Composer( renderer, { useRGBA: false } );
  composer.setSize( window.innerWidth, window.innerHeight ); // or whatever resolution
  
  dirtPass = new WAGNER.DirtPass();
  blendPass = new WAGNER.BlendPass();
  bloomPass = new WAGNER.MultiPassBloomPass();
  bloomPass.params.blurAmount = 3;
  FXAAPass = new WAGNER.FXAAPass();
  vignettePass = new WAGNER.Vignette2Pass();
  vignettePass.params.boost = 2;
  vignettePass.params.reduction = 3;
  noisePass = new WAGNER.NoisePass();
  noisePass.params.amount = .045;
  chromaticAbberationPass = new WAGNER.ChromaticAberrationPass();
  chromaticAbberationPass.params.amount = 100
  oldVideoPass = new WAGNER.OldVideoPass()

}


export function playScene() {
  // PLAY AUDIO
  audio.play()
  scene.add(sphereMesh);
  noisePass.params.speed = 1;
}

function addSegment(segment, radius=10, multiplyScalar=10) {
  // loudness 0-1
  loudnessMax = ((-100 - segment.loudnessMax) * -1) / 100
  var segmentLength = 12

  for(var i = 0; i < 3; i++) {
    const radius = logScale([0.72, 0.97], [1, 64], loudnessMax)

    var uniforms = {
        scale: { type: "f", value: radius*0.1 },
        displacement: { type: "f", value: radius*0.1 }
    };
    var vertexShader = document.getElementById('vertexShader').text;
    var fragmentShader = document.getElementById('fragmentShader').text;
    var material = new THREE.ShaderMaterial(
        {
          uniforms : uniforms,
          vertexShader : vertexShader,
          fragmentShader : fragmentShader,
          transparent: true,
          //opacity: Math.random()
        });
    
    var geometry = new THREE.SphereGeometry( radius, 1, 1 )//(radius, 32, 32);
    
    // // material = new THREE.MeshBasicMaterial();
    //geometry.computeFaceNormals();
    //geometry.computeVertexNormals();

    //var geometry = new THREE.SphereGeometry( radius, 1, 1) 
    
    const materialA = new THREE.MeshPhongMaterial({
      color: 0xffffff, 
      transparent: true,
      //opacity: 1-loudnessMax,
      //shading: THREE.FlatShading,
      specular: Math.random() * 0xffffff,
      wireframe: true
    })

    const _mesh = new THREE.Mesh(geometry, materialA)

    _mesh.rotation.set(Math.random() * 1, Math.random() * 1, Math.random() * 1)
    _mesh.position.set(
      Math.random() * 2.0 - 1.0,
      Math.random() * 2.0 - 1.0,
      Math.random() * 2.0 - 1.0)
    // _mesh.position.set(
    //   sphereMesh.rotation.x,
    //   sphereMesh.position.y,
    //   sphereMesh.position.z)
    _mesh.scale.set(1,1,0)
    _mesh.position.multiplyScalar(Math.random() * 500)
    _mesh.castShadow = true
    _mesh.receiveShadow = false
  
    object3d.add(_mesh)

    // sphereMesh.geometry.vertices = geometry.vertices
    // sphereMesh.geometry.verticesNeedUpdate=true
    // sphereMesh.geometry.__dirtyVertices=true

    tweenSegment(_mesh, loudnessMax, segment.duration, i*(segment.duration/segmentLength)*1000)
    
    
  }
}


function tweenSegment(m, loudness, duration, delay=1, remove=true) {
  var scale = 7*loudness
  var opacity = 1
  var easing = TWEEN.Easing.Quadratic.Out

  var tween = new TWEEN
    .Tween({ scale: 0 })
    .delay(delay)
    .to({ scale: scale }, duration*1000)
    .easing(TWEEN.Easing.Elastic.Out)
    .onUpdate(function(t) {
      m.scale.set(this.scale, this.scale, this.scale)
    })
    .onComplete(function() {
      tweenSegmentOut(m, 2300, Math.random()*3000, true)
    })
    .start()
    

  // var tween = new TWEEN
  //   .Tween({ scale: scale*10, x: m.position.x, y: m.position.y, z: m.position.z })
  //   .delay(delay)
  //   .to({ x: Math.random()*20-20, y: Math.random()*20-20, z: Math.random()*20-20 }, (duration*10)*1000)
  //   .easing(TWEEN.Easing.Quadratic.Out)
  //   .onUpdate(function(t) {
  //     m.position.set(this.x, this.y, this.z)
  //   })
  //   .start()
}

function tweenSegmentOut(mesh, duration=100, scalarValue=100, remove=false) {
  const position = mesh.position.clone()
  const newPosition = position.multiplyScalar(scalarValue)
  newPosition.z = Math.random()*10

  var tween = new TWEEN
    .Tween(mesh.position)
    .to({x: newPosition.x, y: newPosition.y, z: newPosition.z}, duration)
    .easing(TWEEN.Easing.Quadratic.InOut)
    .onUpdate(function(t) {
      mesh.material.opacity = 1-t
      mesh.position.set(this.x, this.y, this.z)
      mesh.rotation.set(t, t, t)
      //mesh.scale.set(this.scale, this.scale, this.scale)
      //mesh.material.uniforms.displacement.value = Math.random() * 10
    })
    .onComplete(function() {
      if(remove) object3d.remove(mesh)
    })
    .start()
}

function bump(duration=250, scalarValue=10, remove=false) {
  var currentObj;
  for(var i = 0; i < object3d.children.length; i++) {
    currentObj = object3d.children[i]
    if(currentObj) tweenSegmentOut(currentObj, duration, scalarValue, remove)
  }
}

function bumpSegment(loudness, duration) {
  // var currentObj;
  // for(var i = 0; i < object3d.children.length; i++) {
  //   currentObj = object3d.children[i]
  //   if(currentObj) tweenSegmentOut(currentObj, duration, scalarValue, remove)
  // }


  new TWEEN
    .Tween({ scaleMesh: 1, displacement: sphereUniforms.displacement.value, scale: sphereUniforms.scale.value })
    .to({ scaleMesh: loudnessMax, displacement: loudness*500, scale: loudness*4}, duration)
    .easing(TWEEN.Easing.Quintic.InOut)
    .onUpdate(function() {
      sphereUniforms.displacement.value = this.displacement
      sphereUniforms.scale.value = this.scale
    })
    .start()

}

function bumpScene(currentScene) {
  const loudness = (-100-currentScene.loudness)*-1

  new TWEEN
    .Tween({ scaleMesh: 1 })
    .to({ scaleMesh: loudness*0.07 }, currentScene.duration*1000)
    .easing(TWEEN.Easing.Quintic.InOut)
    .onUpdate(function() {
      sphereMesh.scale.set(this.scaleMesh, this.scaleMesh, this.scaleMesh)
    })
    .start()
}

function bumpBar(fromScale=0.2, scale=3, duration=2000, returnBack=true) {
  console.log('bar')
  new TWEEN
    .Tween({scale: fromScale})
    .to({scale} , duration)
    .easing(TWEEN.Easing.Quintic.InOut)
    .onUpdate(function() {
      //sphereMesh.scale.set(this.scale, this.scale, this.scale)
      //sphereUniforms.scale.value = this.scale
      //sphereUniforms.displacement.value = this.scale*10
    })
    .onComplete(function() {
      if(returnBack) bumpBar(scale, fromScale, 300, false)
    })
    .start()
}

var barDuration;

var lastTime = 0
var currentScene;
var currentSegment;
var lastSegment = {};
var lastScene = {};
var currentBar = {};
var lastBar = {}
var start = Date.now()
var segmentLoudness = 0
var targetRotation = 0
var targetRotationX = 0
var targetRotationY = 0
var targetRotationZ = 0
var posX = 0, posY = 0, posZ = 0

//var socket = io('http://localhost:5000');

var distanceX = 0, velocityX = 0
var distanceY = 0, velocityY = 0

// socket.on('motion', function(position) {
  
//   velocityX = position.orientation._x
//   velocityY = position.orientation._y

//   //distanceX = distanceX+velocityX
// })

// socket.on('geolocation', function(coords) {
//   posX = coords.x
//   posY = coords.y
//   posZ = coords.z

//   console.log('x', posX)
//   console.log('y', posY)
//   console.log('z', posZ)
// })

function getDistance(time) {
  var t = time/1000
  var distX = 1*(t)+(velocityX*Math.pow(t, 2))/2
  var distY = 1*(t)+(velocityY*Math.pow(t, 2))/2
  velocityX = 0
  velocityY = 0
  return {x: distX/10, y: distY/10 }
}

export function animate(time) {
  barDuration = 1 / (audioData.info.bpm / 60)
  render()
  object3d.rotation.y += 0.01
  textObject.position.y -= 4
  particleSystem.rotation.y -= targetRotation

  // sphereMesh.rotation.x = 1+velocityX*2
  // sphereMesh.rotation.y = 1+velocityY*2
  sphereMesh.rotation.x += 0.01
  sphereMesh.rotation.y += 0.01

  currentScene = scenesByTime[audio.currentTime.toFixed(0)]
  currentSegment = segmentsByTime[audio.currentTime.toFixed(1)]
  currentBar = barsByTime[audio.currentTime.toFixed(1)]

  if(currentBar && currentBar.start != lastBar.start) {
    bumpBar()
    lastBar = currentBar
  }

  if(currentSegment) {
    segmentLoudness = ((-100 - currentSegment.loudnessMax) * -1) / 100

    if(currentSegment && currentSegment.start != lastSegment.start) {

      if(currentSegment.duration >= 0.4) {
        // particles.bump(
        //   Math.max(segmentLoudness, .99), 
        //   'out', 
        //   true, 
        //   undefined, 
        //   currentSegment.duration*1000)
      }

      noisePass.params.amount = (segmentLoudness/100)*10
      addSegment(currentSegment)
      bumpSegment(segmentLoudness, currentSegment.duration*1000)
      lastSegment = currentSegment

      
    }

    
  }


  if(currentScene && currentScene.start != lastScene.start) {
    
    const loudness = (-100-currentScene.loudness)*-1
    targetRotation = loudness*0.0001
    console.log('currentScene', currentScene)
    //bumpScene(currentScene)
    
    lastScene = currentScene  
  }
  

  TWEEN.update()
  requestAnimationFrame(animate)
}

export function render() {
  renderer.autoClearColor = true;
  particles.update()
  composer.reset();
  composer.render( scene, camera );
  composer.pass( dirtPass );
  composer.pass( chromaticAbberationPass );
  composer.pass( bloomPass );
  composer.pass( vignettePass );
  composer.pass( FXAAPass );
  composer.pass( noisePass );
  //composer.pass( oldVideoPass );
  composer.toScreen();
}


//EVENTS

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  composer.setSize( window.innerWidth, window.innerHeight );
}