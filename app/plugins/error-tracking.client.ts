import { reportError } from "~/utils/report-error";
import { createLogger } from "~/utils/logger";

const log = createLogger("error");

function safeStringify(value: unknown): string {
	try {
		return JSON.stringify(value);
	} catch {
		return String(value);
	}
}

export default defineNuxtPlugin({
	name: "error-tracking",
	dependsOn: ["openobserve", "otel"],
	setup(nuxtApp) {
		// Vue Error Handler — faengt alle Errors in Vue-Komponenten
		nuxtApp.vueApp.config.errorHandler = (error, instance, info) => {
			const message = error instanceof Error ? error.message : String(error);
			reportError("vue", message, error, {
				component: instance?.$options?.name || "unknown",
				info,
				type: "vue_error",
			});
		};

		// Unhandled Promise Rejections
		window.addEventListener("unhandledrejection", (event) => {
			const reason = event.reason;
			reportError("global", reason?.message || "Unhandled Promise Rejection", reason ?? "unknown", {
				type: "unhandled_rejection",
			});
		});

		// Uncaught Exceptions
		window.addEventListener("error", (event) => {
			if (!event.filename) return;
			reportError("global", event.message, event.error ?? event.message, {
				filename: event.filename,
				lineno: event.lineno,
				colno: event.colno,
				type: "uncaught_exception",
			});
		});

		// Console Override: Third-Party console.error/warn durch Logger routen.
		// Eigene Logs starten mit "[" (z.B. "[Logger]", "[O2]") und werden nicht doppelt erfasst.
		const originalConsoleError = console.error;
		console.error = (...args: unknown[]) => {
			originalConsoleError.apply(console, args);
			const first = typeof args[0] === "string" ? args[0] : "";
			if (!first.startsWith("[")) {
				const message = args.map((a) => (typeof a === "string" ? a : safeStringify(a))).join(" ");
				log.error(message, { type: "third_party_console_error" });
			}
		};

		const originalConsoleWarn = console.warn;
		console.warn = (...args: unknown[]) => {
			originalConsoleWarn.apply(console, args);
			const first = typeof args[0] === "string" ? args[0] : "";
			if (!first.startsWith("[")) {
				const message = args.map((a) => (typeof a === "string" ? a : safeStringify(a))).join(" ");
				log.warn(message, { type: "third_party_console_warn" });
			}
		};
	},
});
