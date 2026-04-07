# Unified Observability: SigNoz/OTEL neben Sentry + OpenObserve

## Ziel

SigNoz (OpenTelemetry-basiert) als drittes Observability-Backend neben Sentry und OpenObserve integrieren. Alle drei laufen parallel zum Vergleich. Eine einheitliche Logger-Abstraktion verteilt Daten an alle Backends und ist leicht um weitere Systeme erweiterbar.

## Architektur: Ansatz A — Pino Multistream + separater OTEL SDK

Pino bleibt der zentrale Server-Logger. Jedes Backend ist ein Writable Stream in der Multistream-Pipeline. OTEL SDK läuft separat für Tracing und Metrics.

## Infrastruktur

- SigNoz self-hosted: `https://signoz.philippkrapp.de/`
- OTEL Collector HTTP: `https://otelcollectorhttp.philippkrapp.de/`
- Keine Authentifizierung am Collector
- CORS konfiguriert für `https://lottozahlen.philippkrapp.de` + `http://localhost:3000`

## Server-Side

### 1. `server/utils/logger.ts` (ersetzt `server/utils/o2.ts`)

Pino Multistream mit Stream-Registry:

```
Pino rootLogger
  ├── O2 Stream       (batch → O2 API, bestehend)
  ├── Sentry Stream   (level >= warn → Sentry.captureMessage, bestehend)
  ├── OTEL Stream     (NEU: batch → OTEL Collector /v1/logs via OTLP HTTP)
  └── stdout/pretty   (Dev: pino-pretty, Prod: stdout, bestehend)
```

OTEL Log Stream:

- Parst Pino JSON, transformiert in OTLP Log-Format
- Batch-Buffer analog zu O2 (Flush-Interval 5s, Max-Buffer 50)
- Sendet per `fetch` an `${OTEL_EXPORTER_OTLP_ENDPOINT}/v1/logs`
- Fallback-Buffer bei Fehlern (max 500 Einträge)

API (umbenannt, identische Signatur):

- `useO2Logger(module)` → `useLogger(module)`
- `flushO2Logs()` → `flushLogs()`
- `rootLogger` Export bleibt

### 2. `server/utils/otel.ts` — OTEL Node SDK

Initialisiert OpenTelemetry für Tracing + Metrics:

- `NodeSDK` mit OTLP HTTP Exportern
- Auto-Instrumentation: HTTP, MongoDB/Mongoose
- Service-Name: `lottozahlen`
- Version: aus `build-release.json`
- Environment: `development` / `production`
- Endpoint: `OTEL_EXPORTER_OTLP_ENDPOINT`

Exportiert `shutdownOtel()` für Graceful Shutdown.

### 3. `server/plugins/00.otel.ts` — Erster Nitro-Plugin

- Importiert `server/utils/otel.ts` (triggert SDK-Initialisierung)
- Muss VOR allen anderen Plugins laden (vor MongoDB, Cron)
- Hook `close`: ruft `shutdownOtel()` auf

### 4. `server/plugins/01.error-handler.ts` (ersetzt `o2-error-handler.ts`)

Identische Logik, nur umbenannt:

- `useO2Logger` → `useLogger`
- `flushO2Logs` → `flushLogs`
- Nummerierung `01.` damit es nach OTEL-Init läuft

### 5. `server/middleware/01.logging.ts`

Import-Änderung: `rootLogger` kommt aus `../utils/logger` statt `../utils/o2`.

### 6. `nuxt.config.ts` — Nitro Externals

```ts
externals: {
  external: ['croner', 'pino', 'pino-http', 'pino-pretty', 'mongoose', 'mongodb'],
},
```

`mongoose` und `mongodb` externalisieren, damit OTEL Auto-Instrumentation die Module patchen kann.

### 7. `nuxt.config.ts` — Runtime Config

```ts
runtimeConfig: {
  otelEndpoint: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || '',
  // bestehende O2/Sentry Config bleibt
  public: {
    otelEndpoint: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || '',
    // bestehende public Config bleibt
  },
},
```

## Client-Side

### 8. `app/plugins/signoz.client.ts` — OTEL Web SDK

- `WebTracerProvider` mit `BatchSpanProcessor`
- `OTLPTraceExporter` → `${otelEndpoint}/v1/traces`
- Auto-Instrumentations:
  - `DocumentLoadInstrumentation` (Page Load Performance)
  - `FetchInstrumentation` (alle Fetch-Requests, propagiert Trace-Context)
  - `UserInteractionInstrumentation` (Click-Events)
- Resource: Service `lottozahlen`, Version, Environment
- Graceful no-op wenn `otelEndpoint` nicht gesetzt

Läuft parallel zu O2 RUM Plugin und Sentry Browser — unabhängig.

### 9. `app/composables/useObservability.ts` (ersetzt `useO2.ts`)

Einheitliche Client-API die an alle Backends dispatched:

```ts
setUser(user); // → O2 RUM + Sentry.setUser + OTEL Resource
clearUser(); // → O2 clearUser + Sentry.setUser(null)
trackAction(name, ctx); // → O2 RUM addAction + OTEL Span
trackError(msg, ctx); // → O2 Logs error + Sentry captureMessage + OTEL Span
trackInfo(msg, ctx); // → O2 Logs info + OTEL Span
```

