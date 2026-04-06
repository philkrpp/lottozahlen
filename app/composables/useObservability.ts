import type { openobserveRum } from '@openobserve/browser-rum'
import type { openobserveLogs } from '@openobserve/browser-logs'
import type { Tracer } from '@opentelemetry/api'
import { SpanStatusCode } from '@opentelemetry/api'
import * as Sentry from '@sentry/nuxt'

export function useObservability() {
  const nuxtApp = useNuxtApp()

  const rum = nuxtApp.$o2Rum as typeof openobserveRum | undefined
  const logs = nuxtApp.$o2Logs as typeof openobserveLogs | undefined
  const tracer = nuxtApp.$otelTracer as Tracer | undefined

  function setUser(user: { id: string; name?: string; email?: string; [key: string]: any }) {
    rum?.setUser(user)
    Sentry.setUser(user)
  }

  function clearUser() {
    rum?.clearUser()
    Sentry.setUser(null)
  }

  function trackAction(name: string, context?: Record<string, any>) {
    rum?.addAction(name, context || {})
    if (tracer) {
      const span = tracer.startSpan(`action:${name}`, {
        attributes: context as Record<string, string>,
      })
      span.end()
    }
  }

  function trackError(message: string, context?: Record<string, any>) {
    logs?.logger.error(message, { source: 'custom', ...context })
    Sentry.captureMessage(message, { level: 'error', extra: context })
    if (tracer) {
      const span = tracer.startSpan(`error:${message}`)
      span.setStatus({ code: SpanStatusCode.ERROR, message })
      if (context) {
        for (const [k, v] of Object.entries(context)) {
          span.setAttribute(k, String(v))
        }
      }
      span.end()
    }
  }

  function trackInfo(message: string, context?: Record<string, any>) {
    logs?.logger.info(message, { source: 'custom', ...context })
    if (tracer) {
      const span = tracer.startSpan(`info:${message}`)
      if (context) {
        for (const [k, v] of Object.entries(context)) {
          span.setAttribute(k, String(v))
        }
      }
      span.end()
    }
  }

  return { rum, logs, tracer, setUser, clearUser, trackAction, trackError, trackInfo }
}
