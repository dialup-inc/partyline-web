import { actions, InvokeCreator, StateNodeConfig } from 'xstate'
import { throttle } from 'lodash'

import { WS_ENDPOINT } from '../../constants'
import * as devConsole from '../../devConsole'
import type {
  ErrorPayload,
  SessionPayload,
  PartnerPayload,
  InfoPayload,
  LoginPayload,
  SignalPayload,
  HeartbeatPayload,
} from '../../types'

const RECONNECT_DELAY = 2000
const WS_NORMAL_CLOSURE = 1000
const IDLE_TIMEOUT = 10000

export type WSErrorMessage = { kind: 'error'; payload: ErrorPayload }
export type WSSessionMessage = { kind: 'session'; payload: SessionPayload }
export type WSReadyMessage = { kind: 'ready' }
export type WSPartnerMessage = { kind: 'partner'; payload: PartnerPayload }
export type WSSignalMessage = { kind: 'signal'; payload: SignalPayload }
export type WSInfoMessage = { kind: 'info'; payload: InfoPayload }
export type WSIncomingMessage =
  | WSErrorMessage
  | WSSessionMessage
  | WSReadyMessage
  | WSInfoMessage
  | WSPartnerMessage
  | WSSignalMessage

export type WSOutgoingMessage =
  | { kind: 'login'; payload: LoginPayload }
  | { kind: 'match' }
  | { kind: 'signal'; payload: SignalPayload }
  | { kind: 'heartbeat'; payload: HeartbeatPayload }
  | WSSignalMessage

export type WSEvent =
  | { type: 'WS.START' }
  | { type: 'WS.STOP' }
  | { type: 'WS.CONNECTED' }
  | { type: 'WS.DISCONNECTED' }
  | { type: 'WS.ERROR' }
  | { type: 'WS.RECEIVE.ERROR'; msg: WSErrorMessage }
  | { type: 'WS.RECEIVE.SESSION'; msg: WSSessionMessage }
  | { type: 'WS.RECEIVE.READY'; msg: WSReadyMessage }
  | { type: 'WS.RECEIVE.INFO'; msg: WSInfoMessage }
  | { type: 'WS.RECEIVE.PARTNER'; msg: WSPartnerMessage }
  | { type: 'WS.RECEIVE.SIGNAL'; msg: WSSignalMessage }
  | { type: 'WS.SEND'; msg: WSOutgoingMessage }

const wsService: InvokeCreator<any, WSEvent> = (_, event) => (
  callback,
  onReceive,
) => {
  const ws = new WebSocket(WS_ENDPOINT)

  const sendHeartbeat = throttle(
    () => {
      const event = { kind: 'heartbeat', payload: {} } as WSOutgoingMessage
      ws.send(JSON.stringify(event))
    },
    IDLE_TIMEOUT,
    {
      leading: true,
    },
  )

  ws.addEventListener('open', () => {
    window.addEventListener('mousemove', sendHeartbeat)
    window.addEventListener('touchmove', sendHeartbeat)

    callback('WS.CONNECTED')
  })

  ws.addEventListener('close', (ev) => {
    callback({
      type: 'WS.DISCONNECTED',
      code: ev.code,
    })
  })

  ws.addEventListener('error', () => {
    callback('WS.ERROR')
  })

  ws.addEventListener('message', (ev) => {
    const msg: WSIncomingMessage = JSON.parse(ev.data)
    const { kind } = msg
    if (kind === 'error') {
      callback({ type: 'WS.RECEIVE.ERROR', msg })
    } else if (kind === 'session') {
      callback({ type: 'WS.RECEIVE.SESSION', msg })
    } else if (kind === 'ready') {
      callback({ type: 'WS.RECEIVE.READY', msg })
    } else if (kind === 'info') {
      callback({ type: 'WS.RECEIVE.INFO', msg })
    } else if (kind === 'partner') {
      callback({ type: 'WS.RECEIVE.PARTNER', msg })
    } else if (kind === 'signal') {
      callback({ type: 'WS.RECEIVE.SIGNAL', msg })
    } else {
      throw new Error(`Unexpected message kind: ${kind}`)
    }
  })

  devConsole.register('dropWS', () => ws.close())

  onReceive((ev: WSEvent) => {
    if (ev.type === 'WS.SEND') {
      ws.send(JSON.stringify(ev.msg))
    }
  })

  return () => {
    sendHeartbeat.cancel()
    window.removeEventListener('mousemove', sendHeartbeat)
    window.removeEventListener('touchmove', sendHeartbeat)

    ws.close(WS_NORMAL_CLOSURE)
  }
}

const wsStates: StateNodeConfig<any, any, any> = {
  id: 'ws',
  initial: 'idle',
  on: {
    'WS.START': '.running',
    'WS.STOP': '.idle',
  },
  states: {
    idle: {},
    running: {
      initial: 'connecting',
      invoke: {
        id: 'wsService',
        src: wsService,
        onError: {
          actions: actions.escalate((_, { data }) => ({
            message: 'Unexpected WebSocket error',
            err: data,
          })),
        },
      },
      on: {
        'WS.DISCONNECTED': 'reconnecting',
      },
      states: {
        connecting: {
          on: {
            'WS.CONNECTED': 'connected',
          },
        },
        connected: {},
      },
    },
    reconnecting: {
      after: {
        [RECONNECT_DELAY]: 'running',
      },
    },
  },
}

export default wsStates
