import { createLogger } from "~/utils/logger";
import { trace, context, SpanStatusCode } from "@opentelemetry/api";

const log = createLogger("error");

// --- Error-Deduplizierung ---
const recentErrors = new Map<string, number>();

function getErrorFingerprint(message: string, type: string, stack?: string): string {
	const stackLine = stack?.split("\n")[1]?.trim() || "";
	return `${type}:${message}:${stackLine}`;
}

function isDuplicate(fingerprint: string, dedupWindowMs: number): boolean {
	const lastSeen = recentErrors.get(fingerprint);
	const now = Date.now();
	if (lastSeen && now - lastSeen < dedupWindowMs) return true;
	recentErrors.set(fingerprint, now);
	// Alte Eintraege bereinigen
	if (recentErrors.size > 100) {
		for (const [key, ts] of recentErrors) {
			if (now - ts > dedupWindowMs) recentErrors.delete(key);
		}
	}
	return false;
}

export default defineNuxtPlugin((nuxtApp) => {
	const dedupWindowMs = useRuntimeConfig().public.errorDedupWindowMs ?? 5000;

	// Vue Error Handler — faengt alle Errors in Vue-Komponenten
	nuxtApp.vueApp.config.errorHandler = (error, instance, info) => {
		const err = error as Error;
		const fingerprint = getErrorFingerprint(err.message, "vue_error", err.stack);
		if (isDuplicate(fingerprint, dedupWindowMs)) return;

		log.error(err.message, {
			stack: err.stack,
			component: instance?.$options?.name || "unknown",
			info,
			type: "vue_error",
		});

		const span = trace.getSpan(context.active());
		if (span) {
			span.setStatus({ code: SpanStatusCode.ERROR, message: err.message });
			span.recordException(err);
		}
	};

	// Unhandled Promise Rejections
	window.addEventListener("unhandledrejection", (event) => {
		const reason = event.reason;
		const message = reason?.message || "Unhandled Promise Rejection";
		const fingerprint = getErrorFingerprint(message, "unhandled_rejection", reason?.stack);
		if (isDuplicate(fingerprint, dedupWindowMs)) return;

		log.error(message, {
			stack: reason?.stack,
			type: "unhandled_rejection",
		});

		const span = trace.getSpan(context.active());
		if (span) {
			span.setStatus({ code: SpanStatusCode.ERROR, message });
			if (reason instanceof Error) span.recordException(reason);
		}
	});

	// Uncaught Exceptions
	window.addEventListener("error", (event) => {
		if (!event.filename) return;

		const fingerprint = getErrorFingerprint(event.message, "uncaught_exception", `${event.filename}:${event.lineno}`);
		if (isDuplicate(fingerprint, dedupWindowMs)) return;

		log.error(event.message, {
			filename: event.filename,
			lineno: event.lineno,
			colno: event.colno,
			type: "uncaught_exception",
		});

		const span = trace.getSpan(context.active());
		if (span) {
			span.setStatus({ code: SpanStatusCode.ERROR, message: event.message });
			if (event.error instanceof Error) span.recordException(event.error);
		}
	});
});
