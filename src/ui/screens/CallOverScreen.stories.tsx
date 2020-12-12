import React from 'react'
import { Story } from '@storybook/react'

import CallOverScreen, { CallOverScreenProps } from './CallOverScreen'

export default {
  title: 'Screen/Call Over Screen',
  component: CallOverScreen,
}

const Template: Story<CallOverScreenProps> = (args) => (
  <CallOverScreen {...args} />
)

export const screen = Template.bind({})
screen.args = {}

export const report = Template.bind({})
report.args = {
  defaultIncludeReport: true,
}

export const sending = Template.bind({})
sending.args = {
  isSending: true,
}
