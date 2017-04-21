import React, { Component} from 'react'
import ReactDOM from 'react-dom'
import {AppContainer} from 'react-hot-loader'
import App from './App'
import './style.scss'

const render = Component => {
  ReactDOM.render(
    <AppContainer>
      <Component />
    </AppContainer>,
    document.getElementById('main')
  )
}

render(App)

if (module.hot) {
  module.hot.accept('./App', () => { render(App) })
}