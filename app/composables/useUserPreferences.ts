import { ref, computed } from "vue";
import { useToast } from "./useToast";
import { createLogger } from "~/utils/logger";

const log = createLogger("preferences");

interface UserPreferences {
	theme: "light" | "dark" | "system";
	dashboardLayout: "grid" | "list";
	showInactiveLose: boolean;
	defaultAnbieter: string | null;
	language: string;
}

const preferences = ref<UserPreferences>({
	theme: "system",
	dashboardLayout: "grid",
	showInactiveLose: false,
	defaultAnbieter: null,
	language: "de",
});

const isLoaded = ref(false);
const isSaving = ref(false);
const lastSaved = ref<Date | null>(null);

let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let pendingChanges: Partial<UserPreferences> = {};

let isAuthenticated = false;

export function useUserPreferences() {
	const { success, error } = useToast();

	async function loadPreferences() {
		try {
			const data = await $fetch<UserPreferences>("/api/preferences");
			if (data) {
				preferences.value = { ...preferences.value, ...data };
			}
			isAuthenticated = true;
			isLoaded.value = true;
			log.info("Preferences geladen", { theme: data?.theme });
		} catch {
			isAuthenticated = false;
			// Fallback to localStorage for non-authenticated users
			const stored = localStorage.getItem("lottozahlen-preferences");
			if (stored) {
				try {
					preferences.value = { ...preferences.value, ...JSON.parse(stored) };
				} catch {
					/* ignored */
				}
			}
			isLoaded.value = true;
		}
	}

	async function saveToServer(changes: Partial<UserPreferences>) {
		isSaving.value = true;
		try {
			const data = await $fetch<UserPreferences>("/api/preferences", {
				method: "PUT",
				body: changes,
			});
			if (data) {
				preferences.value = { ...preferences.value, ...data };
			}
			lastSaved.value = new Date();
			success("Gespeichert");
			log.info("Preferences gespeichert", { keys: Object.keys(changes) });
		} catch {
			error("Speichern fehlgeschlagen");
			log.error("Preferences speichern fehlgeschlagen");
			// Revert optimistic update would go here
		} finally {
			isSaving.value = false;
		}
	}

	function saveToLocalStorage() {
		try {
			localStorage.setItem("lottozahlen-preferences", JSON.stringify(preferences.value));
		} catch {
			/* ignored */
		}
	}

	function updatePreference<K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) {
		// Optimistic update
		preferences.value[key] = value;

		// Save to localStorage
		saveToLocalStorage();

		// Debounced server save only for authenticated users
		if (isAuthenticated) {
			Object.assign(pendingChanges, { [key]: value });

			if (debounceTimer) clearTimeout(debounceTimer);
			debounceTimer = setTimeout(() => {
				const changes = { ...pendingChanges };
				pendingChanges = {};
				saveToServer(changes);
			}, 500);
		}
	}

	function updatePreferences(partial: Partial<UserPreferences>) {
		// Optimistic update
		Object.assign(preferences.value, partial);

		// Save to localStorage
		saveToLocalStorage();

		// Debounced server save only for authenticated users
		if (isAuthenticated) {
			Object.assign(pendingChanges, partial);

			if (debounceTimer) clearTimeout(debounceTimer);
			debounceTimer = setTimeout(() => {
				const changes = { ...pendingChanges };
				pendingChanges = {};
				saveToServer(changes);
			}, 500);
		}
	}

	return {
		preferences: computed(() => preferences.value),
		isLoaded: computed(() => isLoaded.value),
		isSaving: computed(() => isSaving.value),
		lastSaved: computed(() => lastSaved.value),
		loadPreferences,
		updatePreference,
		updatePreferences,
	};
}
