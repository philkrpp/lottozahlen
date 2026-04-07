import { z } from "zod";
import NotificationSetting from "~~/server/models/NotificationSetting";

const log = useLogger("api:notifications");

const updateNotificationSettingsSchema = z.object({
	emailEnabled: z.boolean().optional(),
	emailAddress: z.string().email("Ungueltige E-Mail-Adresse").optional(),
	slackEnabled: z.boolean().optional(),
	slackWebhookUrl: z.string().url("Ungueltige Webhook-URL").nullable().optional(),
	notifyOnWin: z.boolean().optional(),
	notifyOnNoWin: z.boolean().optional(),
	notifyOnNewDraw: z.boolean().optional(),
});

export default defineEventHandler(async (event) => {
	return withSpan("api.notifications.settings.update", { "http.route": "/api/notifications/settings" }, async () => {
		const userId = event.context.user.id;
		const body = await readBody(event);
		const data = updateNotificationSettingsSchema.parse(body);

		const settings = await NotificationSetting.findOneAndUpdate(
			{ userId },
			{ $set: data },
			{ returnDocument: "after", upsert: true },
		);

		log.info("Benachrichtigungs-Einstellungen aktualisiert", { userId, fields: Object.keys(data) });
		return settings;
	});
});
