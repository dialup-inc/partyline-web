import { Machine, assign, actions, send, sendParent, forwardTo } from 'xstate'
import { User, analytics, messaging } from 'firebase/app'

import {
  INITIAL_QUESTION_COUNT,
  SIGN_UP_STEPS,
  SIGN_IN_STEPS,
} from '../constants'
import { logEvent } from './actions'
import { saveFeedback } from '../api'
import AuthMachine from './AuthMachine'
import AuthFlowMachine from './AuthFlowMachine'
import CallMachine from './CallMachine'
import PushMachine from './PushMachine'
import QuestionsMachine from './QuestionsMachine'

export interface FlowContext {
  matchID: number
  introStep: number
  introStepCount: number
  answeredQuestionCount: number
  hasNotificationsEnabled: boolean
}

export type FlowEvent =
  | { type: 'FLOW.AUTHENTICATED'; user: User }
  | { type: 'FLOW.LOGGED_OUT' }
  | { type: 'FLOW.INTRO_STEP' }
  | { type: 'FLOW.QUESTION_RESPONSE'; questionID: number; responseID: number }
  | { type: 'FLOW.GOTO_LOGIN' }
  | { type: 'FLOW.GOTO_SIGNUP' }
  | { type: 'FLOW.LOGOUT' }
  | { type: 'FLOW.END_CALL' }
  | { type: 'FLOW.CALL_ESTABLISHED'; matchID: number }
  | { type: 'FLOW.SUBMIT_FEEDBACK'; feedback: string; report: string }
  | { type: 'FLOW.SHARE_INITIATED' }
  | { type: 'FLOW.SHARE_DONE' }
  | { type: 'FLOW.NOTIFICATIONS_ENABLED' }
  | { type: 'FLOW.NOTIFICATIONS_DONE' }

