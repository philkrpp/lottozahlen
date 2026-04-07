import { WebTracerProvider } from "@opentelemetry/sdk-trace-web";
import { BatchSpanProcessor, TraceIdRatioBasedSampler, ParentBasedSampler } from "@opentelemetry/sdk-trace-base";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from "@opentelemetry/semantic-conventions";
import { ZoneContextManager } from "@opentelemetry/context-zone";
import { registerInstrumentations } from "@opentelemetry/instrumentation";
import { FetchInstrumentation } from "@opentelemetry/instrumentation-fetch";
import { DocumentLoadInstrumentation } from "@opentelemetry/instrumentation-document-load";
import { UserInteractionInstrumentation } from "@opentelemetry/instrumentation-user-interaction";
import { W3CTraceContextPropagator, CompositePropagator } from "@opentelemetry/core";
import { propagation, trace } from "@opentelemetry/api";
import { getSessionId } from "~/utils/session";

export default defineNuxtPlugin(() => {
	const config = useRuntimeConfig();
	const isDev = import.meta.dev;

	// Traces gehen an eigene API-Route, NICHT direkt an SigNoz
	const collectorUrl = "/api/telemetry/traces";

	const resource = resourceFromAttributes({
		[ATTR_SERVICE_NAME]: `${config.public.otelServiceName || "lottozahlen"}-frontend`,
		[ATTR_SERVICE_VERSION]: config.public.appVersion || "1.0.0",
		"deployment.environment": isDev ? "development" : "production",
		"browser.language": navigator.language,
		"session.id": getSessionId(),
	});

	const exporter = new OTLPTraceExporter({
		url: collectorUrl,
		headers: {},
	});

	const sampleRate = config.public.otelTracesSampleRate ?? 1.0;
	const sampler = new ParentBasedSampler({
		root: new TraceIdRatioBasedSampler(sampleRate),
	});

	const spanProcessors = [
		new BatchSpanProcessor(exporter, {
			maxQueueSize: 100,
			maxExportBatchSize: 20,
			scheduledDelayMillis: 5000,
		}),
	];

	const provider = new WebTracerProvider({ resource, spanProcessors, sampler });

	// W3C TraceContext Propagation — traceparent Header an fetch-Requests
	propagation.setGlobalPropagator(
		new CompositePropagator({
			propagators: [new W3CTraceContextPropagator()],
		}),
	);

	provider.register({
		contextManager: new ZoneContextManager(),
	});

	registerInstrumentations({
		instrumentations: [
			new FetchInstrumentation({
				ignoreUrls: [/\/api\/telemetry\//, /\.(js|css|png|jpg|svg|woff|woff2)$/, /fonts\.googleapis\.com/, /cdn\./],
				propagateTraceHeaderCorsUrls: [new RegExp(`${window.location.origin}/api/.*`)],
				clearTimingResources: true,
			}),
			new DocumentLoadInstrumentation(),
			new UserInteractionInstrumentation({
				eventNames: ["click", "submit"],
			}),
		],
	});

	// Spans bei Tab-Close flushen damit sie nicht verloren gehen
	window.addEventListener("visibilitychange", () => {
		if (document.visibilityState === "hidden") {
			provider.forceFlush().catch(() => {
				// Best-effort — Tab wird geschlossen
			});
		}
	});

	const tracer = trace.getTracer(`${config.public.otelServiceName || "lottozahlen"}-frontend`, config.public.appVersion);

	return {
		provide: {
			otelTracer: tracer,
		},
	};
});
