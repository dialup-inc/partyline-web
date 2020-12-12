import React from 'react'
import { Story } from '@storybook/react'

import UserInfoScreen, { UserInfoScreenProps } from './UserInfoScreen'

export default {
  title: 'Screen/User Info Screen',
  component: UserInfoScreen,
}

const Template: Story<UserInfoScreenProps> = (args) => (
  <UserInfoScreen {...args} />
)

export const userInfo = Template.bind({})
userInfo.args = {}

export const error = Template.bind({})
error.args = {
  ...userInfo.args,
  ageErrorText: 'You must be older than 13.',
  stateErrorText: 'Please pick your state.',
}

export const sending = Template.bind({})
sending.args = {
  ...userInfo.args,
  isSending: true,
}
