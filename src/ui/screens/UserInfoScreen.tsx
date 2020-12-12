import * as React from 'react'
import { Input, Select } from '@chakra-ui/core'
import { Formik, Form } from 'formik'

import states from '../../states.json'
import Screen from './Screen'
import {
  FormScreenTitle,
  FormikNextButton,
  FormScreenContentBox,
  FormField,
} from './FormScreen'
import { LoginButton } from './AuthScreen'

function validateAge(value: string) {
  if (!value) {
    return 'Please enter your age.'
  }
  if (Number(value) < 13) {
    return 'You must be older than 13.'
  }
  if (Number(value) > 120) {
    return 'While impressive, you must be under 120.'
  }
}

function validateState(value: string) {
  if (!value) {
    return 'Please select your state.'
  }
}

export type UserInfoScreenProps = {
  progress: number
  ageErrorText?: string
  stateErrorText?: string
  isSending: boolean
  onNext: (age: number, state: string) => void
  onGotoLogin: () => void
}

export default function UserInfoScreen({
  progress,
  ageErrorText,
  stateErrorText,
  isSending,
  onNext,
  onGotoLogin,
}: UserInfoScreenProps) {
  return (
    <Screen
      progress={progress}
      headerAction={<LoginButton onClick={onGotoLogin} />}
    >
      <Formik
        initialValues={{ age: '', state: '' }}
        initialErrors={{ age: ageErrorText, state: stateErrorText }}
        initialTouched={{ age: !!ageErrorText, state: !!stateErrorText }}
        onSubmit={(values) => {
          onNext(Number(values.age), values.state)
        }}
        validateOnMount
      >
        <Form>
          <FormScreenTitle
            title="Share a little more context about you."
            subtitle="Your partner will see your answers."
          />
          <FormScreenContentBox>
            <FormField
              label="How old are you?"
              name="age"
              validate={validateAge}
            >
              {(field) => (
                <Input
                  type="number"
                  layerStyle="formScreenInput"
                  autoComplete="off"
                  autoFocus
                  {...field}
                />
              )}
            </FormField>
            <FormField
              label="What state do you live in?"
              name="state"
              validate={validateState}
            >
              {(field) => (
                <Select
                  rootProps={{ layerStyle: 'formScreenInput' }}
                  placeholder="— Select one —"
                  {...field}
                >
                  {Object.entries(states).map(([abbrev, name]) => (
                    <option key={abbrev} value={abbrev}>
                      {name}
                    </option>
                  ))}
                </Select>
              )}
            </FormField>
          </FormScreenContentBox>
          <FormikNextButton isWorking={isSending} />
        </Form>
      </Formik>
    </Screen>
  )
}
