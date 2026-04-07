import "vanilla-cookieconsent/dist/cookieconsent.css";
import * as CookieConsent from "vanilla-cookieconsent";

const PUBLIC_ROUTES = ["/", "/agb", "/datenschutz", "/impressum"];

export default defineNuxtPlugin(async () => {
	const router = useRouter();
	const { getSession } = useAuth();

	const session = await getSession();
	const isAuthenticated = !!session.data;

	if (isAuthenticated) {
		CookieConsent.run({
			autoShow: false,
			categories: { necessary: { enabled: true, readOnly: true }, analytics: {} },
			language: { default: "de", translations: { de: {} } },
		});
		CookieConsent.acceptCategory("all");
		return;
	}

	const isPublicRoute = PUBLIC_ROUTES.includes(router.currentRoute.value.path);

	CookieConsent.run({
		autoShow: isPublicRoute,
		mode: "opt-in",
		manageScriptTags: false,
		hideFromBots: true,

		cookie: {
			name: "lz_cc",
			expiresAfterDays: 182,
		},

		guiOptions: {
			consentModal: {
				layout: "bar inline",
				position: "bottom",
				equalWeightButtons: true,
				flipButtons: false,
			},
			preferencesModal: {
				layout: "box",
				equalWeightButtons: true,
				flipButtons: false,
			},
		},

		categories: {
			necessary: {
				enabled: true,
				readOnly: true,
			},
			analytics: {},
		},

		onConsent: () => {
			window.dispatchEvent(new Event("cc:consent-change"));
		},
		onChange: () => {
			window.dispatchEvent(new Event("cc:consent-change"));
		},

		language: {
			default: "de",
			autoDetect: "browser",
			translations: {
				de: {
					consentModal: {
						title: "Cookie-Einstellungen",
						description:
							"Wir verwenden Cookies, um die Nutzung unserer Website zu analysieren und zu verbessern. Du kannst wählen, welche Cookies du zulassen möchtest.",
						acceptAllBtn: "Alle akzeptieren",
						acceptNecessaryBtn: "Nur notwendige",
						showPreferencesBtn: "Einstellungen",
					},
					preferencesModal: {
						title: "Cookie-Einstellungen",
						acceptAllBtn: "Alle akzeptieren",
						acceptNecessaryBtn: "Nur notwendige",
						savePreferencesBtn: "Auswahl speichern",
						closeIconLabel: "Schließen",
						sections: [
							{
								title: "Cookie-Nutzung",
								description:
									"Wir verwenden Cookies, um die grundlegenden Funktionen der Website sicherzustellen und dein Nutzungserlebnis zu verbessern.",
							},
							{
								title: "Notwendige Cookies",
								description:
									"Diese Cookies sind für die Grundfunktionen der Website erforderlich. Dazu gehören Sitzungsverwaltung, Anmeldung und Theme-Einstellungen.",
								linkedCategory: "necessary",
							},
							{
								title: "Analyse-Cookies",
								description:
									"Diese Cookies helfen uns zu verstehen, wie Besucher mit der Website interagieren. Alle Daten werden anonymisiert.",
								linkedCategory: "analytics",
							},
						],
					},
				},
				en: {
					consentModal: {
						title: "Cookie Settings",
						description:
							"We use cookies to analyze and improve the use of our website. You can choose which cookies you want to allow.",
						acceptAllBtn: "Accept all",
						acceptNecessaryBtn: "Necessary only",
						showPreferencesBtn: "Settings",
					},
					preferencesModal: {
						title: "Cookie Settings",
						acceptAllBtn: "Accept all",
						acceptNecessaryBtn: "Necessary only",
						savePreferencesBtn: "Save selection",
						closeIconLabel: "Close",
						sections: [
							{
								title: "Cookie Usage",
								description:
									"We use cookies to ensure the basic functions of the website and to improve your browsing experience.",
							},
							{
								title: "Essential Cookies",
								description:
									"These cookies are required for the basic functions of the website. This includes session management, login, and theme settings.",
								linkedCategory: "necessary",
							},
							{
								title: "Analytics Cookies",
								description:
									"These cookies help us understand how visitors interact with the website. All data is anonymized.",
								linkedCategory: "analytics",
							},
						],
					},
				},
			},
		},
	});

	router.afterEach((to) => {
		if (PUBLIC_ROUTES.includes(to.path) && !CookieConsent.validConsent()) {
			CookieConsent.show();
		} else {
			CookieConsent.hide();
		}
	});
});
