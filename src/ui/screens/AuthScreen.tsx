import * as React from 'react'
import {
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  Text,
} from '@chakra-ui/core'
import { Formik, Form } from 'formik'
import * as EmailValidator from 'email-validator'
import parsePhoneNumber, { Metadata } from 'libphonenumber-js/core'
import PhoneInput from 'react-phone-number-input/input-core'

import phoneMetadata from '../phonenumber.metadata.json'
import Screen from './Screen'
import {
  FormScreenTitle,
  FormikNextButton,
  FormScreenContentBox,
  FormField,
} from './FormScreen'

function validatePhoneNumber(value: string) {
  if (!value) {
    return 'Please enter a phone number.'
  }
  // @ts-ignore: Overly restrictive types for metadata value
  const metadata = phoneMetadata as Metadata
  const parsed = parsePhoneNumber(value, metadata)
  if (!parsed || !parsed.isPossible()) {
    return 'Invalid. Check for typos.'
  }

  if (!parsed.isValid()) {
    return 'Only for US phone numbers.'
  }
}

function validateEmail(value: string) {
  if (!EmailValidator.validate(value)) {
    return 'Please enter a valid email address.'
  }
}

export type AuthScreenProps = {
  mode: 'signup' | 'login'
  initialPhoneNumber: string
  initialEmail: string
  emailErrorText?: string
  phoneNumberErrorText?: string
  isSending: boolean
  onComplete: (phoneNumber: string, email?: string) => void
  onGotoLogin?: () => void
  onGotoSignup?: () => void
}

export const LoginButton = ({ onClick }: { onClick: () => void }) => (
  <Button variant="ghost" size="xs" onClick={onClick}>
    Log in
  </Button>
)

export default function AuthScreen({
  mode,
  initialPhoneNumber,
  initialEmail,
  emailErrorText,
  phoneNumberErrorText,
  isSending,
  onComplete,
  onGotoLogin,
  onGotoSignup,
}: AuthScreenProps) {
  return (
    <Screen
      headerAction={mode !== 'login' && <LoginButton onClick={onGotoLogin} />}
    >
      <Formik
        initialValues={{ phoneNumber: initialPhoneNumber, email: initialEmail }}
        initialErrors={{
          phoneNumber: phoneNumberErrorText,
          email: emailErrorText,
        }}
        initialTouched={{
          phoneNumber: !!initialPhoneNumber || !!phoneNumberErrorText,
          email: !!initialEmail || !!emailErrorText,
        }}
        onSubmit={(values) => {
          onComplete(values.phoneNumber, values.email)
        }}
        enableReinitialize
        validateOnMount
      >
        <Form>
          {mode === 'signup' && (
            <FormScreenTitle
              title="Verify your account to start talking."
              subtitle="Your partner won’t see this."
            />
          )}
          {mode === 'login' && (
            <FormScreenTitle title="Log in to your account." />
          )}
          <FormScreenContentBox>
            {mode === 'signup' && (
              <FormField
                label="What's your email?"
                name="email"
                validate={validateEmail}
              >
                {(field) => (
                  <Input
                    layerStyle="formScreenInput"
                    type="email"
                    placeholder="email@example.com"
                    autoFocus={mode === 'signup'}
                    {...field}
                  />
                )}
              </FormField>
            )}
            <FormField
              label="What's your phone number?"
              name="phoneNumber"
              validate={validatePhoneNumber}
            >
              {(field, helpers) => (
                <InputGroup layerStyle="formScreenInput">
                  <InputLeftElement pointerEvents="none" w={[12, 20]}>
                    <Text mr={2}>🇺🇸</Text>
                    <Text display={['none', 'block']}>+1</Text>
                  </InputLeftElement>
                  <PhoneInput
                    country="US"
                    placeholder="(222) 555-1234"
                    autoFocus={mode === 'login'}
                    metadata={phoneMetadata}
                    // @ts-ignore
                    inputComponent={Input}
                    {...field}
                    onChange={helpers.setValue}
                  />
                </InputGroup>
              )}
            </FormField>
          </FormScreenContentBox>
          <FormikNextButton
            actionText="Text me the code"
            isWorking={isSending}
            noteText="For verification. SMS rates may apply."
            secondaryActionText={
              mode === 'login' ? `Don't have an account yet? Sign up.` : null
            }
            onSecondaryAction={mode === 'login' ? onGotoSignup : null}
          />
        </Form>
      </Formik>
    </Screen>
  )
}
