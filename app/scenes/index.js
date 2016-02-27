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

    this.mouseOver = this.mouseOver.bind(this)
    this.mouseOut = this.mouseOut.bind(this)

    this.renderScene = this.renderScene.bind(this)
  }

  componentDidMount() {
    this.typewrite()
  }

  typewrite() {
    setTimeout(() => {
      this.setState({
        mouseover: !this.state.mouseover
      })
      this.typewrite()
    }, 5000)
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
    scene.rotation.x += 0.01
    scene.rotation.y += 0.01
    scene.rotation.z += 0.01
  }

  render() {

    return <div className="gt-container">
      <div className="gt-screen gt-screen--home">
        <div className="gt-screen__icosahedron">
          <ThreeScene 
            ambientLightColor={0xffffff}
            fogColor={0x222222}
            height={100}
            initScene={this.renderScene} 
            animate={this.animate}
            alpha={true} />
        </div>

        <h1 className="gt-screen__title">
          <TypeWriter word="glasstress" />
        </h1>

        <h2>
          {!this.state.mouseover && <TypeWriter word="max/casacci" />}
          {this.state.mouseover && <TypeWriter word="daniele/mana" />}
        </h2>

        <div className="gt-screen__action">
          <a href="#" className="gt-button gt-button--launch">
            launch visualization*
          </a>
        </div>

        <div className="gt-screen__footer">
          <p className="gt-text gt-text--small">*It requires a WebGl capable browser and optional access to webcam</p>
        </div>
      </div>

      <div className="gt-screen gt-screen--project">
        <div className="gt-screen__left">
          <h2 className="gt-screen__left-title">The project</h2>
        </div>

        <div className="gt-screen__right">
          <p className="gt-text gt-text--body">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
          </p>
        </div>
      </div>
    </div>
  }
}