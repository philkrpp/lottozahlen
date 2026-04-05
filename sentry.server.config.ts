import * as Sentry from '@sentry/nuxt'
import { release } from './build-release.json'

const dsn = process.env.SENTRY_DSN

if (dsn) {
  Sentry.init({
    dsn,
    release,
    tracesSampleRate: 1.0,
  })
}
