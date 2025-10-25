#!/usr/bin/env bash
# run_reorder_tests.sh
# Helper script to run the reorder/views test SQL against a Postgres URL.
# Usage:
#   export DB_URL="postgresql://<user>:<pass>@host:5432/postgres"
#   ./supabase/tests/run_reorder_tests.sh

set -euo pipefail

if [ -z "${DB_URL:-}" ]; then
  echo "ERROR: DB_URL is not set. Set it to a postgres connection string (service_role or admin connection)."
  echo "Example:
  export DB_URL=\"postgresql://postgres:pass@db.yvtrlvmbofklefxcxrzv.supabase.co:5432/postgres\""
  exit 1
fi

SQL_FILE="$(cd "$(dirname "$0")" && pwd)/20251025_test_reorder_and_views.sql"

if [ ! -f "$SQL_FILE" ]; then
  echo "ERROR: test SQL file not found: $SQL_FILE"
  exit 1
fi

echo "Running tests from: $SQL_FILE"
psql "$DB_URL" -f "$SQL_FILE"

echo "Done."