import React from 'react'
import { Story } from '@storybook/react'

import LoadingScreen, { LoadingScreenProps } from './LoadingScreen'

export default {
  title: 'Screen/Loading Screen',
  component: LoadingScreen,
}

const Template: Story<LoadingScreenProps> = (args) => (
  <LoadingScreen {...args} />
)

export const loading = Template.bind({})
loading.args = {}
