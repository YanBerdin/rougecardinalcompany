# Reconstruction Base de Données - 18 Nov 2025

## ✅ RÉSOLU - Base de données entièrement reconstruite

### Problème

- Migration principale DDL manquante (`20250918004849_apply_declarative_schema.sql`)
- Base cloud vidée de toutes ses tables
- Erreur: `relation "public.home_hero_slides" does not exist`

### Solution Appliquée

1. **Créé**: `20250918000002_apply_declarative_schema_complete.sql` (4515 lignes)
   - Concatène tous les fichiers de `supabase/schemas/` dans l'ordre
   - Crée toutes les tables, fonctions, triggers, RLS, indexes, vues

2. **Désactivé** 6 migrations redondantes (renommées `.skip`):
   - Migrations qui recréaient des policies déjà dans le schéma déclaratif
   - Évite les erreurs "policy already exists"

3. **Résultat**:
   - ✅ Base locale: `supabase db reset` fonctionne parfaitement
   - ✅ Base cloud: `supabase db push` réussi - toutes les tables recréées
   - ✅ Site fonctionnel: `pnpm dev` démarre sans erreur
   - ✅ 36 tables + 70+ RLS policies + tous les seeds appliqués

### Fichiers Clés

- Migration principale: `supabase/migrations/20250918000002_apply_declarative_schema_complete.sql`
- Documentation: `RECONSTRUCTION_SUCCES.md` (rapport complet)
- Plan initial: `RECONSTRUCTION_PLAN.md` (diagnostic)

### Workflow Correct

```bash
# Modifier le schéma
vim supabase/schemas/XX_table_name.sql

# Générer migration diff (si nécessaire)
supabase stop && supabase db diff -f nom_modification

# Tester
supabase db reset

# Déployer
supabase db push
```

**Status**: Production Ready ✅
