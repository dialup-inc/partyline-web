import React from 'react'
import { Story } from '@storybook/react'

import ErrorScreen, { ErrorScreenProps } from './ErrorScreen'

export default {
  title: 'Screen/Error Screen',
  component: ErrorScreen,
}

const Template: Story<ErrorScreenProps> = (args) => <ErrorScreen {...args} />

export const error = Template.bind({})
error.args = {}

export const customError = Template.bind({})
customError.args = {
  text: 'Stack overflow.',
  actionText: 'Oh no.',
}
