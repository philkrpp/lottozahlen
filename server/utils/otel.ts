import { NodeSDK } from '@opentelemetry/sdk-node'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http'
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node'
import { resourceFromAttributes } from '@opentelemetry/resources'
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions'
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics'

let sdk: NodeSDK | null = null

export function initOtel() {
  const endpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT
  if (!endpoint) {
    console.warn('[OTEL] OTEL_EXPORTER_OTLP_ENDPOINT nicht gesetzt — Tracing/Metrics deaktiviert.')
    return
  }

  let version = 'unknown'
  try {
    const release = require('../../build-release.json')
    version = release.release
  } catch {
    // Fallback — Datei existiert evtl. nicht in Dev
  }

  sdk = new NodeSDK({
    resource: resourceFromAttributes({
      [ATTR_SERVICE_NAME]: 'lottozahlen',
      [ATTR_SERVICE_VERSION]: version,
      'deployment.environment.name': process.dev ? 'development' : 'production',
    }),
    traceExporter: new OTLPTraceExporter({
      url: `${endpoint}/v1/traces`,
    }),
    metricReader: new PeriodicExportingMetricReader({
      exporter: new OTLPMetricExporter({
        url: `${endpoint}/v1/metrics`,
      }),
      exportIntervalMillis: 60_000,
    }),
    instrumentations: [
      getNodeAutoInstrumentations({
        '@opentelemetry/instrumentation-fs': { enabled: false },
        '@opentelemetry/instrumentation-dns': { enabled: false },
        '@opentelemetry/instrumentation-net': { enabled: false },
      }),
    ],
  })

  sdk.start()
  console.log('[OTEL] SDK gestartet —', endpoint)
}

export async function shutdownOtel() {
  if (sdk) {
    await sdk.shutdown()
    console.log('[OTEL] SDK heruntergefahren.')
  }
}
