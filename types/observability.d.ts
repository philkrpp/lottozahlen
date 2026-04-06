import type { openobserveRum } from '@openobserve/browser-rum'
import type { openobserveLogs } from '@openobserve/browser-logs'
import type { Tracer } from '@opentelemetry/api'

declare module '#app' {
  interface NuxtApp {
    $o2Rum: typeof openobserveRum
    $o2Logs: typeof openobserveLogs
    $otelTracer: Tracer
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $o2Rum: typeof openobserveRum
    $o2Logs: typeof openobserveLogs
    $otelTracer: Tracer
  }
}

export {}
