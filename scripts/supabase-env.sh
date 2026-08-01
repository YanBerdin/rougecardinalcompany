#!/bin/bash
# Exécute la CLI Supabase avec les variables d'environnement de la cible demandée.
#
# Cible via SUPABASE_ENV : staging (défaut, .env.local) ou production (.env).
#   pnpm db:push                           # staging
#   SUPABASE_ENV=production pnpm db:push   # production
set -euo pipefail

SUPABASE_ENV="${SUPABASE_ENV:-staging}"

case "$SUPABASE_ENV" in
  staging)    ENV_FILE=".env.local" ;;
  production) ENV_FILE=".env" ;;
  *)
    echo "SUPABASE_ENV invalide: \"$SUPABASE_ENV\". Valeurs attendues: staging | production" >&2
    exit 1
    ;;
esac

if [ ! -f "$ENV_FILE" ]; then
  echo "Fichier d'environnement introuvable: $ENV_FILE" >&2
  exit 1
fi

# `source` plutôt que `export $(grep ... | xargs)` : préserve les valeurs
# contenant des espaces, des `#` ou des guillemets.
set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

echo "🎯 Cible Supabase: $SUPABASE_ENV ($ENV_FILE, projet ${SUPABASE_PROJECT_REF:-?})" >&2

exec pnpm dlx supabase "$@"