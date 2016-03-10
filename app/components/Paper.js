import React, { Component } from "react"
import { StaggeredMotion, Motion, spring } from 'react-motion'
import TypeWriter from './TypeWriter'
import Remarkable from 'remarkable'

const md = new Remarkable();

require('es6-promise').polyfill();
require('whatwg-fetch');


require('./Paper.css')

export default class Paper extends Component {

  constructor(props) {

    super(props)
    this.state = {
      content: null,
    }
    this.fetch(props.section.href)
  }

  fetch(path) {
    fetch('/contents/'+path+'.md')
      .then((res) => {
        return res.text()
      }, (err) => {
        console.log('err', err)
      })
      .then((text) => {
        console.log('content', text)
        this.setState({
          content: text
        })
      })
  }

  render() {
    const springParams = {stiffness: 150, damping: 14}
    const springParamsAlt = {stiffness: 60, damping: 16}
    const springParamsAlt1 = {stiffness: 30, damping: 10}
    const visible = this.props.show
    return (
      <div className="gt-paper" {...this.props}>

        <div className="gt-paper-grid">


          <div className="gt-paper__aside">
            
          </div>

          <div className="gt-paper__content">
            <div className="gt-paper__back" onClick={this.props.onClose}>
            &larr; Back
            </div>

            <Motion 
              defaultStyle={{
                width: 0,
                opacity: 0
              }}
              style={{
                width: visible ? spring(100, springParamsAlt) : spring(0),
                opacity: visible ? spring(1, springParamsAlt) : spring(0)
              }}>    
              {val => 
                <div style={{
                  height: 1,
                  background: 'rgba(255, 255, 255, .75)',
                  width: val.width + '%',
                }} />}
            </Motion>
            <div className="gt-paper__content-header">

            <h2>
              {visible && <TypeWriter word="01.about" />}
              {!visible && <TypeWriter word={`00.${Math.random()*9999999}`} />}
            </h2>

            <Motion 
              defaultStyle={{
                y: -80,
                opacity: 0
              }}
              style={{
                y: visible ? spring(0, springParamsAlt) : spring(-80),
                opacity: visible ? spring(1, springParamsAlt) : spring(0)
              }}>    
              {values =>  
                <h1 style={{
                  transform: `translate3d(0, ${values.y}px, 0)`,
                  zIndex: 10,
                  position: 'relative',
                  opacity: values.opacity
                }}>The Project</h1>}
              </Motion>

              <Motion 
                defaultStyle={{
                  right: 100,
                  opacity: 0
                }}
                style={{
                  right: visible ? spring(0, springParamsAlt) : spring(100),
                  opacity: visible ? spring(1, springParamsAlt) : spring(0)
                }}>    
              {val => 
                <div style={{
                  position: 'absolute',
                  zIndex: 1,
                  height: 1,
                  background: 'rgba(255, 255, 255, .125)',
                  width: '100%',
                  transform: `translate3d(${val.right}%, 0, 0)`
                }} />}
            </Motion>

            </div>

            <Motion 
              defaultStyle={{
                y: 600,
                opacity: spring(0, springParamsAlt1)
              }}
              style={{
                y: visible ? spring(0, springParamsAlt1) : spring(600),
                opacity: visible ? spring(1, springParamsAlt1) : spring(0)
              }}>    
              {values => 
              <div 
                style={{
                  transform: `translate3d(0, ${values.y}px, 0)`,
                  opacity: values.opacity
                }}
                className="gt-paper__content-body">
                <div dangerouslySetInnerHTML={{
                  __html: md.render(this.state.content)
                }} />
              </div>}
            </Motion>

            
          </div>

        </div>

      </div>
    )
  }
}