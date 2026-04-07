import pino from "pino";
import pinoPretty from "pino-pretty";
import * as Sentry from "@sentry/nuxt";
import { Writable } from "node:stream";
import { trace, context } from "@opentelemetry/api";

// --- Pino Level → OTEL Severity Mapping ---
const PINO_TO_OTEL_SEVERITY: Record<number, { number: number; text: string }> = {
	10: { number: 1, text: "TRACE" },
	20: { number: 5, text: "DEBUG" },
	30: { number: 9, text: "INFO" },
	40: { number: 13, text: "WARN" },
	50: { number: 17, text: "ERROR" },
	60: { number: 21, text: "FATAL" },
};

// --- Health-Check State ---
let flushFailureThreshold = 3;
let o2ConsecutiveFailures = 0;
let otelConsecutiveFailures = 0;

function getFlushFailureThreshold(): number {
	try {
		return useRuntimeConfig().logFlushFailureThreshold ?? 3;
	} catch {
		return flushFailureThreshold;
	}
}

// --- OpenObserve Batch-Buffer ---
const O2_LOG_BUFFER: Record<string, unknown>[] = [];
const FLUSH_INTERVAL_MS = 5_000;
const MAX_BUFFER_SIZE = 50;
let o2FlushTimer: ReturnType<typeof setInterval> | null = null;
let _o2Flushing = false;

