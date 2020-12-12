import * as React from 'react'
import { useEffect, useState } from 'react'
import { Text } from '@chakra-ui/core'

type TimerSinceProps = React.ComponentProps<typeof Text> & { since: Date }

function timeSince(since: Date) {
  const duration = Math.floor((new Date().getTime() - since.getTime()) / 1000)
  const seconds = duration % 60
  const mins = Math.floor(duration / 60) % 60
  const hours = Math.floor(duration / (60 * 60))
  const parts = [mins, seconds]
  if (hours > 0) {
    parts.unshift(hours)
  }
  return parts.map((p) => String(p).padStart(2, '0')).join(':')
}

export default function TimerSince({ since, ...props }: TimerSinceProps) {
  const [label, setLabel] = useState(timeSince(since))
  useEffect(() => {
    const interval = setInterval(() => setLabel(timeSince(since)), 500)
    return () => clearInterval(interval)
  }, [])
  return <Text {...props}>{label}</Text>
}
