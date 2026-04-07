import * as Sentry from "@sentry/nuxt";
import { release } from "./build-release.json";

const config = useRuntimeConfig();
const dsn = config.public.sentryDsn;

if (dsn) {
	Sentry.init({
		dsn,
		release,
		environment: config.public.appEnv || "development",
		tracesSampleRate: config.public.sentryTracesSampleRate ?? 1.0,
		integrations: [Sentry.browserTracingIntegration()],
	});
}