Jedes Backend ist optional (graceful no-op wenn Provider nicht verfügbar). Neues Backend = eine Zeile pro Methode.

### 10. `types/observability.d.ts` (ersetzt `types/openobserve.d.ts`)

Erweitert NuxtApp und ComponentCustomProperties um:

- `$o2Rum` (bestehend)
- `$o2Logs` (bestehend)
- `$otelTracer` (NEU)

## Renames (22+ Dateien)

| Alt                                  | Neu                                   |
| ------------------------------------ | ------------------------------------- |
| `server/utils/o2.ts`                 | `server/utils/logger.ts`              |
| `useO2Logger()`                      | `useLogger()`                         |
| `flushO2Logs()`                      | `flushLogs()`                         |
| `app/composables/useO2.ts`           | `app/composables/useObservability.ts` |
| `server/plugins/o2-error-handler.ts` | `server/plugins/01.error-handler.ts`  |
| `types/openobserve.d.ts`             | `types/observability.d.ts`            |

Betroffene Dateien für `useO2Logger` → `useLogger`:

- `server/cron/checkDrawResults.ts`
- `server/cron/index.ts`
- `server/cron/notifyUsers.ts`
- `server/services/losChecker.ts`
- `server/services/emailService.ts`
- `server/services/slackService.ts`
- `server/services/fernsehlotterieApi.ts`
- `server/services/notificationService.ts`
- `server/services/drawFetcher.ts`
- `server/api/notifications/settings.put.ts`
- `server/api/notifications/test.post.ts`
- `server/api/los/[id]/check.post.ts`
- `server/api/los/[id].put.ts`
- `server/api/los/index.post.ts`
- `server/api/los/[id].delete.ts`
- `server/api/user/set-password.post.ts`
- `server/api/user/profile.put.ts`
- `server/api/user/password.put.ts`
- `server/api/user/account.delete.ts`
- `server/middleware/auth.ts`
- `server/utils/db.ts`

## Neue Packages

**Server (dependencies):**

- `@opentelemetry/sdk-node`
- `@opentelemetry/auto-instrumentations-node`
- `@opentelemetry/exporter-trace-otlp-http`
- `@opentelemetry/exporter-metrics-otlp-http`
- `@opentelemetry/exporter-logs-otlp-http`
- `@opentelemetry/resources`
- `@opentelemetry/semantic-conventions`

**Browser (dependencies):**

- `@opentelemetry/api`
- `@opentelemetry/sdk-trace-web`
- `@opentelemetry/instrumentation-document-load`
- `@opentelemetry/instrumentation-fetch`
- `@opentelemetry/instrumentation-user-interaction`
- `@opentelemetry/context-zone`

## Environment Variables

```bash
# Neu
OTEL_EXPORTER_OTLP_ENDPOINT=https://otelcollectorhttp.philippkrapp.de

# Bestehend (unverändert)
SENTRY_DSN=...
O2_API_URL=...
O2_AUTH_USER=...
O2_AUTH_PASSWORD=...
O2_SITE=...
O2_CLIENT_TOKEN=...
O2_ORG=default
```

## Nitro Plugin Reihenfolge

```ts
nitro: {
  plugins: [
    '~~/server/plugins/00.otel.ts',          // OTEL SDK zuerst
    '~~/server/plugins/01.error-handler.ts',  // Error Handler
    '~~/server/plugins/mongodb.ts',           // MongoDB
    '~~/server/plugins/cron.ts',              // Cron Jobs
  ],
},
```

## Datenfluss

```
                          ┌─────────────┐
                          │  useLogger() │
                          └──────┬──────┘
                                 │
                          ┌──────▼──────┐
                          │    Pino     │
                          │ Multistream │
                          └──┬──┬──┬──┬┘
                             │  │  │  │
              ┌──────────────┘  │  │  └──────────────┐
              │                 │  │                  │
        ┌─────▼─────┐   ┌─────▼──▼──┐        ┌─────▼─────┐
        │ O2 Stream  │   │  Sentry   │        │OTEL Stream│
        │ (batch→API)│   │  Stream   │        │(batch→OTLP)│
        └─────┬─────┘   └─────┬─────┘        └─────┬─────┘
              │                │                     │
              ▼                ▼                     ▼
         OpenObserve       Sentry              SigNoz OTEL
                                               Collector
                                                  │
                                          ┌───────┼───────┐
                                          │       │       │
                                        Traces  Logs  Metrics
                                          │       │       │
                                          └───────┼───────┘
                                                  │
                                               SigNoz
                                                 UI

Browser:
  ┌──────────────────────────────────────────────────┐
  │ useObservability()                               │
  │   ├── O2 RUM + Logs    → OpenObserve             │
  │   ├── Sentry Browser   → Sentry                  │
  │   └── OTEL Web Tracer  → SigNoz OTEL Collector   │
  └──────────────────────────────────────────────────┘
```
