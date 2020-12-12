import * as React from 'react'
import { Actor, State } from 'xstate'
import { useActor } from '@xstate/react'

import type { Question } from '../types'
import { CallContext, CallEvent } from '../stateMachine/CallMachine'
import { PushContext, PushEvent } from '../stateMachine/PushMachine'
import { PreMatchScreen, InCallScreen } from './screens'
import { API_ENDPOINT } from '../constants'
import { messaging } from 'firebase/app'

type CallFlowProps = {
  call: Actor<State<CallContext>, CallEvent>
  push: Actor<State<PushContext>, PushEvent>
  isLoadingQuestions: boolean
  currentQuestion: Question
  onQuestionResponse: (questionID: number, responseID: number) => void
  onEndCall: () => void
  onLogout: () => void
}

const isNotificationSupported = messaging.isSupported()

const addToCalendar = () => {
  window.open(API_ENDPOINT + '/event.ics')
}

export default function CallFlow({
  call,
  push,
  isLoadingQuestions,
  currentQuestion,
  onQuestionResponse,
  onEndCall,
  onLogout,
}: CallFlowProps) {
  const [state, send] = useActor<CallEvent, State<CallContext>>(call)
  const [pushState, pushSend] = useActor<PushEvent, State<PushContext>>(push)
  return (
    <>
      {state.matches('flow.preMatch') && (
        <PreMatchScreen
          isTimedOut={state.matches('flow.preMatch.wait.timedOut')}
          canJoin={state.matches('flow.preMatch.connection.readyToMatch')}
          isLoadingQuestions={isLoadingQuestions}
          isRegisteringNotifications={pushState.matches('registering')}
          isNotificationsRegistered={pushState.matches('enabled')}
          currentQuestion={currentQuestion}
          onlineCount={state.context.onlineCount}
          onNextQuestion={onQuestionResponse}
          onNotify={() => pushSend({ type: 'PUSH.REGISTER' })}
          onJoin={() => send({ type: 'CALL.START_MATCHING' })}
          onLogout={onLogout}
          onCalendar={() => addToCalendar()}
          isNotificationUnsupported={!isNotificationSupported}
        />
      )}
      {!state.matches('flow.preMatch') && (
        <InCallScreen
          micStream={state.context.micStream}
          remoteStream={state.context.remoteStream}
          callStartTime={state.context.startTime}
          partner={state.context.partner}
          prompts={state.context.prompts}
          talkingCount={state.context.talkingCount}
          answeringQuestionsCount={
            state.context.onlineCount - state.context.talkingCount
          }
          isConnected={state.matches('flow.inCall.active.connected')}
          isRemoteEnded={state.matches('flow.ended')}
          onEndCall={onEndCall}
        />
      )}
    </>
  )
}
