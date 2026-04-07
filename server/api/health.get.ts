import mongoose from "mongoose";

export default defineEventHandler(async () => {
	return withSpan("api.health.check", { "http.route": "/api/health" }, async (span) => {
		const mongoState = mongoose.connection.readyState;
		// 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
		const isMongoHealthy = mongoState === 1;
		span.setAttribute("db.mongo.state", mongoState);

		if (!isMongoHealthy) {
			throw createError({
				statusCode: 503,
				statusMessage: "Service Unavailable",
				data: {
					status: "unhealthy",
					mongo: mongoState === 2 ? "connecting" : "disconnected",
					timestamp: new Date().toISOString(),
					traceId: getActiveTraceId(),
				},
			});
		}

		return {
			status: "healthy",
			mongo: "connected",
			timestamp: new Date().toISOString(),
		};
	});
});
