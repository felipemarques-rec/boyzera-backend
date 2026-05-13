# syntax=docker/dockerfile:1.7
#
# BoyZera backend image.
# Build context = the backend repo root (this directory).

# ---- Stage 1: deps (full install, used for building) ----
FROM node:20-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci


# ---- Stage 2: build ----
FROM node:20-alpine AS build
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json* tsconfig*.json nest-cli.json* ./
COPY src ./src

RUN npm run build


# ---- Stage 3: prod deps only ----
FROM node:20-alpine AS prod-deps
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --omit=dev


# ---- Stage 4: runtime ----
FROM node:20-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production \
    PORT=5001

RUN apk add --no-cache wget tini \
 && addgroup -S app && adduser -S app -G app

COPY --from=build     /app/dist                ./dist
COPY --from=prod-deps /app/node_modules        ./node_modules
COPY --from=build     /app/package.json        ./package.json
COPY docker-entrypoint.sh                      ./docker-entrypoint.sh

RUN chmod +x ./docker-entrypoint.sh && chown -R app:app /app

USER app
EXPOSE 5001

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD wget -qO- --tries=1 --timeout=3 http://127.0.0.1:5001/ >/dev/null 2>&1 || exit 1

ENTRYPOINT ["/sbin/tini", "--", "./docker-entrypoint.sh"]
