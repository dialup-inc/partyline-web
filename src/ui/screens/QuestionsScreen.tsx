import * as React from 'react'
import { Text } from '@chakra-ui/core'
import { Formik, Form } from 'formik'

import type { Question } from '../../types'
import Screen from './Screen'
import {
  FormScreenTitle,
  FormScreenContentBox,
  FormField,
  FormikNextButton,
} from './FormScreen'
import QuestionInput from '../component/QuestionInput'
import { Spinner } from '../icons'
import { LoginButton } from './AuthScreen'

export function requireResponse(value: string) {
  if (!value) {
    return 'Response required.'
  }
}

export type QuestionsScreenProps = {
  isLoadingQuestions: boolean
  currentQuestion: Question
  questionIndex: number
  questionCount: number
  progress: number
  onNext: (questionID: number, responseID: number) => void
  onLogin: () => void
}

export default function QuestionsScreen({
  isLoadingQuestions,
  currentQuestion,
  questionIndex,
  questionCount,
  progress,
  onNext,
  onLogin,
}: QuestionsScreenProps) {
  return (
    <Screen
      progress={progress}
      headerAction={<LoginButton onClick={onLogin} />}
    >
      <Formik
        key={currentQuestion?.questionID}
        initialValues={{ response: undefined }}
        onSubmit={(values) => {
          onNext(currentQuestion.questionID, Number(values.response))
        }}
        validateOnMount
      >
        <Form>
          <FormScreenTitle
            title="Answer a few questions to get a match."
            subtitle="Your partner will see your answers."
          />
          <FormScreenContentBox>
            {isLoadingQuestions || !currentQuestion ? (
              <Spinner color="blue" boxSize={8} />
            ) : (
              <FormField name="response" validate={requireResponse} hasNoErrors>
                {(field, helpers) => (
                  <>
                    <Text fontSize="xs" fontWeight="bold" textAlign="center">
                      ({questionIndex} of {questionCount})
                    </Text>
                    <QuestionInput
                      question={currentQuestion}
                      autoFocus
                      {...field}
                      onChange={helpers.setValue}
                    />
                  </>
                )}
              </FormField>
            )}
          </FormScreenContentBox>
          <FormikNextButton
            secondaryActionText="Already have an account? Sign in."
            onSecondaryAction={onLogin}
          />
        </Form>
      </Formik>
    </Screen>
  )
}
