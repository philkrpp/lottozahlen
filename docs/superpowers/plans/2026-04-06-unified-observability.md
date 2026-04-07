# Unified Observability Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add SigNoz via OpenTelemetry alongside existing Sentry + OpenObserve, with a unified logger abstraction that routes to all backends.

**Architecture:** Pino multistream stays as the server logging core with a new OTEL stream. OTEL Node SDK handles tracing + metrics. OTEL Web SDK handles browser traces. All `useO2Logger`/`useO2` references are renamed to backend-agnostic names.

**Tech Stack:** OpenTelemetry JS SDK, Pino multistream, Nuxt 4 / Nitro, OTLP HTTP protocol

**Spec:** `docs/superpowers/specs/2026-04-06-unified-observability-design.md`

---

## File Structure

### New Files

| File                           | Responsibility                                                       |
| ------------------------------ | -------------------------------------------------------------------- |
| `server/utils/otel.ts`         | OTEL Node SDK init (tracing + metrics), exports `shutdownOtel()`     |
| `server/plugins/00.otel.ts`    | First Nitro plugin — triggers OTEL SDK init + graceful shutdown      |
| `app/plugins/signoz.client.ts` | Browser OTEL Web SDK (document load, fetch, user interaction traces) |

### Renamed Files

| From                                 | To                                    | Changes                             |
| ------------------------------------ | ------------------------------------- | ----------------------------------- |
| `server/utils/o2.ts`                 | `server/utils/logger.ts`              | Add OTEL log stream, rename exports |
| `server/plugins/o2-error-handler.ts` | `server/plugins/01.error-handler.ts`  | Update imports only                 |
| `app/composables/useO2.ts`           | `app/composables/useObservability.ts` | Multi-backend dispatch              |
| `types/openobserve.d.ts`             | `types/observability.d.ts`            | Add `$otelTracer` type              |

### Modified Files

| File                              | Changes                                                      |
| --------------------------------- | ------------------------------------------------------------ |
| `nuxt.config.ts`                  | Add `otelEndpoint` to runtimeConfig, externals, plugin order |
| `server/middleware/01.logging.ts` | Import from `logger` instead of `o2`                         |
| 21 server files                   | `useO2Logger` → `useLogger` rename                           |

---

### Task 1: Install OpenTelemetry packages

**Files:**

- Modify: `package.json`

- [ ] **Step 1: Install server-side OTEL packages**

```bash
pnpm add @opentelemetry/api @opentelemetry/sdk-node @opentelemetry/sdk-metrics @opentelemetry/auto-instrumentations-node @opentelemetry/exporter-trace-otlp-http @opentelemetry/exporter-metrics-otlp-http @opentelemetry/resources @opentelemetry/semantic-conventions
```

- [ ] **Step 2: Install browser-side OTEL packages**

```bash
pnpm add @opentelemetry/sdk-trace-web @opentelemetry/sdk-trace-base @opentelemetry/instrumentation @opentelemetry/instrumentation-document-load @opentelemetry/instrumentation-fetch @opentelemetry/instrumentation-user-interaction
```

- [ ] **Step 3: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore: add OpenTelemetry packages for SigNoz integration"
```

---

### Task 2: Create OTEL Node SDK setup

**Files:**

- Create: `server/utils/otel.ts`

- [ ] **Step 1: Create `server/utils/otel.ts`**

```ts
import { NodeSDK } from "@opentelemetry/sdk-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-http";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { Resource } from "@opentelemetry/resources";
import {
	ATTR_SERVICE_NAME,
	ATTR_SERVICE_VERSION,
	ATTR_DEPLOYMENT_ENVIRONMENT_NAME,
} from "@opentelemetry/semantic-conventions";
import { PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";

let sdk: NodeSDK | null = null;

export function initOtel() {
	const endpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;
	if (!endpoint) {
		console.warn("[OTEL] OTEL_EXPORTER_OTLP_ENDPOINT nicht gesetzt — Tracing/Metrics deaktiviert.");
		return;
	}

	// Version aus build-release.json (wird von nuxt.config.ts generiert)
	let version = "unknown";
	try {
		const release = require("../../build-release.json");
		version = release.release;
	} catch {
		// Fallback — Datei existiert evtl. nicht in Dev
	}

	sdk = new NodeSDK({
		resource: new Resource({
			[ATTR_SERVICE_NAME]: "lottozahlen",
			[ATTR_SERVICE_VERSION]: version,
			[ATTR_DEPLOYMENT_ENVIRONMENT_NAME]: process.dev ? "development" : "production",
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
				// Deaktiviere noisy/irrelevante Instrumentierungen
				"@opentelemetry/instrumentation-fs": { enabled: false },
				"@opentelemetry/instrumentation-dns": { enabled: false },
				"@opentelemetry/instrumentation-net": { enabled: false },
			}),
		],
	});

	sdk.start();
	console.log("[OTEL] SDK gestartet —", endpoint);
}

