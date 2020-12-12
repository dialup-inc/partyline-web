import * as React from 'react'
import { useCallback } from 'react'
import {
  Box,
  Button,
  FormLabel,
  FormControl,
  useRadio,
  useRadioGroup,
  UseRadioProps,
  VStack,
} from '@chakra-ui/core'
import { useField } from 'formik'

import type { Question, Response } from '../../types'

type QuestionChoiceProps = UseRadioProps & {
  children: React.ReactNode
  autoFocus: boolean
  onBlur?: (ev: React.FocusEvent<HTMLInputElement>) => void
}

function QuestionChoice({
  children,
  autoFocus,
  onBlur,
  ...radioProps
}: QuestionChoiceProps) {
  const { getInputProps, getCheckboxProps } = useRadio(radioProps)

  const { onBlur: onInputBlur, ...inputProps } = getInputProps()
  const handleBlur = useCallback(
    (ev) => {
      onInputBlur(ev)
      onBlur(ev)
    },
    [onInputBlur, onBlur],
  )

  return (
    <Box as="label">
      <input {...inputProps} autoFocus={autoFocus} onBlur={handleBlur} />
      <Button as="div" variant="outline" minW="14rem" {...getCheckboxProps()}>
        {children}
      </Button>
    </Box>
  )
}

type QuestionChoiceListProps = {
  responses: Array<Response>
  value: string
  autoFocus: boolean
  onChange: (value: string) => void
  onBlur?: (ev: React.FocusEvent<HTMLInputElement>) => void
}

function QuestionChoiceList({
  responses,
  value,
  autoFocus,
  onChange,
  onBlur,
}: QuestionChoiceListProps) {
  const { getRootProps, getRadioProps } = useRadioGroup({
    name: 'question',
    value,
    onChange,
  })

  const group = getRootProps()

  return (
    <VStack spacing={1} {...group}>
      {responses.map(({ responseID, text }, idx) => {
        const radio = getRadioProps({ value: String(responseID) })
        return (
          <QuestionChoice
            key={responseID}
            autoFocus={autoFocus && idx === 0}
            onBlur={onBlur}
            {...radio}
          >
            {text}
          </QuestionChoice>
        )
      })}
    </VStack>
  )
}

export type QuestionInputProps = {
  question: Question
  value: string
  autoFocus: boolean
  onChange?: (value: string) => void
  onBlur?: (ev: React.FocusEvent<HTMLInputElement>) => void
}

export default function QuestionInput({
  question,
  value,
  autoFocus,
  onChange,
  onBlur,
}: QuestionInputProps) {
  return (
    <FormControl>
      <FormLabel>{question.text}</FormLabel>
      <QuestionChoiceList
        responses={question.responses}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        autoFocus={autoFocus}
      />
    </FormControl>
  )
}
