import { Machine, assign, actions, DoneInvokeEvent } from 'xstate'

import { fetchQuestions, sendResponse } from '../api'
import { captureError } from './actions'
import type { Question, ResponseSaveRequest } from '../types'

export interface QuestionsContext {
  questionsQueue: Array<Question>
  responsesQueue: Array<ResponseSaveRequest>

  // HACK:
  finishedQuestions: Set<number>
}

export type QuestionsEvent =
  | { type: 'QUESTIONS.FLUSH_AND_LOAD' }
  | { type: 'QUESTIONS.QUEUE_SENDING' }
  | { type: 'QUESTIONS.RESUME_SENDING' }
  | { type: 'QUESTIONS.SENT_RESPONSE' }
  | { type: 'FLOW.QUESTION_RESPONSE'; questionID: number; responseID: number }

const popResponse = assign({
  responsesQueue: ({ responsesQueue }) => responsesQueue.slice(1),
})

const storeResponse = [
  assign<QuestionsContext>({
    responsesQueue: (
      { responsesQueue },
      {
        questionID,
        responseID,
      }: QuestionsEvent & { type: 'FLOW.QUESTIONS_RESPONSE' },
    ) => [...responsesQueue, { questionID, responseID }],
  }),
  assign<QuestionsContext>({
    questionsQueue: ({ questionsQueue }) => questionsQueue.slice(1),
  }),
]

const QuestionsMachine = Machine<QuestionsContext, QuestionsEvent>({
  id: 'questions',
  type: 'parallel',
  context: {
    questionsQueue: [],
    responsesQueue: [],
    finishedQuestions: new Set(),
  },
  states: {
    status: {
      initial: 'queueing',
      states: {
        queueing: {
          on: { 'QUESTIONS.RESUME_SENDING': 'sending' },
        },
        sending: {
          on: { 'QUESTIONS.QUEUE_SENDING': 'queueing' },
        },
      },
    },
    sender: {
      initial: 'idle',
      on: {
        'FLOW.QUESTION_RESPONSE': {
          actions: storeResponse,
        },
      },
      states: {
        idle: {
          always: {
            target: 'sending',
            cond: ({ responsesQueue }) => responsesQueue.length > 0,
            in: '#questions.status.sending',
          },
        },
        sending: {
          invoke: {
            id: 'sendResponse',
            src: ({ responsesQueue }) =>
              sendResponse({
                questionID: responsesQueue[0].questionID,
                responseID: responsesQueue[0].responseID,
              }),
            onError: {
              target: 'failed',
              actions: [
                actions.log((_, ev) => ev, 'Error sending response'),
                captureError,
              ],
            },
            onDone: [
              {
                cond: ({ responsesQueue }) => responsesQueue.length > 1,
                target: 'sending',
                actions: popResponse,
              },
              {
                target: 'idle',
                actions: popResponse,
              },
            ],
          },
          entry: assign({
            finishedQuestions: ({ finishedQuestions, responsesQueue }) =>
              finishedQuestions.add(responsesQueue[0].questionID),
          }),
        },
        failed: {
          on: {
            'FLOW.QUESTION_RESPONSE': {
              actions: storeResponse,
              target: 'idle',
            },
          },
        },
      },
    },
    loader: {
      initial: 'idle',
      states: {
        idle: {
          on: {
            'FLOW.QUESTION_RESPONSE': {
              target: 'loading',
              cond: ({ questionsQueue }) => questionsQueue.length <= 1,
            },
            'QUESTIONS.FLUSH_AND_LOAD': {
              target: 'loading',
              actions: assign<QuestionsContext>({ questionsQueue: [] }),
            },
          },
        },
        loading: {
          initial: 'waitForSend',
          states: {
            // If we're currently sending a response, we need to wait for it to complete before we can load the next question.
            waitForSend: {
              always: {
                target: 'fetch',
                in: '#questions.sender.idle',
              },
            },
            fetch: {
              invoke: {
                id: 'fetchQuestions',
                src: () => fetchQuestions(),
                onError: {
                  actions: [
                    actions.log((_, ev) => ev, 'Error fetching questions'),
                    actions.escalate((_, { data }) => ({
                      message: 'Unable to fetch questions',
                      err: data,
                    })),
                  ],
                },
                onDone: {
                  target: '#questions.loader.idle',
                  actions: assign({
                    questionsQueue: (
                      { questionsQueue, finishedQuestions },
                      ev: DoneInvokeEvent<Array<Question>>,
                    ) =>
                      [...questionsQueue, ...ev.data]
                        // HACK: Remove duplicates from the server
                        .filter((q) => !finishedQuestions.has(q.questionID)),
                  }),
                },
              },
            },
          },
        },
      },
    },
  },
})

export default QuestionsMachine
