# Migrations Manuelles - Rouge Cardinal Company

Ce dossier contient les migrations spécifiques qui doivent être exécutées manuellement, séparément du schéma déclaratif.

## Migrations Disponibles

### `sync_existing_profiles.sql`

**Description :** Synchronisation ponctuelle des profils existants avec auth.users  
**Contexte :** Migration extraite du schéma déclaratif pour respecter les principes de Declarative Database Schema Management  
**Exécution :** Après application du schéma déclaratif principal  
**Idempotente :** ✅ Oui (peut être exécutée plusieurs fois sans effet de bord)

## Ordre d'Exécution Recommandé

1. **Appliquer le schéma déclaratif :**

   ```bash
   supabase stop
   supabase db diff -f apply_declarative_schema
   supabase db push
   ```

2. **Exécuter les migrations de données :**

   ```bash
   # Synchronisation des profils existants
   psql -h localhost -p 54322 -d postgres -U postgres -f supabase/migrations/sync_existing_profiles.sql
   ```

## Notes Importantes

- **Les migrations de données (DML)** ne sont pas capturées par `supabase db diff` et doivent être gérées séparément
- **Les migrations de schéma (DDL)** sont gérées automatiquement par le système de schéma déclaratif
- Toujours tester les migrations sur un environnement de développement avant production

## Voir Aussi

- `.github/copilot/Declarative_Database_Schema.Instructions.md` - Instructions pour le schéma déclaratif
- `supabase/schemas/` - **NOUVEAU : Schéma déclaratif correctement structuré en fichiers séparés**
- `supabase/schemas/empty-database-schema-recap.sql` - **OBSOLÈTE : Ancien fichier monolithique à supprimer**
