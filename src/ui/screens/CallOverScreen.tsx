import * as React from 'react'
import { useState } from 'react'
import { Formik, Form, Field, FieldProps } from 'formik'
import {
  FormControl,
  FormLabel,
  Button,
  Flex,
  Text,
  Textarea,
  useDisclosure,
} from '@chakra-ui/core'

import Screen from './Screen'
import { FormScreenNextButton, FormScreenContentBox } from './FormScreen'
import { FlagIcon } from '../icons'

export type CallOverScreenProps = {
  isSending: boolean
  defaultIncludeReport?: boolean
  onSubmit: (feedback: string, report: string) => void
}

export default function CallOverScreen({
  isSending,
  defaultIncludeReport,
  onSubmit,
}: CallOverScreenProps) {
  const [feedback, setFeedback] = useState<string>('')
  const {
    isOpen: isReportExpanded,
    onToggle: toggleReportExpanded,
  } = useDisclosure({ defaultIsOpen: defaultIncludeReport })
  const [report, setReport] = useState<string>('')
  return (
    <Screen>
      <Formik
        initialValues={{ feedback: '', report: '' }}
        onSubmit={(values) => {
          onSubmit(values.feedback, values.report)
        }}
      >
        <Form>
          <Text fontSize="xs" textAlign="center" h={4}>
            Thanks for participating!
          </Text>
          <FormScreenContentBox justifyContent="flex-start" minH="18rem">
            <FormControl d="flex" flex="2" flexDir="column">
              <FormLabel fontSize={['sm', 'md']}>
                Did this conversation expand your mind? If so, how?
              </FormLabel>
              <Field name="feedback">
                {({ field }: FieldProps) => (
                  <Textarea
                    flex="1"
                    fontSize="sm"
                    autoFocus
                    resize="none"
                    {...field}
                  />
                )}
              </Field>
              <Flex h={6} justifyContent="flex-end">
                {isReportExpanded ? (
                  <Button
                    key="cancel-report"
                    size="xs"
                    variant="link"
                    color="blue"
                    onClick={toggleReportExpanded}
                  >
                    Cancel report
                  </Button>
                ) : (
                  <Button
                    key="report"
                    size="xs"
                    variant="ghost"
                    color="brightRed"
                    p={0}
                    leftIcon={<FlagIcon mb=".225rem" />}
                    iconSpacing=".2rem"
                    onClick={toggleReportExpanded}
                  >
                    Report match
                  </Button>
                )}
              </Flex>
            </FormControl>
            {isReportExpanded && (
              <FormControl d="flex" flex="1" flexDir="column">
                <FormLabel fontSize={['sm', 'md']}>What went wrong?</FormLabel>
                <Field name="report">
                  {({ field }: FieldProps) => (
                    <Textarea flex="1" fontSize="sm" resize="none" {...field} />
                  )}
                </Field>
              </FormControl>
            )}
          </FormScreenContentBox>
          <FormScreenNextButton
            height={32}
            actionText="Submit feedback"
            actionProps={{ size: 'lg-light' }}
            isWorking={isSending}
          />
        </Form>
      </Formik>
    </Screen>
  )
}
