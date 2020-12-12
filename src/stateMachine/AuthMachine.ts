import {
  Machine,
  assign,
  sendParent,
  actions,
  DoneInvokeEvent,
  InvokeCreator,
} from 'xstate'
import { auth, User } from 'firebase/app'
import * as Sentry from '@sentry/browser'
import { checkAccountExists } from '../api'

export interface AuthContext {
  user: firebase.User
}

type SignedInEvent = {
  type: 'AUTH.SIGNED_IN'
  user: User
}
type AuthenticatedEvent = {
  type: 'AUTH.AUTHENTICATED'
  user: User
  token: string
}
type LoggedOutEvent = {
  type: 'AUTH.LOGGED_OUT'
}
type CheckAccountEvent = {
  type: 'AUTH.CHECK_ACCOUNT_EXISTS'
}
type LogoutEvent = {
  type: 'AUTH.LOGOUT'
}
export type AuthEvent =
  | SignedInEvent
  | AuthenticatedEvent
  | LoggedOutEvent
  | CheckAccountEvent
  | LogoutEvent

const watchAuth: InvokeCreator<any, AuthEvent> = (_, event) => (
  callback,
  _,
) => {
  const unsubscribe = auth().onAuthStateChanged(async (user) => {
    if (user) {
      Sentry.setUser({
        id: user.uid,
      })
    }
    callback(
      user ? { type: 'AUTH.SIGNED_IN', user } : { type: 'AUTH.LOGGED_OUT' },
    )
  })

  return unsubscribe
}

async function performCheckAccountExists() {
  // Ensure that the backend agrees with Firebase auth that a valid user is logged in -- otherwise log out of Firebase auth.
  const accountExists = await checkAccountExists()
  if (!accountExists) {
    await logout()
  }
}

export async function fetchToken() {
  return await auth().currentUser.getIdToken()
}

export async function logout() {
  await auth().signOut()
}

const AuthMachine = Machine<AuthContext, AuthEvent>({
  id: 'auth',
  initial: 'init',
  context: {
    user: null,
  },
  invoke: {
    id: 'watchAuth',
    src: watchAuth,
  },
  on: {
    'AUTH.SIGNED_IN': {
      target: '.signedIn',
      actions: assign({
        user: (_, ev) => ev.user,
      }),
    },
    'AUTH.LOGGED_OUT': {
      target: '.loggedOut',
      actions: sendParent({ type: 'FLOW.LOGGED_OUT' }),
    },
    'AUTH.LOGOUT': {
      actions: logout,
    },
    'AUTH.CHECK_ACCOUNT_EXISTS': {
      actions: performCheckAccountExists,
    },
  },
  states: {
    init: {},
    loggedOut: {},
    signedIn: {
      entry: sendParent(({ user }) => ({
        type: 'FLOW.AUTHENTICATED',
        user,
      })),
    },
  },
})

export default AuthMachine
