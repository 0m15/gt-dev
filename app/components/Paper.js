import React, { Component } from "react"
import { StaggeredMotion, Motion, spring } from 'react-motion'
import TypeWriter from './TypeWriter'

require('./Paper.css')

export default class Paper extends Component {


  render() {
    const springParams = {stiffness: 120, damping: 16}
    const springParamsAlt = {stiffness: 60, damping: 16}
    const springParamsAlt1 = {stiffness: 30, damping: 10}

    return (
      <div className="gt-paper" {...this.props}>

        <div className="gt-paper-grid">

          <div className="gt-paper__aside">
            
          </div>

          <div className="gt-paper__content">
            <Motion 
              defaultStyle={{
                width: 0,
                opacity: 0
              }}
              style={{
                width: spring(100, springParamsAlt),
                opacity: spring(1, springParamsAlt)
              }}>    
              {val => 
                <div style={{
                  height: 1,
                  background: '#888',
                  width: val.width + '%',
                }} />}
            </Motion>
            <div className="gt-paper__content-header">

            <h2><TypeWriter word="about" /></h2>

            <Motion 
              defaultStyle={{
                y: -80,
                opacity: 0
              }}
              style={{
                y: spring(0, springParamsAlt),
                opacity: spring(1, springParamsAlt)
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
                  right: spring(0, springParamsAlt),
                  opacity: spring(1, springParamsAlt),
                }}>    
              {val => 
                <div style={{
                  position: 'absolute',
                  zIndex: 1,
                  height: 1,
                  background: '#333',
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
                y: spring(0, springParamsAlt1),
                opacity: spring(1, springParamsAlt1)
              }}>    
              {values => 
              <div 
                style={{
                  transform: `translate3d(0, ${values.y}px, 0)`,
                  opacity: values.opacity
                }}
                className="gt-paper__content-body">
                <p>
                Glass sounds turning to Music.
                New sound project, out on March 18th 2016, by Max Casacci 
                (producer, composer and founder of Subsonica) and Daniel Mana 
                (electronic producer also known as Vaghe Stelle, from 
                  Nicolas Jaar’s Other People label - gaining support by the likes of James Holden, Kode9, Jacques Greene, Martyn, Nathan Fake).
                "Glasstress" is an album made with all kind of audio samples gathered in the environment of a furnace in Murano, near Venice: from the powerful breath of the furnace that reaches over 3000 celsius degrees to noise of tools, from the crushing of waste glass to the stem of his blowtorch.
                No electronic or acoustic drums, no pre-rhythmic set was added. All the rhythm of the furnace are formed exclusively by the noise and, in the same way, most of the melodic phrases are from the sound of the crystals.
                Eight tracks that open the doors of a glasshouse, such as suggested by surrealist Andre Breton in the "Nadja" novel, and does so by means of a powerful and evocative sensory journey. This is not a simple ambient soundtrack but an exploration through post industrial sounds.
                Glasstress was born from the homonymous exhibition of contemporary art glass created by Adriano Berengo and presented at the Venice Biennale in 2011.
                Some of the artworks had been expressly made for Glasstress by artists such as Tony Cragg, Jan Fabre, Olafur Eliasson, Orlan, Patricia Urquiola, Zaha Hadid and Fred Wilson, who have been invited to work in the glass studio in Murano.
                "Like A Glass Angel" is the first single, the song was inspired by the Pharrell Williams artwork “Inside Out”, from the Glasstress 2011 exhibition, a statue of the skeleton of a glass angel. The eclectic producer was enthusiastic about the project, granting permission to use the image of his work for the cover of "Like A Glass Angel", after listening to the album.
                Glasstress 2011 focused on the complex relationship that ties art, design and architecture together in an age thought to have moved beyond modernism. The exhibition, produced by Venice Projects, a partnership between Adriano Berengo and Susan Scherman, was presented in collaboration with MAD, the Museum of Arts and Design, New York. Among the other artists taking part to the booklet artwork, there are Javier Pérez, Kate Mccgwire, Mat Collishaw, Ivan Plusch, Hitoshi Kuriayama, Leonardo Cimolin and Kaneuhi Teppei.
                </p>
              </div>}
            </Motion>

            
          </div>

        </div>

      </div>
    )
  }
}