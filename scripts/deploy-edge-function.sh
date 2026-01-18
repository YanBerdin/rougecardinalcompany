#!/usr/bin/env bash
# ============================================================================
# 🚀 Supabase Edge Function Deployment Script
# ============================================================================
# Purpose: Deploy the scheduled-cleanup Edge Function with all required setup
# Usage: ./scripts/deploy-edge-function.sh [--set-secret] [--schedule-cron]
# ============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
FUNCTION_NAME="scheduled-cleanup"
PROJECT_REF="${SUPABASE_PROJECT_REF:-}"

# ============================================================================
# Helper Functions
# ============================================================================

print_header() {
    echo -e "\n${BLUE}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}\n"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# ============================================================================
# Pre-flight Checks
# ============================================================================

check_prerequisites() {
    print_header "1. Pre-flight Checks"

    # Check Supabase CLI
    if ! command -v supabase &> /dev/null; then
        print_error "Supabase CLI not found. Install with: npm install -g supabase"
        exit 1
    fi
    print_success "Supabase CLI installed: $(supabase --version)"

    # Check if logged in
    if ! supabase projects list &> /dev/null 2>&1; then
        print_error "Not logged in to Supabase. Run: supabase login"
        exit 1
    fi
    print_success "Logged in to Supabase"

    # Check project ref
    if [ -z "$PROJECT_REF" ]; then
        print_warning "SUPABASE_PROJECT_REF not set. Attempting to detect from .env..."
        if [ -f ".env.local" ]; then
            PROJECT_REF=$(grep SUPABASE_PROJECT_REF .env.local 2>/dev/null | cut -d '=' -f2 | tr -d ' "')
        fi
        if [ -z "$PROJECT_REF" ]; then
            print_error "Could not detect project ref. Set SUPABASE_PROJECT_REF environment variable."
            exit 1
        fi
    fi
    print_success "Project ref: $PROJECT_REF"

    # Check function exists
    if [ ! -d "supabase/functions/$FUNCTION_NAME" ]; then
        print_error "Function directory not found: supabase/functions/$FUNCTION_NAME"
        exit 1
    fi
    print_success "Function directory exists"
}

# ============================================================================
# Generate CRON_SECRET
# ============================================================================

generate_secret() {
    print_header "2. Generate CRON_SECRET"

    if [ "$1" == "--set-secret" ] || [ "$2" == "--set-secret" ]; then
        CRON_SECRET=$(openssl rand -base64 32)
        echo -e "\n${GREEN}Generated CRON_SECRET:${NC}"
        echo -e "${YELLOW}$CRON_SECRET${NC}"
        echo ""
        print_warning "IMPORTANT: Save this token securely! You'll need it for:"
        echo "  1. Supabase Dashboard > Edge Functions > Secrets"
        echo "  2. The pg_cron job authorization header"
        echo ""

        # Ask to set in Supabase
        read -p "Set this secret in Supabase now? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            echo "$CRON_SECRET" | supabase secrets set CRON_SECRET --project-ref "$PROJECT_REF"
            print_success "Secret set in Supabase"
        else
            print_info "Manual setup required:"
            echo "  supabase secrets set CRON_SECRET='$CRON_SECRET' --project-ref $PROJECT_REF"
        fi
    else
        print_info "Skipping secret generation (use --set-secret to generate)"
    fi
}

# ============================================================================
# Deploy Function
# ============================================================================

deploy_function() {
    print_header "3. Deploy Edge Function"

    print_info "Deploying $FUNCTION_NAME to project $PROJECT_REF..."
    
    supabase functions deploy "$FUNCTION_NAME" --project-ref "$PROJECT_REF"
    
    print_success "Function deployed successfully!"
    echo ""
    echo "Function URL:"
    echo "  https://$PROJECT_REF.supabase.co/functions/v1/$FUNCTION_NAME"
}

# ============================================================================
# Setup pg_cron Schedule
# ============================================================================

setup_cron() {
    print_header "4. Setup pg_cron Schedule"

    if [ "$1" == "--schedule-cron" ] || [ "$2" == "--schedule-cron" ]; then
        print_warning "pg_cron setup requires manual SQL execution."
        echo ""
        echo "Run this SQL in Supabase SQL Editor (Dashboard > SQL Editor):"
        echo ""
        echo -e "${YELLOW}-- 1. Enable pg_cron extension (if not already enabled)${NC}"
        echo "create extension if not exists pg_cron with schema extensions;"
        echo ""
        echo -e "${YELLOW}-- 2. Enable pg_net extension (for HTTP requests)${NC}"
        echo "create extension if not exists pg_net with schema extensions;"
        echo ""
        echo -e "${YELLOW}-- 3. Schedule the cleanup job (daily at 2:00 AM UTC)${NC}"
        echo "select cron.schedule("
        echo "  'daily-data-retention-cleanup',"
        echo "  '0 2 * * *',"
        echo "  \$\$"
        echo "  select net.http_post("
        echo "    url := 'https://$PROJECT_REF.supabase.co/functions/v1/$FUNCTION_NAME',"
        echo "    headers := '{\"Authorization\": \"Bearer <YOUR_CRON_SECRET>\", \"Content-Type\": \"application/json\"}'::jsonb,"
        echo "    body := '{}'::jsonb"
        echo "  ) as request_id;"
        echo "  \$\$"
        echo ");"
        echo ""
        print_warning "Replace <YOUR_CRON_SECRET> with the token you generated!"
    else
        print_info "Skipping cron setup (use --schedule-cron to show instructions)"
    fi
}

# ============================================================================
# Test Function
# ============================================================================

test_function() {
    print_header "5. Test Function"

    echo "To test the function manually, run:"
    echo ""
    echo -e "${YELLOW}curl -X POST \\${NC}"
    echo -e "${YELLOW}  'https://$PROJECT_REF.supabase.co/functions/v1/$FUNCTION_NAME' \\${NC}"
    echo -e "${YELLOW}  -H 'Authorization: Bearer <YOUR_CRON_SECRET>' \\${NC}"
    echo -e "${YELLOW}  -H 'Content-Type: application/json'${NC}"
    echo ""
    echo "Or for local testing:"
    echo ""
    echo -e "${YELLOW}supabase functions serve $FUNCTION_NAME --env-file supabase/functions/.env.local${NC}"
    echo ""
    echo "Then in another terminal:"
    echo ""
    echo -e "${YELLOW}curl -X POST http://localhost:54321/functions/v1/$FUNCTION_NAME \\${NC}"
    echo -e "${YELLOW}  -H 'Authorization: Bearer <YOUR_LOCAL_CRON_SECRET>' \\${NC}"
    echo -e "${YELLOW}  -H 'Content-Type: application/json'${NC}"
}

# ============================================================================
# Summary
# ============================================================================

print_summary() {
    print_header "📋 Deployment Summary"

    echo "Function: $FUNCTION_NAME"
    echo "Project:  $PROJECT_REF"
    echo "URL:      https://$PROJECT_REF.supabase.co/functions/v1/$FUNCTION_NAME"
    echo ""
    echo "Next steps:"
    echo "  1. Verify CRON_SECRET is set: supabase secrets list --project-ref $PROJECT_REF"
    echo "  2. Set up pg_cron schedule in SQL Editor (see --schedule-cron output)"
    echo "  3. Test with curl command above"
    echo "  4. Monitor logs: supabase functions logs $FUNCTION_NAME --project-ref $PROJECT_REF"
    echo ""
    print_success "Deployment complete!"
}

# ============================================================================
# Main
# ============================================================================

main() {
    print_header "🚀 Edge Function Deployment: $FUNCTION_NAME"
    
    check_prerequisites
    generate_secret "$@"
    deploy_function
    setup_cron "$@"
    test_function
    print_summary
}

# Show help
if [ "$1" == "--help" ] || [ "$1" == "-h" ]; then
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --set-secret      Generate and optionally set CRON_SECRET in Supabase"
    echo "  --schedule-cron   Show pg_cron setup instructions"
    echo "  -h, --help        Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                          # Deploy only"
    echo "  $0 --set-secret             # Deploy + generate secret"
    echo "  $0 --set-secret --schedule-cron  # Full setup"
    exit 0
fi

main "$@"
