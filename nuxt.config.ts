import { writeFileSync } from "node:fs";
import { version } from "./package.json";

const isDev = process.env.NODE_ENV !== "production";
const buildTimestamp = new Date().toISOString().replace(/[-:]/g, "").replace("T", "-").slice(0, 15);
const appRelease = isDev ? `${version}-dev` : `${version}+${buildTimestamp}`;

writeFileSync("./build-release.json", JSON.stringify({ release: appRelease }));

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	compatibilityDate: "2025-07-15",
	ssr: true,
	devtools: { enabled: true },

	app: {
		head: {
			htmlAttrs: { lang: "de" },
			title: "Lottozahlen – Losnummern automatisch prüfen lassen",
			meta: [
				{
					name: "description",
					content:
						"Trage deine Losnummern ein und werde automatisch benachrichtigt, wenn du gewinnst. Kostenlos, schnell und zuverlässig.",
				},
				{ property: "og:type", content: "website" },
				{ property: "og:locale", content: "de_DE" },
				{ property: "og:site_name", content: "Lottozahlen" },
				{ name: "robots", content: "index, follow" },
			],
			link: [
				{ rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
				{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
				{ rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" },
			],
		},
	},

	srcDir: "app/",
	serverDir: "server/",

	modules: ["vuetify-nuxt-module", "@nuxt/eslint", "@sentry/nuxt/module", "@nuxt/fonts"],

	sentry: {
		autoInjectServerSentry: "top-level-import",
	},

	runtimeConfig: {
		mongodbUri: process.env.MONGODB_URI || "mongodb://localhost:27017/lottozahlen",
		betterAuthSecret: process.env.BETTER_AUTH_SECRET,
		betterAuthUrl: process.env.BETTER_AUTH_URL || "http://localhost:3000",
		googleClientId: process.env.GOOGLE_CLIENT_ID,
		googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
		githubClientId: process.env.GITHUB_CLIENT_ID,
		githubClientSecret: process.env.GITHUB_CLIENT_SECRET,
		smtp: {
			host: process.env.SMTP_HOST || "",
			port: parseInt(process.env.SMTP_PORT || "587"),
			user: process.env.SMTP_USER || "",
			pass: process.env.SMTP_PASS || "",
			from: process.env.SMTP_FROM || "noreply@lottozahlen.de",
		},
		o2ApiUrl: process.env.O2_API_URL || "",
		o2Org: process.env.O2_ORG || "default",
		o2AuthUser: process.env.O2_AUTH_USER || "",
		o2AuthPassword: process.env.O2_AUTH_PASSWORD || "",
		o2LogStream: process.env.O2_LOG_STREAM || "lottozahlen_server_logs",
		otelEndpoint: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || "",
		logFlushFailureThreshold: parseInt(process.env.LOG_FLUSH_FAILURE_THRESHOLD || "3"),
		sentryTracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || "100") / 100,
		public: {
			appName: process.env.NUXT_PUBLIC_APP_NAME || "Lottozahlen",
			appUrl: process.env.NUXT_PUBLIC_APP_URL || "http://localhost:3000",
			appVersion: appRelease,
			nodeEnv: process.env.NODE_ENV || "development",
			o2ClientToken: process.env.NUXT_PUBLIC_O2_CLIENT_TOKEN || "",
			o2Org: process.env.NUXT_PUBLIC_O2_ORG || "default",
			o2PrivacyLevel: process.env.NUXT_PUBLIC_O2_PRIVACY_LEVEL || "mask-user-input",
			o2ServiceName: process.env.NUXT_PUBLIC_O2_SERVICE_NAME || "lottozahlen",
			o2SessionReplaySampleRate: parseInt(process.env.NUXT_PUBLIC_O2_SESSION_REPLAY_SAMPLE_RATE || "100"),
			o2SessionSampleRate: parseInt(process.env.NUXT_PUBLIC_O2_SESSION_SAMPLE_RATE || "100"),
			o2Site: process.env.O2_API_URL || "",
			logLevel: (process.env.NUXT_PUBLIC_LOG_LEVEL || "debug") as "debug" | "info" | "warn" | "error",
			errorDedupWindowMs: parseInt(process.env.NUXT_PUBLIC_ERROR_DEDUP_WINDOW_MS || "5000"),
			otelEndpoint: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || "",
			otelServiceName: process.env.OTEL_SERVICE_NAME || "lottozahlen",
			otelTracesSampleRate: parseFloat(process.env.NUXT_PUBLIC_OTEL_TRACES_SAMPLE_RATE || "100") / 100,
			sentryDsn: process.env.SENTRY_DSN || "",
			sentryTracesSampleRate: parseFloat(process.env.NUXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE || "100") / 100,
			umamiHost: process.env.NUXT_PUBLIC_UMAMI_HOST || "",
			umamiWebsiteId: process.env.NUXT_PUBLIC_UMAMI_WEBSITE_ID || "",
		},
	},

	routeRules: {
		"/dashboard/**": { ssr: false },
		"/login": { ssr: false },
		"/register": { ssr: false },
		"/forgot-password": { ssr: false },
		"/verify-email": { ssr: false },
		"/set-password": { ssr: false },
	},

	nitro: {
		plugins: [
			"~~/server/plugins/00.otel.ts",
			"~~/server/plugins/01.error-handler.ts",
			"~~/server/plugins/mongodb.ts",
			"~~/server/plugins/cron.ts",
		],
		experimental: {
			asyncContext: true,
		},
		externals: {
			external: [
				"croner",
				"pino",
				"pino-http",
				"pino-pretty",
				"mongoose",
				"mongodb",
				"@opentelemetry/api",
				"@opentelemetry/sdk-node",
				"@opentelemetry/sdk-trace-base",
				"@opentelemetry/exporter-trace-otlp-http",
				"@opentelemetry/exporter-metrics-otlp-http",
				"@opentelemetry/sdk-metrics",
				"@opentelemetry/auto-instrumentations-node",
			],
		},
	},

	css: ["~/assets/styles/main.scss", "@mdi/font/css/materialdesignicons.min.css"],

	components: [{ path: "~/components/vue-bits", pathPrefix: false }, "~/components"],

	typescript: {
		strict: true,
	},

	build: {
		transpile: ["@opentelemetry/api", "@opentelemetry/sdk-trace-web", "@opentelemetry/context-zone"],
	},

	vite: {
		optimizeDeps: {
			include: [
				"dayjs",
				"dayjs/plugin/relativeTime",
				"dayjs/locale/de",
				"better-auth/client/plugins",
				"better-auth/vue",
				"@openobserve/browser-rum",
				"@opentelemetry/sdk-trace-base",
				"@opentelemetry/exporter-trace-otlp-http",
				"@opentelemetry/semantic-conventions",
				"@opentelemetry/instrumentation",
				"@opentelemetry/instrumentation-fetch",
				"@opentelemetry/instrumentation-document-load",
				"@opentelemetry/instrumentation-user-interaction",
				"@opentelemetry/core",
				"@opentelemetry/resources",
			],
		},
	},

	vuetify: {
		vuetifyOptions: "./vuetify.config.ts",
	},
});