export async function shutdownOtel() {
	if (sdk) {
		await sdk.shutdown();
		console.log("[OTEL] SDK heruntergefahren.");
	}
}
```

**Note:** Auto-instrumentation for externalized modules (mongoose, http) works best-effort in Nitro's bundled environment. Logs and browser traces always work regardless.

- [ ] **Step 2: Commit**

```bash
git add server/utils/otel.ts
git commit -m "feat: add OpenTelemetry Node SDK setup for SigNoz tracing and metrics"
```

---

### Task 3: Create OTEL Nitro plugin

**Files:**

- Create: `server/plugins/00.otel.ts`

- [ ] **Step 1: Create `server/plugins/00.otel.ts`**

```ts
import { initOtel, shutdownOtel } from "../utils/otel";

// OTEL SDK muss vor allen anderen Plugins initialisiert werden
initOtel();

export default defineNitroPlugin((nitroApp) => {
	nitroApp.hooks.hook("close", async () => {
		await shutdownOtel();
	});
});
```

- [ ] **Step 2: Commit**

```bash
git add server/plugins/00.otel.ts
git commit -m "feat: add OTEL Nitro plugin for early SDK initialization"
```

---

### Task 4: Refactor `server/utils/o2.ts` → `server/utils/logger.ts`

This is the core refactoring: rename the file, add the OTEL log stream, rename exported functions.

**Files:**

- Delete: `server/utils/o2.ts`
- Create: `server/utils/logger.ts`

- [ ] **Step 1: Create `server/utils/logger.ts` with OTEL stream + renamed exports**

The file keeps ALL existing O2 + Sentry stream logic and adds the OTEL log stream. The only changes from the original `o2.ts` are:

1. New `createOtelStream()` function
2. OTEL stream added to multistream
3. `useO2Logger` → `useLogger`
4. `flushO2Logs` → `flushLogs` (also flushes OTEL buffer)

```ts
import pino from "pino";
import pinoPretty from "pino-pretty";
import * as Sentry from "@sentry/nuxt";
import { Writable } from "node:stream";

// --- Pino Level → OTEL Severity Mapping ---
const PINO_TO_OTEL_SEVERITY: Record<number, { number: number; text: string }> = {
	10: { number: 1, text: "TRACE" },
	20: { number: 5, text: "DEBUG" },
	30: { number: 9, text: "INFO" },
	40: { number: 13, text: "WARN" },
	50: { number: 17, text: "ERROR" },
	60: { number: 21, text: "FATAL" },
};

// --- OpenObserve Batch-Buffer ---
const O2_LOG_BUFFER: Record<string, any>[] = [];
const FLUSH_INTERVAL_MS = 5_000;
const MAX_BUFFER_SIZE = 50;
let o2FlushTimer: ReturnType<typeof setInterval> | null = null;

