# 🔧 Plan de Reconstruction de la Base de Données Supabase

## 🔍 Problème Identifié

La migration principale `20250918004849_apply_declarative_schema.sql` qui devait créer toutes les tables depuis le schéma déclaratif **N'EXISTE PAS**.

### Situation Actuelle

```
supabase/schemas/          ✅ COMPLET (36 fichiers de schéma déclaratif)
supabase/migrations/       ⚠️  INCOMPLET (manque la migration de base)
  ├── 20250918000000_fix_spectacles_versioning_trigger.sql
  ├── 20250918031500_seed_home_hero_slides.sql  ❌ Échoue car tables n'existent pas
  ├── ... (32 autres migrations de seed/fix)
  └── ❌ MANQUE: 20250918004849_apply_declarative_schema.sql
```

### Pourquoi ça échoue

1. **Supabase db reset/push** essaie d'appliquer les migrations dans l'ordre chronologique
2. La première migration après le fix (20250918031500) est un **SEED** qui insère dans `home_hero_slides`
3. Mais la table `home_hero_slides` n'existe pas encore (elle devrait être créée par la migration manquante)
4. Résultat: `ERROR: relation "public.home_hero_slides" does not exist`

## ✅ Solution en 3 Étapes

### Étape 1: Générer la migration principale depuis le schéma déclaratif

```bash
# Arrêter Supabase local
pnpm dlx supabase stop

# Générer la migration depuis le schéma déclaratif
# Cette commande va créer une nouvelle migration avec tout le schéma
pnpm dlx supabase db diff -f apply_declarative_schema_complete

# Renommer avec le bon timestamp pour qu'elle s'exécute en premier
mv supabase/migrations/$(ls -t supabase/migrations/*.sql | head -1) \
   supabase/migrations/20250918000002_apply_declarative_schema_complete.sql
```

**Note**: Le timestamp `20250918000002` assure qu'elle s'exécute APRÈS le fix du trigger (000000) mais AVANT tous les seeds (031500+).

### Étape 2: Tester en local

```bash
# Réinitialiser complètement la base locale
pnpm dlx supabase db reset

# Si ça passe, toutes les tables seront créées, puis les seeds appliqués
```

### Étape 3: Déployer sur le cloud

```bash
# Pousser vers Supabase Cloud
pnpm dlx supabase db push
```

## 🎯 Approche Alternative (Plus Rapide)

Si l'approche ci-dessus échoue, créer manuellement la migration :

```bash
# Créer la migration avec le bon timestamp
cat > supabase/migrations/20250918000002_apply_declarative_schema_complete.sql << 'EOF'
-- MIGRATION PRINCIPALE: Création de toutes les tables depuis le schéma déclaratif
-- Date: 2025-11-18
-- Source: supabase/schemas/*.sql

-- Cette migration reconstruit le schéma complet de la base de données
-- Elle doit s'exécuter AVANT tous les seeds de données

EOF

# Concaténer tous les fichiers de schéma dans l'ordre
for file in supabase/schemas/*.sql; do
    echo "" >> supabase/migrations/20250918000002_apply_declarative_schema_complete.sql
    echo "-- ============================================================================" >> supabase/migrations/20250918000002_apply_declarative_schema_complete.sql
    echo "-- SOURCE: $(basename $file)" >> supabase/migrations/20250918000002_apply_declarative_schema_complete.sql
    echo "-- ============================================================================" >> supabase/migrations/20250918000002_apply_declarative_schema_complete.sql
    cat "$file" >> supabase/migrations/20250918000002_apply_declarative_schema_complete.sql
done

# Corriger les commentaires sur storage.objects (nécessite superuser)
sed -i 's/^comment on policy.*storage\.objects/-- &/' supabase/migrations/20250918000002_apply_declarative_schema_complete.sql
```

## 📊 Ordre d'Exécution Correct

Après correction, les migrations s'exécuteront dans cet ordre:

```
1. 20250918000000_fix_spectacles_versioning_trigger.sql    ✅ Fix fonction
2. 20250918000002_apply_declarative_schema_complete.sql    ✅ CRÉER TOUTES LES TABLES
3. 20250918031500_seed_home_hero_slides.sql                ✅ Seed (tables existent)
4. 20250918094530_seed_core_content.sql                    ✅ Seed
5. ... (tous les autres seeds)                             ✅ Seeds
```

## 🚨 Points d'Attention

### Problèmes Potentiels

1. **storage.objects policies**: Les commentaires sur ces policies nécessitent des privilèges superuser
   - **Solution**: Commentés dans la migration (lignes préfixées par `--`)

2. **Duplications de policies**: Certaines migrations ultérieures recréent des policies
   - **Solution**: Les fichiers de schéma utilisent `drop policy if exists` avant `create policy`

3. **Ordre des dépendances**: Les fichiers de schéma sont nommés pour respecter les dépendances
   - **OK**: 01_extensions → 02_profiles → 02b_functions → ... → 62_rls_advanced

### Vérification Post-Migration

```bash
# Vérifier que toutes les tables existent
psql $DB_URL -c "\dt public.*" | wc -l
# Devrait afficher ~36 tables

# Vérifier les policies RLS
psql $DB_URL -c "SELECT schemaname, tablename, COUNT(*) FROM pg_policies WHERE schemaname='public' GROUP BY schemaname, tablename;"
# Toutes les tables doivent avoir des policies

# Tester un seed
psql $DB_URL -c "SELECT COUNT(*) FROM public.home_hero_slides;"
```

## 📝 Mise à Jour du README

Après réussite, mettre à jour `supabase/schemas/README.md`:

```markdown
Pour rappel, la migration générée est `supabase/migrations/20250918000002_apply_declarative_schema_complete.sql`
```

## 🎉 Résultat Attendu

- ✅ Base locale reconstruite depuis zéro avec `db reset`
- ✅ Base cloud synchronisée avec `db push`
- ✅ Toutes les tables créées avec RLS
- ✅ Tous les seeds appliqués
- ✅ Site fonctionnel en local et en production
