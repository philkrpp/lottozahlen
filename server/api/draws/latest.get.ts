import Draw from "~~/server/models/Draw";

export default defineEventHandler(async (event) => {
	return withSpan("api.draws.latest", { "http.route": "/api/draws/latest" }, async (span) => {
		const query = getQuery(event);
		const anbieter = (query.anbieter as string) || "deutsche-fernsehlotterie";
		span.setAttribute("draws.anbieter", anbieter);

		const draw = await Draw.findOne({ anbieter }).sort({ drawDate: -1 });
		return draw;
	});
});
