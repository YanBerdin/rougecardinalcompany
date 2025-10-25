#!/bin/bash
# Quick script to check remaining grants on the 3 problematic objects
# Run after Round 7b application

echo "==================================================================="
echo "CHECKING GRANTS ON PROBLEMATIC OBJECTS (Post Round 7b)"
echo "==================================================================="
echo ""

# Check if supabase CLI is available
if ! command -v pnpm &> /dev/null; then
    echo "Error: pnpm not found"
    exit 1
fi

# Run SQL query to check grants
pnpm dlx supabase db execute --linked <<'SQL'
-- Check 1: information_schema.administrable_role_authorizations
SELECT 
  'information_schema.administrable_role_authorizations' as object_name,
  grantee,
  privilege_type
FROM information_schema.table_privileges
WHERE table_schema = 'information_schema'
  AND table_name = 'administrable_role_authorizations'
  AND grantee IN ('PUBLIC', 'anon', 'authenticated')
ORDER BY grantee, privilege_type;

-- Check 2: realtime.schema_migrations
SELECT 
  'realtime.schema_migrations' as object_name,
  grantee,
  privilege_type
FROM information_schema.table_privileges
WHERE table_schema = 'realtime'
  AND table_name = 'schema_migrations'
  AND grantee IN ('PUBLIC', 'anon', 'authenticated')
ORDER BY grantee, privilege_type;

-- Check 3: realtime.subscription
SELECT 
  'realtime.subscription' as object_name,
  grantee,
  privilege_type
FROM information_schema.table_privileges
WHERE table_schema = 'realtime'
  AND table_name = 'subscription'
  AND grantee IN ('PUBLIC', 'anon', 'authenticated')
ORDER BY grantee, privilege_type;
SQL

echo ""
echo "==================================================================="
echo "If no rows returned above, all grants have been successfully revoked!"
echo "==================================================================="
