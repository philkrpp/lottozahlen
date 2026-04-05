import * as Sentry from '@sentry/nuxt'
import { consola } from 'consola'

export default defineNitroPlugin(() => {
  if (!process.env.SENTRY_DSN) return

  consola.addReporter({
    log(logObj) {
      if (logObj.level <= 1) {
        const errorArg = logObj.args.find((arg) => arg instanceof Error)
        if (errorArg) {
          Sentry.captureException(errorArg, {
            extra: { consolaTag: logObj.tag },
          })
        } else {
          Sentry.captureMessage(logObj.args.map(String).join(' '), {
            level: logObj.level === 0 ? 'fatal' : 'error',
            extra: { consolaTag: logObj.tag },
          })
        }
      } else if (logObj.level === 2) {
        Sentry.addBreadcrumb({
          category: 'consola',
          message: logObj.args.map(String).join(' '),
          level: 'warning',
        })
      }
    },
  })
})
