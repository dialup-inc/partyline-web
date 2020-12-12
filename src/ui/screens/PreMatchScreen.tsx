import * as React from 'react'
import { Button, Center, VStack, Text, Image, Box } from '@chakra-ui/core'
import { Formik, Form, Field, FieldProps } from 'formik'

import type { Question } from '../../types'
import Screen from './Screen'
import { FormScreenContentBox, FormField } from './FormScreen'
import QuestionInput from '../component/QuestionInput'
import { NextIcon, Spinner } from '../icons'

export type PreMatchScreenProps = {
  isTimedOut: boolean
  canJoin: boolean
  isLoadingQuestions: boolean
  isRegisteringNotifications: boolean
  isNotificationsRegistered: boolean
  isNotificationUnsupported: boolean
  currentQuestion: Question
  onlineCount: number
  onNextQuestion: (questionID: number, responseID: number) => void
  onNotify: () => void
  onJoin: () => void
  onLogout: () => void
  onCalendar: () => void
}

export default function PreMatchScreen({
  isTimedOut,
  canJoin,
  isLoadingQuestions,
  isRegisteringNotifications,
  isNotificationsRegistered,
  isNotificationUnsupported,
  currentQuestion,
  onlineCount,
  onNextQuestion,
  onNotify,
  onJoin,
  onLogout,
  onCalendar,
}: PreMatchScreenProps) {
  const logoutButton = (
    <Button variant="ghost" size="xs" onClick={onLogout}>
      Log out
    </Button>
  )
  const bottomPane = (
    <VStack
      flex={1}
      flexShrink={0}
      bg="blue"
      p={4}
      spacing={4}
      justifyContent="center"
      textAlign="center"
    >
      {canJoin ? (
        <>
          <Button colorScheme="brightRed" size="lg-light" onClick={onJoin}>
            Join the match pool
          </Button>
          <Text
            fontSize="xs"
            color="lightBlue"
            d="block"
            visibility={onlineCount === null ? 'hidden' : 'visible'}
          >
            <Text as="b">{onlineCount}</Text>{' '}
            {onlineCount === 1 ? 'person' : 'people'} online{' '}
          </Text>
        </>
      ) : isTimedOut ? (
        <>
          {isNotificationUnsupported ? (
            <Button
              colorScheme="grayBlue"
              variant="faint"
              size="lg-light"
              isLoading={isRegisteringNotifications}
              onClick={onCalendar}
            >
              Add to calendar
            </Button>
          ) : isNotificationsRegistered ? (
            <Button
              as="p"
              variant="ghost"
              size="lg-light"
              color="lightBlue"
              opacity={0.5}
            >
              We'll notify you when it's busier.
            </Button>
          ) : (
            <Button
              colorScheme="grayBlue"
              variant="faint"
              size="lg-light"
              isLoading={isRegisteringNotifications}
              onClick={onNotify}
            >
              Notify me when there's a match
            </Button>
          )}
          <Text fontSize="xs" color="lightBlue" d="block">
            No matches yet. Keep waiting, or come back at 7:30 PT.
          </Text>
        </>
      ) : (
        <>
          <Spinner color="brightRed" boxSize={8} />
          <Text color="lightBlue" fontSize={['xs', 'sm']}>
            Searching for matches...
          </Text>
        </>
      )}
    </VStack>
  )
  return (
    <Screen headerAction={logoutButton} bottomPane={bottomPane}>
      <Formik
        key={currentQuestion?.questionID}
        initialValues={{ response: undefined }}
        onSubmit={(values) => {
          onNextQuestion(currentQuestion.questionID, Number(values.response))
        }}
      >
        <Form style={{ display: 'flex' }}>
          <Center minHeight="min-content" flex={3} flexDir="column">
            {isLoadingQuestions ? (
              <Spinner color="blue" boxSize={8} />
            ) : currentQuestion ? (
              <>
                <Text fontSize="xs" textAlign="center" mx={4}>
                  Welcome! Answer questions to help us match you.
                </Text>
                <FormScreenContentBox justifyContent="flex-start" minH="12rem">
                  <FormField name="response" hasNoErrors>
                    {(field, helpers) => (
                      <QuestionInput
                        question={currentQuestion}
                        autoFocus
                        {...field}
                        onChange={helpers.setValue}
                      />
                    )}
                  </FormField>
                </FormScreenContentBox>
                <Button
                  type="submit"
                  size="lg-light"
                  colorScheme="grayBlue"
                  color="blue"
                  variant="faint"
                  mt={2}
                  mb={4}
                  rightIcon={<NextIcon />}
                >
                  Next question
                </Button>
              </>
            ) : (
              <>
                <Image
                  alt="Done."
                  objectFit="contain"
                  boxSize="sm"
                  mb={4}
                  htmlWidth={523}
                  htmlHeight={389}
                  src={require('../../../static/done.png')}
                />
                <Text fontSize="xs" textAlign="center" mx={4}>
                  That's all the questions we have for today!
                  <br />
                  We're finding a match for you.
                </Text>
              </>
            )}
          </Center>
        </Form>
      </Formik>
    </Screen>
  )
}
