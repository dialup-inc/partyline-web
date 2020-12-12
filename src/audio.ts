import { AudioContext } from 'standardized-audio-context'

let audioContext: AudioContext
export function getAudioContext() {
  if (!audioContext) {
    audioContext = new AudioContext()
  }
  if (audioContext.state === 'suspended') {
    audioContext.resume()
  }
  return audioContext
}

type AnalyserOptions = {
  fftSize?: number
  smoothingTimeConstant?: number
  minDecibels?: number
  maxDecibels?: number
}

export function onAudioFrequencyData(
  stream: MediaStream,
  {
    fftSize = 256,
    smoothingTimeConstant = 0.5,
    minDecibels = -100,
    maxDecibels = 0,
  }: AnalyserOptions,
  callback: (frequencyData: Uint8Array, sampleRate: number) => void,
) {
  const ctx = getAudioContext()
  const streamNode = ctx.createMediaStreamSource(stream)
  const analyserNode = ctx.createAnalyser()
  analyserNode.fftSize = fftSize
  analyserNode.minDecibels = minDecibels
  analyserNode.maxDecibels = maxDecibels
  analyserNode.smoothingTimeConstant = smoothingTimeConstant
  streamNode.connect(analyserNode)

  let raf: number
  const dataArray = new Uint8Array(analyserNode.fftSize)
  function frame() {
    analyserNode.getByteFrequencyData(dataArray)
    callback(dataArray, ctx.sampleRate)
    raf = requestAnimationFrame(frame)
  }
  frame()

  return () => cancelAnimationFrame(raf)
}
