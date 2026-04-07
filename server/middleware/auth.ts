import { trace, context } from "@opentelemetry/api";
import { getAuth } from "~~/server/utils/auth";

const log = useLogger("auth");

export default defineEventHandler(async (event) => {
	const url = getRequestURL(event);

	// Skip auth routes, health check, and telemetry endpoints
	if (
		url.pathname.startsWith("/api/auth") ||
		url.pathname === "/api/health" ||
		url.pathname.startsWith("/api/telemetry")
	) {
		return;
	}

	// Only protect API routes
	if (!url.pathname.startsWith("/api/")) {
		return;
	}

	const session = await getAuth().api.getSession({ headers: event.headers });

	if (!session) {
		const ip = getHeader(event, "x-forwarded-for") || getHeader(event, "x-real-ip") || "";
		log.warn("Auth fehlgeschlagen", { path: url.pathname, ip });
		throw createError({ statusCode: 401, message: "Nicht authentifiziert", data: { traceId: getActiveTraceId() } });
	}

	event.context.user = session.user;
	event.context.session = session.session;

	// User-ID auf den aktiven Span setzen fuer Trace-Korrelation
	const span = trace.getSpan(context.active());
	if (span) {
		span.setAttribute("user.id", session.user.id);
	}

	log.debug("Auth erfolgreich", { userId: session.user.id, path: url.pathname });
});
