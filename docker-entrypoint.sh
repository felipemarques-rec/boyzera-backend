#!/bin/sh
set -e

if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
  echo "[entrypoint] Running TypeORM migrations..."
  npm run migration:run:prod
else
  echo "[entrypoint] RUN_MIGRATIONS=false — skipping migrations."
fi

echo "[entrypoint] Starting NestJS on port ${PORT:-5001}..."
exec node dist/main