const FlowMachine = Machine<FlowContext, FlowEvent>({
  id: 'flow',
  initial: 'intro',
  context: {
    matchID: null,
    introStep: null,
    introStepCount: null,
    answeredQuestionCount: null,
    hasNotificationsEnabled: false,
  },
  invoke: [
    {
      id: 'questions',
      src: QuestionsMachine,
      onError: {
        actions: actions.escalate((_, { data }) => data),
      },
    },
    {
      id: 'push',
      src: PushMachine,
      onError: {
        actions: actions.escalate((_, { data }) => data),
      },
    },
    {
      id: 'auth',
      src: AuthMachine,
      onError: {
        actions: actions.escalate((_, { data }) => data),
      },
    },
  ],
  on: {
    'FLOW.LOGGED_OUT': {
      actions: [
        send('QUESTIONS.PAUSE_SENDING', { to: 'questions' }),
        sendParent('SESSION.START'),
      ],
    },
    'FLOW.INTRO_STEP': {
      actions: assign({ introStep: ({ introStep }) => introStep + 1 }),
    },
    'FLOW.NOTIFICATIONS_ENABLED': {
      actions: assign<FlowContext>({ hasNotificationsEnabled: true }),
    },
  },
  states: {
    intro: {
      initial: 'loadingAuth',
      entry: assign({
        answeredQuestionCount: 0,
      }),
      on: {
        'FLOW.LOGGED_OUT': '.signup',
      },
      states: {
        loadingAuth: {
          on: {
            'FLOW.AUTHENTICATED': '#flow.call',
          },
        },
        signup: {
          initial: 'startingQuestions',
          on: {
            'FLOW.GOTO_LOGIN': 'login',
          },
          states: {
            startingQuestions: {
              entry: [
                logEvent('start_initial_questions'),
                assign(({ answeredQuestionCount }) => ({
                  introStep: answeredQuestionCount,
                  introStepCount: SIGN_UP_STEPS + INITIAL_QUESTION_COUNT,
                })),
                send({ type: 'QUESTIONS.FLUSH_AND_LOAD' }, { to: 'questions' }),
              ],
              on: {
                'FLOW.QUESTION_RESPONSE': {
                  actions: [
                    assign({
                      answeredQuestionCount: ({ answeredQuestionCount }) =>
                        answeredQuestionCount + 1,
                    }),
                    send('FLOW.INTRO_STEP'),
                    forwardTo('questions'),
                  ],
                },
              },
              always: {
                target: 'auth',
                cond: ({ answeredQuestionCount }) =>
                  answeredQuestionCount >= INITIAL_QUESTION_COUNT,
              },
            },
            auth: {
              invoke: {
                id: 'authFlow',
                src: AuthFlowMachine,
                data: { mode: 'signup' },
                onDone: '#flow.call',
                onError: {
                  actions: [
                    send({ type: 'AUTH.LOGOUT' }, { to: 'auth' }),
                    actions.escalate((_, ev) => ev),
                  ],
                },
              },
            },
          },
        },
        login: {
          entry: assign(() => ({
            introStep: INITIAL_QUESTION_COUNT,
            introStepCount: SIGN_IN_STEPS + INITIAL_QUESTION_COUNT,
          })),
          on: {
            // Override default handler if auth rolled back.
            'FLOW.LOGGED_OUT': undefined,
            'FLOW.GOTO_SIGNUP': 'signup',
          },
          invoke: {
            id: 'authFlow',
            src: AuthFlowMachine,
            data: { mode: 'login' },
            onError: {
              actions: [
                send({ type: 'AUTH.LOGOUT' }, { to: 'auth' }),
                actions.escalate((_, ev) => ev),
              ],
            },
            onDone: '#flow.call',
          },
        },
      },
      exit: assign<FlowContext>({ introStep: null }),
    },
    call: {
      entry: [
        send({ type: 'AUTH.CHECK_ACCOUNT_EXISTS' }, { to: 'auth' }),
        send({ type: 'QUESTIONS.RESUME_SENDING' }, { to: 'questions' }),
        send({ type: 'QUESTIONS.FLUSH_AND_LOAD' }, { to: 'questions' }),
        assign<FlowContext>({ matchID: null }),
      ],
      // FIXME: working around https://github.com/davidkpiano/xstate/issues/1109
      exit: logEvent('end_call_flow'),
      on: {
        'FLOW.QUESTION_RESPONSE': { actions: forwardTo('questions') },
        'FLOW.CALL_ESTABLISHED': {
          actions: assign({ matchID: (_, { matchID }) => matchID }),
        },
        'FLOW.LOGOUT': 'loggingOut',
        'FLOW.END_CALL': [
          { target: 'afterCall', cond: ({ matchID }) => !!matchID },
          { target: 'call', internal: false },
        ],
      },
      invoke: {
        id: 'call',
        src: CallMachine,
      },
    },
    afterCall: {
      initial: 'idle',
      entry: logEvent('start_feedback'),
      states: {
        idle: {
          on: {
            'FLOW.SUBMIT_FEEDBACK': 'working',
          },
        },
        working: {
          invoke: {
            id: 'saveFeedback',
            src: (
              { matchID },
              {
                feedback,
                report,
              }: FlowEvent & { type: 'FLOW.SUBMIT_FEEDBACK' },
            ) => saveFeedback({ matchID, feedback, report }),
            onError: {
              actions: actions.escalate((_, { data }) => ({
                message: 'Error sending feedback',
                err: data,
              })),
            },
            onDone: {
              target: '#flow.share',
            },
          },
        },
      },
    },
    share: {
      entry: logEvent('start_share'),
      on: {
        'FLOW.SHARE_DONE': [
          {
            target: 'call',
            cond: ({ hasNotificationsEnabled }) =>
              !messaging.isSupported() || hasNotificationsEnabled,
          },
          { target: 'offerNotifications' },
        ],
        'FLOW.SHARE_INITIATED': {
          actions: logEvent('share_initiated'),
        },
      },
    },
    offerNotifications: {
      entry: logEvent('start_notifications'),
      on: {
        'FLOW.NOTIFICATIONS_DONE': 'call',
        'FLOW.NOTIFICATIONS_ENABLED': {
          actions: assign<FlowContext>({ hasNotificationsEnabled: true }),
          target: 'call',
        },
      },
    },
    loggingOut: {
      entry: send({ type: 'AUTH.LOGOUT' }, { to: 'auth' }),
      on: {
        'FLOW.LOGGED_OUT': {
          actions: () => {
            window.location.assign('https://partyline.chat')
          },
        },
      },
    },
  },
})

export default FlowMachine
