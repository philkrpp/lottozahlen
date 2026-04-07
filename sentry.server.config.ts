import * as Sentry from "@sentry/nuxt";
import { release } from "./build-release.json";

const dsn = process.env.SENTRY_DSN;

if (dsn) {
	Sentry.init({
		dsn,
		release,
		environment: process.env.APP_ENV || "development",
		tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || "100") / 100,
	});
}
