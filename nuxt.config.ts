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

  modules: ['vuetify-nuxt-module', '@nuxt/eslint'],

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
    public: {
      appUrl: process.env.NUXT_PUBLIC_APP_URL || 'http://localhost:3000',
      appName: process.env.NUXT_PUBLIC_APP_NAME || 'Lottozahlen',
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
    plugins: ['~~/server/plugins/mongodb.ts', '~~/server/plugins/cron.ts'],
    externals: {
      external: ['croner'],
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
