#!/bin/sh
set -e

if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
  echo "[entrypoint] Running TypeORM migrations..."
  # Invoke the TypeORM CLI directly so we don't depend on package.json npm scripts.
  node ./node_modules/typeorm/cli.js \
    -d dist/infrastructure/database/data-source.js \
    migration:run
else
  echo "[entrypoint] RUN_MIGRATIONS=false — skipping migrations."
fi

echo "[entrypoint] Starting NestJS on port ${PORT:-5001}..."
exec node dist/main
