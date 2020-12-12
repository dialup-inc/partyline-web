import { Machine, assign, send, sendParent, actions } from 'xstate'
import { analytics } from 'firebase/app'
import * as Sentry from '@sentry/browser'

import { RTC_TIMEOUT } from '../../constants'
import { logEvent } from '../actions'
import micStates, { MicEvent } from './micStates'
import wsStates, { WSEvent } from './wsStates'
import rtcService, { RTCEvent } from './rtcService'
import beforeUnloadService from './beforeUnloadService'
import { fetchToken } from '../AuthMachine'
import { getAudioContext } from '../../audio'
import { playConnectSound, playDisconnectSound } from '../../sounds'
import type { PartnerInfo, Prompt, RTCIceServer } from '../../types'

export interface CallContext {
  talkingCount: number
  onlineCount: number
  sessionID: string
  startTime: Date
  partner: PartnerInfo
  prompts: Array<Prompt>
  iceServers: Array<RTCIceServer>
  shouldInitiate: boolean
  micStream: MediaStream
  remoteStream: MediaStream
}

export type CallEvent =
  | { type: 'CALL.START_MATCHING' }
  | MicEvent
  | WSEvent
  | RTCEvent

const READY_TO_MATCH_TIMEOUT = 30000

const storePartner = assign(
  (_, ev: WSEvent & { type: 'WS.RECEIVE.PARTNER' }) => ({
    partner: ev.msg.payload.partner,
    shouldInitiate: ev.msg.payload.shouldInitiate,
    prompts: ev.msg.payload.prompts,
    iceServers: ev.msg.payload.iceServers,
  }),
)

