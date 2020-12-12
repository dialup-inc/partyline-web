import * as React from 'react'
import { Actor, State } from 'xstate'
import { useActor } from '@xstate/react'
import { Progress } from '@chakra-ui/core'

import { FlowContext, FlowEvent } from '../stateMachine/FlowMachine'
import {
  QuestionsContext,
  QuestionsEvent,
} from '../stateMachine/QuestionsMachine'
import { PushContext, PushEvent } from '../stateMachine/PushMachine'
import {
  LoadingScreen,
  QuestionsScreen,
  CallOverScreen,
  ShareScreen,
  NotificationsScreen,
} from './screens'
import { INITIAL_QUESTION_COUNT, SIGN_UP_STEPS } from '../constants'
import AuthFlow from './AuthFlow'
import CallFlow from './CallFlow'

type FlowProps = {
  flow: Actor<State<FlowContext>, FlowEvent>
}

export default function Flow({ flow }: FlowProps) {
  const [state, send] = useActor<FlowEvent, State<FlowContext>>(flow)
  const [questionsState, _] = useActor<QuestionsEvent, State<QuestionsContext>>(
    state.children.questions,
  )
  const [pushState, pushSend] = useActor<PushEvent, State<PushContext>>(
    state.children.push,
  )
  const { introStep, introStepCount } = state.context
  return (
    <>
      <Progress
        value={(100 * (introStep + 1)) / introStepCount}
        opacity={introStep === null ? 0 : 1}
        h={['6px', '10px']}
        position="fixed"
        top="0"
        left="0"
        right="0"
      />
      {state.matches('intro.loadingAuth') && <LoadingScreen />}
      {state.matches('intro.signup.startingQuestions') && (
        <QuestionsScreen
          progress={
            (state.context.answeredQuestionCount + 1) /
            (INITIAL_QUESTION_COUNT + SIGN_UP_STEPS)
          }
          isLoadingQuestions={questionsState.matches('loader.loading')}
          currentQuestion={questionsState.context.questionsQueue[0]}
          questionIndex={state.context.answeredQuestionCount + 1}
          questionCount={INITIAL_QUESTION_COUNT}
          onNext={(questionID, responseID) =>
            send({ type: 'FLOW.QUESTION_RESPONSE', questionID, responseID })
          }
          onLogin={() => send({ type: 'FLOW.GOTO_LOGIN' })}
        />
      )}
      {(state.matches('intro.signup.auth') || state.matches('intro.login')) &&
        state.children.authFlow && (
          <AuthFlow
            authFlow={state.children.authFlow}
            onGotoLogin={() => send({ type: 'FLOW.GOTO_LOGIN' })}
            onGotoSignup={() => send({ type: 'FLOW.GOTO_SIGNUP' })}
          />
        )}
      {state.matches('call') && (
        <CallFlow
          call={state.children.call}
          push={state.children.push}
          isLoadingQuestions={questionsState.matches('loader.loading')}
          currentQuestion={questionsState.context.questionsQueue[0]}
          onQuestionResponse={(questionID, responseID) => {
            send({ type: 'FLOW.QUESTION_RESPONSE', questionID, responseID })
          }}
          onEndCall={() => send({ type: 'FLOW.END_CALL' })}
          onLogout={() => send({ type: 'FLOW.LOGOUT' })}
        />
      )}
      {state.matches('afterCall') && (
        <CallOverScreen
          isSending={state.matches('afterCall.working')}
          onSubmit={(feedback, report) => {
            send({ type: 'FLOW.SUBMIT_FEEDBACK', feedback, report })
          }}
        />
      )}
      {state.matches('share') && (
        <ShareScreen
          onShareInitiated={() => {
            send({ type: 'FLOW.SHARE_INITIATED' })
          }}
          onDone={() => {
            send({ type: 'FLOW.SHARE_DONE' })
          }}
        />
      )}
      {state.matches('offerNotifications') && (
        <NotificationsScreen
          onNotify={() => pushSend({ type: 'PUSH.REGISTER' })}
          isRegisteringNotifications={pushState.matches('registering')}
          onDone={() => {
            send({ type: 'FLOW.NOTIFICATIONS_DONE' })
          }}
        />
      )}
    </>
  )
}
