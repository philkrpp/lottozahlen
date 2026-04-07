import NotificationSetting from "~~/server/models/NotificationSetting";

export default defineEventHandler(async (event) => {
	return withSpan("api.notifications.settings.get", { "http.route": "/api/notifications/settings" }, async () => {
		const userId = event.context.user.id;

		let settings = await NotificationSetting.findOne({ userId });
		if (!settings) {
			settings = await NotificationSetting.create({
				userId,
				emailAddress: event.context.user.email,
			});
		}
		return settings;
	});
});
