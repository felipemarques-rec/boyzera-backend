#!/bin/sh
set -e

if [ "${DB_SYNCHRONIZE:-false}" = "true" ]; then
  echo "[entrypoint] DB_SYNCHRONIZE=true — running schema:sync to materialize schema from entities..."
  node ./node_modules/typeorm/cli.js \
    -d dist/infrastructure/database/data-source.js \
    schema:sync
elif [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
  echo "[entrypoint] Running TypeORM migrations..."
  node ./node_modules/typeorm/cli.js \
    -d dist/infrastructure/database/data-source.js \
    migration:run
else
  echo "[entrypoint] DB_SYNCHRONIZE=false and RUN_MIGRATIONS=false — DB untouched."
fi

echo "[entrypoint] Starting NestJS on port ${PORT:-5001}..."
exec node dist/main
