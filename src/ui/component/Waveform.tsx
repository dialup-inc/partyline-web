import clamp from 'lodash/clamp'
import * as React from 'react'
import { useEffect, useRef } from 'react'
import { chakra, useTheme } from '@chakra-ui/core'
import { getColor } from '@chakra-ui/theme-tools'

import { onAudioFrequencyData } from '../../audio'

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  h: number,
  r: number,
) {
  ctx.moveTo(x, y + r)
  ctx.lineTo(x, y + h - r)
  ctx.arc(x + r, y + h - r, r, Math.PI, 0, true)
  ctx.lineTo(x + 2 * r, y + r)
  ctx.arc(x + r, y + r, r, 0, Math.PI, true)
  ctx.closePath()
}

const ChakraCanvas = chakra('canvas')

export type WaveformProps = React.ComponentProps<typeof ChakraCanvas> & {
  colorScheme: string
  stream: MediaStream
  w?: number
  h?: number
  segments?: number
}

const fftSize = 256
const analyserOptions = {
  fftSize,
  smoothingTimeConstant: 0.5,
  minDecibels: -100,
  maxDecibels: -50,
}

export default function Waveform({
  stream,
  colorScheme,
  w = 220,
  h = 60,
  segments = 20,
  ...props
}: WaveformProps) {
  const theme = useTheme()
  const canvasRef = useRef<HTMLCanvasElement>()
  const dpr = window.devicePixelRatio

  useEffect(() => {
    if (!stream) {
      return
    }
    return onAudioFrequencyData(
      stream,
      analyserOptions,
      (freqData, sampleRate) => {
        const el = canvasRef.current
        if (!el) {
          return
        }

        // Limit the frequencies displayed to the most interesting for voice.
        const minFreq = 2000
        const maxFreq = 7500

        // We'll sum together bins for each segment based on the size of the FFT.
        const startBin = Math.floor((fftSize / sampleRate) * minFreq)
        const endBin = Math.ceil((fftSize / sampleRate) * maxFreq)
        const binsPerSegment = (endBin - startBin) / segments

        // Scale the canvas for high DPI screens.
        el.width = w * dpr
        el.height = h * dpr
        const ctx = el.getContext('2d')
        ctx.scale(dpr, dpr)

        // Calculate bar radius and spacing (1 part spacing to 2 parts bar).
        const r = w / (3 * segments)
        const spacing = w / (segments - 1) - r * 2

        // Scale bars so at their smallest, a circle is displayed.
        const minBarHeight = 2 * r

        // Walk through the bins, calculating RMS for each segment.
        let j = startBin
        for (let i = 0; i < segments; i++) {
          let sum = 0
          let count = 0
          for (; j < startBin + (i + 1) * binsPerSegment; j++) {
            sum += (freqData[j] / 255) ** 2
            count += 1
          }
          const rms = Math.sqrt(sum / count)

          // Scale values within the usable display range (> minBarHeight).
          const bh = (minBarHeight + (h - minBarHeight) * rms) / h

          // Draw a vertically centered rounded rectangle.
          roundRect(ctx, i * (r * 2 + spacing), h * (0.5 - bh / 2), h * bh, r)
        }
        ctx.fillStyle = getColor(theme, colorScheme)
        ctx.fill()
      },
    )
  }, [stream, colorScheme, theme])

  return <ChakraCanvas ref={canvasRef} w={w} h={h} {...props} />
}
