import { trace, SpanStatusCode } from "@opentelemetry/api";
import { createLogger } from "~/utils/logger";

const tracer = trace.getTracer("lottozahlen-frontend");

export function useTracking(module: string) {
	const log = createLogger(module);

	async function trackAction<T>(
		action: string,
		attributes: Record<string, string | number | boolean>,
		fn: () => Promise<T>,
	): Promise<T> {
		const spanName = `ui.${module}.${action}`;

		return tracer.startActiveSpan(
			spanName,
			{
				attributes: {
					...attributes,
					"ui.action": action,
					"ui.module": module,
					"ui.route": window.location.pathname,
				},
			},
			async (span) => {
				try {
					log.info(`Action: ${action}`, attributes as Record<string, unknown>);
					const result = await fn();
					span.setStatus({ code: SpanStatusCode.OK });
					return result;
				} catch (error) {
					const err = error as Error;
					span.setStatus({
						code: SpanStatusCode.ERROR,
						message: err.message,
					});
					span.recordException(err);
					log.error(`Action failed: ${action}`, {
						...attributes,
						error: err.message,
					});
					throw error;
				} finally {
					span.end();
				}
			},
		);
	}

	function trackEvent(event: string, data?: Record<string, unknown>) {
		log.info(`Event: ${event}`, data);
	}

	return { trackAction, trackEvent };
}
