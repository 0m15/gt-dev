import React, { Component } from 'react'
import ThreeScene from '../components/Three'

import THREE from 'three'
import TWEEN from 'tween'

export default class IcosahedronButton extends Component {

  constructor(props) {
    super(props)
    this.state = {
      mouseover: false,
    }

    this.mouseOver = this.mouseOver.bind(this)
    this.mouseOut = this.mouseOut.bind(this)

    this.animate = this.animate.bind(this)
    this.renderScene = this.renderScene.bind(this)
  }

  mouseOver() {
    this.setState({
      mouseover: true
    })
  }

  mouseOut() {
    this.setState({
      mouseover: false
    }) 
  }

  renderScene(scene, camera, renderer) {
    const geometry = new THREE.IcosahedronGeometry( 320 );
    //const geometry = new THREE.TorusKnotGeometry(320, 40, 120, 4)
    const material = new THREE.MeshPhongMaterial( { 
      color: this.props.color||0xffffff, 
      wireframe: true,
      // transparent: true,
      // opacity: 1.0
    });
    const mesh = new THREE.Mesh( geometry, material);
    mesh.scale.x = mesh.scale.y = mesh.scale.z = 1
    scene.add(mesh)
  }

  animate(scene, camera) {
    
    if(this.state.mouseover) {
      scene.rotation.x += 0.01
      scene.rotation.y += 0.01
      scene.rotation.z += 0.01
    }

    //TWEEN.udpate()

  }

  render() {

    return (
      <div 
        onMouseOver={this.mouseOver} 
        onMouseOut={this.mouseOut} 
        onClick={this.props.onClick} 
        style={{cursor:'pointer'}}>
        <ThreeScene 
          ambientLightColor={0xffffff}
          fogColor={0x222222}
          height={100}
          initScene={this.renderScene} 
          animate={this.animate}
          alpha={true} />
      </div>)
  }
}