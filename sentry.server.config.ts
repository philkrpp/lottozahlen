import * as Sentry from "@sentry/nuxt";
import { release } from "./build-release.json";

const dsn = process.env.SENTRY_DSN;

if (dsn) {
	Sentry.init({
		dsn,
		release,
		tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || "100") / 100,
	});
}
