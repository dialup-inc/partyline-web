import React from 'react'
import { Story } from '@storybook/react'

import AuthScreen, { AuthScreenProps } from './AuthScreen'

export default {
  title: 'Screen/Auth Screen',
  component: AuthScreen,
}

const Template: Story<AuthScreenProps> = (args) => <AuthScreen {...args} />

export const signUp = Template.bind({})
signUp.args = {
  mode: 'signup',
}

export const signUpErrors = Template.bind({})
signUpErrors.args = {
  mode: 'signup',
  progress: 65,
  emailErrorText: 'Invalid. Check for typos.',
  phoneNumberErrorText: 'Invalid. Check for typos.',
}

export const signUpSending = Template.bind({})
signUpSending.args = {
  ...signUp.args,
  isSending: true,
}

export const logIn = Template.bind({})
logIn.args = {
  mode: 'login',
}

export const logInErrors = Template.bind({})
logInErrors.args = {
  mode: 'login',
  phoneNumberErrorText: 'Invalid. Check for typos.',
}

export const logInSending = Template.bind({})
logInSending.args = {
  ...logIn.args,
  isSending: true,
}
