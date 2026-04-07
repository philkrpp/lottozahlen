/**
 * Empfaengt gebatchte Frontend-Logs.
 *
 * Logs werden validiert, bereinigt, mit Server-Metadaten angereichert
 * und an den Pino-Logger weitergeleitet. Dadurch landen sie in allen
 * konfigurierten Streams (Console, OpenObserve, Sentry, OTEL/SigNoz).
 */

// --- IP-basiertes Rate-Limiting ---
const RATE_LIMIT_WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 30;
const rateLimitMap = new Map<string, { count: number; windowStart: number }>();

setInterval(() => {
	const now = Date.now();
	for (const [ip, entry] of rateLimitMap) {
		if (now - entry.windowStart > RATE_LIMIT_WINDOW_MS) rateLimitMap.delete(ip);
	}
}, RATE_LIMIT_WINDOW_MS);

function isRateLimited(ip: string): boolean {
	const now = Date.now();
	const entry = rateLimitMap.get(ip);

	if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
		rateLimitMap.set(ip, { count: 1, windowStart: now });
		return false;
	}

	entry.count++;
	return entry.count > MAX_REQUESTS_PER_WINDOW;
}

interface FrontendLogEntry {
	timestamp: string;
	level: "debug" | "info" | "warn" | "error";
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

const ALLOWED_LEVELS = ["debug", "info", "warn", "error"] as const;
const MAX_MESSAGE_LENGTH = 2000;
const MAX_LOGS_PER_BATCH = 100;

const log = useLogger("frontend");

export default defineEventHandler(async (event) => {
	const clientIp =
		getHeader(event, "x-forwarded-for")?.split(",")[0]?.trim() || getHeader(event, "x-real-ip") || "unknown";

	if (isRateLimited(clientIp)) {
		throw createError({ statusCode: 429, statusMessage: "Too many requests" });
	}

	let body: { logs: FrontendLogEntry[] } | undefined;
	try {
		body = await readBody<{ logs: FrontendLogEntry[] }>(event);
	} catch {
		// Connection aborted (e.g. browser navigated away) — silently discard
		return { status: "ok", received: 0 };
	}

	if (!body?.logs || !Array.isArray(body.logs)) {
		throw createError({ statusCode: 400, statusMessage: "Invalid payload" });
	}

	const logs = body.logs.slice(0, MAX_LOGS_PER_BATCH);

	for (const entry of logs) {
		if (!ALLOWED_LEVELS.includes(entry.level as (typeof ALLOWED_LEVELS)[number])) continue;
		if (!entry.message || typeof entry.message !== "string") continue;

		const sanitizedMessage = entry.message.slice(0, MAX_MESSAGE_LENGTH);

		const meta = {
			source: "frontend" as const,
			module: entry.module || "frontend",
			trace_id: entry.trace_id,
			span_id: entry.span_id,
			session_id: entry.session_id,
			rum_session_id: entry.rum_session_id,
			rum_view_id: entry.rum_view_id,
			rum_application_id: entry.rum_application_id,
			user_id: entry.user_id,
			route: entry.route,
			client_ip: clientIp,
			client_timestamp: entry.timestamp,
			...(entry.data && {
				data: JSON.parse(JSON.stringify(entry.data).slice(0, 5000)),
			}),
		};

		switch (entry.level) {
			case "error":
				log.error(sanitizedMessage, meta);
				break;
			case "warn":
				log.warn(sanitizedMessage, meta);
				break;
			case "info":
				log.info(sanitizedMessage, meta);
				break;
			case "debug":
				log.debug(sanitizedMessage, meta);
				break;
		}
	}

	return { status: "ok", received: logs.length };
});
