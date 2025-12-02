#!/bin/bash
# Script pour charger les variables d'environnement et exécuter Supabase CLI

# Charger les variables d'environnement depuis .env.local
if [ -f .env.local ]; then
  export $(grep -v '^#' .env.local | xargs)
fi

# Exécuter la commande Supabase avec tous les arguments passés
exec pnpm dlx supabase "$@"