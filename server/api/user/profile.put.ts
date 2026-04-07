import mongoose from "mongoose";

const log = useLogger("api:user");

export default defineEventHandler(async (event) => {
	return withSpan("api.user.profile.update", { "http.route": "/api/user/profile" }, async () => {
		const userId = event.context.user.id;
		const { name } = await readBody<{ name?: string }>(event);

		if (typeof name !== "string" || name.length > 100) {
			log.warn("Ungültiger Name bei Profil-Update", { userId });
			throw createError({ statusCode: 400, message: "Ungültiger Name", data: { traceId: getActiveTraceId() } });
		}

		const db = mongoose.connection.db;
		await db.collection("user").updateOne({ _id: userId }, { $set: { name: name.trim(), updatedAt: new Date() } });

		log.info("Profil aktualisiert", { userId });
		return { success: true };
	});
});
