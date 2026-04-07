FROM node:24-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS test
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm test:unit
RUN pnpm build

FROM base AS production
RUN apk add --no-cache curl
WORKDIR /app
COPY --from=test /app/.output ./.output
ENV NODE_ENV=production
ENV NITRO_PORT=3000
EXPOSE 3000
HEALTHCHECK --interval=10s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1
CMD ["node", ".output/server/index.mjs"]
