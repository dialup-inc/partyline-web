import { Machine, actions, ActionTypes } from 'xstate'
import * as Sentry from '@sentry/browser'

import { captureError, ErrorEvent, logEvent } from './actions'
import FlowMachine from './FlowMachine'

export interface SessionContext {}

export type SessionEvent = { type: 'SESSION.START' } | ErrorEvent

const isGetUserMediaSupported =
  'getUserMedia' in navigator ||
  ('mediaDevices' in navigator && 'getUserMedia' in navigator['mediaDevices'])

const isIOS =
  [
    'iPad Simulator',
    'iPhone Simulator',
    'iPod Simulator',
    'iPad',
    'iPhone',
    'iPod',
  ].includes(navigator.platform) ||
  // iPad on iOS 13 detection
  (navigator.userAgent.includes('Mac') && 'ontouchend' in document)

const SessionMachine = Machine<SessionContext, SessionEvent>({
  id: 'session',
  initial: isGetUserMediaSupported ? 'session' : 'unsupported',
  context: {
    isIOS,
  },
  on: {
    'SESSION.START': { target: 'session', internal: false },
  },
  states: {
    session: {
      invoke: {
        id: 'flow',
        src: FlowMachine,
        onError: {
          target: 'error',
        },
      },
    },
    error: {
      entry: [
        actions.log((_, ev) => ev, 'Fatal error'),
        logEvent('error'),
        captureError,
      ],
    },
    unsupported: {
      entry: logEvent('unsupported_browser'),
    },
  },
})

export default SessionMachine
