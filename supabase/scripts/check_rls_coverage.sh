#!/usr/bin/env bash

# Script de vérification RLS - Détecte les tables avec RLS activé mais sans policies
# Contexte: Éviter la catastrophe du 26 oct 2025 où les grants ont été révoqués mais les policies RLS n'existaient pas
# Usage: ./check_rls_coverage.sh

set -euo pipefail

echo "========================================"
echo "RLS Coverage Check"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Query to find tables with RLS enabled but no policies
SQL_QUERY="
SELECT 
  schemaname,
  tablename,
  COUNT(pol.policyname) as policy_count
FROM pg_tables tbl
LEFT JOIN pg_policies pol 
  ON tbl.schemaname = pol.schemaname 
  AND tbl.tablename = pol.tablename
WHERE tbl.schemaname = 'public'
  AND tbl.rowsecurity = true
GROUP BY tbl.schemaname, tbl.tablename
ORDER BY policy_count ASC, tablename;
"

# Execute query using Supabase CLI (read from stdin)
RESULT=$(echo "$SQL_QUERY" | pnpm dlx supabase db execute 2>&1 || echo "ERROR")

# Check if command failed
if [[ "$RESULT" == *"ERROR"* ]] || [[ "$RESULT" == *"Usage:"* ]]; then
    echo -e "${RED}✗ Cannot execute SQL query via Supabase CLI${NC}"
    echo "Please run this query manually in Supabase Dashboard SQL Editor:"
    echo ""
    echo "$SQL_QUERY"
    exit 1
fi

echo "$RESULT"
echo ""

# Parse results to check for tables with 0 policies
ZERO_POLICY_TABLES=$(echo "$RESULT" | grep -E '^\s+public\s+\w+\s+0' || echo "")

if [ -n "$ZERO_POLICY_TABLES" ]; then
    echo -e "${RED}========================================"
    echo -e "⚠️  WARNING: RLS ENABLED WITHOUT POLICIES"
    echo -e "========================================${NC}"
    echo ""
    echo -e "${YELLOW}The following tables have RLS enabled but NO policies:${NC}"
    echo "$ZERO_POLICY_TABLES"
    echo ""
    echo -e "${RED}This means DENY ALL - no one can access these tables!${NC}"
    echo ""
    echo "Action required: Add RLS policies in schemas/ and create migration"
    exit 1
else
    echo -e "${GREEN}========================================"
    echo -e "✓ All RLS-enabled tables have policies"
    echo -e "========================================${NC}"
    exit 0
fi
