import { openobserveRum } from '@openobserve/browser-rum'
import { openobserveLogs } from '@openobserve/browser-logs'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const { o2Site, o2ClientToken, o2Org, appVersion } = config.public

  if (!o2Site || !o2ClientToken) {
    console.warn('[O2] Konfiguration fehlt — RUM deaktiviert.')
    return
  }

  const serviceName = 'lottozahlen'
  const version = appVersion // z.B. "1.0.1-dev" oder "1.0.1+20260405-114700"
  const env = import.meta.dev ? 'development' : 'production'

  // --- RUM ---
  openobserveRum.init({
    applicationId: serviceName,
    clientToken: o2ClientToken,
    site: o2Site,
    organizationIdentifier: o2Org,
    service: serviceName,
    env,
    version,
    trackResources: true,
    trackLongTasks: true,
    trackUserInteractions: true,
    apiVersion: 'v1',
    insecureHTTP: false,
    defaultPrivacyLevel: 'mask-user-input',
    sessionSampleRate: 100,
    sessionReplaySampleRate: 100,
  })

  // --- Logs (leitet ALLE console.* automatisch weiter) ---
  openobserveLogs.init({
    clientToken: o2ClientToken,
    site: o2Site,
    organizationIdentifier: o2Org,
    service: serviceName,
    env,
    version,
    forwardErrorsToLogs: true,
    forwardConsoleLogs: 'all',
    forwardReports: 'all',
    insecureHTTP: false,
    apiVersion: 'v1',
  })

  // --- Session Replay starten (100%) ---
  openobserveRum.startSessionReplayRecording()

  // --- Globale unhandled Promise Rejections abfangen ---
  window.addEventListener('unhandledrejection', (event) => {
    openobserveLogs.logger.error(`Unhandled Promise Rejection: ${event.reason}`, {
      source: 'unhandledrejection',
      reason: String(event.reason),
      stack: event.reason?.stack || '',
    })
  })

  return {
    provide: {
      o2Rum: openobserveRum,
      o2Logs: openobserveLogs,
    },
  }
})
