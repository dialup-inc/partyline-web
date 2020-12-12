import { Machine, actions, sendParent } from 'xstate'
import { messaging } from 'firebase/app'
import * as Sentry from '@sentry/browser'

import { PUSH_VAPID_KEY } from '../constants'
import { savePushToken } from '../api'

export interface PushContext {}

type RegisterEvent = {
  type: 'PUSH.REGISTER'
}
export type PushEvent = RegisterEvent

export async function register() {
  const token = await messaging().getToken({
    vapidKey: PUSH_VAPID_KEY,
  })
  await savePushToken(token)
}

const PushMachine = Machine<PushContext, PushEvent>({
  id: 'push',
  initial: 'init',
  context: {},
  states: {
    init: {
      on: { 'PUSH.REGISTER': 'registering' },
    },
    registering: {
      invoke: {
        id: 'register',
        src: register,
        onError: {
          actions: actions.escalate((_, { data }) => ({
            message: 'Failed to register push token',
            err: data,
          })),
        },
        onDone: 'enabled',
      },
    },
    enabled: {
      entry: sendParent('FLOW.NOTIFICATIONS_ENABLED'),
    },
  },
})

export default PushMachine
