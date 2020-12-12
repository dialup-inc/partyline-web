import React from 'react'
import { Story } from '@storybook/react'

import QuestionInput, { QuestionInputProps } from './QuestionInput'

export const sampleQuestion = {
  questionID: 0,
  text: 'Who let the dogs out?',
  responses: [
    { responseID: 0, text: 'Dogs' },
    { responseID: 1, text: 'People' },
    { responseID: 2, text: 'Baha Men' },
  ],
}

export const sampleLongQuestion = {
  questionID: 1,
  text:
    "What's the most important factor weighing in your decision for the next election?",
  responses: [
    { responseID: 0, text: 'Lust' },
    { responseID: 1, text: 'Gluttony' },
    { responseID: 2, text: 'Greed' },
    { responseID: 3, text: 'Sloth' },
    { responseID: 4, text: 'Wrath' },
    { responseID: 5, text: 'Envy' },
    { responseID: 6, text: 'Pride' },
  ],
}

export default {
  title: 'Question Input',
  component: QuestionInput,
  argTypes: {
    value: {
      control: {
        type: 'inline-radio',
        options: sampleQuestion.responses.map((r) => r.responseID),
      },
    },
  },
  includeStories: ['question', 'longQuestion'],
}

const Template: Story<QuestionInputProps> = (args) => (
  <QuestionInput {...args} />
)

export const question = Template.bind({})
question.args = {
  question: sampleQuestion,
}

export const longQuestion = Template.bind({})
longQuestion.args = {
  question: sampleLongQuestion,
}
