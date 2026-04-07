import { trace, context, SpanStatusCode } from "@opentelemetry/api";
import { createLogger } from "./logger";
import { openobserveRum } from "@openobserve/browser-rum";

// DSN einmalig bei Module-Import lesen (Modul wird waehrend App-Hydration importiert,
// wo der Nuxt-Kontext aktiv ist). Per-Call useRuntimeConfig() wuerde in Event-Handlern
// ausserhalb des Nuxt-Kontexts silent failen und Sentry nie erreichen.
let _sentryDsn: string | undefined;
try {
	_sentryDsn = useRuntimeConfig().public.sentryDsn as string | undefined;
} catch {
	// Ausserhalb Nuxt-Kontext — DSN bleibt undefined
}

const loggers = new Map<string, ReturnType<typeof createLogger>>();

function getLogger(module: string) {
	let log = loggers.get(module);
	if (!log) {
		log = createLogger(module);
		loggers.set(module, log);
	}
	return log;
}

// Dedup: gleiche Error-Message innerhalb 5s nicht mehrfach melden
const recentErrors = new Map<string, number>();
const DEDUP_WINDOW_MS = 5_000;

function isDuplicate(message: string): boolean {
	const key = message.slice(0, 120);
	const now = Date.now();
	const last = recentErrors.get(key);
	if (last && now - last < DEDUP_WINDOW_MS) return true;
	recentErrors.set(key, now);

	if (recentErrors.size > 100) {
		for (const [k, ts] of recentErrors) {
			if (now - ts > DEDUP_WINDOW_MS) recentErrors.delete(k);
		}
	}
	return false;
}

/**
 * Zentraler Frontend-Error-Reporter.
 * Meldet den Fehler an alle 4 Systeme: Frontend Logger (→ O2), OTEL Span, Sentry, O2 RUM.
 * Eingebautes Deduplication (gleiche Message innerhalb 5s wird ignoriert).
 */
export function reportError(module: string, message: string, error: unknown, data?: Record<string, unknown>) {
	const err = error instanceof Error ? error : new Error(String(error));

	if (isDuplicate(message)) return;

	// 1. Frontend Logger → Buffer → POST /api/telemetry/logs → Pino → O2/OTEL/Sentry
	const log = getLogger(module);
	log.error(message, {
		...data,
		error_message: err.message,
		error_stack: err.stack,
	});

	// 2. OTEL Span (wenn aktiv)
	const span = trace.getSpan(context.active());
	if (span) {
		span.setStatus({ code: SpanStatusCode.ERROR, message: err.message });
		span.recordException(err);
	}

	// 3. Sentry captureException (nur wenn DSN konfiguriert)
	if (_sentryDsn) {
		const spanContext = span?.spanContext();
		import("@sentry/nuxt")
			.then((Sentry) => {
				Sentry.captureException(err, {
					tags: {
						module,
						...(spanContext?.traceId && { trace_id: spanContext.traceId }),
					},
					extra: data,
				});
			})
			.catch(() => {
				// Sentry nicht verfuegbar
			});
	}

	// 4. O2 RUM Error
	try {
		openobserveRum.addError(err, { module, ...data });
	} catch {
		// RUM nicht initialisiert
	}
}
