import { getAudioContext } from './audio'

const connectSound = require('../static/connect.mp3').default
const disconnectSound = require('../static/disconnect.mp3').default

let sounds: { [key: string]: AudioBuffer } = {}

async function loadSound(url: string, name: string) {
  const resp = await fetch(url)
  const ab = await resp.arrayBuffer()
  const buf = await getAudioContext().decodeAudioData(ab)
  sounds[name] = buf
}

function playSound(buf: AudioBuffer) {
  if (!buf) {
    return
  }
  const ctx = getAudioContext()
  const srcNode = ctx.createBufferSource()
  srcNode.buffer = buf
  srcNode.connect(ctx.destination)
  srcNode.start()
}

export async function load() {
  loadSound(connectSound, 'connect')
  loadSound(disconnectSound, 'disconnect')
}

export function playConnectSound() {
  playSound(sounds.connect)
}

export function playDisconnectSound() {
  playSound(sounds.disconnect)
}
