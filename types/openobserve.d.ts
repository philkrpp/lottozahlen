import type { openobserveRum } from '@openobserve/browser-rum'
import type { openobserveLogs } from '@openobserve/browser-logs'

declare module '#app' {
  interface NuxtApp {
    $o2Rum: typeof openobserveRum
    $o2Logs: typeof openobserveLogs
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $o2Rum: typeof openobserveRum
    $o2Logs: typeof openobserveLogs
  }
}

export {}
