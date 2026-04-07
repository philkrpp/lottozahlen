export default defineNitroPlugin((nitroApp) => {
	const log = useLogger("nitro");

	// --- Unhandled Errors in Nitro ---
	nitroApp.hooks.hook("error", (error, { event }) => {
		const url = event ? getRequestURL(event).pathname : "unknown";
		const method = event ? getMethod(event) : "unknown";
		const traceId = getActiveTraceId();

		log.error(`Server Error: ${error.message}`, {
			path: url,
			method,
			type: "unhandled_error",
			...(traceId && { traceId }),
		}, error);

		// Trace-ID an Response-Header anhaengen
		if (event && traceId) {
			setHeader(event, "x-trace-id", traceId);
		}
	});

	// --- Process-Level Errors ---
	process.on("unhandledRejection", (reason: unknown) => {
		const err = reason instanceof Error ? reason : new Error(String(reason));
		log.fatal(`Unhandled Rejection: ${err.message}`, {
			type: "unhandled_rejection",
		}, err);
	});

	process.on("uncaughtException", (error) => {
		log.fatal(`Uncaught Exception: ${error.message}`, {
			type: "uncaught_exception",
		}, error);
	});

	// --- Graceful Shutdown: Logs flushen vor dem Beenden ---
	nitroApp.hooks.hook("close", async () => {
		log.info("Server wird heruntergefahren — Logs werden geflusht.");
		await flushLogs();
	});
});
