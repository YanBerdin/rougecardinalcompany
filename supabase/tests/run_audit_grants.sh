#!/usr/bin/env bash

# ---------------------------------------------------------------------------
# This is a shell script (bash). DO NOT paste this file into the Supabase
# SQL Editor — the SQL Editor expects SQL, not shell commands. If you want to
# run the audit from the SQL Editor, open `supabase/scripts/audit_grants.sql`
# and execute that SQL directly.
#
# Usage (local):
#   TEST_DB_URL="postgresql://postgres:pw@host:5432/postgres" ./supabase/tests/run_audit_grants.sh
#
# Usage (SQL Editor):
#   - Open `supabase/scripts/audit_grants.sql` in the Supabase dashboard and Run.
#
# This script connects with psql and executes the SQL file. It's safe to run
# in CI (set TEST_DB_URL secret) or locally (fallback to localhost:5432).
# ---------------------------------------------------------------------------

set -euo pipefail

# Helper to run the audit_grants.sql script against TEST_DB_URL or localhost
SQL_FILE="$(dirname "$0")/../scripts/audit_grants.sql"

if [ -n "${TEST_DB_URL:-}" ]; then
  echo "Running audit against TEST_DB_URL"
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

echo "Audit finished. Review output for objects granted to PUBLIC/anon/authenticated."
