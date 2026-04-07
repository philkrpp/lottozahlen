import Draw from "~~/server/models/Draw";

export default defineEventHandler(async (event) => {
	return withSpan("api.draws.list", { "http.route": "/api/draws" }, async (span) => {
		const query = getQuery(event);
		const page = Math.max(1, Number(query.page) || 1);
		const limit = Math.min(50, Math.max(1, Number(query.limit) || 20));
		const anbieter = query.anbieter as string | undefined;

		const filter: Record<string, string> = {};
		if (anbieter) filter.anbieter = anbieter;

		const [draws, total] = await Promise.all([
			Draw.find(filter)
				.sort({ drawDate: -1 })
				.skip((page - 1) * limit)
				.limit(limit),
			Draw.countDocuments(filter),
		]);

		span.setAttribute("draws.count", draws.length);
		span.setAttribute("draws.total", total);
		return { draws, total, page, limit, totalPages: Math.ceil(total / limit) };
	});
});
