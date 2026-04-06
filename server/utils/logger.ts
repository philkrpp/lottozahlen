import pino from 'pino'
import pinoPretty from 'pino-pretty'
import * as Sentry from '@sentry/nuxt'
import { Writable } from 'node:stream'

// --- Pino Level → OTEL Severity Mapping ---
const PINO_TO_OTEL_SEVERITY: Record<number, { number: number; text: string }> = {
  10: { number: 1, text: 'TRACE' },
  20: { number: 5, text: 'DEBUG' },
  30: { number: 9, text: 'INFO' },
  40: { number: 13, text: 'WARN' },
  50: { number: 17, text: 'ERROR' },
  60: { number: 21, text: 'FATAL' },
}

// --- OpenObserve Batch-Buffer ---
const O2_LOG_BUFFER: Record<string, any>[] = []
const FLUSH_INTERVAL_MS = 5_000
const MAX_BUFFER_SIZE = 50
let o2FlushTimer: ReturnType<typeof setInterval> | null = null

async function flushO2Buffer() {
  if (O2_LOG_BUFFER.length === 0) return

  const config = useRuntimeConfig()
  if (!config.o2ApiUrl || !config.o2AuthUser || !config.o2AuthPassword) return

  const batch = O2_LOG_BUFFER.splice(0)
  const authToken = Buffer.from(`${config.o2AuthUser}:${config.o2AuthPassword}`).toString('base64')
  const streamName = 'lottozahlen_server_logs'

  try {
    const res = await fetch(`${config.o2ApiUrl}/${streamName}/_json`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(batch),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
  } catch (err) {
    if (O2_LOG_BUFFER.length < 500) {
      O2_LOG_BUFFER.unshift(...batch)
    }
    console.error('[O2] Log-Flush fehlgeschlagen:', err)
  }
}

function startO2FlushTimer() {
  if (!o2FlushTimer) {
    o2FlushTimer = setInterval(flushO2Buffer, FLUSH_INTERVAL_MS)
  }
}

// --- OTEL (SigNoz) Batch-Buffer ---
const OTEL_LOG_BUFFER: Record<string, any>[] = []
let otelFlushTimer: ReturnType<typeof setInterval> | null = null

async function flushOtelBuffer() {
  if (OTEL_LOG_BUFFER.length === 0) return

  const config = useRuntimeConfig()
  if (!config.otelEndpoint) return

  const batch = OTEL_LOG_BUFFER.splice(0)

  const resourceAttributes = [
    { key: 'service.name', value: { stringValue: 'lottozahlen' } },
    { key: 'service.version', value: { stringValue: config.public.appVersion } },
    {
      key: 'deployment.environment.name',
      value: { stringValue: process.dev ? 'development' : 'production' },
    },
  ]

  const logRecords = batch.map((log) => ({
    timeUnixNano: String(log.timeUnixNano),
    severityNumber: log.severityNumber,
    severityText: log.severityText,
    body: { stringValue: log.message },
    attributes: log.attributes,
  }))

  const payload = {
    resourceLogs: [
      {
        resource: { attributes: resourceAttributes },
        scopeLogs: [
          {
            scope: { name: 'pino' },
            logRecords,
          },
        ],
      },
    ],
  }

  try {
    const res = await fetch(`${config.otelEndpoint}/v1/logs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
  } catch (err) {
    if (OTEL_LOG_BUFFER.length < 500) {
      OTEL_LOG_BUFFER.unshift(...batch)
    }
    console.error('[OTEL] Log-Flush fehlgeschlagen:', err)
  }
}

function startOtelFlushTimer() {
  if (!otelFlushTimer) {
    otelFlushTimer = setInterval(flushOtelBuffer, FLUSH_INTERVAL_MS)
  }
}

// --- OpenObserve Writable Stream ---
function createO2Stream(): Writable {
  return new Writable({
    write(chunk, _encoding, callback) {
      try {
        const logObj = JSON.parse(chunk.toString())
        const config = useRuntimeConfig()

        O2_LOG_BUFFER.push({
          _timestamp: Date.now() * 1000,
          level: pino.levels.labels[logObj.level] || 'info',
          message: logObj.msg,
          module: logObj.module || '',
          service: 'lottozahlen',
          version: config.public.appVersion,
          env: process.dev ? 'development' : 'production',
          component: 'server',
          ...(logObj.meta || {}),
        })

        if (O2_LOG_BUFFER.length >= MAX_BUFFER_SIZE) {
          flushO2Buffer()
        }
        startO2FlushTimer()
      } catch {
        /* ignore parse errors */
      }
      callback()
    },
  })
}

// --- Sentry Writable Stream ---
function createSentryStream(): Writable | null {
  if (!process.env.SENTRY_DSN) return null

  return new Writable({
    write(chunk, _encoding, callback) {
      try {
        const logObj = JSON.parse(chunk.toString())
        const pinoLevel = logObj.level
        const extra = { module: logObj.module, ...(logObj.meta || {}) }

        if (pinoLevel >= 50) {
          Sentry.captureMessage(logObj.msg, {
            level: pinoLevel >= 60 ? 'fatal' : 'error',
            extra,
          })
        } else if (pinoLevel >= 40) {
          Sentry.addBreadcrumb({
            category: 'logger',
            message: logObj.msg,
            level: 'warning',
            data: { module: logObj.module },
          })
        }
      } catch {
        /* ignore */
      }
      callback()
    },
  })
}

// --- OTEL (SigNoz) Writable Stream ---
function createOtelStream(): Writable | null {
  if (!process.env.OTEL_EXPORTER_OTLP_ENDPOINT) return null

  return new Writable({
    write(chunk, _encoding, callback) {
      try {
        const logObj = JSON.parse(chunk.toString())
        const severity = PINO_TO_OTEL_SEVERITY[logObj.level] || { number: 9, text: 'INFO' }

        const attributes: { key: string; value: { stringValue: string } }[] = [
          { key: 'module', value: { stringValue: logObj.module || '' } },
          { key: 'component', value: { stringValue: 'server' } },
        ]

        if (logObj.meta) {
          for (const [k, v] of Object.entries(logObj.meta)) {
            attributes.push({ key: k, value: { stringValue: String(v) } })
          }
        }

        OTEL_LOG_BUFFER.push({
          timeUnixNano: BigInt(Date.now()) * 1_000_000n + '',
          severityNumber: severity.number,
          severityText: severity.text,
          message: logObj.msg,
          attributes,
        })

        if (OTEL_LOG_BUFFER.length >= MAX_BUFFER_SIZE) {
          flushOtelBuffer()
        }
        startOtelFlushTimer()
      } catch {
        /* ignore parse errors */
      }
      callback()
    },
  })
}

// --- Multistream ---
function createMultistream(): pino.MultiStreamRes {
  const streams: pino.StreamEntry[] = []

  streams.push({ stream: createO2Stream() })

  if (process.dev) {
    streams.push({ stream: pinoPretty({ colorize: true }) })
  } else {
    streams.push({ stream: process.stdout })
  }

  const sentryStream = createSentryStream()
  if (sentryStream) {
    streams.push({ stream: sentryStream, level: 'warn' as pino.Level })
  }

  const otelStream = createOtelStream()
  if (otelStream) {
    streams.push({ stream: otelStream })
  }

  return pino.multistream(streams)
}

// --- Root Logger Singleton ---
export const rootLogger = pino(
  { level: process.dev ? 'debug' : 'info' },
  createMultistream(),
)

/**
 * Server-Logger: loggt an Console, OpenObserve, Sentry und SigNoz.
 *
 * Nutzung:
 *   const log = useLogger('api:users')
 *   log.info('User erstellt', { userId: '123' })
 */
export function useLogger(module: string) {
  const child = rootLogger.child({ module })

  return {
    debug(message: string, meta: Record<string, any> = {}) {
      child.debug({ meta }, message)
    },
    info(message: string, meta: Record<string, any> = {}) {
      child.info({ meta }, message)
    },
    warn(message: string, meta: Record<string, any> = {}) {
      child.warn({ meta }, message)
    },
    error(message: string, meta: Record<string, any> = {}) {
      child.error({ meta }, message)
    },
    fatal(message: string, meta: Record<string, any> = {}) {
      child.fatal({ meta }, message)
    },
  }
}

/**
 * Manueller Flush aller Log-Backends — aufrufen bei Server-Shutdown.
 */
export async function flushLogs() {
  if (o2FlushTimer) {
    clearInterval(o2FlushTimer)
    o2FlushTimer = null
  }
  if (otelFlushTimer) {
    clearInterval(otelFlushTimer)
    otelFlushTimer = null
  }
  rootLogger.flush()
  await Promise.all([flushO2Buffer(), flushOtelBuffer()])
}
