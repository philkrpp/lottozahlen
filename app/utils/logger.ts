import { trace, context } from "@opentelemetry/api";
import { getSessionId, getUserId } from "./session";

type LogLevel = "debug" | "info" | "warn" | "error";

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
	debug: 0,
	info: 1,
	warn: 2,
	error: 3,
};

function getMinLogLevel(): LogLevel {
	try {
		return (useRuntimeConfig().public.logLevel as LogLevel) || "debug";
	} catch {
		return "debug";
	}
}

interface RumInternalContext {
	application_id: string;
	session_id: string;
	view?: { id: string; name?: string; url?: string; referrer?: string };
	user_action?: { id: string };
}

interface LogEntry {
	timestamp: string;
	level: LogLevel;
	message: string;
	module?: string;
	trace_id?: string;
	span_id?: string;
	session_id: string;
	rum_session_id?: string;
	rum_view_id?: string;
	rum_application_id?: string;
	user_id?: string;
	route?: string;
	data?: Record<string, unknown>;
}

const LOG_BUFFER: LogEntry[] = [];
const MAX_BUFFER_SIZE = 50;
const FLUSH_INTERVAL_MS = 10_000;
let _flushing = false;

// Sentry als Fallback fuer Error-Logs (async Import damit kein harter Dependency-Fehler)
let _sentry: { addBreadcrumb: (breadcrumb: Record<string, unknown>) => void } | null = null;
if (typeof window !== "undefined") {
	import("@sentry/nuxt")
		.then((s) => {
			_sentry = s;
		})
		.catch(() => {
			// @sentry/nuxt nicht verfuegbar
		});
}

function getRumContext(): RumInternalContext | undefined {
	const ooRum = (window as any).OO_RUM;
	return ooRum?.getInternalContext?.();
}

function createLogEntry(level: LogLevel, message: string, module?: string, data?: Record<string, unknown>): LogEntry {
	const span = trace.getSpan(context.active());
	const spanContext = span?.spanContext();
	const rumCtx = getRumContext();

	return {
		timestamp: new Date().toISOString(),
		level,
		message,
		module,
		trace_id: spanContext?.traceId,
		span_id: spanContext?.spanId,
		session_id: rumCtx?.session_id || getSessionId(),
		rum_session_id: rumCtx?.session_id,
		rum_view_id: rumCtx?.view?.id,
		rum_application_id: rumCtx?.application_id,
		user_id: getUserId(),
		route: window.location.pathname,
		...(data && { data }),
	};
}

function pushLog(entry: LogEntry) {
	const minLevel = getMinLogLevel();
	if (LOG_LEVEL_PRIORITY[entry.level] < LOG_LEVEL_PRIORITY[minLevel]) return;

	LOG_BUFFER.push(entry);

	// Sentry-Breadcrumb fuer warn/error als Fallback falls Server nicht erreichbar
	if (_sentry && (entry.level === "error" || entry.level === "warn")) {
		_sentry.addBreadcrumb({
			category: "logger",
			message: entry.message,
			level: entry.level,
			data: { module: entry.module, route: entry.route },
		});
	}

	if (entry.level === "error" || LOG_BUFFER.length >= MAX_BUFFER_SIZE) {
		flushLogs();
	}
}

async function flushLogs() {
	if (LOG_BUFFER.length === 0 || _flushing) return;

	_flushing = true;
	const logsToSend = LOG_BUFFER.splice(0);

	try {
		await fetch("/api/telemetry/logs", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ logs: logsToSend }),
			keepalive: true,
		});
	} catch (e) {
		console.error("[Logger] Flush fehlgeschlagen:", e);
		if (LOG_BUFFER.length < 200) {
			LOG_BUFFER.unshift(...logsToSend);
		}
	} finally {
		_flushing = false;
	}
}

if (typeof window !== "undefined") {
	setInterval(flushLogs, FLUSH_INTERVAL_MS);

	window.addEventListener("visibilitychange", () => {
		if (document.visibilityState === "hidden") {
			if (LOG_BUFFER.length > 0) {
				const logsToSend = LOG_BUFFER.splice(0);
				const queued = navigator.sendBeacon("/api/telemetry/logs", JSON.stringify({ logs: logsToSend }));
				if (!queued) {
					console.warn("[Logger] sendBeacon fehlgeschlagen — Logs gehen moeglicherweise verloren");
				}
			}
		}
	});
}

export function createLogger(module: string) {
	return {
		debug: (msg: string, data?: Record<string, unknown>) => pushLog(createLogEntry("debug", msg, module, data)),
		info: (msg: string, data?: Record<string, unknown>) => pushLog(createLogEntry("info", msg, module, data)),
		warn: (msg: string, data?: Record<string, unknown>) => pushLog(createLogEntry("warn", msg, module, data)),
		error: (msg: string, data?: Record<string, unknown>) => pushLog(createLogEntry("error", msg, module, data)),
	};
}

export const logger = createLogger("app");
