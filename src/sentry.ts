import * as Sentry from '@sentry/browser'
import { Integrations } from '@sentry/tracing'

Sentry.init({
  dsn: '',
  integrations: [new Integrations.BrowserTracing()],
  tracesSampleRate: 1.0,
  release: `party-line-web@${process.env.GIT_COMMIT_HASH}`,
})