async function flushO2Buffer() {
	if (O2_LOG_BUFFER.length === 0) return;

	const config = useRuntimeConfig();
	if (!config.o2ApiUrl || !config.o2AuthUser || !config.o2AuthPassword) return;

	const batch = O2_LOG_BUFFER.splice(0);
	const authToken = Buffer.from(`${config.o2AuthUser}:${config.o2AuthPassword}`).toString("base64");
	const streamName = "lottozahlen_server_logs";

	try {
		const res = await fetch(`${config.o2ApiUrl}/${streamName}/_json`, {
			method: "POST",
			headers: {
				Authorization: `Basic ${authToken}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify(batch),
		});
		if (!res.ok) throw new Error(`HTTP ${res.status}`);
	} catch (err) {
		if (O2_LOG_BUFFER.length < 500) {
			O2_LOG_BUFFER.unshift(...batch);
		}
		console.error("[O2] Log-Flush fehlgeschlagen:", err);
	}
}

function startO2FlushTimer() {
	if (!o2FlushTimer) {
		o2FlushTimer = setInterval(flushO2Buffer, FLUSH_INTERVAL_MS);
	}
}

// --- OTEL (SigNoz) Batch-Buffer ---
const OTEL_LOG_BUFFER: Record<string, any>[] = [];
let otelFlushTimer: ReturnType<typeof setInterval> | null = null;

async function flushOtelBuffer() {
	if (OTEL_LOG_BUFFER.length === 0) return;

	const config = useRuntimeConfig();
	if (!config.otelEndpoint) return;

	const batch = OTEL_LOG_BUFFER.splice(0);

	const resourceAttributes = [
		{ key: "service.name", value: { stringValue: "lottozahlen" } },
		{ key: "service.version", value: { stringValue: config.public.appVersion } },
		{
			key: "deployment.environment.name",
			value: { stringValue: process.dev ? "development" : "production" },
		},
	];

	const logRecords = batch.map((log) => ({
		timeUnixNano: String(log.timeUnixNano),
		severityNumber: log.severityNumber,
		severityText: log.severityText,
		body: { stringValue: log.message },
		attributes: log.attributes,
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
	} catch (err) {
		if (OTEL_LOG_BUFFER.length < 500) {
			OTEL_LOG_BUFFER.unshift(...batch);
		}
		console.error("[OTEL] Log-Flush fehlgeschlagen:", err);
	}
}

function startOtelFlushTimer() {
	if (!otelFlushTimer) {
		otelFlushTimer = setInterval(flushOtelBuffer, FLUSH_INTERVAL_MS);
	}
}

// --- OpenObserve Writable Stream ---
function createO2Stream(): Writable {
	return new Writable({
		write(chunk, _encoding, callback) {
			try {
				const logObj = JSON.parse(chunk.toString());
				const config = useRuntimeConfig();

				O2_LOG_BUFFER.push({
					_timestamp: Date.now() * 1000, // Mikrosekunden fuer OpenObserve
					level: pino.levels.labels[logObj.level] || "info",
					message: logObj.msg,
					module: logObj.module || "",
					service: "lottozahlen",
					version: config.public.appVersion,
					env: process.dev ? "development" : "production",
					component: "server",
					...(logObj.meta || {}),
				});

				if (O2_LOG_BUFFER.length >= MAX_BUFFER_SIZE) {
					flushO2Buffer();
				}
				startO2FlushTimer();
			} catch {
				/* ignore parse errors */
			}
			callback();
		},
	});
}

// --- Sentry Writable Stream ---
function createSentryStream(): Writable | null {
	if (!process.env.SENTRY_DSN) return null;

	return new Writable({
		write(chunk, _encoding, callback) {
			try {
				const logObj = JSON.parse(chunk.toString());
				const pinoLevel = logObj.level;
				const extra = { module: logObj.module, ...(logObj.meta || {}) };

				// pino: fatal=60, error=50, warn=40
				if (pinoLevel >= 50) {
					Sentry.captureMessage(logObj.msg, {
						level: pinoLevel >= 60 ? "fatal" : "error",
						extra,
					});
				} else if (pinoLevel >= 40) {
					Sentry.addBreadcrumb({
						category: "logger",
						message: logObj.msg,
						level: "warning",
						data: { module: logObj.module },
					});
				}
			} catch {
				/* ignore */
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

				// Meta-Felder als OTEL Attributes
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
				});

				if (OTEL_LOG_BUFFER.length >= MAX_BUFFER_SIZE) {
					flushOtelBuffer();
				}
				startOtelFlushTimer();
			} catch {
				/* ignore parse errors */
			}
			callback();
		},
	});
}

// --- Multistream ---
function createMultistream(): pino.MultiStreamRes {
	const streams: pino.StreamEntry[] = [];

	streams.push({ stream: createO2Stream() });

	if (process.dev) {
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

// --- Root Logger Singleton ---
export const rootLogger = pino({ level: process.dev ? "debug" : "info" }, createMultistream());

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
		debug(message: string, meta: Record<string, any> = {}) {
			child.debug({ meta }, message);
		},
		info(message: string, meta: Record<string, any> = {}) {
			child.info({ meta }, message);
		},
		warn(message: string, meta: Record<string, any> = {}) {
			child.warn({ meta }, message);
		},
		error(message: string, meta: Record<string, any> = {}) {
			child.error({ meta }, message);
		},
		fatal(message: string, meta: Record<string, any> = {}) {
			child.fatal({ meta }, message);
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
```

- [ ] **Step 2: Delete `server/utils/o2.ts`**

```bash
git rm server/utils/o2.ts
```

- [ ] **Step 3: Commit**

```bash
git add server/utils/logger.ts
git commit -m "feat: refactor o2.ts to logger.ts with OTEL log stream for SigNoz"
```

---

### Task 5: Rename error handler plugin

**Files:**

- Delete: `server/plugins/o2-error-handler.ts`
- Create: `server/plugins/01.error-handler.ts`

- [ ] **Step 1: Create `server/plugins/01.error-handler.ts`**

Same logic as the original, only import names changed:

```ts
export default defineNitroPlugin((nitroApp) => {
	const log = useLogger("nitro");

	// --- Unhandled Errors in Nitro ---
	nitroApp.hooks.hook("error", (error, { event }) => {
		const url = event ? getRequestURL(event).pathname : "unknown";
		const method = event ? getMethod(event) : "unknown";

		log.error(`Server Error: ${error.message}`, {
			path: url,
			method,
			stack: error.stack || "",
			name: error.name,
			type: "unhandled_error",
		});
	});

	// --- Process-Level Errors ---
	process.on("unhandledRejection", (reason: any) => {
		log.fatal(`Unhandled Rejection: ${reason?.message || reason}`, {
			stack: reason?.stack || "",
			type: "unhandled_rejection",
		});
	});

	process.on("uncaughtException", (error) => {
		log.fatal(`Uncaught Exception: ${error.message}`, {
			stack: error.stack || "",
			type: "uncaught_exception",
		});
	});

	// --- Graceful Shutdown: Logs flushen vor dem Beenden ---
	nitroApp.hooks.hook("close", async () => {
		log.info("Server wird heruntergefahren — Logs werden geflusht.");
		await flushLogs();
	});
});
```

- [ ] **Step 2: Delete old file**

```bash
git rm server/plugins/o2-error-handler.ts
```

- [ ] **Step 3: Commit**

```bash
git add server/plugins/01.error-handler.ts
git commit -m "refactor: rename o2-error-handler to 01.error-handler with useLogger"
```

---

### Task 6: Rename `useO2Logger` → `useLogger` in all server files

**Files (21 files):**

- Modify: `server/cron/checkDrawResults.ts`
- Modify: `server/cron/index.ts`
- Modify: `server/cron/notifyUsers.ts`
- Modify: `server/services/losChecker.ts`
- Modify: `server/services/emailService.ts`
- Modify: `server/services/slackService.ts`
- Modify: `server/services/fernsehlotterieApi.ts`
- Modify: `server/services/notificationService.ts`
- Modify: `server/services/drawFetcher.ts`
- Modify: `server/api/notifications/settings.put.ts`
- Modify: `server/api/notifications/test.post.ts`
- Modify: `server/api/los/[id]/check.post.ts`
- Modify: `server/api/los/[id].put.ts`
- Modify: `server/api/los/index.post.ts`
- Modify: `server/api/los/[id].delete.ts`
- Modify: `server/api/user/set-password.post.ts`
- Modify: `server/api/user/profile.put.ts`
- Modify: `server/api/user/password.put.ts`
- Modify: `server/api/user/account.delete.ts`
- Modify: `server/middleware/auth.ts`
- Modify: `server/utils/db.ts`

- [ ] **Step 1: Find-and-replace `useO2Logger` → `useLogger` in all files**

In every file listed above, the only change is:

```
// Before:
const log = useO2Logger('module-name')

// After:
const log = useLogger('module-name')
```

Since `useLogger` is auto-imported by Nitro (exported from `server/utils/logger.ts`), no import statement changes are needed.

- [ ] **Step 2: Update `server/middleware/01.logging.ts` import**

```ts
// Before:
import { rootLogger } from "../utils/o2";

// After:
import { rootLogger } from "../utils/logger";
```

The rest of the file stays unchanged.

- [ ] **Step 3: Commit**

```bash
git add server/
git commit -m "refactor: rename useO2Logger to useLogger across all server files"
```

---

### Task 7: Update `nuxt.config.ts`

**Files:**

- Modify: `nuxt.config.ts`

- [ ] **Step 1: Add `otelEndpoint` to runtimeConfig**

Add to the `runtimeConfig` object:

```ts
runtimeConfig: {
  // ... existing keys ...
  otelEndpoint: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || '',
  public: {
    // ... existing keys ...
    otelEndpoint: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || '',
  },
},
```

- [ ] **Step 2: Update Nitro externals**

```ts
externals: {
  external: [
    'croner', 'pino', 'pino-http', 'pino-pretty',
    'mongoose', 'mongodb',
    '@opentelemetry/api',
    '@opentelemetry/sdk-node',
    '@opentelemetry/sdk-metrics',
    '@opentelemetry/auto-instrumentations-node',
    '@opentelemetry/exporter-trace-otlp-http',
    '@opentelemetry/exporter-metrics-otlp-http',
    '@opentelemetry/resources',
    '@opentelemetry/semantic-conventions',
  ],
},
```

- [ ] **Step 3: Update Nitro plugins list**

```ts
nitro: {
  plugins: [
    '~~/server/plugins/00.otel.ts',
    '~~/server/plugins/01.error-handler.ts',
    '~~/server/plugins/mongodb.ts',
    '~~/server/plugins/cron.ts',
  ],
},
```

- [ ] **Step 4: Commit**

```bash
git add nuxt.config.ts
git commit -m "feat: add OTEL config to nuxt.config.ts (runtimeConfig, externals, plugins)"
```

---

### Task 8: Create browser OTEL plugin

**Files:**

- Create: `app/plugins/signoz.client.ts`

- [ ] **Step 1: Create `app/plugins/signoz.client.ts`**

```ts
import { WebTracerProvider } from "@opentelemetry/sdk-trace-web";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { Resource } from "@opentelemetry/resources";
import {
	ATTR_SERVICE_NAME,
	ATTR_SERVICE_VERSION,
	ATTR_DEPLOYMENT_ENVIRONMENT_NAME,
} from "@opentelemetry/semantic-conventions";
import { registerInstrumentations } from "@opentelemetry/instrumentation";
import { DocumentLoadInstrumentation } from "@opentelemetry/instrumentation-document-load";
import { FetchInstrumentation } from "@opentelemetry/instrumentation-fetch";
import { UserInteractionInstrumentation } from "@opentelemetry/instrumentation-user-interaction";
import { trace } from "@opentelemetry/api";

export default defineNuxtPlugin(() => {
	const config = useRuntimeConfig();
	const { otelEndpoint, appVersion } = config.public;

	if (!otelEndpoint) {
		console.warn("[SigNoz] otelEndpoint nicht gesetzt — Browser-Tracing deaktiviert.");
		return;
	}

	const env = import.meta.dev ? "development" : "production";

	const provider = new WebTracerProvider({
		resource: new Resource({
			[ATTR_SERVICE_NAME]: "lottozahlen",
			[ATTR_SERVICE_VERSION]: appVersion,
			[ATTR_DEPLOYMENT_ENVIRONMENT_NAME]: env,
		}),
	});

	provider.addSpanProcessor(
		new BatchSpanProcessor(
			new OTLPTraceExporter({
				url: `${otelEndpoint}/v1/traces`,
			}),
		),
	);

	provider.register();

	registerInstrumentations({
		instrumentations: [
			new DocumentLoadInstrumentation(),
			new FetchInstrumentation({
				propagateTraceHeaderCorsUrls: [/.*/],
			}),
			new UserInteractionInstrumentation(),
		],
	});

	const tracer = trace.getTracer("lottozahlen-browser", appVersion);

	return {
		provide: {
			otelTracer: tracer,
		},
	};
});
```

- [ ] **Step 2: Commit**

```bash
git add app/plugins/signoz.client.ts
git commit -m "feat: add SigNoz browser OTEL plugin (traces, document load, fetch, interactions)"
```

---

### Task 9: Refactor client composable + types

**Files:**

- Delete: `app/composables/useO2.ts`
- Create: `app/composables/useObservability.ts`
- Delete: `types/openobserve.d.ts`
- Create: `types/observability.d.ts`

- [ ] **Step 1: Create `app/composables/useObservability.ts`**

```ts
import type { openobserveRum } from "@openobserve/browser-rum";
import type { openobserveLogs } from "@openobserve/browser-logs";
import type { Tracer } from "@opentelemetry/api";
import { SpanStatusCode } from "@opentelemetry/api";
import * as Sentry from "@sentry/nuxt";

export function useObservability() {
	const nuxtApp = useNuxtApp();

	const rum = nuxtApp.$o2Rum as typeof openobserveRum | undefined;
	const logs = nuxtApp.$o2Logs as typeof openobserveLogs | undefined;
	const tracer = nuxtApp.$otelTracer as Tracer | undefined;

	function setUser(user: { id: string; name?: string; email?: string; [key: string]: any }) {
		rum?.setUser(user);
		Sentry.setUser(user);
	}

	function clearUser() {
		rum?.clearUser();
		Sentry.setUser(null);
	}

	function trackAction(name: string, context?: Record<string, any>) {
		rum?.addAction(name, context || {});
		if (tracer) {
			const span = tracer.startSpan(`action:${name}`, {
				attributes: context as Record<string, string>,
			});
			span.end();
		}
	}

	function trackError(message: string, context?: Record<string, any>) {
		logs?.logger.error(message, { source: "custom", ...context });
		Sentry.captureMessage(message, { level: "error", extra: context });
		if (tracer) {
			const span = tracer.startSpan(`error:${message}`);
			span.setStatus({ code: SpanStatusCode.ERROR, message });
			if (context) {
				for (const [k, v] of Object.entries(context)) {
					span.setAttribute(k, String(v));
				}
			}
			span.end();
		}
	}

	function trackInfo(message: string, context?: Record<string, any>) {
		logs?.logger.info(message, { source: "custom", ...context });
		if (tracer) {
			const span = tracer.startSpan(`info:${message}`);
			if (context) {
				for (const [k, v] of Object.entries(context)) {
					span.setAttribute(k, String(v));
				}
			}
			span.end();
		}
	}

	return { rum, logs, tracer, setUser, clearUser, trackAction, trackError, trackInfo };
}
```

- [ ] **Step 2: Delete `app/composables/useO2.ts`**

```bash
git rm app/composables/useO2.ts
```

- [ ] **Step 3: Create `types/observability.d.ts`**

```ts
import type { openobserveRum } from "@openobserve/browser-rum";
import type { openobserveLogs } from "@openobserve/browser-logs";
import type { Tracer } from "@opentelemetry/api";

declare module "#app" {
	interface NuxtApp {
		$o2Rum: typeof openobserveRum;
		$o2Logs: typeof openobserveLogs;
		$otelTracer: Tracer;
	}
}

declare module "vue" {
	interface ComponentCustomProperties {
		$o2Rum: typeof openobserveRum;
		$o2Logs: typeof openobserveLogs;
		$otelTracer: Tracer;
	}
}

export {};
```

- [ ] **Step 4: Delete `types/openobserve.d.ts`**

```bash
git rm types/openobserve.d.ts
```

- [ ] **Step 5: Commit**

```bash
git add app/composables/useObservability.ts types/observability.d.ts
git commit -m "refactor: replace useO2 composable with useObservability (multi-backend dispatch)"
```

---

### Task 10: Build verification

- [ ] **Step 1: Add OTEL_EXPORTER_OTLP_ENDPOINT to `.env`**

Ensure `.env` contains:

```
OTEL_EXPORTER_OTLP_ENDPOINT=https://otelcollectorhttp.philippkrapp.de
```

- [ ] **Step 2: Run build**

```bash
pnpm build
```

Expected: Build succeeds without errors.

- [ ] **Step 3: Run dev server**

```bash
pnpm dev
```

Expected: Server starts, console shows `[OTEL] SDK gestartet` message. No import errors.

- [ ] **Step 4: Fix any build issues**

If there are build errors (missing imports, type issues), fix them before proceeding.

- [ ] **Step 5: Final commit if fixes were needed**

```bash
git add -A
git commit -m "fix: resolve build issues from observability refactoring"
```
