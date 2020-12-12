import * as React from 'react'
import { useMachine } from '@xstate/react'

import SessionMachine, {
  SessionContext,
  SessionEvent,
} from '../stateMachine/SessionMachine'
import { ErrorScreen } from './screens'
import Flow from './Flow'
import UnsupportedBrowserScreen from './screens/UnsupportedBrowserScreen'
import clipboardCopy from 'clipboard-copy'

export default function App() {
  const [state, send] = useMachine<SessionContext, SessionEvent>(SessionMachine)
  return (
    <>
      {state.matches('error') && (
        <ErrorScreen onAction={() => send({ type: 'SESSION.START' })} />
      )}
      {state.matches('unsupported') && (
        <UnsupportedBrowserScreen
          isIOS={state.context.isIOS}
          onPressCopy={() => clipboardCopy('https://partyline.chat')}
        />
      )}
      {state.matches('session') && <Flow flow={state.children.flow} />}
    </>
  )
}
