import { assign, InvokeCreator } from 'xstate'
import * as SimplePeer from 'simple-peer'

import { WEBRTC_CONFIG } from '../../constants'
import * as devConsole from '../../devConsole'
import type { CallContext } from './'

export type RTCEvent =
  | { type: 'RTC.CONNECTED' }
  | { type: 'RTC.CLOSED' }
  | { type: 'RTC.ERROR'; err: Error }
  | { type: 'RTC.SIGNAL'; data: any }
  | { type: 'RTC.STREAM'; stream: MediaStream }

const rtcService: InvokeCreator<CallContext, any> = (context, _) => (
  callback,
  onReceive,
) => {
  const peer = new SimplePeer({
    config: { ...WEBRTC_CONFIG, iceServers: context.iceServers },
    initiator: context.shouldInitiate,
    stream: context.micStream,
  })

  peer.on('signal', (data) => {
    callback({
      type: 'RTC.SIGNAL',
      data,
    })
  })

  peer.on('connect', () => {
    callback({
      type: 'RTC.CONNECTED',
    })
  })

  peer.on('stream', (stream) => {
    callback({
      type: 'RTC.STREAM',
      stream,
    })
  })

  peer.on('close', () => {
    callback({
      type: 'RTC.CLOSED',
    })
  })

  peer.on('error', (err) => {
    callback({
      type: 'RTC.ERROR',
      err,
    })
  })

  devConsole.register('dropRTC', () => peer.destroy())

  onReceive((ev: RTCEvent) => {
    if (ev.type === 'RTC.SIGNAL') {
      peer.signal(ev.data)
    } else {
      throw new Error(`Unexpected event type: ${ev.type}`)
    }
  })

  return () => {
    if (peer) {
      peer.destroy()
    }
  }
}

export default rtcService
