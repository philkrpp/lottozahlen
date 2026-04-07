import { openobserveRum } from "@openobserve/browser-rum";

export default defineNuxtPlugin(() => {
	const config = useRuntimeConfig();
	const {
		o2Site,
		o2ClientToken,
		o2Org,
		o2ServiceName,
		o2SessionSampleRate,
		o2SessionReplaySampleRate,
		o2PrivacyLevel,
		appVersion,
	} = config.public;

	if (!o2Site || !o2ClientToken) {
		console.warn("[O2] Konfiguration fehlt — RUM deaktiviert.");
		return;
	}

	const serviceName = `${o2ServiceName || "lottozahlen"}-frontend`;
	const version = appVersion;
	const env = import.meta.dev ? "development" : "production";

	openobserveRum.init({
		applicationId: serviceName,
		clientToken: o2ClientToken,
		site: o2Site,
		organizationIdentifier: o2Org,
		service: serviceName,
		env,
		version,
		trackResources: true,
		trackLongTasks: true,
		trackUserInteractions: true,
		apiVersion: "v1",
		insecureHTTP: false,
		defaultPrivacyLevel: o2PrivacyLevel || "mask-user-input",
		sessionSampleRate: Number(o2SessionSampleRate) || 100,
		sessionReplaySampleRate: Number(o2SessionReplaySampleRate) || 100,
	});

	openobserveRum.startSessionReplayRecording();

	return {
		provide: {
			o2Rum: openobserveRum,
		},
	};
});
