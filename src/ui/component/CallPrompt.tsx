import * as React from 'react'
import { Box, Flex, Text } from '@chakra-ui/core'

import type { Prompt } from '../../types'

type CallPromptProps = React.ComponentProps<typeof Box> & {
  prompt: Prompt
}

export default function CallPrompt({ prompt, ...props }: CallPromptProps) {
  const responseText = (responseID: number) =>
    prompt.question.responses.find((r) => r.responseID === responseID).text

  let details
  if (prompt.yourResponse === undefined && prompt.theirResponse === undefined) {
    details = <Text>Icebreaker question</Text>
  } else {
    const choiceWidth = '6rem'
    details = (
      <>
        <Flex>
          <Text w={choiceWidth} whiteSpace="nowrap" flexShrink={0}>
            You chose
          </Text>
          <Text fontWeight="bold" color="brightRed">
            {responseText(prompt.yourResponse)}
          </Text>
        </Flex>
        <Flex>
          <Text w={choiceWidth} whiteSpace="nowrap" flexShrink={0}>
            They chose
          </Text>
          <Text fontWeight="bold" color="brightRed">
            {responseText(prompt.theirResponse)}
          </Text>
        </Flex>
      </>
    )
  }

  return (
    <Box color="lightBlue" fontSize="sm" textAlign="left" {...props}>
      <Text fontWeight="bold" mb={2}>
        {prompt.question.text}
      </Text>
      {details}
    </Box>
  )
}
