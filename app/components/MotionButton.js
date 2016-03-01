import React, { Component } from "react"
import { StaggeredMotion, Motion, spring } from 'react-motion'

export default class MotionButton extends Component {

  constructor(props) {
    super(props)

    this.mouseover = this.mouseover.bind(this)
    this.mouseout = this.mouseout.bind(this)

    this.state = {
      mouseover: false
    }
  }

  render() {
    
    const { mouseover } = this.state
    const springParams = {stiffness: 800, damping: 20}
    const springParamsAlt = {stiffness: 20, damping: 20}

    return (
      <Motion 
        defaultStyle={{
          scale: 1, 
          x: 0,
          borderRadius: 2,
          opacity: .2,
          borderColor: 'rgba(255, 255, 255, 0)'
        }} 
        style={{
          x: mouseover ? spring() : spring(0),
          scale: mouseover ? spring(1.25, springParams) : spring(1, springParams),
          borderRadius: mouseover ? spring(25) : spring(2),
          opacity: mouseover ? spring(0) : spring(.125),
        }}>
        {values => 
          <button 
            {...this.props}
            style={{
              transform: `scale(${values.scale})`,
              border: `1px solid rgba(255, 255, 255, ${values.opacity})`,
              borderRadius: values.borderRadius
            }} 
            onMouseOver={this.mouseover}
            onMouseOut={this.mouseout}>
            
            <Motion 
              defaultStyle={{
                scale: 1,
                letterSpacing: 2
              }} 
              style={{
                scale: mouseover ? spring(0.8, springParamsAlt) : spring(1, springParamsAlt),
                letterSpacing: mouseover ? spring(6, springParamsAlt) : spring(2, springParamsAlt),
              }}>
              {values => 
                <span 
                  style={{
                    display: 'inline-block',
                    transform: `scale(${values.scale})`,
                    pointerEvents: 'none',
                    letterSpacing: values.letterSpacing
                  }}
                  className="gt-button__label">
                  {this.props.label}
                </span>
              }
            </Motion>

          </button>
        }
      </Motion>
    )
  }

  mouseover(e) {
    this.setState({
      mouseover: true
    })
    this.props.onMouseOver && this.props.onMouseOver()
  }

  mouseout() {
    console.log('mouseout')
    this.setState({
      mouseover: false
    }) 
    this.props.onMouseOut && this.props.onMouseOut()
  }


  show() {

  }

  hide() {

  }

}