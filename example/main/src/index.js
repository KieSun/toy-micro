import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'
import { registerMicroApps, start } from '../../../dist'

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
)

const appList = [
  {
    name: 'vue',
    activeRule: '/vue',
    container: '#micro-container',
    entry: '//localhost:8080',
  },
  {
    name: 'react',
    activeRule: '/react',
    container: '#micro-container',
    entry: '//localhost:8084',
  },
]

registerMicroApps(appList)
start()
