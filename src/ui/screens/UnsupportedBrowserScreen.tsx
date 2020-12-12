import * as React from 'react'
import { useState } from 'react'
import { Center, Button, Heading, Text } from '@chakra-ui/core'

import Screen from './Screen'

export type UnsupportedBrowserScreenProps = {
  onPressCopy: () => Promise<void>
  isIOS: boolean
}

export default function UnsupportedBrowserScreen({
  onPressCopy,
  isIOS,
}: UnsupportedBrowserScreenProps) {
  const [copied, setCopied] = useState(false)
  return (
    <Screen>
      <Center
        flexDir="column"
        position="absolute"
        top={0}
        bottom={0}
        left={0}
        right={0}
      >
        <Heading size="sm" textAlign="center" mb="4">
          {isIOS ? 'Please open in Safari.' : 'Please open in Chrome.'}
        </Heading>
        <Text fontSize="xs" textAlign="center" mb="12">
          {isIOS
            ? 'Or switch to desktop to open in any browser.'
            : 'Or try again on another device.'}
        </Text>
        <Button
          size="lg"
          onClick={async () => {
            try {
              await onPressCopy()
            } catch (error) {
              // ignore
            }
            setCopied(true)
            setTimeout(() => setCopied(false), 5000)
          }}
        >
          Copy link
        </Button>
        <Text
          fontSize="xs"
          mt="4"
          opacity={copied ? 0.7 : 0}
          transition="opacity 0.5s ease"
          textAlign="center"
        >
          {isIOS
            ? 'Copied! Now open Safari and paste.'
            : 'Copied to clipboard!'}
        </Text>
      </Center>
    </Screen>
  )
}
