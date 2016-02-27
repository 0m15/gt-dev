// app/index.js

import React from 'react'
import ReactDOM from 'react-dom'
import Scene from "./scenes"

require('./styles/normalize.css')
require('./styles/body.css')



const app = ReactDOM.render(<Scene/>, document.getElementById('gt-app'))
