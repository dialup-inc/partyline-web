import * as React from 'react'
import { MINIMAL_VIEWPORTS } from '@storybook/addon-viewport'
import { ChakraProvider } from '@chakra-ui/core'

import theme from '../src/ui/theme'

const customViewports = {
  mobileShort: {
    name: 'Short mobile',
    styles: {
      height: '480px',
      width: '320px',
    },
    type: 'mobile',
  },
}

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  layout: 'fullscreen',
  viewport: {
    viewports: {
      ...MINIMAL_VIEWPORTS,
      ...customViewports,
    },
  },
}

export const decorators = [
  (Story) => (
    <ChakraProvider resetCSS theme={theme}>
      <Story />
    </ChakraProvider>
  ),
]
