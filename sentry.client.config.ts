import * as Sentry from '@sentry/nuxt'
import { release } from './build-release.json'

const dsn = useRuntimeConfig().public.sentryDsn

if (dsn) {
  Sentry.init({
    dsn,
    release,
    tracesSampleRate: 1.0,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.captureConsoleIntegration({ levels: ['log', 'warn', 'error'] }),
    ],
  })
}
