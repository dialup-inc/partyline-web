import React from 'react'
import { Story } from '@storybook/react'

import PreMatchScreen, { PreMatchScreenProps } from './PreMatchScreen'
import {
  sampleQuestion,
  sampleLongQuestion,
} from '../component/QuestionInput.stories'

export default {
  title: 'Screen/Pre-Match Screen',
  component: PreMatchScreen,
}

const Template: Story<PreMatchScreenProps> = (args) => (
  <PreMatchScreen {...args} />
)

export const searching = Template.bind({})
searching.args = {
  isSearching: true,
  talkingCount: 8,
  onlineCount: 0,
  currentQuestion: sampleQuestion,
}

export const searchingLoadingQuestions = Template.bind({})
searchingLoadingQuestions.args = {
  ...searching.args,
  isLoadingQuestions: true,
}

export const searchingLongQuestion = Template.bind({})
searchingLongQuestion.args = {
  ...searching.args,
  currentQuestion: sampleLongQuestion,
}

export const searchingAllQuestionsAnswered = Template.bind({})
searchingAllQuestionsAnswered.args = {
  ...searching.args,
  currentQuestion: null,
}

export const timedOut = Template.bind({})
timedOut.args = {
  ...searching.args,
  isTimedOut: true,
  canJoin: false,
}

export const registeringNotifications = Template.bind({})
registeringNotifications.args = {
  ...timedOut.args,
  isRegisteringNotifications: true,
}

export const notificationUnsupported = Template.bind({})
notificationUnsupported.args = {
  ...timedOut.args,
  isNotificationUnsupported: true,
}

export const notificationsRegistered = Template.bind({})
notificationsRegistered.args = {
  ...timedOut.args,
  isNotificationsRegistered: true,
}

export const canJoin = Template.bind({})
canJoin.args = {
  ...searching.args,
  isSearching: false,
  canJoin: true,
  onlineCount: 3,
}
