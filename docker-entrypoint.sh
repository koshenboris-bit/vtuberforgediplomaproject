#!/usr/bin/env sh
set -eu

: "${JWT_ACCESS_SECRET:=super-secret-access}"
: "${JWT_REFRESH_SECRET:=super-secret-refresh}"
: "${RUN_MIGRATIONS:=true}"

if [ -z "${DATABASE_URL:-}" ]; then
  if [ -n "${PORT:-}" ]; then
    echo "DATABASE_URL is required on Render. Create a PostgreSQL database and set DATABASE_URL."
    exit 1
  fi
  DATABASE_URL="postgres://postgres:postgres@db:5432/app?sslmode=disable"
fi

export DATABASE_URL JWT_ACCESS_SECRET JWT_REFRESH_SECRET

if [ "$RUN_MIGRATIONS" = "true" ]; then
  echo "Waiting for PostgreSQL..."
  until pg_isready -d "$DATABASE_URL" >/dev/null 2>&1; do
    sleep 1
  done

  echo "Running migrations..."
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f /app/migrations/001_init.sql
fi

exec /usr/local/bin/app
