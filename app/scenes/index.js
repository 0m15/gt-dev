import React, { Component } from 'react'
import { Motion, spring, TransitionMotion } from 'react-motion'
import Transition from 'react-motion-ui-pack'

import TypeWriter from '../components/TypeWriter'
import ThreeScene from '../components/ThreeScene'
import * as visualization from './viz-alt.js'
import { playSfx } from '../lib/sfx'
import MotionButton from "../components/MotionButton";
import Navigation from '../components/Navigation'
import Paper from '../components/Paper'

import WordFader from '../components/WordFader'

import THREE from 'three'
import TWEEN from 'tween'

require('es6-promise').polyfill();
require('whatwg-fetch');

require('./styles/home.css')

export default class Scene extends Component {

  constructor(props) {
    super(props)
    this.state = {
      mouseover: false,
      author: false,
      launched: false,
      pageIdx: -1,
      showNavigation: false,
      audioLoaded: false,
      showLauncher: true,
      currentSection: null,
      canLaunch: false
    }

    this.mouseOver = this.mouseOver.bind(this)
    this.mouseOut = this.mouseOut.bind(this)

    // load track audio data
    fetch('/app/data/track-data2.json')
      .then((res) => {
        return res.json()
      }, (err) => {
        console.log('cannot load audio data', err)
      })
      .then((json) => {
        console.log('json')
        this.setState({
          canLaunch: true
        })
        visualization.setupAudioData(json)
        visualization.init()
        visualization.animate()
      }) 
  }

  componentDidMount() {
    this.audioEl = document.getElementById('track')

    function isLoaded() {
      return this.audioEl.readyState == 4
    }

    function checkIsLoaded() {
      setTimeout(function() {
        if(isLoaded()) {
          return this.setState({
            audioLoaded: true
          })
        }
      }, 250)
    }    
    
  }

  componentDidUpdate(prevProps, prevState) {

    if(this.state.launched && !prevState.launched) {
      setTimeout(() => {
        visualization.playScene()
      }, 0)
      
    }
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

  launch() {
    this.setState({
      launched: true
    })
  }

  closePaper() {
    this.setState({
      pageIdx: -1,
      showLauncher: true
    })
  }

  render() {

    const { showLauncher, launched, pageIdx, showNavigation } = this.state
    const springParamsA = {stiffness: 60, damping: 12, precision: 0.1}
    const springParams = {stiffness: 20, damping: 20, precision: 0.1}
    const springParamsAlt = {stiffness: 80, damping: 16, precision: 0.1}

    let headerMotionStyle = {
      scale: spring(1), 
      opacity: spring(1),
      y: spring(0),
      x: spring(0)
    }

    let buttonMotionStyle = {
      scale: spring(1), 
      opacity: spring(1),
      y: spring(0),
      x: spring(0)
    }

    if(launched) {
      headerMotionStyle.scale = spring(1.25, springParams)
      headerMotionStyle.opacity =spring(.75, springParams)
      headerMotionStyle.y = spring(180, springParams)

      buttonMotionStyle.scale = spring(1, springParams)
      buttonMotionStyle.y = spring(200, springParams)
      buttonMotionStyle.opacity =  spring(0, springParams)
    }

    if(showNavigation && !launched) {
      headerMotionStyle.scale = spring(.9, springParamsA)
      headerMotionStyle.opacity = spring(.5, springParamsA)
      headerMotionStyle.y = spring(0, springParamsA)
      buttonMotionStyle = headerMotionStyle
    }

    return <div>

      <div className="gt-screen__icosahedron">
        <Navigation 
          onToggle={this.toggleNavigation.bind(this)}
          onNavigate={this.navigate.bind(this)} />
      </div>

      <div id="visualization" />

      <div className="gt-screen__toolbar">
        toolbar
      </div>


      <Motion
        defaultStyle={{
          scale: 1, 
          opacity: 1,
          y: 0
        }} 
        style={{
          scale: !showLauncher ? spring(.9, springParamsAlt) : spring(1),
          opacity: !showLauncher ? spring(0, springParamsAlt) : spring(1),
          y: !showLauncher ? spring(-100, springParamsAlt) : spring(0),
        }}>
        {values => 
          <div 
            style={{
              opacity: values.opacity,
              transform: `translate3d(0, ${values.y}vh, 0) scale(${values.scale})`,
            }}
            className="gt-screen gt-screen--home">
            <Motion 
              defaultStyle={{
                scale: 1, 
                y: 0,
                opacity: 1,
                x: 0
              }} 
              style={headerMotionStyle}>
              {values => 
                <div style={{
                  transform: `translate3d(${values.x}px, ${values.y}px, 0) scale(${values.scale})`,
                  opacity: values.opacity
                }} className="gt-screen__title">
                  <h1 className="gt-title">
                    <TypeWriter word="glasstress" />
                  </h1>
                  <h2>
                    {this.state.author==0 && <TypeWriter word="max/casacci" />}
                    {this.state.author==1 && <TypeWriter word="daniele/mana" />}
                  </h2>
                </div>}
            </Motion>

            {this.state.canLaunch && <Motion defaultStyle={{
                scale: 1,
                opacity: 1, 
                y: 0,
                x: 0
              }} 
              style={buttonMotionStyle}>
              {values => 
                <div style={{
                  transform: `translate3d(${values.x}px, ${values.y}px, 0)  scale(${values.scale})`,
                  opacity: values.opacity
                }} className="gt-screen__action">
                  <MotionButton 
                    onMouseOver={this.mouseOver}
                    onMouseOut={this.mouseOut}
                    onClick={this.launch.bind(this)}
                    className="gt-button gt-button--launch"
                    label="launch visualization*" /> 
                </div>}
            </Motion>}

            {!this.state.canLaunch && <div className="gt-screen__action">
              <span>loading audio data...</span>
            </div>}
          </div>}
      </Motion>



      <Transition
        runOnMount={true}
        component={false} // don't use a wrapping component
        enter={{
          opacity: 1,
          translateY: spring(0)
        }}
        leave={{
          opacity: 0,
          translateY: 600
        }}>
        {this.state.pageIdx > -1 &&
          <Paper 
            key="paper"
            section={this.state.currentSection}
            onClose={this.closePaper.bind(this)} 
            show={this.state.pageIdx>-1} />}
      </Transition>
    </div>
  }

  toggleNavigation(shown) {
    console.log('toggle', shown)
    this.setState({
      showNavigation: shown
    })
  }

  navigate(item) {
    const pageIdx = item.id
    this.setState({ pageIdx: -1 })

    setTimeout(() => {
      this.setState({ showLauncher: false })    
    }, 250)

    setTimeout(() => {
      this.setState({ pageIdx, currentSection: item })
    }, 750)
    
  }
}