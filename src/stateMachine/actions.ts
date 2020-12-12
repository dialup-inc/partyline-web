import { ActionTypes } from 'xstate'
import { analytics } from 'firebase/app'
import * as Sentry from '@sentry/browser'

export function logEvent<Context, Event>(
  nameOrFunc: string | ((context: Context, event: Event) => string),
) {
  return (context: Context, event: Event) => {
    let name
    if (typeof nameOrFunc === 'string') {
      name = nameOrFunc
    } else {
      name = nameOrFunc(context, event)
    }
    analytics().logEvent(name)
  }
}

export type ErrorEvent = {
  type: ActionTypes.ErrorCustom
  data:
    | {
        message?: string
        err?: Error
      }
    | Error
}

export function captureError<Context>(_: Context, { data }: ErrorEvent) {
  if (data instanceof Error) {
    Sentry.captureException(data)
    return
  }
  const { err, message } = data
  Sentry.captureException(err, {
    extra: {
      message,
    },
  })
}
