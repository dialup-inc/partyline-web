import { assign, actions, DoneInvokeEvent, InvokeCreator } from 'xstate'

import type { CallContext } from './'

export type MicEvent =
  | { type: 'MIC.ACQUIRE' }
  | { type: 'MIC.ACQUIRED'; stream: MediaStream }
  | { type: 'MIC.REJECTED'; err: Error }
  | { type: 'MIC.RELEASE' }

const micService: InvokeCreator<any, MicEvent> = () => (
  callback,
  onReceive,
) => {
  let stream: MediaStream
  async function acquire() {
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    } catch (err) {
      callback({ type: 'MIC.REJECTED', err })
      return
    }
    callback({ type: 'MIC.ACQUIRED', stream })
  }
  acquire()
  return () => {
    if (stream) {
      for (const track of stream.getTracks()) {
        track.stop()
      }
    }
  }
}

const micStates = {
  id: 'mic',
  initial: 'none',
  states: {
    none: {
      entry: assign<CallContext>({ micStream: null }),
      on: {
        'MIC.ACQUIRE': 'active',
      },
    },
    active: {
      on: {
        'MIC.RELEASE': 'none',
        'MIC.ACQUIRED': {
          actions: assign({
            micStream: (_, { stream }: MicEvent & { type: 'MIC.ACQUIRED' }) =>
              stream,
          }),
        },
        'MIC.REJECTED': {
          target: 'none',
          actions: actions.log((_, ev) => ev, 'Error requesting media'),
        },
      },
      invoke: {
        id: 'micService',
        src: micService,
      },
    },
  },
}

export default micStates
