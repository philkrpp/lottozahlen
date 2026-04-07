import { ref, computed } from "vue";
import { useToast } from "./useToast";
import { createLogger } from "~/utils/logger";

const log = createLogger("notifications");

interface NotificationSettings {
	_id: string;
	userId: string;
	emailEnabled: boolean;
	emailAddress: string;
	slackEnabled: boolean;
	slackWebhookUrl: string | null;
	notifyOnWin: boolean;
	notifyOnNoWin: boolean;
	notifyOnNewDraw: boolean;
}

const settings = ref<NotificationSettings | null>(null);
const isLoading = ref(false);
const isSaving = ref(false);

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

export function useNotifications() {
	const { success, error } = useToast();

	async function fetchSettings() {
		isLoading.value = true;
		try {
			const data = await $fetch<NotificationSettings>("/api/notifications/settings");
			settings.value = data;
			log.info("Notification-Settings geladen");
		} catch {
			error("Benachrichtigungs-Einstellungen konnten nicht geladen werden");
			log.error("Notification-Settings laden fehlgeschlagen");
		} finally {
			isLoading.value = false;
		}
	}

	async function updateSettings(data: Partial<NotificationSettings>) {
		if (!settings.value) return;

		// Optimistic update
		Object.assign(settings.value, data);

		// Debounced save
		if (debounceTimer) clearTimeout(debounceTimer);
		debounceTimer = setTimeout(async () => {
			isSaving.value = true;
			try {
				const updated = await $fetch<NotificationSettings>("/api/notifications/settings", {
					method: "PUT",
					body: data,
				});
				settings.value = updated;
				success("Gespeichert");
				log.info("Notification-Settings aktualisiert", { keys: Object.keys(data) });
			} catch {
				error("Speichern fehlgeschlagen");
				log.error("Notification-Settings speichern fehlgeschlagen");
			} finally {
				isSaving.value = false;
			}
		}, 500);
	}

	async function sendTestNotification(type: "email" | "slack") {
		log.info("Test-Benachrichtigung senden", { type });
		try {
			await $fetch("/api/notifications/test", {
				method: "POST",
				body: { type },
			});
			success(`Test-${type === "email" ? "E-Mail" : "Slack-Nachricht"} wurde gesendet`);
			log.info("Test-Benachrichtigung gesendet", { type });
		} catch {
			error(`Test-Benachrichtigung konnte nicht gesendet werden`);
			log.error("Test-Benachrichtigung fehlgeschlagen", { type });
		}
	}

	return {
		settings: computed(() => settings.value),
		isLoading: computed(() => isLoading.value),
		isSaving: computed(() => isSaving.value),
		fetchSettings,
		updateSettings,
		sendTestNotification,
	};
}
