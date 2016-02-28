import React, { Component } from 'react'
import TypeWriter from '../components/TypeWriter'
import ThreeScene from '../components/Three'
import * as visualization from './collection.js'

import { playSfx } from '../lib/sfx'
import MotionButton from "../components/MotionButton";
import Navigation from '../components/Navigation'

import THREE from 'three'
import TWEEN from 'tween'

require('./styles/home.css')

export default class Scene extends Component {

  constructor(props) {
    super(props)
    this.state = {
      mouseover: false,
      author: false
    }

    this.mouseOver = this.mouseOver.bind(this)
    this.mouseOut = this.mouseOut.bind(this)

    this.animate = this.animate.bind(this)
    this.renderScene = this.renderScene.bind(this)
  }

  componentDidMount() {
    this.typewrite()
  }

  typewrite() {
    playSfx('sfx08', 0.2)
    setTimeout(() => {
      this.setState({
        author: !this.state.author
      })
      this.typewrite()
    }, 5000)
  }

  mouseOver() {
    playSfx('sfx05')
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
    
    if(this.state.mouseover) {
      scene.rotation.x += 0.01
      scene.rotation.y += 0.01
      scene.rotation.z += 0.01
    }

    //TWEEN.udpate()

  }

  launch() {
    visualization.init()
    visualization.animate()
  }

  render() {

    return <div className="gt-container">

      <div id="visualization" />
      <div className="gt-screen gt-screen--home">
        <h1 className="gt-screen__title">
          <TypeWriter word="glasstress" />
        </h1>

        <h2>
          {this.state.author==0 && <TypeWriter word="max/casacci" />}
          {this.state.author==1 && <TypeWriter word="daniele/mana" />}
        </h2>

        <div className="gt-screen__icosahedron">
          <Navigation />
        </div>

        <div className="gt-screen__action">
          <MotionButton 
            onMouseOver={this.mouseOver}
            onMouseOut={this.mouseOut}
            onClick={this.launch.bind(this)}
            className="gt-button gt-button--launch"
            label="launch visualization*" /> 

          {/*<a href="#" className="gt-button gt-button--launch" 
            onMouseOver={this.mouseOver}
            onMouseOut={this.mouseOut}
            onClick={this.launch.bind(this)}>
            launch visualization*
          </a>*/}
        </div>

        <div className="gt-screen__footer">
          <p className="gt-text gt-text--small">*It requires a WebGl capable browser and optional access to webcam</p>
        </div>
      </div>

    </div>
  }
}