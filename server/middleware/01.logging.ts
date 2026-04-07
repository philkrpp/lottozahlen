import pinoHttp from "pino-http";
import { rootLogger } from "../utils/logger";

const httpLogger = pinoHttp({
	logger: rootLogger.child({ module: "http" }),
	autoLogging: {
		ignore: (req) => {
			const url = req.url || "";
			return url.startsWith("/_nuxt") || url.startsWith("/__nuxt");
		},
	},
	customReceivedMessage(req) {
		return `→ ${req.method} ${req.url}`;
	},
	customLogLevel(_req, res, err) {
		if (err || (res.statusCode && res.statusCode >= 500)) return "error";
		if (res.statusCode && res.statusCode >= 400) return "warn";
		return "info";
	},
	customSuccessMessage(req, res, responseTime) {
		return `${req.method} ${req.url} ${res.statusCode} (${Math.round(responseTime)}ms)`;
	},
	customErrorMessage(req, _res, err) {
		return `${req.method} ${req.url} ${err.message}`;
	},
	customProps(req) {
		return {
			meta: {
				userAgent: req.headers["user-agent"] || "",
				ip: (req.headers["x-forwarded-for"] as string) || (req.headers["x-real-ip"] as string) || "",
			},
		};
	},
});

export default defineEventHandler((event) => {
	httpLogger(event.node.req, event.node.res);
});
