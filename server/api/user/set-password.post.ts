import { hashPassword } from "better-auth/crypto";
import mongoose from "mongoose";

const log = useLogger("api:user");

export default defineEventHandler(async (event) => {
	return withSpan("api.user.password.set", { "http.route": "/api/user/set-password" }, async () => {
		const session = event.context.session;
		if (!session) {
			throw createError({ statusCode: 401, message: "Nicht authentifiziert", data: { traceId: getActiveTraceId() } });
		}

		const userId = event.context.user.id;

		// Only allow password set for fresh sessions (< 10 minutes)
		const sessionAge = Date.now() - new Date(session.createdAt).getTime();
		if (sessionAge > 10 * 60 * 1000) {
			log.warn("Passwort setzen: Session zu alt", { userId, sessionAgeMs: sessionAge });
			throw createError({
				statusCode: 403,
				message: "Session zu alt. Bitte fordere einen neuen Link an.",
				data: { traceId: getActiveTraceId() },
			});
		}

		const { newPassword } = await readBody<{ newPassword: string }>(event);

		if (!newPassword || newPassword.length < 8) {
			log.warn("Passwort setzen: zu kurz", { userId });
			throw createError({
				statusCode: 400,
				message: "Passwort muss mindestens 8 Zeichen lang sein",
				data: { traceId: getActiveTraceId() },
			});
		}

		const hashedPassword = await hashPassword(newPassword);

		const db = mongoose.connection.db;
		await db
			.collection("account")
			.updateOne({ userId, providerId: "credential" }, { $set: { password: hashedPassword } });

		// Invalidate all other sessions (keep current)
		await db.collection("session").deleteMany({
			userId,
			_id: { $ne: session.id },
		});

		log.info("Passwort gesetzt (via Magic Link), andere Sessions invalidiert", { userId });
		return { success: true };
	});
});
