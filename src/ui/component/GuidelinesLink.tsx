import * as React from 'react'
import { Flex, Link, Spacer, useTheme } from '@chakra-ui/core'

export type GuidelinesLinkProps = {
  isLight?: boolean
}

export default function GuidelinesLink({ isLight }: GuidelinesLinkProps) {
  return (
    <Link
      href="https://partyline.chat/about"
      fontSize="xs"
      color={isLight ? 'lightBlue' : 'blue'}
      textDecoration="underline"
      opacity={isLight ? 0.5 : 1}
      alignSelf="center"
      position="absolute"
      bottom="1.5vh"
      isExternal
    >
      Guidelines &amp; Policies
    </Link>
  )
}
