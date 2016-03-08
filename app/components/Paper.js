import React, { Component } from "react"
import { StaggeredMotion, Motion, spring } from 'react-motion'


require('./Paper.css')

export default class Paper extends Component {


  render() {
    const springParams = {stiffness: 60, damping: 20}
    const springParamsAlt = {stiffness: 40, damping: 20}
    return (
      <div className="gt-paper" {...this.props}>

        <div className="gt-paper-grid">

          <div className="gt-paper__aside">
            
          </div>

          <div className="gt-paper__content">
            
            <Motion 
              defaultStyle={{
                y: 600,
                opacity: 0
              }}
              style={{
                y: spring(0, springParams),
                opacity: spring(1, springParams)
              }}>    
              {values => 
              <div 
                style={{
                  transform: `translate3d(0, ${values.y}px, 0)`,
                  opacity: values.opacity
                }}
                className="gt-paper__content-header">
                <h1>title</h1>
              </div>}
            </Motion>


            <Motion 
              defaultStyle={{
                y: 800,
                opacity: 0
              }}
              style={{
                y: spring(0, springParamsAlt),
                opacity: spring(1, springParamsAlt)
              }}>    
              {values => 
              <div 
                style={{
                  transform: `translate3d(0, ${values.y}px, 0)`,
                  opacity: values.opacity
                }}
                className="gt-paper__content-body">
                <p>body</p>
              </div>}
            </Motion>

            
          </div>

        </div>

      </div>
    )
  }
}