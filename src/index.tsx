import './sentry'
import * as React from 'react'
import { render } from 'react-dom'
import { ChakraProvider } from '@chakra-ui/core'
import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/analytics'
import 'firebase/messaging'
import 'webrtc-adapter'

import { FIREBASE_CONFIG } from './constants'
import * as sounds from './sounds'
import * as devConsole from './devConsole'
import theme from './ui/theme'
import App from './ui/App'

function main() {
  const app = firebase.initializeApp(FIREBASE_CONFIG)
  sounds.load()

  devConsole.init()

  const container = document.createElement('div')
  container.id = 'root'
  render(
    <ChakraProvider resetCSS theme={theme}>
      <App />
    </ChakraProvider>,
    container,
  )
  document.body.appendChild(container)
}

main()
