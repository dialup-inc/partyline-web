import * as React from 'react'
import { useRef, useEffect } from 'react'

type StreamProps = {
  stream: MediaStream
  muted: boolean
}

export default function Stream({ stream, muted }: StreamProps) {
  const ref = useRef<HTMLAudioElement>()

  useEffect(() => {
    if (stream && ref.current) {
      ref.current.srcObject = stream
    }
  }, [stream])

  return (
    <audio
      ref={ref}
      style={{ display: 'none' }}
      muted={muted}
      autoPlay
      playsInline
    />
  )
}
