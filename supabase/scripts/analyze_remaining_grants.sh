#!/bin/bash
# analyze_remaining_grants.sh
# Quick analysis script to identify remaining exposed database objects
# Usage: ./supabase/scripts/analyze_remaining_grants.sh

set -euo pipefail

echo "🔍 Analyzing database grants for exposed objects..."
echo "=================================================="
echo ""

# Check if we can run against linked DB
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Please install it first."
    exit 1
fi

# Try to get the project ref
PROJECT_REF=$(grep "project_id" .supabase/config.toml 2>/dev/null | cut -d'"' -f2 || echo "")

if [ -z "$PROJECT_REF" ]; then
    echo "⚠️  No linked project found. Using local database instead."
    DB_CONNECTION="postgresql://postgres:postgres@127.0.0.1:54322/postgres"
else
    echo "✅ Found linked project: $PROJECT_REF"
    DB_CONNECTION="" # Will use supabase db query
fi

echo ""
echo "Running audit query..."
echo "====================="
echo ""

# Run the audit script
if [ -n "$DB_CONNECTION" ]; then
    # Local database
    psql "$DB_CONNECTION" -f supabase/scripts/audit_grants.sql
else
    # Cloud database (requires manual execution)
    echo "📋 Please copy and paste the following into your Supabase SQL Editor:"
    echo ""
    echo "--- START SQL ---"
    cat supabase/scripts/audit_grants.sql
    echo "--- END SQL ---"
    echo ""
    echo "Or run manually:"
    echo "  psql \"\$DATABASE_URL\" -f supabase/scripts/audit_grants.sql"
fi

echo ""
echo "Expected: 0 rows (all objects secured)"
echo "If you see rows above, create a migration to revoke those grants."
