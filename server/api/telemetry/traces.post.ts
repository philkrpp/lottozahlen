/**
 * Proxy fuer Frontend-Traces -> OTLP Backend (SigNoz).
 *
 * OTLP-Endpoint bleibt intern (nicht oeffentlich),
 * Rate-Limiting und Payload-Validierung auf Server-Seite.
 */
const log = useLogger("telemetry:traces");

export default defineEventHandler(async (event) => {
	const otlpEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;
	if (!otlpEndpoint) {
		return { status: "ok", message: "No OTLP endpoint configured, traces discarded" };
	}

	let body: string | undefined;
	try {
		body = await readRawBody(event);
	} catch {
		// Connection aborted (e.g. browser navigated away) — silently discard
		return { status: "ok" };
	}

	if (!body) {
		throw createError({ statusCode: 400, statusMessage: "Empty body" });
	}

	if (body.length > 512_000) {
		throw createError({ statusCode: 413, statusMessage: "Payload too large" });
	}

	try {
		const res = await fetch(`${otlpEndpoint}/v1/traces`, {
			method: "POST",
			headers: {
				"Content-Type": getHeader(event, "content-type") || "application/json",
			},
			body,
		});

		if (!res.ok) {
			log.warn(`OTLP Trace-Forward fehlgeschlagen: HTTP ${res.status}`, {
				statusCode: res.status,
			});
			throw createError({ statusCode: 502, statusMessage: "OTLP backend error" });
		}

		return { status: "ok" };
	} catch (error) {
		if ((error as { statusCode?: number }).statusCode) throw error;
		log.error("OTLP Trace-Forward fehlgeschlagen", { endpoint: otlpEndpoint }, error instanceof Error ? error : undefined);
		throw createError({ statusCode: 502, statusMessage: "OTLP backend unreachable" });
	}
});
