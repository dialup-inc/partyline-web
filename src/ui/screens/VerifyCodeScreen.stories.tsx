import React from 'react'
import { Story } from '@storybook/react'

import VerifyCodeScreen, { VerifyCodeScreenProps } from './VerifyCodeScreen'

export default {
  title: 'Screen/Verify Code Screen',
  component: VerifyCodeScreen,
}

const Template: Story<VerifyCodeScreenProps> = (args) => (
  <VerifyCodeScreen {...args} />
)

export const verifyCode = Template.bind({})
verifyCode.args = {
  kind: 'signup',
}

export const error = Template.bind({})
error.args = {
  ...verifyCode.args,
  codeErrorText: 'Invalid. Check for typos.',
}

export const sending = Template.bind({})
sending.args = {
  ...verifyCode.args,
  isSending: true,
}
