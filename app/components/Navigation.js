import React, { Component } from "react"
import { StaggeredMotion, Motion, spring } from 'react-motion'
import Transition from 'react-motion-ui-pack'
import IcosahedronButton from './IcosahedronButton'
import TypeWriter from '../components/TypeWriter'

const items = [
  {
    title: "The Project",
    subtitle: "00.About",
    href: "project",
    id: 0,
  },
  {
    title: "Tracklist",
    subtitle: "01.Listen",
    href: "tracklist",
    id: 2,
    aside: (
      <div className="gt-tracklist__artwork">
        <img src="/assets/imgs/glasstress-front.jpg" width={500} height={500} />
      </div>)
  },
  {
    title: "Masterpieces",
    subtitle: "02.See",
    href: "masterpieces",
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
    this.mouseOverButton = this.mouseOverButton.bind(this)
    this.mouseOutButton = this.mouseOutButton.bind(this)

    this.state = {
      show: false,
      mouseOver: false
    }
  }

  mouseOverButton(e) {
    this.setState({
      mouseOver: true
    })
  }

  mouseOutButton() {
    this.setState({
      mouseOver: false
    })
  }

  render() {
    
    const { show, mouseOver } = this.state
    const springParams = {stiffness: 280, damping: 20}
    const springParamsAlt = {stiffness: 200, damping: 30}

    return (
      <div>
        <div style={{textAlign:'center'}}>
          <IcosahedronButton 
            onMouseOver={this.mouseOverButton}
            onMouseOut={this.mouseOutButton} 
            onClick={this.toggle} />
          {mouseOver && <span className="gt-text--subhead">
            {show ? <TypeWriter word="close" /> : <TypeWriter word="menu" />}
          </span>}
        </div>

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
                //background: 'rgba(0,0,0,.45)',
                background: 'linear-gradient(to right, rgba(0, 0, 0, 0), rgba(0, 0, 0, .9))',
                opacity: values.opacity,
                position: 'fixed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                textAlign: 'right',
                top: 0,
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