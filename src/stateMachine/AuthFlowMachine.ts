import {
  Machine,
  assign,
  send,
  sendParent,
  actions,
  DoneInvokeEvent,
  StateNodeConfig,
} from 'xstate'
import { auth, analytics } from 'firebase/app'

import { logEvent } from './actions'
import { checkAccountExists, setProfile } from '../api'
import recaptchaService, { RecaptchaEvent } from './recaptchaService'
import { logout } from './AuthMachine'

export interface AuthFlowContext {
  mode: 'signup' | 'login'
  age: number
  state: string
  email: string
  phoneNumber: string
  phoneNumberErrorText: string
  authConfirmation: auth.ConfirmationResult
  authCodeErrorText: string
  recaptchaVerifier: auth.RecaptchaVerifier
}

type UserInfoEvent = {
  type: 'AUTH_FLOW.USER_INFO'
  age: number
  state: string
}
type SignupEvent = {
  type: 'AUTH_FLOW.SIGNUP'
  phoneNumber: string
  email: string
}
type LoginEvent = {
  type: 'AUTH_FLOW.LOGIN'
  phoneNumber: string
}
type VerifyCodeEvent = {
  type: 'AUTH_FLOW.VERIFY_CODE'
  code: string
}
type ResendCodeEvent = {
  type: 'AUTH_FLOW.RESEND_CODE'
}

export type AuthFlowEvent =
  | UserInfoEvent
  | VerifyCodeEvent
  | ResendCodeEvent
  | RecaptchaEvent
  | SignupEvent
  | LoginEvent

async function firebaseSignIn(context: AuthFlowContext) {
  await auth().setPersistence(auth.Auth.Persistence.LOCAL)
  return await auth().signInWithPhoneNumber(
    context.phoneNumber,
    context.recaptchaVerifier,
  )
}

async function verifyCode(context: AuthFlowContext, event: VerifyCodeEvent) {
  const { user } = await context.authConfirmation.confirm(event.code)
  analytics().setUserId(user.uid)
  return user
}

async function performSetProfile(...args: Parameters<typeof setProfile>) {
  try {
    await setProfile(...args)
  } catch (err) {
    if (err.code === 'conflict') {
      // Profiles can only be set once. We'll ignore the error if the profile has been set before.
      return
    }
    throw err
  }
}

