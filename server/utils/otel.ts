import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-http";
import { ConsoleSpanExporter, SimpleSpanProcessor, BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";

let sdk: NodeSDK | null = null;

const log = useLogger("otel");

export function initOtel() {
	const endpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;
	const isDev = import.meta.dev;

	// OTLP wenn Endpoint konfiguriert, Console im Dev, nichts in Prod ohne Endpoint
	if (!endpoint && !isDev) {
		log.warn("OTEL_EXPORTER_OTLP_ENDPOINT nicht gesetzt — Tracing/Metrics deaktiviert.");
		return;
	}

	let version = "unknown";
	try {
		const raw = readFileSync(resolve(import.meta.dirname ?? ".", "../../build-release.json"), "utf-8");
		const release = JSON.parse(raw) as { release: string };
		version = release.release;
	} catch {
		// Fallback — Datei existiert evtl. nicht in Dev
	}

	// Resource-Attribute per Env-Variable setzen (umgeht Nitro dev-mode Resolver-Bug
	// mit @opentelemetry/resources Modul-Auflösung bei pnpm)
	process.env.OTEL_RESOURCE_ATTRIBUTES = [
		`service.name=${process.env.OTEL_SERVICE_NAME || "lottozahlen"}-backend`,
		`service.version=${version}`,
		`deployment.environment.name=${process.env.APP_ENV || "development"}`,
	].join(",");

	const traceExporter = endpoint ? new OTLPTraceExporter({ url: `${endpoint}/v1/traces` }) : new ConsoleSpanExporter();

	const sdkOptions: ConstructorParameters<typeof NodeSDK>[0] = {
		// BatchSpanProcessor fuer Production (gebuendelte Exports), Simple fuer Dev (sofort)
		spanProcessor: endpoint ? new BatchSpanProcessor(traceExporter) : new SimpleSpanProcessor(traceExporter),
		instrumentations: [
			getNodeAutoInstrumentations({
				"@opentelemetry/instrumentation-fs": { enabled: false },
				"@opentelemetry/instrumentation-dns": { enabled: false },
				"@opentelemetry/instrumentation-net": { enabled: false },
				"@opentelemetry/instrumentation-http": {
					ignoreOutgoingRequestHook: (req) => {
						const path = req.path || "";
						// Telemetry-Flush-Calls ausschliessen um Feedback-Loop und Trace-Noise zu verhindern
						return path.includes("/v1/traces") || path.includes("/v1/logs") || path.includes("/v1/metrics") || path.includes("/_json");
					},
				},
			}),
		],
	};

	// Metrics nur wenn OTLP Endpoint vorhanden
	if (endpoint) {
		sdkOptions.metricReader = new PeriodicExportingMetricReader({
			exporter: new OTLPMetricExporter({
				url: `${endpoint}/v1/metrics`,
			}),
			exportIntervalMillis: 60_000,
		});
	}

	sdk = new NodeSDK(sdkOptions);
	sdk.start();
	log.info(`SDK gestartet`, { endpoint: endpoint || "ConsoleSpanExporter (dev)" });
}

export async function shutdownOtel() {
	if (sdk) {
		await sdk.shutdown();
		log.info("SDK heruntergefahren.");
	}
}
