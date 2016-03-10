
import THREE from 'three'
import TWEEN from 'tween'

window.THREE = THREE

let particleSystem;
let particles;
let material;
let geometry;
let pCount;


export function setup(particleCount=2500, size=2) {
  geometry = new THREE.Geometry();
  const textureLoader = new THREE.TextureLoader()
  const texture = THREE.ImageUtils.loadTexture('/assets/tests/particle-1.png');

  const material = new THREE.PointsMaterial({
    size: size,
    transparent: true,
    opacity: 1,
    map: texture,
    fog: false,
    //blending: THREE.Overlay,
    depthWrite: false,
    sizeAttenuation: true,
    color: 0xffffff
  })

  for (var i = 0; i < particleCount; i++) {
    const particle = new THREE.Vector3(
      0, 0, 0
    )
  
    particle.x = Math.random() * 10 - 5 
    particle.y = Math.random() * 10 - 5 
    particle.z = Math.random() * 10 - 5
    particle.multiplyScalar(Math.random() * (800 - 700) + 700);    

    particle.velocity = new THREE.Vector3(
      Math.random(), Math.random(), 0
    )

    geometry.vertices[i] = particle
  }

  particleSystem = new THREE.Points(geometry, material)
  return particleSystem
}


export function update() {

  pCount = geometry.vertices.length;
  
  while (pCount--) {

    // get the particle
    var particle = geometry.vertices[pCount];

    // check if we need to reset
    if (particle.y > window.innerHeight + 300) {
      particle.y = -window.innerHeight*2
      particle.velocity.y = 0;
    }

    // if (particle.x > window.innerWidth) {
    //   particle.x = -window.innerWidth;
    //   particle.velocity.x = 0;
    // }

    // update the velocity with
    // a splat of randomniz
    particle.velocity.x = Math.random() * .2 - .2;
    particle.velocity.y = Math.random() * 10;

    particle.y += particle.velocity.y
    particle.x += particle.velocity.x
    // and the position
    // particle.position.addSelf(
    //   particle.velocity);
  }

  // flag to the particle system
  // that we've changed its vertices.
  geometry.verticesNeedUpdate = true
}

export function bump(value=1.1, direction='out', back=true, duration=250) {
  for(var i = 0; i < geometry.vertices.length; i++) {
    // get the particle
    var particle = geometry.vertices[i];
    bumpParticle(particle, value, direction, back, TWEEN.Easing.Quadratic.In, duration, i)
  }
}

function bumpParticle(
  particle, 
  scalar, 
  direction='out', 
  back=false, 
  easing=TWEEN.Easing.Quadratic.In,
  duration,
  delay=0) {
  const position = particle.clone()
  
  if(direction=='out') {
    position.multiplyScalar(scalar)
  } else {
    position.divideScalar(scalar)
  } 

  new TWEEN
    .Tween({x: particle.x, y: particle.y, z: particle.z})
    .to({x: position.x, y: position.y, z: position.z }, duration / 2)
    .onUpdate(function() {
      particle.x = this.x
      particle.y = this.y
      particle.z = this.z
      geometry.verticesNeedUpdate = true
    })
    .easing(easing)
    .onComplete(function() {
      if(back) bumpParticle(particle, scalar, 'in', false, TWEEN.Easing.Quadratic.Out, duration)
    })
    .delay(delay)
    .start()
} 


