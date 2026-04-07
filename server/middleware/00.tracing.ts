import { trace, context } from "@opentelemetry/api";

export default defineEventHandler((event) => {
	const span = trace.getSpan(context.active());
	if (!span) return;

	const method = getMethod(event);
	const path = getRequestURL(event).pathname;

	// Request-ID fuer zusaetzliche Korrelation
	const requestId = getHeader(event, "x-request-id") || crypto.randomUUID();
	setHeader(event, "x-request-id", requestId);

	// Root-Span (von auto-instrumentation) mit Request-Details anreichern
	span.updateName(`${method} ${path}`);
	span.setAttribute("http.request_id", requestId);
	span.setAttribute("http.route", path);
});
