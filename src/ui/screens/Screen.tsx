import * as React from 'react'
import { Flex, Link, Spacer, useTheme } from '@chakra-ui/core'
import { isDark } from '@chakra-ui/theme-tools'

import { Logo } from '../icons'
import GuidelinesLink from '../component/GuidelinesLink'

export type ScreenProps = {
  children?: React.ReactNode
  bg?: string
  headerAction?: React.ReactNode
  bottomPane?: React.ReactNode
  progress?: number
}

export default function Screen({
  children,
  bg = 'lightBlue',
  headerAction,
  bottomPane,
}: ScreenProps) {
  const theme = useTheme()
  return (
    <Flex direction="column" flex={1} maxH="full" bg={bg}>
      <Flex flex={4} direction="column" overflow="hidden" overflowY="auto">
        <Flex flexShrink={0} p={[2, 4]} pb={[5, 0]} alignItems="center">
          <Link
            href="https://partyline.chat"
            title="Partyline, a project by Dialup"
            isExternal
          >
            <Logo
              w={['9rem', '10rem']}
              color={isDark(bg)(theme) ? 'lightBlue' : 'blue'}
            />
          </Link>
          <Spacer />
          {headerAction}
        </Flex>
        <Flex
          direction="column"
          flex="1"
          minH="min-content"
          justifyContent="center"
          position="relative"
        >
          {children}
          {!bottomPane && <GuidelinesLink />}
        </Flex>
      </Flex>
      {bottomPane}
      {bottomPane && <GuidelinesLink isLight />}
    </Flex>
  )
}
