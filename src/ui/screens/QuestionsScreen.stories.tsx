import React from 'react'
import { Story } from '@storybook/react'

import QuestionsScreen, { QuestionsScreenProps } from './QuestionsScreen'
import {
  sampleQuestion,
  sampleLongQuestion,
} from '../component/QuestionInput.stories'

export default {
  title: 'Screen/Questions Screen',
  component: QuestionsScreen,
}

const Template: Story<QuestionsScreenProps> = (args) => (
  <QuestionsScreen {...args} />
)

export const question = Template.bind({})
question.args = {
  currentQuestion: sampleQuestion,
  questionIndex: 1,
  questionCount: 3,
}

export const loading = Template.bind({})
loading.args = {
  ...question.args,
  isLoadingQuestions: true,
}

export const longQuestion = Template.bind({})
longQuestion.args = {
  currentQuestion: sampleLongQuestion,
  questionIndex: 2,
  questionCount: 3,
}
