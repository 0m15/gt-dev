import React, { Component } from "react"
import ReactDOM from 'react-dom'
import THREE from 'three'
import TWEEN from 'tween'

const defaultProps = {
  width: 320,
  height: 240,
  fog: false,
  alpha: false,
  ambientLightColor: 0xffffff,
  clearColor: 0x222222,
  fullScreen: false,
  resize: true,
  initScene: (scene, camera) => {},
  animate: (scene, camera) => {}
}

export default class ThreeScene extends Component {
  
  constructor(props) { 
    // code
    super(props)

    this.scene;
    this.camera;
    this.renderer;

    this.animateScene = this.animateScene.bind(this)
  }

  componentDidMount() {
    this.initScene()
  }

  componentDidUpdate() {

  }

  render() {
    return <div ref={(ref) => { this.node = ref }} />
  }


  // methods

  initScene() {
    const { alpha, ambientLightColor, clearColor, width, height } = this.props
    
    const scene = this.scene = new THREE.Scene()
    const camera = this.camera = new THREE.PerspectiveCamera( 
      70, width / height, 1, 2000 
    )

    camera.position.z = 1000
    scene.add( new THREE.AmbientLight( ambientLightColor) );
    scene.fog = new THREE.Fog( 0x222222, 0.1, 1600 );

    this.props.initScene(scene, camera)


    const renderer = this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha
    });
    
    renderer.setPixelRatio( window.devicePixelRatio )
    renderer.setSize( width, height )

    if(!this.props.alpha) {
      renderer.setClearColor( clearColor )  
    }
    

    ReactDOM.findDOMNode(this.node).appendChild( renderer.domElement )

    this.animateScene()
  }

  animateScene() {
    
    const { renderer, camera, scene } = this

    requestAnimationFrame(this.animateScene)
    this.props.animate(scene, camera)
    renderer.render(scene, camera)
  }

}

ThreeScene.defaultProps = defaultProps