async function flushO2Buffer() {
	if (O2_LOG_BUFFER.length === 0 || _o2Flushing) return;

	const config = useRuntimeConfig();
	if (!config.o2ApiUrl || !config.o2AuthUser || !config.o2AuthPassword) {
		O2_LOG_BUFFER.length = 0;
		return;
	}

	_o2Flushing = true;
	const batch = O2_LOG_BUFFER.splice(0);
	const authToken = Buffer.from(`${config.o2AuthUser}:${config.o2AuthPassword}`).toString("base64");
	const streamName = config.o2LogStream || "lottozahlen_server_logs";

	try {
		const res = await fetch(`${config.o2ApiUrl}/api/${config.o2Org}/${streamName}/_json`, {
			method: "POST",
			headers: {
				Authorization: `Basic ${authToken}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify(batch),
		});
		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		o2ConsecutiveFailures = 0;
	} catch (err) {
		if (O2_LOG_BUFFER.length < 500) {
			O2_LOG_BUFFER.unshift(...batch);
		}
		o2ConsecutiveFailures++;
		const threshold = getFlushFailureThreshold();
		if (o2ConsecutiveFailures === threshold) {
			console.warn(`[O2] ${threshold} aufeinanderfolgende Flush-Fehler — Destination moeglicherweise nicht erreichbar`);
		}
		console.error("[O2] Log-Flush fehlgeschlagen:", err);
	} finally {
		_o2Flushing = false;
	}
}

function startO2FlushTimer() {
	if (!o2FlushTimer) {
		o2FlushTimer = setInterval(flushO2Buffer, FLUSH_INTERVAL_MS);
	}
}

// --- OTEL (SigNoz) Batch-Buffer ---
const OTEL_LOG_BUFFER: Record<string, unknown>[] = [];
let otelFlushTimer: ReturnType<typeof setInterval> | null = null;
let _otelFlushing = false;

async function flushOtelBuffer() {
	if (OTEL_LOG_BUFFER.length === 0 || _otelFlushing) return;

	const config = useRuntimeConfig();
	if (!config.otelEndpoint) {
		OTEL_LOG_BUFFER.length = 0;
		return;
	}

	_otelFlushing = true;
	const batch = OTEL_LOG_BUFFER.splice(0);

	const resourceAttributes = [
		{ key: "service.name", value: { stringValue: `${process.env.OTEL_SERVICE_NAME || "lottozahlen"}-backend` } },
		{ key: "service.version", value: { stringValue: config.public.appVersion } },
		{
			key: "deployment.environment.name",
			value: { stringValue: import.meta.dev ? "development" : "production" },
		},
	];

	const logRecords = batch.map((log) => ({
		timeUnixNano: String(log.timeUnixNano),
		severityNumber: log.severityNumber,
		severityText: log.severityText,
		body: { stringValue: log.message },
		attributes: log.attributes,
		// Trace-Korrelation: OTLP LogRecord Top-Level-Felder
		...(log.traceId && {
			traceId: log.traceId,
			spanId: log.spanId,
			flags: log.flags,
		}),
	}));

	const payload = {
		resourceLogs: [
			{
				resource: { attributes: resourceAttributes },
				scopeLogs: [
					{
						scope: { name: "pino" },
						logRecords,
					},
				],
			},
		],
	};

	try {
		const res = await fetch(`${config.otelEndpoint}/v1/logs`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(payload),
		});
		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		otelConsecutiveFailures = 0;
	} catch (err) {
		if (OTEL_LOG_BUFFER.length < 500) {
			OTEL_LOG_BUFFER.unshift(...batch);
		}
		otelConsecutiveFailures++;
		const threshold = getFlushFailureThreshold();
		if (otelConsecutiveFailures === threshold) {
			console.warn(`[OTEL] ${threshold} aufeinanderfolgende Flush-Fehler — Destination moeglicherweise nicht erreichbar`);
		}
		console.error("[OTEL] Log-Flush fehlgeschlagen:", err);
	} finally {
		_otelFlushing = false;
	}
}

function startOtelFlushTimer() {
	if (!otelFlushTimer) {
		otelFlushTimer = setInterval(flushOtelBuffer, FLUSH_INTERVAL_MS);
	}
}

// --- OpenObserve Writable Stream ---
function createO2Stream(): Writable | null {
	try {
		const config = useRuntimeConfig();
		if (!config.o2ApiUrl || !config.o2AuthUser || !config.o2AuthPassword) return null;
	} catch {
		return null;
	}

	return new Writable({
		write(chunk, _encoding, callback) {
			try {
				const logObj = JSON.parse(chunk.toString());

				O2_LOG_BUFFER.push({
					_timestamp: Date.now() * 1000,
					level: pino.levels.labels[logObj.level] || "info",
					message: logObj.msg,
					module: logObj.module || "",
					service: `${process.env.NUXT_PUBLIC_O2_SERVICE_NAME || "lottozahlen"}-backend`,
					version: process.env.NUXT_PUBLIC_APP_VERSION || "unknown",
					env: import.meta.dev ? "development" : "production",
					component: "server",
					// Trace-Korrelation vom Pino-Mixin
					...(logObj.trace_id && {
						trace_id: logObj.trace_id,
						span_id: logObj.span_id,
						trace_flags: logObj.trace_flags,
					}),
					// User-ID vom Pino-Mixin (leer bei nicht-authentifizierten Calls)
					...(logObj.user_id && { user_id: logObj.user_id }),
					...(logObj.meta || {}),
				});

				if (O2_LOG_BUFFER.length >= MAX_BUFFER_SIZE) {
					flushO2Buffer();
				}
				startO2FlushTimer();
			} catch (e) {
				console.error("[O2-Stream] Parse error:", e);
			}
			callback();
		},
	});
}

// --- Sentry Writable Stream ---
// Nur Breadcrumbs — Error-Capture uebernimmt @sentry/nuxt automatisch.
// Dadurch kein Double-Capture: Sentry SDK faengt Exceptions, dieser Stream liefert Kontext.
function createSentryStream(): Writable | null {
	if (!process.env.SENTRY_DSN) return null;

	return new Writable({
		write(chunk, _encoding, callback) {
			try {
				const logObj = JSON.parse(chunk.toString());
				const pinoLevel = logObj.level;

				if (pinoLevel >= 40) {
					const level = pinoLevel >= 60 ? "fatal" : pinoLevel >= 50 ? "error" : "warning";
					Sentry.addBreadcrumb({
						category: "logger",
						message: logObj.msg,
						level,
						data: {
							module: logObj.module,
							...(logObj.trace_id && { trace_id: logObj.trace_id }),
							...(logObj.user_id && { user_id: logObj.user_id }),
						},
					});
				}
			} catch (e) {
				console.error("[Sentry-Stream] Parse error:", e);
			}
			callback();
		},
	});
}

// --- OTEL (SigNoz) Writable Stream ---
function createOtelStream(): Writable | null {
	if (!process.env.OTEL_EXPORTER_OTLP_ENDPOINT) return null;

	return new Writable({
		write(chunk, _encoding, callback) {
			try {
				const logObj = JSON.parse(chunk.toString());
				const severity = PINO_TO_OTEL_SEVERITY[logObj.level] || { number: 9, text: "INFO" };

				const attributes: { key: string; value: { stringValue: string } }[] = [
					{ key: "module", value: { stringValue: logObj.module || "" } },
					{ key: "component", value: { stringValue: "server" } },
				];

				// User-ID als Attribut (leer bei nicht-authentifizierten Calls)
				if (logObj.user_id) {
					attributes.push({ key: "user.id", value: { stringValue: logObj.user_id } });
				}

				if (logObj.meta) {
					for (const [k, v] of Object.entries(logObj.meta)) {
						attributes.push({ key: k, value: { stringValue: String(v) } });
					}
				}

				OTEL_LOG_BUFFER.push({
					timeUnixNano: BigInt(Date.now()) * 1_000_000n + "",
					severityNumber: severity.number,
					severityText: severity.text,
					message: logObj.msg,
					attributes,
					// Trace-Korrelation als Top-Level-Felder (OTLP LogRecord Spec)
					...(logObj.trace_id && {
						traceId: logObj.trace_id,
						spanId: logObj.span_id,
						flags: logObj.trace_flags,
					}),
				});

				if (OTEL_LOG_BUFFER.length >= MAX_BUFFER_SIZE) {
					flushOtelBuffer();
				}
				startOtelFlushTimer();
			} catch (e) {
				console.error("[OTEL-Stream] Parse error:", e);
			}
			callback();
		},
	});
}

// --- Multistream ---
function createMultistream(): pino.MultiStreamRes {
	const streams: pino.StreamEntry[] = [];

	const o2Stream = createO2Stream();
	if (o2Stream) {
		streams.push({ stream: o2Stream });
	}

	if (import.meta.dev) {
		streams.push({ stream: pinoPretty({ colorize: true }) });
	} else {
		streams.push({ stream: process.stdout });
	}

	const sentryStream = createSentryStream();
	if (sentryStream) {
		streams.push({ stream: sentryStream, level: "warn" as pino.Level });
	}

	const otelStream = createOtelStream();
	if (otelStream) {
		streams.push({ stream: otelStream });
	}

	return pino.multistream(streams);
}

// --- OTEL Trace Correlation + User-ID Mixin ---
function otelMixin() {
	const result: Record<string, string | number> = {};

	const span = trace.getSpan(context.active());
	if (span) {
		const spanContext = span.spanContext();
		result.trace_id = spanContext.traceId;
		result.span_id = spanContext.spanId;
		result.trace_flags = spanContext.traceFlags;
	}

	// User-ID aus dem Nitro Request-Context (erfordert asyncContext: true)
	try {
		const event = useEvent();
		if (event?.context?.user?.id) {
			result.user_id = event.context.user.id;
		}
	} catch {
		// Kein Request-Context (Startup, Cron, Shutdown)
	}

	return result;
}

// --- Root Logger Singleton ---
export const rootLogger = pino({ level: import.meta.dev ? "debug" : "info", mixin: otelMixin }, createMultistream());

/**
 * Server-Logger: loggt an Console, OpenObserve, Sentry und SigNoz.
 *
 * Nutzung:
 *   const log = useLogger('api:users')
 *   log.info('User erstellt', { userId: '123' })
 */
export function useLogger(module: string) {
	const child = rootLogger.child({ module });

	return {
		debug(message: string, meta: Record<string, unknown> = {}) {
			child.debug({ meta }, message);
		},
		info(message: string, meta: Record<string, unknown> = {}) {
			child.info({ meta }, message);
		},
		warn(message: string, meta: Record<string, unknown> = {}) {
			child.warn({ meta }, message);
		},
		error(message: string, meta: Record<string, unknown> = {}, err?: Error) {
			child.error({ meta, ...(err && { err }) }, message);
		},
		fatal(message: string, meta: Record<string, unknown> = {}, err?: Error) {
			child.fatal({ meta, ...(err && { err }) }, message);
		},
	};
}

/**
 * Health-Status aller Log-Backends — fuer /api/health/telemetry.
 */
export function getLoggerHealth() {
	const threshold = getFlushFailureThreshold();
	return {
		o2: {
			healthy: o2ConsecutiveFailures < threshold,
			consecutiveFailures: o2ConsecutiveFailures,
			bufferSize: O2_LOG_BUFFER.length,
		},
		otel: {
			healthy: otelConsecutiveFailures < threshold,
			consecutiveFailures: otelConsecutiveFailures,
			bufferSize: OTEL_LOG_BUFFER.length,
		},
		sentry: {
			configured: !!process.env.SENTRY_DSN,
		},
	};
}

/**
 * Manueller Flush aller Log-Backends — aufrufen bei Server-Shutdown.
 */
export async function flushLogs() {
	if (o2FlushTimer) {
		clearInterval(o2FlushTimer);
		o2FlushTimer = null;
	}
	if (otelFlushTimer) {
		clearInterval(otelFlushTimer);
		otelFlushTimer = null;
	}
	rootLogger.flush();
	await Promise.all([flushO2Buffer(), flushOtelBuffer()]);
}
