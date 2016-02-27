import React, { Component } from "react";

const alphabet = ".cfhklpqrstwxyz01234567890!#|\$%&/=§@_-*??".split("")

const defaultProps = {
  char: 'a',
  minIterations: 3,
  maxIterations: 10,
  minDelay: 25,
  maxDelay: 500,
}

const getRandomCharIndex = () => {
  return parseInt((alphabet.length) * Math.random())
}

const without = (char) => {
  const idx = alphabet.indexOf(char.toLowerCase())
  let randIdx = getRandomCharIndex()
  
  while(randIdx == idx) {
    randIdx = getRandomCharIndex()
  }

  return randIdx
}

export default class Type extends Component {
  constructor(props) {
    // code
    super(props)

    this.iterations = 0
    this.state = {
      char: without(this.props.char),
      opacity: 0,
      scale: 0
    }
    
  }

  typer() {
    const { maxIterations, maxDelay, minDelay } = this.props
    const delay = Math.random() * (maxDelay - minDelay) + minDelay
    const iterations = this.iterations
    
    let finalChar = this.props.char

    setTimeout(() => {
      
      let char = finalChar

      if(iterations < maxIterations) {
        char = alphabet[without(finalChar)]
        this.setState({ 
          char, 
          opacity: 0 + ((1.0 / maxIterations) * iterations),
          scale: 0 + ((1.0 / maxIterations) * iterations),
        })
        this.iterations += 1
        this.typer()
      } else {
        this.setState({ char, opacity: 1 })
      }
      

    }, delay)
  }

  componentDidMount() {
    this.typer()
  }

  // methods
  render() {
    return <span style={{
        display: 'inline-block',
        opacity: this.state.opacity,
        transform: 'scale('+this.state.scale+')'
      }}>{this.state.char}</span>
  }
}

Type.defaultProps = defaultProps