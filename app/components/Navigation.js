import React, { Component } from "react"
import { StaggeredMotion, Motion, spring } from 'react-motion'
import IcosahedronButton from './IcosahedronButton'

const items = [
  {
    title: "The Project",
    href: "#project"
  },
  {
    title: "Artists",
    href: "#artists"
  },
  {
    title: "Get the Album",
    href: "#listen"
  },
  {
    title: "Gallery",
    href: "#gallery"
  },
]

export default class Navigation extends Component {

  constructor(props) {
    super(props)

    this.show = this.show.bind(this)
    this.hide = this.hide.bind(this)

    this.state = {
      show: false
    }
  }

  render() {
    
    const { show } = this.state
    const springParams = {stiffness: 280, damping: 30}
    const springParamsAlt = {stiffness: 200, damping: 30}

    return (
      <div>
        <IcosahedronButton onClick={this.show} />
        <Motion 
          defaultStyle={{
            y: -100,
            opacity: 0
          }} 
          style={{
            y: show ? spring(0, springParamsAlt) : spring(-100, springParamsAlt),
            opacity: show ? spring(1) : spring(0),
          }}>
          {values => 
            <div 
              {...this.props}
              style={{
                transform: `translate3d(0, ${values.y}%, 0)`,
                opacity: values.opacity,
                position: 'fixed',
                display: 'flex',
                alignItems: 'center',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(0, 0, 0, .85)',
                color: '#ababab',
                paddingLeft: '10%'
              }}>
              
              <div style={{
                flex:1
              }}>
                <p style={{
                  fontSize:'1.25em',
                  fontWeight:100,
                  cursor:'pointer',
                  marginLeft:-28,
                  marginBottom: 40}} 
                  onClick={this.hide}>
                  &larr; Back
                </p>

                {show && <StaggeredMotion
                  defaultStyles={[
                    {y: -100, opacity: 0}, 
                    {y: -200, opacity: 0}, 
                    {y: -300, opacity: 0},
                    {y: -400, opacity: 0}
                    ]}
                  styles={prevInterpolatedStyles => prevInterpolatedStyles.map((_, i) => {
                    return i === 0
                      ? {y: spring(0, springParams), opacity: spring(1, springParams)}
                      : {
                          opacity: spring(prevInterpolatedStyles[i - 1].opacity, springParams),
                          y: spring(prevInterpolatedStyles[i - 1].y, springParams)
                        }
                  })}>
                  {interpolatingStyles =>
                    <div>
                      {interpolatingStyles.map((style, i) =>
                        <div key={i} style={{
                          paddingTop: 8,
                          paddingBottom: 8,
                          fontSize: '1.75em', 
                          fontWeight: 100,
                          opacity: style.opacity,
                          transform: `translate3d(0, ${style.y}px, 0)`
                        }}>
                          <a href="#" style={{color:'#EB5033',textDecoration:'none'}}>{items[i].title}</a>
                        </div>)
                      }
                    </div>
                  }
                </StaggeredMotion>}
              </div>
            </div>
          }
        </Motion>
      </div>
    )
  }

  show(e) {
    this.setState({
      show: true
    })
  }

  hide() {
    this.setState({
      show: false
    }) 
  }

}