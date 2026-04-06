import { WebTracerProvider } from '@opentelemetry/sdk-trace-web'
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { Resource } from '@opentelemetry/resources'
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
  ATTR_DEPLOYMENT_ENVIRONMENT_NAME,
} from '@opentelemetry/semantic-conventions'
import { registerInstrumentations } from '@opentelemetry/instrumentation'
import { DocumentLoadInstrumentation } from '@opentelemetry/instrumentation-document-load'
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch'
import { UserInteractionInstrumentation } from '@opentelemetry/instrumentation-user-interaction'
import { trace } from '@opentelemetry/api'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const { otelEndpoint, appVersion } = config.public

  if (!otelEndpoint) {
    console.warn('[SigNoz] otelEndpoint nicht gesetzt — Browser-Tracing deaktiviert.')
    return
  }

  const env = import.meta.dev ? 'development' : 'production'

  const provider = new WebTracerProvider({
    resource: new Resource({
      [ATTR_SERVICE_NAME]: 'lottozahlen',
      [ATTR_SERVICE_VERSION]: appVersion,
      [ATTR_DEPLOYMENT_ENVIRONMENT_NAME]: env,
    }),
  })

  provider.addSpanProcessor(
    new BatchSpanProcessor(
      new OTLPTraceExporter({
        url: `${otelEndpoint}/v1/traces`,
      }),
    ),
  )

  provider.register()

  registerInstrumentations({
    instrumentations: [
      new DocumentLoadInstrumentation(),
      new FetchInstrumentation({
        propagateTraceHeaderCorsUrls: [/.*/],
      }),
      new UserInteractionInstrumentation(),
    ],
  })

  const tracer = trace.getTracer('lottozahlen-browser', appVersion)

  return {
    provide: {
      otelTracer: tracer,
    },
  }
})
