#!/bin/bash
# =====================================================
# Post-Reset Script: Initialize Admin User
# Description: Exécute automatiquement après db reset
#              pour recréer l'utilisateur admin
# Usage: Appelé par package.json script "db:reset"
# =====================================================

set -e

echo "🔧 Post-reset: Initializing admin user..."

# Vérifier que Supabase est démarré
if ! pnpm dlx supabase status &>/dev/null; then
  echo "❌ Supabase is not running. Start it with: pnpm dlx supabase start"
  exit 1
fi

# Attendre que la base soit prête
echo "⏳ Waiting for database to be ready..."
sleep 2

# Créer l'utilisateur admin
echo "👤 Creating admin user..."
if pnpm exec tsx scripts/create-admin-user.ts; then
  echo "✅ Admin user initialized successfully!"
  echo ""
  echo "📧 Email: yandevformation@gmail.com"
  echo "🔒 Password: AdminRouge2025! (CHANGE THIS!)"
  echo ""
  echo "🚀 Next steps:"
  echo "   1. Start dev server: pnpm dev"
  echo "   2. Login at: http://localhost:3000/auth/login"
  echo "   3. Access admin: http://localhost:3000/admin"
else
  echo "⚠️  Admin user creation failed. Run manually:"
  echo "   pnpm exec tsx scripts/create-admin-user.ts"
  exit 1
fi
