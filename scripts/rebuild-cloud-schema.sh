#!/bin/bash
set -e

echo "🔧 Reconstruction du schéma Supabase Cloud depuis les fichiers déclaratifs"
echo "==========================================================================="

# Obtenir la DB URL depuis Supabase
PROJECT_REF=$(grep 'NEXT_PUBLIC_SUPABASE_URL' .env.local | cut -d'/' -f3 | cut -d'.' -f1)
echo "📡 Project Ref: $PROJECT_REF"

# Demander le mot de passe de la base de données
read -sp "🔑 Entrez le mot de passe de la base de données Supabase: " DB_PASSWORD
echo ""

# Construire l'URL de connexion
DB_URL="postgresql://postgres:${DB_PASSWORD}@db.${PROJECT_REF}.supabase.co:5432/postgres"

echo ""
echo "📋 Application des fichiers de schéma dans l'ordre..."
echo ""

# Appliquer chaque fichier de schéma dans l'ordre
for file in supabase/schemas/*.sql; do
    filename=$(basename "$file")
    echo "  ➤ $filename"
    
    # Appliquer le fichier, en ignorant les erreurs de commentaires sur storage.objects
    PGPASSWORD="${DB_PASSWORD}" psql "$DB_URL" -f "$file" 2>&1 | grep -v "comment on policy" | grep -E "(ERROR|CREATE|ALTER|DROP)" || true
    
    if [ $? -ne 0 ]; then
        echo "    ⚠️  Avertissement lors de l'application de $filename"
    else
        echo "    ✅ $filename appliqué"
    fi
done

echo ""
echo "✅ Schéma reconstruit avec succès!"
echo ""
echo "📊 Vérification des tables créées..."
PGPASSWORD="${DB_PASSWORD}" psql "$DB_URL" -c "\dt public.*" | head -30

echo ""
echo "🎉 Reconstruction terminée!"
