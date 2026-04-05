import type { openobserveRum } from '@openobserve/browser-rum'
import type { openobserveLogs } from '@openobserve/browser-logs'

export function useO2() {
  const nuxtApp = useNuxtApp()

  const rum = nuxtApp.$o2Rum as typeof openobserveRum | undefined
  const logs = nuxtApp.$o2Logs as typeof openobserveLogs | undefined

  function setUser(user: { id: string; name?: string; email?: string; [key: string]: any }) {
    rum?.setUser(user)
  }

  function clearUser() {
    rum?.clearUser()
  }

  function trackAction(name: string, context?: Record<string, any>) {
    rum?.addAction(name, context || {})
  }

  function trackError(message: string, context?: Record<string, any>) {
    logs?.logger.error(message, { source: 'custom', ...context })
  }

  function trackInfo(message: string, context?: Record<string, any>) {
    logs?.logger.info(message, { source: 'custom', ...context })
  }

  return { rum, logs, setUser, clearUser, trackAction, trackError, trackInfo }
}