const AuthFlowMachine = Machine<AuthFlowContext, AuthFlowEvent>({
  id: 'authFlow',
  initial: 'init',
  context: {
    mode: 'signup',
    phoneNumber: null,
    phoneNumberErrorText: null,
    email: null,
    age: null,
    state: null,
    authConfirmation: null,
    authCodeErrorText: null,
    recaptchaVerifier: null,
  },
  invoke: [
    {
      id: 'recaptchaService',
      src: recaptchaService,
    },
  ],
  entry: logEvent('start_auth_flow'),
  exit: logEvent('end_auth_flow'),
  states: {
    init: {
      always: [
        { target: 'userInfo', cond: ({ mode }) => mode === 'signup' },
        { target: 'auth' },
      ],
    },
    userInfo: {
      entry: logEvent('start_user_info'),
      on: {
        'AUTH_FLOW.USER_INFO': {
          target: 'auth',
          actions: assign((_, { age, state }) => ({ age, state })),
        },
      },
      exit: sendParent('FLOW.INTRO_STEP'),
    },
    auth: {
      initial: 'idle',
      entry: logEvent(({ mode }) =>
        mode === 'signup' ? 'start_signup' : 'start_login',
      ),
      states: {
        idle: {
          on: {
            'AUTH_FLOW.SIGNUP': {
              actions: assign((_, { email, phoneNumber }: SignupEvent) => ({
                email,
                phoneNumber,
              })),
              target: 'working',
            },
            'AUTH_FLOW.LOGIN': {
              actions: assign((_, { phoneNumber }: LoginEvent) => ({
                phoneNumber,
              })),
              target: 'working',
            },
          },
          exit: sendParent('FLOW.INTRO_STEP'),
        },
        working: {
          initial: 'captcha',
          entry: [
            logEvent('start_captcha'),
            assign<AuthFlowContext>({ phoneNumberErrorText: null }),
          ],
          states: {
            captcha: {
              entry: send(
                { type: 'RECAPTCHA.SHOW' },
                { to: 'recaptchaService' },
              ),
              on: {
                'RECAPTCHA.SUCCESS': {
                  actions: assign({
                    recaptchaVerifier: (_, { recaptchaVerifier }) =>
                      recaptchaVerifier,
                  }),
                  target: 'firebaseSignIn',
                },
                'RECAPTCHA.CANCEL': '#authFlow.auth',
              },
            },
            firebaseSignIn: {
              invoke: {
                id: 'firebaseSignIn',
                src: firebaseSignIn,
                onError: [
                  {
                    target: '#authFlow.auth',
                    actions: assign({
                      phoneNumberErrorText:
                        'Too many requests. Please try again in 20 minutes.',
                    }),
                    cond: (_, { data }) =>
                      data.code === 'auth/too-many-requests',
                  },
                  {
                    actions: actions.escalate((_, { data }) => ({
                      message: 'Error signing in',
                      err: data,
                    })),
                  },
                ],
                onDone: {
                  target: '#authFlow.verifyCode',
                  actions: assign({
                    authConfirmation: (
                      _,
                      ev: DoneInvokeEvent<auth.ConfirmationResult>,
                    ) => ev.data,
                  }),
                },
              },
            },
          },
        },
      },
    },
    verifyCode: {
      initial: 'idle',
      states: {
        idle: {
          entry: logEvent('start_verify_code'),
          on: {
            'AUTH_FLOW.VERIFY_CODE': 'working',
            'AUTH_FLOW.RESEND_CODE': '#authFlow.auth',
          },
          exit: sendParent('FLOW.INTRO_STEP'),
        },
        working: {
          initial: 'confirm',
          states: {
            confirm: {
              entry: assign<AuthFlowContext>({ authCodeErrorText: null }),
              invoke: {
                id: 'verifyCode',
                src: verifyCode,
                onError: [
                  {
                    target: '#authFlow.verifyCode',
                    actions: assign({
                      authCodeErrorText: 'Invalid. Check for typos.',
                    }),
                    cond: (_, { data }) =>
                      data.code === 'auth/invalid-verification-code',
                  },
                  {
                    target: '#authFlow.auth',
                    actions: assign({
                      phoneNumberErrorText: 'Code expired. Please try again.',
                    }),
                    cond: (_, { data }) => data.code === 'auth/code-expired',
                  },
                  {
                    actions: actions.escalate((_, { data }) => ({
                      message: 'Error verifying auth code',
                      err: data,
                    })),
                  },
                ],
                onDone: [
                  {
                    target: 'setProfile',
                    cond: ({ mode }) => mode === 'signup',
                  },
                  {
                    target: 'checkAccount',
                    cond: ({ mode }) => mode === 'login',
                  },
                ],
              },
            },
            setProfile: {
              invoke: {
                id: 'setProfile',
                src: ({ email, age, state }) =>
                  performSetProfile({ email, age, state }),
                onError: {
                  actions: [
                    actions.escalate((_, { data }) => ({
                      message: 'Error setting profile',
                      err: data,
                    })),
                  ],
                },
                onDone: {
                  target: '#authFlow.done',
                },
              },
            },
            checkAccount: {
              invoke: {
                id: 'checkAccountExists',
                src: checkAccountExists,
                onError: {
                  actions: [
                    actions.escalate((_, { data }) => ({
                      message: 'Error getting profile',
                      err: data,
                    })),
                  ],
                },
                onDone: [
                  {
                    target: '#authFlow.accountRequired',
                    actions: logout,
                    cond: (_, { data }) => !data,
                  },
                  {
                    target: '#authFlow.done',
                  },
                ],
              },
            },
          },
        },
      },
    },
    accountRequired: {},
    done: {
      type: 'final',
    },
  },
})

export default AuthFlowMachine
