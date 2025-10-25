#!/usr/bin/env bash
set -euo pipefail

# Helper to run the reorder test SQL against a DB URL or local Postgres
# Usage:
#   TEST_DB_URL="postgresql://user:pw@host:5432/dbname" ./supabase/tests/ci-run.sh

SQL_FILE="$(dirname "$0")/20251025_test_reorder_and_views.sql"

if [ -n "${TEST_DB_URL:-}" ]; then
  echo "Running test SQL against TEST_DB_URL"
  psql "$TEST_DB_URL" -f "$SQL_FILE"
else
  echo "No TEST_DB_URL provided, attempting to connect to localhost:5432 as postgres/postgres"
  PGHOST=${PGHOST:-127.0.0.1}
  PGPORT=${PGPORT:-5432}
  PGUSER=${PGUSER:-postgres}
  PGPASSWORD=${PGPASSWORD:-postgres}

  export PGPASSWORD
  psql "postgresql://$PGUSER:$PGPASSWORD@$PGHOST:$PGPORT/postgres?sslmode=disable" -f "$SQL_FILE"
fi

echo "Done. Check output for RAISE NOTICE lines describing test results."
