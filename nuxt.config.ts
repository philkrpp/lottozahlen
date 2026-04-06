import { version } from './package.json'
import { writeFileSync } from 'node:fs'

const isDev = process.env.NODE_ENV !== 'production'
const buildTimestamp = new Date().toISOString().replace(/[-:]/g, '').replace('T', '-').slice(0, 15)
const appRelease = isDev ? `${version}-dev` : `${version}+${buildTimestamp}`

writeFileSync('./build-release.json', JSON.stringify({ release: appRelease }))

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  ssr: true,
  devtools: { enabled: true },

  app: {
    head: {
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
      ],
    },
  },

  srcDir: 'app/',
  serverDir: 'server/',

  modules: ['vuetify-nuxt-module', '@nuxt/eslint', '@sentry/nuxt/module'],

  sentry: {
    autoInjectServerSentry: 'top-level-import',
  },

  runtimeConfig: {
    mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/lottozahlen',
    betterAuthSecret: process.env.BETTER_AUTH_SECRET,
    betterAuthUrl: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
    googleClientId: process.env.GOOGLE_CLIENT_ID,
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
    githubClientId: process.env.GITHUB_CLIENT_ID,
    githubClientSecret: process.env.GITHUB_CLIENT_SECRET,
    smtp: {
      host: process.env.SMTP_HOST || '',
      port: parseInt(process.env.SMTP_PORT || '587'),
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
      from: process.env.SMTP_FROM || 'noreply@lottozahlen.de',
    },
    o2ApiUrl: process.env.O2_API_URL || '',
    o2AuthUser: process.env.O2_AUTH_USER || '',
    o2AuthPassword: process.env.O2_AUTH_PASSWORD || '',
    otelEndpoint: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || '',
    public: {
      appUrl: process.env.NUXT_PUBLIC_APP_URL || 'http://localhost:3000',
      appName: process.env.NUXT_PUBLIC_APP_NAME || 'Lottozahlen',
      umamiHost: process.env.NUXT_PUBLIC_UMAMI_HOST || '',
      umamiWebsiteId: process.env.NUXT_PUBLIC_UMAMI_WEBSITE_ID || '',
      sentryDsn: process.env.SENTRY_DSN || '',
      appVersion: appRelease,
      o2Site: process.env.O2_SITE || '',
      o2ClientToken: process.env.O2_CLIENT_TOKEN || '',
      o2Org: process.env.O2_ORG || 'default',
      otelEndpoint: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || '',
    },
  },

  routeRules: {
    '/dashboard/**': { ssr: false },
    '/login': { ssr: false },
    '/register': { ssr: false },
    '/forgot-password': { ssr: false },
    '/verify-email': { ssr: false },
    '/set-password': { ssr: false },
  },

  nitro: {
    plugins: [
      '~~/server/plugins/00.otel.ts',
      '~~/server/plugins/01.error-handler.ts',
      '~~/server/plugins/mongodb.ts',
      '~~/server/plugins/cron.ts',
    ],
    externals: {
      external: [
        'croner', 'pino', 'pino-http', 'pino-pretty',
        'mongoose', 'mongodb',
        '@opentelemetry/api',
        '@opentelemetry/sdk-node',
        '@opentelemetry/sdk-metrics',
        '@opentelemetry/auto-instrumentations-node',
        '@opentelemetry/exporter-trace-otlp-http',
        '@opentelemetry/exporter-metrics-otlp-http',
        '@opentelemetry/resources',
        '@opentelemetry/semantic-conventions',
      ],
    },
  },

  css: ['~/assets/styles/main.scss', '@mdi/font/css/materialdesignicons.min.css'],

  components: [{ path: '~/components/vue-bits', pathPrefix: false }, '~/components'],

  typescript: {
    strict: true,
  },

  vite: {
    optimizeDeps: {
      include: [
        'dayjs',
        'dayjs/plugin/relativeTime',
        'dayjs/locale/de',
        'better-auth/client/plugins',
        'better-auth/vue',
      ],
    },
  },

  vuetify: {
    vuetifyOptions: './vuetify.config.ts',
  },
})
