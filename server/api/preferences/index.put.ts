import { z } from "zod";
import UserPreference from "~~/server/models/UserPreference";

const preferencesSchema = z.object({
	theme: z.enum(["light", "dark", "system"]).optional(),
	dashboardLayout: z.enum(["grid", "list"]).optional(),
	showInactiveLose: z.boolean().optional(),
	defaultAnbieter: z.string().nullable().optional(),
	language: z.string().optional(),
});

export default defineEventHandler(async (event) => {
	return withSpan("api.preferences.update", { "http.route": "/api/preferences" }, async () => {
		const userId = event.context.user.id;
		const body = await readBody(event);
		const data = preferencesSchema.parse(body);

		const prefs = await UserPreference.findOneAndUpdate(
			{ userId },
			{ $set: data },
			{ returnDocument: "after", upsert: true },
		);
		return prefs;
	});
});
