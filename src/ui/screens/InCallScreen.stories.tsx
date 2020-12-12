import * as React from 'react'
import { useEffect, useState } from 'react'
import { Story } from '@storybook/react'

import { Prompt } from '../../types'
import InCallScreen, { InCallScreenProps } from './InCallScreen'

const prompts: Array<Prompt> = [
  {
    question: {
      questionID: 0,
      text: 'Who do you want to win in the upcoming election?',
      responses: [
        { responseID: 0, text: 'Biden' },
        { responseID: 1, text: 'Trump' },
      ],
    },
    yourResponse: 0,
    theirResponse: 0,
  },
  {
    question: {
      questionID: 1,
      text: 'What did you have for breakfast?',
      responses: [],
    },
    yourResponse: undefined,
    theirResponse: undefined,
  },
  {
    question: {
      questionID: 2,
      text:
        "What's the most important factor weighing in your decision for the next election?",
      responses: [
        { responseID: 0, text: 'Healthcare and COVID-19' },
        { responseID: 1, text: 'Climate change and energy' },
      ],
    },
    yourResponse: 0,
    theirResponse: 1,
  },
]

export default {
  title: 'Screen/In Call Screen',
  component: InCallScreen,
}

const Template: Story<InCallScreenProps> = (args) => <InCallScreen {...args} />

export const unmatched = Template.bind({})
unmatched.args = {
  talkingCount: 4,
  answeringQuestionsCount: 8,
}

export const matched = Template.bind({})
matched.args = {
  partner: {
    userID: '0',
    state: 'NY',
    age: 65,
  },
  prompts,
}

let cachedMediaStream: MediaStream = null
const AudioTemplate: Story<InCallScreenProps> = (args) => {
  const [stream, setStream] = useState<MediaStream>(cachedMediaStream)
  useEffect(() => {
    if (cachedMediaStream) {
      return
    }
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      cachedMediaStream = stream
      setStream(stream)
    })
  }, [])
  return (
    <InCallScreen {...args} micStream={stream} remoteStream={stream} isSilent />
  )
}

export const matchedAndConnected = AudioTemplate.bind({})
matchedAndConnected.args = {
  ...matched.args,
  isConnected: true,
  callStartTime: new Date(),
}

export const endCall = AudioTemplate.bind({})
endCall.args = {
  ...matchedAndConnected.args,
  isEndCallOpen: true,
}

export const partnerLeft = AudioTemplate.bind({})
partnerLeft.args = {
  ...matchedAndConnected.args,
  isRemoteEnded: true,
  partner: null,
  remoteStream: null,
}
