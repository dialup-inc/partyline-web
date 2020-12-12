import * as React from 'react'
import { Center } from '@chakra-ui/core'

import Screen from './Screen'
import { Spinner } from '../icons'

export type LoadingScreenProps = {}

export default function LoadingScreen({}: LoadingScreenProps) {
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
        <Spinner color="blue" boxSize={8} />
      </Center>
    </Screen>
  )
}
