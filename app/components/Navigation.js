import React, { Component } from "react"
import { StaggeredMotion, Motion, spring } from 'react-motion'
import IcosahedronButton from './IcosahedronButton'

const items = [
  {
    title: "the project",
  },
  {
    title: "artists",
  },
  {
    title: "listen to ep",
  },
  {
    title: "gallery",
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
    const springParams = {stiffness: 80, damping: 12}
    const springParamsAlt = {stiffness: 120, damping: 20}

    return (
      <div>
        <IcosahedronButton onClick={this.show} />
        {show && 
        <Motion 
          defaultStyle={{
            y: -100,
          }} 
          style={{
            y: show ? spring(0) : spring(-100),
          }}>
          {values => 
            <div 
              {...this.props}
              style={{
                transform: `translate3d(0, ${values.y}%, 0)`,
                position: 'fixed',
                display: 'flex',
                alignItems: 'center',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor: '#fff',
                color: '#444',
                paddingLeft: '10%'
              }}>
              <div>
                <p style={{fontSize:'1.25em',fontWeight:100,cursor:'pointer',marginLeft:-28}} onClick={this.hide}>&larr; Back</p>
                <br/>
                <br/>
                <StaggeredMotion
                  defaultStyles={[
                    {y: -100, opacity: 0}, 
                    {y: -250, opacity: 0}, 
                    {y: -500, opacity: 0},
                    {y: -750, opacity: 0}
                    ]}
                  styles={prevInterpolatedStyles => prevInterpolatedStyles.map((_, i) => {
                    return i === 0
                      ? {y: spring(0), opacity: spring(1)}
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
                          <a href="#" style={{color:'#444',textDecoration:'none'}}>{items[i].title}</a>
                        </div>)
                      }
                    </div>
                  }
                </StaggeredMotion>
              </div>

            </div>
          }
        </Motion>}
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