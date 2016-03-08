import React, { Component } from "react"
import { StaggeredMotion, Motion, spring } from 'react-motion'
import IcosahedronButton from './IcosahedronButton'

const items = [
  {
    title: "The Project",
    href: "project",
    id: 0
  },
  {
    title: "Artists",
    href: "artists",
    id: 1
  },
  {
    title: "Get the Album",
    href: "listen",
    id: 2
  },
  {
    title: "Gallery",
    href: "gallery",
    id: 3
  },
]

export default class Navigation extends Component {

  constructor(props) {
    super(props)

    this.show = this.show.bind(this)
    this.hide = this.hide.bind(this)
    this.toggle = this.toggle.bind(this)
    this.navigate = this.navigate.bind(this)

    this.state = {
      show: false
    }
  }

  render() {
    
    const { show } = this.state
    const springParams = {stiffness: 280, damping: 20}
    const springParamsAlt = {stiffness: 200, damping: 30}

    return (
      <div>
        <IcosahedronButton onClick={this.toggle} />
        <Motion 
          defaultStyle={{
            y: 100,
            opacity: 0
          }} 
          style={{
            y: show ? spring(0, springParamsAlt) : spring(100, springParamsAlt),
            opacity: show ? spring(1) : spring(0),
          }}>
          {values => 
            <div 
              {...this.props}
              style={{
                //transform: `translate3d(0, ${values.y}%, 0)`,
                opacity: values.opacity,
                position: 'fixed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                textAlign: 'right',
                left: 0,
                width: '100%',
                height: '100%',
                color: '#ababab',
                pointerEvents: show ? 'inherit' : 'none'
              }}>
              
              <div style={{
                flex:1,
                paddingRight: '2em'
              }}>

                {show && <StaggeredMotion
                  defaultStyles={[
                    {y: -30, opacity: 0}, 
                    {y: -40, opacity: 0}, 
                    {y: -50, opacity: 0},
                    {y: -60, opacity: 0}
                    ]}
                  styles={prevInterpolatedStyles => prevInterpolatedStyles.map((_, i) => {
                    return i === 0
                      ? {y: spring(40, springParams), opacity: spring(1, springParams)}
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
                          <a 
                            onClick={this.navigate.bind(this, items[i])}
                            href={"#" + items[i].href}
                            style={{color:'#fff',fontWeight:100,textDecoration:'none'}}>{items[i].title}</a>
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

  navigate(href, e) {
    e.preventDefault()
    this.hide()
    this.props.onNavigate(href)
  }

  toggle() {
    this.state.show ? this.hide() : this.show()
  }

  show(e) {
    this.setState({
      show: true
    })
    this.props.onToggle(true)
  }

  hide() {
    this.setState({
      show: false
    }) 
    this.props.onToggle(false)
  }

}