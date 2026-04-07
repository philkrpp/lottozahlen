/**
 * Health-Status aller Telemetry-Backends.
 *
 * Zeigt auf einen Blick welche Logger-Destinations gesund sind,
 * wie viele Logs im Buffer warten, und ob consecutive Failures vorliegen.
 */
export default defineEventHandler(() => {
	const health = getLoggerHealth();

	const allHealthy = health.o2.healthy && health.otel.healthy;

	return {
		status: allHealthy ? "healthy" : "degraded",
		backends: health,
		timestamp: new Date().toISOString(),
	};
});
