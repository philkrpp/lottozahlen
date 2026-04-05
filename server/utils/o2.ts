import { createConsola } from 'consola'

// --- Batch-Buffer für OpenObserve ---
const LOG_BUFFER: Record<string, any>[] = []
const FLUSH_INTERVAL_MS = 5_000
const MAX_BUFFER_SIZE = 50
let flushTimer: ReturnType<typeof setInterval> | null = null

async function flushLogs() {
  if (LOG_BUFFER.length === 0) return

  const config = useRuntimeConfig()
  if (!config.o2ApiUrl || !config.o2AuthUser || !config.o2AuthPassword) return

  const batch = LOG_BUFFER.splice(0)
  const authToken = Buffer.from(`${config.o2AuthUser}:${config.o2AuthPassword}`).toString('base64')
  const streamName = 'lottozahlen_server_logs'

  try {
    await $fetch(`${config.o2ApiUrl}/${streamName}/_json`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: batch,
    })
  } catch (err) {
    // Logs zurück in Buffer, aber Memory-Limit beachten
    if (LOG_BUFFER.length < 500) {
      LOG_BUFFER.unshift(...batch)
    }
    // Nur in Console loggen, nicht rekursiv an O2 senden
    console.error('[O2] Log-Flush fehlgeschlagen:', err)
  }
}

function queueLog(level: string, message: string, meta: Record<string, any> = {}) {
  const config = useRuntimeConfig()

  LOG_BUFFER.push({
    _timestamp: Date.now() * 1000, // Mikrosekunden für OpenObserve
    level,
    message,
    service: 'lottozahlen',
    version: config.public.appVersion,
    env: process.dev ? 'development' : 'production',
    component: 'server',
    ...meta,
  })

  if (LOG_BUFFER.length >= MAX_BUFFER_SIZE) {
    flushLogs()
  }

  if (!flushTimer) {
    flushTimer = setInterval(flushLogs, FLUSH_INTERVAL_MS)
  }
}

/**
 * Server-Logger: loggt sowohl in die Console (via consola) als auch an OpenObserve.
 *
 * Nutzung:
 *   const log = useO2Logger('api:users')
 *   log.info('User erstellt', { userId: '123' })
 */
export function useO2Logger(module: string) {
  const consola = createConsola({ defaults: { tag: module } })

  return {
    debug(message: string, meta: Record<string, any> = {}) {
      consola.debug(message, meta)
      queueLog('debug', message, { module, ...meta })
    },
    info(message: string, meta: Record<string, any> = {}) {
      consola.info(message, meta)
      queueLog('info', message, { module, ...meta })
    },
    warn(message: string, meta: Record<string, any> = {}) {
      consola.warn(message, meta)
      queueLog('warn', message, { module, ...meta })
    },
    error(message: string, meta: Record<string, any> = {}) {
      consola.error(message, meta)
      queueLog('error', message, { module, ...meta })
    },
    fatal(message: string, meta: Record<string, any> = {}) {
      consola.fatal(message, meta)
      queueLog('fatal', message, { module, ...meta })
    },
  }
}

/**
 * Manueller Flush — aufrufen bei Server-Shutdown.
 */
export async function flushO2Logs() {
  if (flushTimer) {
    clearInterval(flushTimer)
    flushTimer = null
  }
  await flushLogs()
}
