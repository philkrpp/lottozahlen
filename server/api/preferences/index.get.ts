import UserPreference from "~~/server/models/UserPreference";

export default defineEventHandler(async (event) => {
	return withSpan("api.preferences.get", { "http.route": "/api/preferences" }, async () => {
		const userId = event.context.user.id;

		let prefs = await UserPreference.findOne({ userId });
		if (!prefs) {
			prefs = await UserPreference.create({ userId });
		}
		return prefs;
	});
});
