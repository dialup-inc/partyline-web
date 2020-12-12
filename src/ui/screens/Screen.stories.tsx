import React from 'react'
import { Story } from '@storybook/react'
import { Flex, Text } from '@chakra-ui/core'

import Screen, { ScreenProps } from './Screen'

export default {
  title: 'Screen',
  component: Screen,
  argTypes: {
    progress: {
      control: {
        type: 'range',
        min: 0,
        max: 100,
      },
    },
  },
}

const Template: Story<ScreenProps> = (args) => (
  <Screen {...args}>
    <Flex flex={1} alignItems="center" justifyContent="center">
      <Text>Screen contents</Text>
    </Flex>
  </Screen>
)

export const Base = Template.bind({})
Base.args = {
  progress: 33,
}
