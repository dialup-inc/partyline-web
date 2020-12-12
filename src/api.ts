import { auth } from 'firebase/app'
import { getActiveTransaction } from '@sentry/tracing'

import { API_ENDPOINT } from './constants'
import type {
  Question,
  PushTokenSaveRequest,
  ResponseSaveRequest,
} from './types'

import addRetry from 'fetch-retry'
const fetchRetry = addRetry(fetch)

class APIError extends Error {
  code: string
  constructor(msg: string, code: string) {
    super(msg)
    Object.setPrototypeOf(this, APIError.prototype)
    this.code = code
  }
}

function traceHeaders() {
  const tx = getActiveTransaction()
  if (!tx) {
    return
  }
  const traceparent = tx.toTraceparent()
  return { traceparent }
}

async function authorizationHeader() {
  if (!auth().currentUser) {
    return
  }
  const token = await auth().currentUser.getIdToken()
  return { Authorization: `Bearer ${token}` }
}

async function request(
  url: string,
  options: RequestInit & { retry?: boolean } = {},
): Promise<Response> {
  const { retry, headers, ...remainingOptions } = options

  const authHeader = await authorizationHeader()

  let retryOptions
  if (retry) {
    retryOptions = {
      retryOn: (_: any, error: Error, resp: Response) =>
        error !== null || resp.status !== 200,
      // truncated exponential backoff
      retryDelay: (attempt: number) => {
        const seconds = Math.min(32, Math.pow(2, attempt) + Math.random())
        return seconds * 1000
      },
    }
  } else {
    retryOptions = { retries: 0 }
  }

  const resp = await fetchRetry(url, {
    ...remainingOptions,
    headers: {
      ...headers,
      ...authHeader,
      ...traceHeaders(),
    },
    ...retryOptions,
  })
  if (!resp.ok) {
    const body = await resp.json()
    throw new APIError(body.error.message, body.error.code)
  }
  return resp
}

export async function fetchQuestions(): Promise<Array<Question>> {
  const resp = await request(`${API_ENDPOINT}/questions`, { retry: true })
  const questions: Array<Question> = await resp.json()
  return questions
}

export async function sendResponse(req: ResponseSaveRequest) {
  const resp = await request(`${API_ENDPOINT}/responses`, {
    method: 'POST',
    body: JSON.stringify(req),
    retry: true,
  })
}

export async function getProfile() {
  const resp = await request(`${API_ENDPOINT}/profile`)
  return await resp.json()
}

export async function setProfile({
  email,
  age,
  state,
}: {
  email: string
  age: number
  state: string
}) {
  const resp = await request(`${API_ENDPOINT}/profile`, {
    method: 'POST',
    body: JSON.stringify({ email, age, state }),
  })
}

export async function saveFeedback({
  matchID,
  feedback,
  report,
}: {
  matchID: number
  feedback: string
  report: string
}) {
  const resp = await request(`${API_ENDPOINT}/matches/${matchID}/feedback`, {
    method: 'POST',
    body: JSON.stringify({ feedback, report }),
    retry: true,
  })
}

export async function savePushToken(token: string) {
  const resp = await request(`${API_ENDPOINT}/push_tokens`, {
    method: 'POST',
    body: JSON.stringify({ token } as PushTokenSaveRequest),
  })
}

export async function checkAccountExists() {
  try {
    await getProfile()
  } catch (err) {
    if (err.code === 'not_exist') {
      return false
    }
    throw err
  }
  return true
}
