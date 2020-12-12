import * as React from 'react'
import { Center, Heading, Text, Button } from '@chakra-ui/core'

import Screen from './Screen'

export type ErrorScreenProps = {
  text?: string
  actionText?: string
  onAction?: () => void
}

export default function ErrorScreen({
  text = null,
  actionText = 'Try again',
  onAction,
}: ErrorScreenProps) {
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
        {text ? (
          <Text m="4" textAlign="center">
            {text}
          </Text>
        ) : (
          <>
            <Heading size="sm" textAlign="center" mb="4">
              Something went wrong.
            </Heading>
            <Text fontSize="xs" textAlign="center" mx="4" mb="12">
              If you keep experiencing issues, try joining from a different
              device.
            </Text>
          </>
        )}
        <Button size="lg" onClick={onAction}>
          {actionText}
        </Button>
      </Center>
    </Screen>
  )
}
