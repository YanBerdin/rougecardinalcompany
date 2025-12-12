#!/bin/bash

# Script de test pour l'endpoint /api/admin/team/[id]/active
# Usage: ./scripts/test-active-endpoint.sh [AUTH_COOKIE]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BASE_URL="http://localhost:3000"
ENDPOINT="/api/admin/team"
AUTH_COOKIE="${1:-}"

if [ -z "$AUTH_COOKIE" ]; then
  echo -e "${YELLOW}⚠️  No auth cookie provided. Testing without authentication.${NC}"
  echo -e "${YELLOW}Usage: $0 'sb-xxx-auth-token=your-token-here'${NC}"
  echo ""
fi

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}Testing /api/admin/team/[id]/active endpoint${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

# Helper function to make requests
test_request() {
  local test_name="$1"
  local team_id="$2"
  local body="$3"
  local expected_status="$4"
  
  echo -e "${YELLOW}🧪 Test: ${test_name}${NC}"
  echo -e "   Request: POST ${ENDPOINT}/${team_id}/active"
  echo -e "   Body: ${body}"
  
  if [ -n "$AUTH_COOKIE" ]; then
    response=$(curl -s -w "\n%{http_code}" -X POST "${BASE_URL}${ENDPOINT}/${team_id}/active" \
      -H "Content-Type: application/json" \
      -H "Cookie: ${AUTH_COOKIE}" \
      -d "${body}")
  else
    response=$(curl -s -w "\n%{http_code}" -X POST "${BASE_URL}${ENDPOINT}/${team_id}/active" \
      -H "Content-Type: application/json" \
      -d "${body}")
  fi
  
  http_code=$(echo "$response" | tail -n1)
  response_body=$(echo "$response" | head -n-1)
  
  echo -e "   Status: ${http_code}"
  echo -e "   Response: ${response_body}"
  
  if [ "$http_code" = "$expected_status" ]; then
    echo -e "${GREEN}✅ PASS${NC}"
  else
    echo -e "${RED}❌ FAIL - Expected status ${expected_status}, got ${http_code}${NC}"
  fi
  echo ""
}

# Test 1: Boolean natif (true)
test_request \
  "Boolean natif (true)" \
  "1" \
  '{"active": true}' \
  "200"

# Test 2: Boolean natif (false)
test_request \
  "Boolean natif (false)" \
  "1" \
  '{"active": false}' \
  "200"

# Test 3: String "true"
test_request \
  "String \"true\"" \
  "1" \
  '{"active": "true"}' \
  "200"

# Test 4: String "false"
test_request \
  "String \"false\"" \
  "1" \
  '{"active": "false"}' \
  "200"

# Test 5: Number 1
test_request \
  "Number 1 (active)" \
  "1" \
  '{"active": 1}' \
  "200"

# Test 6: Number 0
test_request \
  "Number 0 (inactive)" \
  "1" \
  '{"active": 0}' \
  "200"

# Test 7: Invalid value (string "maybe")
test_request \
  "Invalid value (string \"maybe\")" \
  "1" \
  '{"active": "maybe"}' \
  "422"

# Test 8: Invalid value (number 2)
test_request \
  "Invalid value (number 2)" \
  "1" \
  '{"active": 2}' \
  "422"

# Test 9: Missing active field
test_request \
  "Missing active field" \
  "1" \
  '{}' \
  "422"

# Test 10: Invalid ID (non-numeric)
test_request \
  "Invalid ID (non-numeric)" \
  "abc" \
  '{"active": true}' \
  "400"

# Test 11: Invalid ID (negative)
test_request \
  "Invalid ID (negative)" \
  "-1" \
  '{"active": true}' \
  "400"

# Test 12: Invalid ID (zero)
test_request \
  "Invalid ID (zero)" \
  "0" \
  '{"active": true}' \
  "400"

# Test 13: Invalid JSON body
echo -e "${YELLOW}🧪 Test: Invalid JSON body${NC}"
echo -e "   Request: POST ${ENDPOINT}/1/active"
echo -e "   Body: {invalid json}"

if [ -n "$AUTH_COOKIE" ]; then
  response=$(curl -s -w "\n%{http_code}" -X POST "${BASE_URL}${ENDPOINT}/1/active" \
    -H "Content-Type: application/json" \
    -H "Cookie: ${AUTH_COOKIE}" \
    -d '{invalid json}')
else
  response=$(curl -s -w "\n%{http_code}" -X POST "${BASE_URL}${ENDPOINT}/1/active" \
    -H "Content-Type: application/json" \
    -d '{invalid json}')
fi

http_code=$(echo "$response" | tail -n1)
response_body=$(echo "$response" | head -n-1)

echo -e "   Status: ${http_code}"
echo -e "   Response: ${response_body}"

if [ "$http_code" = "400" ]; then
  echo -e "${GREEN}✅ PASS${NC}"
else
  echo -e "${RED}❌ FAIL - Expected status 400, got ${http_code}${NC}"
fi
echo ""

# Test 14: Wrong content type
echo -e "${YELLOW}🧪 Test: Wrong content type${NC}"
echo -e "   Request: POST ${ENDPOINT}/1/active"
echo -e "   Content-Type: text/plain"

if [ -n "$AUTH_COOKIE" ]; then
  response=$(curl -s -w "\n%{http_code}" -X POST "${BASE_URL}${ENDPOINT}/1/active" \
    -H "Content-Type: text/plain" \
    -H "Cookie: ${AUTH_COOKIE}" \
    -d '{"active": true}')
else
  response=$(curl -s -w "\n%{http_code}" -X POST "${BASE_URL}${ENDPOINT}/1/active" \
    -H "Content-Type: text/plain" \
    -d '{"active": true}')
fi

http_code=$(echo "$response" | tail -n1)
response_body=$(echo "$response" | head -n-1)

echo -e "   Status: ${http_code}"
echo -e "   Response: ${response_body}"

if [ "$http_code" = "400" ]; then
  echo -e "${GREEN}✅ PASS${NC}"
else
  echo -e "${RED}❌ FAIL - Expected status 400, got ${http_code}${NC}"
fi
echo ""

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}Testing complete!${NC}"
echo -e "${BLUE}================================================${NC}"

# Test without auth if cookie was provided (to verify auth protection)
if [ -n "$AUTH_COOKIE" ]; then
  echo ""
  echo -e "${YELLOW}🔒 Testing authentication protection...${NC}"
  
  response=$(curl -s -w "\n%{http_code}" -X POST "${BASE_URL}${ENDPOINT}/1/active" \
    -H "Content-Type: application/json" \
    -d '{"active": true}')
  
  http_code=$(echo "$response" | tail -n1)
  response_body=$(echo "$response" | head -n-1)
  
  echo -e "   Request: POST ${ENDPOINT}/1/active (without cookie)"
  echo -e "   Status: ${http_code}"
  echo -e "   Response: ${response_body}"
  
  if [ "$http_code" = "403" ]; then
    echo -e "${GREEN}✅ PASS - Auth protection working${NC}"
  else
    echo -e "${RED}❌ FAIL - Expected status 403, got ${http_code}${NC}"
  fi
fi
