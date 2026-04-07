import { trace, SpanStatusCode, context, propagation, type Span } from "@opentelemetry/api";

const tracer = trace.getTracer("lottozahlen");

/**
 * Wrapper fuer async Funktionen mit automatischem Span.
 * Nutzt AsyncLocalStorage — der Span-Context wird automatisch
 * an alle aufgerufenen Funktionen vererbt.
 *
 * Overloads:
 *   withSpan('name', async (span) => { ... })
 *   withSpan('name', { attributes }, async (span) => { ... })
 */
export async function withSpan<T>(
	name: string,
	attributesOrFn: Record<string, string | number | boolean> | ((span: Span) => Promise<T>),
	maybeFn?: (span: Span) => Promise<T>,
): Promise<T> {
	const attributes = typeof attributesOrFn === "function" ? {} : attributesOrFn;
	const fn = typeof attributesOrFn === "function" ? attributesOrFn : maybeFn!;

	return tracer.startActiveSpan(name, { attributes }, async (span) => {
		try {
			const result = await fn(span);
			span.setStatus({ code: SpanStatusCode.OK });
			return result;
		} catch (error) {
			span.setStatus({
				code: SpanStatusCode.ERROR,
				message: (error as Error).message,
			});
			span.recordException(error as Error);
			throw error;
		} finally {
			span.end();
		}
	});
}

/**
 * Trace-Context in ausgehende HTTP-Headers injizieren.
 * Nutzen bei manuellen fetch()-Calls zu externen Services,
 * damit der Trace ueber Service-Grenzen hinweg propagiert wird.
 */
export function injectTraceContext(headers: Record<string, string> = {}): Record<string, string> {
	propagation.inject(context.active(), headers);
	return headers;
}

/**
 * Aktive Trace-ID holen — z.B. fuer Error-Responses an den Client.
 */
export function getActiveTraceId(): string | undefined {
	return trace.getSpan(context.active())?.spanContext().traceId;
}
