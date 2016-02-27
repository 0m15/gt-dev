import React, { Component } from 'react'
import TypeWriter from '../components/TypeWriter'
import ThreeScene from '../components/Three'
import THREE from 'three'

require('./styles/home.css')

export default class Scene extends Component {

  constructor(props) {
    super(props)
    this.state = {
      mouseover: false
    }
    this.renderScene = this.renderScene.bind(this)
  }

  mouseOverAction() {
    this.setState({
      mouseover: true
    })
  }

  mouseOutAction() {
    this.setState({
      mouseover: false
    })
  }

  renderScene(scene, camera, renderer) {
    const geometry = new THREE.IcosahedronGeometry( 240 );
    const material = new THREE.MeshPhongMaterial( { 
      color: 0xffffff, 
      wireframe: true,
      // transparent: true,
      // opacity: 1.0
    });
    const mesh = new THREE.Mesh( geometry, material);
    mesh.scale.x = mesh.scale.y = mesh.scale.z = 1
    scene.add(mesh)
  }

  animate(scene, camera) {
    //scene.rotation.x += 0.01
    scene.rotation.y += 0.01
    //scene.rotation.z += 0.01
  }

  render() {

    return <div className="gt-screen gt-screen--home">
      <div className="gt-screen__icosahedron">
        <ThreeScene 
          ambientLightColor={0xffffff}
          initScene={this.renderScene} 
          animate={this.animate}
          alpha={true} />
      </div>

      <h1 className="gt-screen__title">
        
        <TypeWriter word="glasstress" />
      </h1> 

      <div className="gt-screen__action" 
        onMouseOver={this.mouseOverAction} 
        onMouseOut={this.mouseOutAction}>
        <a href="#" className="gt-button gt-button--launch">
          launch visualization*
        </a>
        <p className="gt-text gt-text--secondary">
          or <a href="#">listen to EP</a>
        </p>
      </div>

      <div className="gt-screen__footer">
        <p className="gt-text gt-text--small">*It requires a WebGl capable browser and optional access to webcam</p>
      </div>
    </div>
  }
}