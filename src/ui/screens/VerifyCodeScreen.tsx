import * as React from 'react'
import { Input } from '@chakra-ui/core'
import { Formik, Form } from 'formik'

import Screen from './Screen'
import {
  FormScreenTitle,
  FormikNextButton,
  FormScreenContentBox,
  FormField,
} from './FormScreen'

function validateCode(value: string) {
  if (value.length !== 6) {
    return 'Please enter 6 characters.'
  }
}

export type VerifyCodeScreenProps = {
  codeErrorText?: string
  isSending: boolean
  onSubmit: (code: string) => void
  onResend: () => void
}

export default function VerifyCodeScreen({
  codeErrorText,
  isSending,
  onSubmit,
  onResend,
}: VerifyCodeScreenProps) {
  return (
    <Screen>
      <Formik
        initialValues={{ code: '' }}
        initialErrors={{ code: codeErrorText }}
        initialTouched={{ code: !!codeErrorText }}
        onSubmit={(values) => {
          onSubmit(values.code)
        }}
        enableReinitialize
        validateOnMount
      >
        <Form>
          <FormScreenTitle
            title="Check your text messages!"
            subtitle="We just need to verify your account."
          />
          <FormScreenContentBox>
            <FormField
              label="Enter your 6-digit verification code."
              name="code"
              validate={validateCode}
            >
              {(field) => (
                <Input
                  type="text"
                  inputMode="numeric"
                  layerStyle="formScreenInput"
                  placeholder="555555"
                  maxLength={6}
                  autoComplete="off"
                  autoFocus
                  {...field}
                />
              )}
            </FormField>
          </FormScreenContentBox>
          <FormikNextButton
            actionText="Submit"
            isWorking={isSending}
            secondaryActionText="Resend code."
            onSecondaryAction={onResend}
          />
        </Form>
      </Formik>
    </Screen>
  )
}