const CallMachine = Machine<CallContext, CallEvent>({
  id: 'call',
  type: 'parallel',
  context: {
    talkingCount: null,
    onlineCount: null,
    sessionID: null,
    startTime: null,
    partner: null,
    prompts: null,
    iceServers: null,
    shouldInitiate: null,
    micStream: null,
    remoteStream: null,
  },
  on: {
    'WS.RECEIVE.ERROR': {
      actions: actions.escalate((_, { type, msg }) => ({
        message: `Received "${type}" error from WebSocket`,
        type,
        errorMsg: msg,
      })),
    },
  },
  entry: logEvent('start_call_flow'),
  states: {
    session: {
      initial: 'disconnected',
      on: {
        // Stateless informational messages to store.
        'WS.RECEIVE.SESSION': {
          actions: assign(
            (_, ev: WSEvent & { type: 'WS.RECEIVE.SESSION' }) => ({
              sessionID: ev.msg.payload.sessionID,
            }),
          ),
        },
        'WS.RECEIVE.INFO': {
          actions: assign((_, ev: WSEvent & { type: 'WS.RECEIVE.INFO' }) => ({
            talkingCount: ev.msg.payload.counts.matched,
            onlineCount:
              ev.msg.payload.counts.matched +
              ev.msg.payload.counts.answering_questions +
              ev.msg.payload.counts.lobby,
          })),
        },
      },
      states: {
        disconnected: {
          on: {
            'WS.CONNECTED': 'loggingIn',
          },
        },
        loggingIn: {
          invoke: {
            id: 'fetchToken',
            src: fetchToken,
            onError: {
              actions: actions.escalate((_, { data }) => ({
                message: 'Error fetching auth token',
                err: data,
              })),
            },
            onDone: {
              actions: send(
                ({ sessionID }, { data: token }) => ({
                  type: 'WS.SEND',
                  msg: { kind: 'login', payload: { token, sessionID } },
                }),
                { to: 'wsService' },
              ),
              target: 'awaitingPartner',
            },
          },
        },
        awaitingPartner: {
          on: {
            'WS.RECEIVE.PARTNER': {
              actions: storePartner,
              target: 'active',
            },
          },
        },
        active: {
          on: {
            'WS.RECEIVE.PARTNER': {
              actions: storePartner,
            },
            'WS.DISCONNECTED': 'disconnected',
          },
        },
      },
    },
    flow: {
      initial: 'preMatch',
      entry: send('WS.START'),
      // Receiving a partner means we have an active ongoing RTC call and should move to inCall state.
      states: {
        preMatch: {
          type: 'parallel',
          always: {
            target: 'micSetup',
            cond: (context) => !!context.partner,
          },
          states: {
            wait: {
              initial: 'start',
              states: {
                start: {
                  after: {
                    [READY_TO_MATCH_TIMEOUT]: 'timedOut',
                  },
                },
                timedOut: {
                  entry: logEvent('prematch_timeout'),
                },
              },
            },
            connection: {
              initial: 'connecting',
              states: {
                connecting: {
                  always: {
                    target: 'lobby',
                    in: '#call.session.active',
                  },
                },
                lobby: {
                  on: { 'WS.RECEIVE.READY': 'readyToMatch' },
                },
                readyToMatch: {
                  entry: logEvent('prematch_ready'),
                  on: { 'CALL.START_MATCHING': '#call.flow.micSetup' },
                },
              },
            },
          },
        },
        micSetup: {
          entry: [
            getAudioContext, // Initialize AudioContext from user gesture.
            send('MIC.ACQUIRE'),
            logEvent('start_mic_request'),
          ],
          exit: logEvent('end_mic_request'),
          always: {
            target: 'matching',
            cond: (context: CallContext) => !!context.micStream,
          },
        },
        matching: {
          initial: 'awaitingConnection',
          always: {
            target: '#call.flow.inCall',
            cond: (context) => !!context.partner,
          },
          states: {
            // If RTC times out and we reconnect to the WebSocket, we need to wait for the connections to become ready again.
            awaitingConnection: {
              always: {
                target: 'awaitingMatch',
                in: '#call.session.active',
              },
            },
            awaitingMatch: {
              entry: [
                logEvent('start_matching'),
                send(
                  () => ({
                    type: 'WS.SEND',
                    msg: { kind: 'match' },
                  }),
                  { to: 'wsService' },
                ),
              ],
            },
          },
        },
        inCall: {
          initial: 'active',
          entry: [
            logEvent('start_call'),
            assign<CallContext>({
              startTime: () => new Date(),
            }),
            playConnectSound,
          ],
          invoke: {
            id: 'beforeUnloadService',
            src: beforeUnloadService,
          },
          // Receiving no partner takes us out of the call.
          always: {
            target: 'ended',
            cond: (context) => !context.partner,
          },
          states: {
            active: {
              initial: 'connecting',
              invoke: {
                id: 'rtcService',
                src: rtcService,
                onError: {
                  actions: actions.log((_, ev) => ev, 'Unexpected RTC error'),
                  target: 'disconnected',
                },
              },
              on: {
                'RTC.SIGNAL': {
                  actions: send(
                    ({ partner }, { data }) => ({
                      type: 'WS.SEND',
                      msg: {
                        kind: 'signal',
                        payload: {
                          to: partner.sessionID,
                          data,
                        },
                      },
                    }),
                    { to: 'wsService' },
                  ),
                },
                'WS.RECEIVE.SIGNAL': {
                  actions: send(
                    (_, { msg }) => ({
                      type: 'RTC.SIGNAL',
                      data: msg.payload.data,
                    }),
                    { to: 'rtcService' },
                  ),
                },
                'RTC.STREAM': {
                  actions: assign({
                    remoteStream: (
                      _,
                      { stream }: RTCEvent & { type: 'RTC.STREAM' },
                    ) => stream,
                  }),
                },
                // Errors will cause us to leave and rejoin this state, recreating the PeerConnection.
                'RTC.CLOSED': {
                  target: 'disconnected',
                },
                'RTC.ERROR': {
                  target: 'disconnected',
                  actions: [
                    actions.log((_, ev) => ev, 'Error from RTC'),
                    (_, { err }) => {
                      Sentry.captureException(err)
                    },
                  ],
                },
              },
              states: {
                connecting: {
                  entry: logEvent('call_connecting'),
                  on: {
                    'RTC.CONNECTED': 'connected',
                  },
                  after: {
                    [RTC_TIMEOUT]: {
                      actions: [
                        actions.log(
                          (_, ev) => ev,
                          'Timed out waiting for RTC connection',
                        ),
                        // Restart WebSocket connection
                        assign<CallContext>({ sessionID: null }),
                        send('WS.START'),
                      ],
                      target: '#call.flow.matching',
                    },
                  },
                },
                connected: {
                  entry: [
                    logEvent('call_connected'),
                    sendParent(({ partner }) => ({
                      type: 'FLOW.CALL_ESTABLISHED',
                      matchID: partner.matchID,
                    })),
                  ],
                },
              },
            },
            disconnected: {
              entry: logEvent('call_disconnected'),
              always: {
                target: 'active',
                in: '#call.session.active',
              },
            },
          },
        },
        ended: {
          entry: [
            // TODO: move to exit action for machine after https://github.com/davidkpiano/xstate/pull/1566 lands.
            ({ startTime }) => {
              analytics().logEvent('end_call', {
                value: Date.now() - startTime.getTime(),
              })
            },
            playDisconnectSound,
          ],
        },
      },
    },
    mic: micStates,
    ws: wsStates,
  },
})

export default CallMachine
