#!/bin/bash
# Quick audit check - runs the filtered audit script against the linked database

echo "🔍 Running security audit on linked database..."
echo ""

# Get the database URL from supabase
DBURL=$(pnpm dlx supabase db dump --linked --data-only 2>&1 | grep -o 'postgresql://[^"]*' | head -n 1)

if [ -z "$DBURL" ]; then
    echo "❌ Could not get database URL. Make sure you're linked to a project."
    exit 1
fi

echo "📊 Executing audit_grants_filtered.sql..."
echo ""

# Run the audit script
RESULT=$(psql "$DBURL" -q -t -A -f supabase/scripts/audit_grants_filtered.sql 2>&1)

# Check if any rows were returned
if [ -z "$RESULT" ]; then
    echo "✅ Security audit PASSED: No exposed objects detected!"
    echo ""
    echo "All database objects are properly secured:"
    echo "- Business tables protected by RLS policies"
    echo "- System tables whitelisted (storage.*, realtime.*)"
    echo "- Trigger functions have no public grants"
    echo "- Extension functions whitelisted (pg_trgm, citext, etc.)"
    exit 0
else
    echo "⚠️  Security audit FAILED: Found exposed objects:"
    echo ""
    echo "$RESULT" | head -n 20
    echo ""
    TOTAL=$(echo "$RESULT" | wc -l)
    echo "Total exposed objects: $TOTAL"
    echo ""
    echo "Next step: Create migration Round $(( $(ls supabase/migrations/202510* 2>/dev/null | wc -l) + 1 ))"
    exit 1
fi
