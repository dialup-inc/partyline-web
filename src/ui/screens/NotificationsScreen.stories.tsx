import React from 'react'
import { Story } from '@storybook/react'

import NotificationsScreen, {
  NotificationsScreenProps,
} from './NotificationsScreen'

export default {
  title: 'Screen/Notifications Screen',
  component: NotificationsScreen,
}

const Template: Story<NotificationsScreenProps> = (args) => (
  <NotificationsScreen {...args} />
)

export const notify = Template.bind({})
notify.args = {}

export const registering = Template.bind({})
registering.args = {
  isRegisteringNotifications: true,
}
