# ============================================================================
# 🗄️ SUPABASE CONFIGURATION (Required)
# ============================================================================
# Get these from: https://app.supabase.com/project/_/settings/api

NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=your-anon-key

# ⚠️ CRITICAL: Service Role Key - NEVER commit to version control!
# Used for: Admin operations (user invitation, role management)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# ============================================================================
# 🌐 APPLICATION CONFIGURATION (Required)
# ============================================================================

# Site URL (used for invitation links, redirects)
# Development: http://localhost:3000
# Production: https://rougecardinalcompany.fr
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# ============================================================================
# 📧 EMAIL CONFIGURATION (Resend - Required)
# ============================================================================
# Get API key from: https://resend.com/api-keys

# Resend API Key (format: re_xxxxx)
RESEND_API_KEY=re_your_api_key_here

# Sender email (must be verified in Resend dashboard)
EMAIL_FROM=noreply@rougecardinalcompany.fr

# Admin contact email (receives contact form notifications)
EMAIL_CONTACT=contact@rougecardinalcompany.fr

# ============================================================================
# 🚨 DEVELOPMENT EMAIL REDIRECT (Optional - Dev Only)
# ============================================================================
# ⚠️  WARNING: MUST be 'false' or omitted in production!
#
# Purpose: Redirect ALL invitation emails to a test address during development
# Useful for: Testing invitation flow without sending to real users
#
# Activation requirements:
# 1. NODE_ENV='development'
# 2. EMAIL_DEV_REDIRECT='true'
#
# ❌ DO NOT enable in production - will redirect real user invitations!
# ✅ Safe production values: 'false', undefined, or omit these lines

EMAIL_DEV_REDIRECT=false
EMAIL_DEV_REDIRECT_TO=your-test-email@example.com

# ============================================================================
# 🔐 ADMIN SEEDING (Optional - Local Development)
# ============================================================================
# Used by scripts/create-admin-user.ts for local database seeding

DEFAULT_ADMIN_EMAIL=admin@rougecardinal.com
DEFAULT_ADMIN_PASSWORD=Admin123!

# ============================================================================
# 🧪 TESTING & DEVELOPMENT (Optional)
# ============================================================================

TEST_DB_URL=postgresql://...
GITHUB_TOKEN=ghp_...
CONTEXT7_API_KEY=...

# ============================================================================
# 🤖 MCP TOOLS & CI/CD (Optional - External tooling only)
# ============================================================================
# These variables are used by MCP Supabase tools and CI/CD pipelines.
# They are NOT required for the Next.js application to run.
# 
# Used by:
# - Claude MCP Supabase tools (database operations via MCP)
# - GitHub Actions workflows (database migrations, testing)
# - Supabase CLI commands in CI/CD
#
# Safe to omit if you're only running the Next.js app locally.

SUPABASE_PROJECT_REF=your-project-ref
SUPABASE_ACCESS_TOKEN=sbp_your-access-token

# ============================================================================
# ⚙️ ENVIRONMENT (Auto-detected by Next.js)
# ============================================================================
# Values: development | test | production
# Usually set automatically - no need to specify
# NODE_ENV=development

# ============================================================================
# 🚀 DEPLOYMENT CHECKLIST
# ============================================================================
# Before deploying to production, verify:
# 
# ✅ EMAIL_DEV_REDIRECT is 'false' or undefined
# ✅ EMAIL_FROM is a verified domain in Resend
# ✅ RESEND_API_KEY is production key (not test mode)
# ✅ SUPABASE_SERVICE_ROLE_KEY is kept secret (use env vars in hosting platform)
# ✅ NEXT_PUBLIC_SITE_URL points to production domain
# ============================================================================

# ============================================================================
# 🔒 T3 ENV VALIDATION
# ============================================================================
# T3 Env validates all required variables at build/runtime.
# Missing or invalid variables will cause immediate failure with clear errors.
#
# To skip validation during CI/CD build (not recommended):
# SKIP_ENV_VALIDATION=true
# ============================================================================
