import * as React from 'react'
import { Actor, State } from 'xstate'
import { useActor } from '@xstate/react'

import { INITIAL_QUESTION_COUNT, SIGN_UP_STEPS } from '../constants'
import { AuthFlowContext, AuthFlowEvent } from '../stateMachine/AuthFlowMachine'
import {
  AuthScreen,
  ErrorScreen,
  UserInfoScreen,
  VerifyCodeScreen,
} from './screens'

type AuthFlowProps = {
  authFlow: Actor<State<AuthFlowContext>, AuthFlowEvent>
  onGotoLogin: () => void
  onGotoSignup: () => void
}

export default function AuthFlow({
  authFlow,
  onGotoLogin,
  onGotoSignup,
}: AuthFlowProps) {
  const [state, send] = useActor<AuthFlowEvent, State<AuthFlowContext>>(
    authFlow,
  )
  return (
    <>
      {state.matches('userInfo') && (
        <UserInfoScreen
          progress={
            (INITIAL_QUESTION_COUNT + 1) /
            (INITIAL_QUESTION_COUNT + SIGN_UP_STEPS)
          }
          isSending={state.matches('userInfo.sending')}
          onNext={(age, state) => {
            send({ type: 'AUTH_FLOW.USER_INFO', age, state })
          }}
          onGotoLogin={onGotoLogin}
        />
      )}
      {state.matches('auth') && (
        <AuthScreen
          mode={state.context.mode}
          initialPhoneNumber={state.context.phoneNumber}
          initialEmail={state.context.email}
          phoneNumberErrorText={state.context.phoneNumberErrorText}
          isSending={state.matches('auth.working')}
          onComplete={(phoneNumber, email) =>
            send({ type: 'AUTH_FLOW.SIGNUP', phoneNumber, email })
          }
          onGotoLogin={onGotoLogin}
          onGotoSignup={onGotoSignup}
        />
      )}
      {state.matches('verifyCode') && (
        <VerifyCodeScreen
          codeErrorText={state.context.authCodeErrorText}
          isSending={state.matches('verifyCode.working')}
          onSubmit={(code) => send({ type: 'AUTH_FLOW.VERIFY_CODE', code })}
          onResend={() => send({ type: 'AUTH_FLOW.RESEND_CODE' })}
        />
      )}
      {state.matches('accountRequired') && (
        <ErrorScreen
          text="Account does not exist. Please sign up first."
          actionText="Sign up"
          onAction={onGotoSignup}
        />
      )}
    </>
  )
}
