# Lottozahlen

Nuxt 4 Full-Stack-App zum Verwalten von Losen der Deutschen Fernsehlotterie mit automatischer Gewinnpruefung und Benachrichtigungen.

## Tech-Stack

- **Framework:** Nuxt 4 (Vue 3, Nitro), SSR aktiviert
- **UI:** Vuetify 4 (Dark-Theme default), SCSS, Sora-Font
- **DB:** MongoDB via Mongoose
- **Auth:** Better-Auth (Email/Passwort, Magic Link, OTP, Google/GitHub OAuth)
- **Email:** Nodemailer (SMTP)
- **Cron:** Croner (Sonntags 20:15 Europe/Berlin)
- **Validation:** Zod
- **Observability:** OpenTelemetry, Sentry, Pino, OpenObserve, Umami
- **Animationen:** GSAP, Three.js, OGL, Motion-V
- **Node:** >=24.0.0, pnpm

## Projektstruktur

```
app/                  # Frontend (Nuxt source dir)
  pages/              # Seiten (index, dashboard/*, auth, legal)
  components/         # Komponenten nach Feature (auth/, dashboard/, los/, draws/, landing/, shared/, vue-bits/)
  composables/        # State-Management via Composables (kein Pinia)
  plugins/            # Client-Plugins (otel, sentry, cookie-consent, umami)
  layouts/            # default (Marketing), auth (Login), dashboard (geschuetzt)
  assets/styles/      # SCSS (main.scss, variables.scss)
  utils/              # Logger, Session, Formatters, Validators, Constants
server/               # Backend (Nitro)
  api/                # REST-Endpunkte (auth, draws, los, notifications, preferences, user, telemetry, health)
  services/           # Business-Logik (fernsehlotterieApi, losChecker, drawFetcher, emailService, notificationService, slackService)
  models/             # Mongoose-Models (Draw, Los, CheckResult, NotificationSetting, UserPreference)
  utils/              # Auth-Config, DB, Logger, Tracing, LosTypDetector, Constants
  middleware/          # Tracing, Logging, Auth-Guard, Header-Cleanup
  plugins/             # Startup: OTEL, Error-Handler, MongoDB, Cron
  cron/               # Automatische Gewinnpruefung (checkDrawResults, notifyUsers)
types/                # Geteilte TypeScript-Typen
tests/                # Unit + E2E Tests
```

## Commands

```bash
pnpm dev              # Dev-Server starten
pnpm build            # Production-Build
pnpm test             # Alle Tests (vitest)
pnpm test:unit        # Nur Unit-Tests
pnpm test:e2e         # Nur E2E-Tests
pnpm test:watch       # Unit-Tests im Watch-Mode
pnpm lint             # ESLint
pnpm lint:fix         # ESLint mit Auto-Fix
pnpm format           # Prettier
pnpm format:check     # Prettier Check
```

## Code Conventions

- **Formatting:** Prettier — Tabs, Double-Quotes, Trailing Commas, Print-Width 120
- **Linting:** ESLint mit Nuxt-Config, multi-word component names deaktiviert
- **TypeScript:** Strict-Mode, `explicit-any` als Warning, unused vars mit `_` Prefix erlaubt
- **Komponenten:** `<script setup lang="ts">`, Composition API
- **State:** Composables mit `ref()`/`computed()`, kein Pinia
- **HTTP (Backend):** Natives `fetch` fuer externe APIs, keine HTTP-Libs (axios etc.)
- **API-Headers:** Exakt wie in Curl-Aufrufen setzen (User-Agent, Accept-Language)

## Architektur

- **SSR:** Aktiviert fuer Marketing-Seiten, deaktiviert fuer `/dashboard/**`, `/login`, `/register` etc.
- **Auth-Middleware:** Schuetzt `/api/*` ausser `/api/auth/*`, `/api/health`, `/api/telemetry/*`
- **Externe API:** `https://www.fernsehlotterie.de/webshop/api/` (Gewinnabfrage, Ziehungen)
- **Ziehungen:** Sonntags 18:00 + 20:00 Uhr, Cron fetcht ab 20:15 (Europe/Berlin)
- **Los-Typen:** mega-los (7x), jahreslos (8x), dauerlos (9x), einzellos (6x) — erste Ziffer der Losnummer
- **Benachrichtigungen:** Email (Nodemailer) + Slack (Webhooks), konfigurierbar pro User
- **Soft-Delete:** Lose werden mit `isActive: false` deaktiviert, nicht geloescht
- **Cookie-Prefix:** `lz`
- **Theme:** Light/Dark/System, Cookie-basiert fuer SSR (`lz_color-scheme`)
