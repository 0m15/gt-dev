import React, { Component } from 'react'
import ThreeScene from '../components/ThreeScene'

import THREE from 'three'
import TWEEN from 'tween'

export default class IcosahedronButton extends Component {

  constructor(props) {
    super(props)
    this.state = {
      mouseover: false,
    }

    this.am = 0.001
    this.mouseOver = this.mouseOver.bind(this)
    this.mouseOut = this.mouseOut.bind(this)

    this.animate = this.animate.bind(this)
    this.renderScene = this.renderScene.bind(this)
  }

  mouseOver() {
    this.setState({
      mouseover: true
    })
    this.props.onMouseOver()
  }

  mouseOut() {
    this.setState({
      mouseover: false
    }) 
    this.props.onMouseOut()
  }

  renderScene(scene, camera, renderer) {
    this.mesh = this.drawIco()
    scene.add(this.mesh)
  }

  drawIco() {
    const geometry = new THREE.IcosahedronGeometry( 320 );
    //const geometry = new THREE.TorusKnotGeometry(320, 40, 120, 4)
    const material = new THREE.MeshPhongMaterial( { 
      color: this.props.color||0xffffff, 
      wireframe: true,
      wireframeLinewidth: 1
      // transparent: true,
      // opacity: 1.0
    });
    const mesh = new THREE.Mesh( geometry, material);
    mesh.scale.x = mesh.scale.y = mesh.scale.z = 1
    return mesh
    
  }

  drawMenu() {
    var geometry = new THREE.Geometry();
    geometry.vertices.push(
      new THREE.Vector3( -200, 0, 0 ),
      new THREE.Vector3( 200, 0, 0 ),
      new THREE.Vector3( -200, 120, 0 ),
      new THREE.Vector3( 200, 120, 0 ),
      new THREE.Vector3( -200, 240, 0 ),
      new THREE.Vector3( 200, 240, 0 )
    );

    var material = new THREE.LineBasicMaterial({
      color: 0xffffff
    });

    var lineSegments = new THREE.LineSegments( geometry, material );
    return lineSegments 
  }

  animate(scene, camera) {

    if(this.state.mouseover) {
      
      if(this.am < 0.0325) {
        this.am += 0.0005
      }

    } else {
      if(this.am > 0.001) {
        this.am -= 0.0005
      }
    }

    scene.rotation.x += this.am
    scene.rotation.y += this.am
    scene.rotation.z += this.am
  }

  render() {

    return (
      <div 
        onMouseOver={this.mouseOver} 
        onMouseOut={this.mouseOut} 
        onClick={this.props.onClick} 
        style={{cursor:'pointer', position:'relative', zIndex:1}}>
        <ThreeScene 
          ambientLightColor={0xffffff}
          fogColor={0x212121}
          height={72}
          width={72}
          initScene={this.renderScene} 
          animate={this.animate}
          alpha={true} />
      </div>)
  }
}