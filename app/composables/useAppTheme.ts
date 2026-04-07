import { ref, computed, watch, onMounted } from "vue";
import { useTheme as useVuetifyTheme } from "vuetify";
import { useUserPreferences } from "./useUserPreferences";

type ThemeMode = "light" | "dark" | "system";

const themeMode = ref<ThemeMode>("system");
const systemPrefersDark = ref(false);

export function useAppTheme() {
	const { preferences, updatePreference } = useUserPreferences();

	// Cookie for SSR-safe theme — lets the server render the correct theme
	const themeCookie = useCookie<"light" | "dark">("lz_color-scheme", {
		default: () => "dark",
		maxAge: 60 * 60 * 24 * 365,
	});

	let vuetifyTheme: ReturnType<typeof useVuetifyTheme> | null = null;
	try {
		vuetifyTheme = useVuetifyTheme();
	} catch {
		/* ignored */
	}

	// Apply cookie-based theme immediately during setup (SSR + client)
	if (vuetifyTheme && themeCookie.value) {
		vuetifyTheme.change(themeCookie.value);
	}

	const isDark = computed(() => {
		if (themeMode.value === "system") return systemPrefersDark.value;
		return themeMode.value === "dark";
	});

	const resolvedTheme = computed<"light" | "dark">(() => (isDark.value ? "dark" : "light"));

	// Vue Bits theme-aware colors
	const vueBitsColors = computed(() => ({
		auroraColors: isDark.value ? ["#0A0F1E", "#00E5CC", "#38BDF8"] : ["#FAFBFC", "#0D9488", "#0EA5E9"],
		particleColor: isDark.value ? "#00E5CC" : "#0D9488",
		gradientFrom: isDark.value ? "#00e5cc" : "#0d9488",
		gradientTo: isDark.value ? "#38bdf8" : "#0ea5e9",
	}));

	function applyTheme() {
		if (vuetifyTheme) {
			vuetifyTheme.change(resolvedTheme.value);
		}
		themeCookie.value = resolvedTheme.value;
	}

	function setTheme(mode: ThemeMode) {
		themeMode.value = mode;
		updatePreference("theme", mode);
		applyTheme();
	}

	function toggleTheme() {
		setTheme(isDark.value ? "light" : "dark");
	}

	function initTheme() {
		// Read persisted theme synchronously from localStorage
		// (reactive preferences may not be loaded from API yet)
		try {
			const stored = localStorage.getItem("lottozahlen-preferences");
			if (stored) {
				const parsed = JSON.parse(stored);
				if (parsed.theme && ["light", "dark", "system"].includes(parsed.theme)) {
					themeMode.value = parsed.theme;
				}
			}
		} catch {
			/* ignored */
		}

		// Listen for system preference changes
		if (typeof window !== "undefined") {
			const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
			systemPrefersDark.value = mediaQuery.matches;

			mediaQuery.addEventListener("change", (e) => {
				systemPrefersDark.value = e.matches;
				if (themeMode.value === "system") {
					applyTheme();
				}
			});
		}

		applyTheme();
	}

	// Watch for preference changes (e.g., loaded async from server)
	watch(
		() => preferences.value.theme,
		(newTheme) => {
			if (newTheme && newTheme !== themeMode.value) {
				themeMode.value = newTheme;
				applyTheme();
			}
		},
	);

	onMounted(() => {
		initTheme();
	});

	return {
		theme: themeMode,
		isDark,
		resolvedTheme,
		vueBitsColors,
		setTheme,
		toggleTheme,
		initTheme,
	};
}
