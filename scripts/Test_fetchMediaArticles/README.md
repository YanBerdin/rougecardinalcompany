# Test fetchMediaArticles - Diagnostic Scripts

## Problème Diagnostiqué (09 octobre 2025)

### Symptôme Initial

- Console log affichait : `mediaArticles Array(0)`
- Page "Revue de Presse" (`/presse`) restait vide malgré 3 articles seedés en base
- `fetchMediaArticles()` dans DAL retournait un tableau vide

### Cause Racine

**Incompatibilité RLS avec JWT Signing Keys** :

- Supabase a migré vers un nouveau format de clés : `sb_publishable_*` / `sb_secret_*` (JWT Signing Keys)
- Les politiques RLS sur la table `articles_presse` ne s'activaient pas correctement avec les nouveaux tokens JWT
- Requêtes avec le rôle `anon` bloquées (0 résultats), requêtes avec `service_role` fonctionnaient (3 résultats)

### Tests de Diagnostic

Scripts créés pour isoler le problème :

- `test-rls-articles.ts` : Test des politiques RLS avec clé `anon` (❌ 0 articles)
- `test-public-view.ts` : Test de la vue après création (✅ 3 articles)
- `check-chapo-excerpt.ts` : Validation des champs `chapo` et `excerpt` séparés
- `test-dal-pattern.ts` : Test du pattern DAL complet
- `test-chapo-and-excerpt-separate.ts` : Validation traitement séparé des champs

## Solution Implémentée

### Approche : Database VIEW

Création d'une vue `articles_presse_public` qui :

- Contourne l'évaluation RLS (permissions directes via `GRANT SELECT`)
- Filtre les articles publiés : `WHERE published_at IS NOT NULL`
- Réplique le comportement attendu des politiques RLS originales

### Fichiers Modifiés

1. **Migration DDL** :
   - `supabase/migrations/20251021000001_create_articles_presse_public_view.sql`
   - Appliquée via MCP Supabase le 09/10/2025

2. **Schéma Déclaratif** (source de vérité) :
   - `supabase/schemas/08_table_articles_presse.sql`
   - Ajout de la définition de la vue pour conformité au workflow déclaratif

3. **DAL (Data Access Layer)** :
   - `lib/dal/presse.ts`
   - Changement : `from("articles_presse")` → `from("articles_presse_public")`
   - Ajout du champ `chapo` au SELECT (corrigé : chapo et excerpt sont des champs séparés, pas des fallbacks)

4. **Types et Schémas** :
   - `components/features/public-site/presse/types.ts`
   - Ajout de `chapo: z.string()` au `MediaArticleSchema`

5. **UI** :
   - `components/features/public-site/presse/PresseView.tsx`
   - Affichage conditionnel de `chapo` (texte normal) et `excerpt` (italique entre guillemets)

## Résultat Final

✅ **Validation Utilisateur (09/10/2025)** :

- Les 3 articles s'affichent correctement
- Le chapo apparaît (texte d'introduction)
- L'excerpt apparaît (citation en italique)
- Aucune erreur console

## Impact et Considérations

### Sécurité

- ✅ Aucun impact : La vue applique le même filtre que les politiques RLS (`published_at IS NOT NULL`)
- ✅ Permissions identiques : `anon` et `authenticated` peuvent uniquement lire (`SELECT`)

### Performance

- ⚡ Amélioration potentielle : Évite l'overhead de l'évaluation RLS
- ⚡ Requêtes plus directes sur la vue

### Maintenance Future

- 🔄 Si Supabase corrige la compatibilité JWT/RLS dans une future version du SDK
- 🔄 La vue peut être remplacée par un retour direct sur `articles_presse` avec RLS
- 📝 Migration conservée pour l'historique et la cohérence avec Supabase Cloud

## Documentation Projet

- **Workflow déclaratif** : `.github/copilot/Declarative_Database_Schema.Instructions.md`
- **Migrations** : `supabase/migrations/migrations.md`
- **Schémas** : `supabase/schemas/README.md`
- **Auth Supabase** : `.github/instructions/nextjs-supabase-auth-2025.instructions.md`

## Scripts de Test Conservés

Ces scripts sont gardés pour référence future et debugging :

- Ils peuvent être réutilisés si un problème similaire survient
- Ils documentent la méthodologie de diagnostic
- Ils servent d'exemples pour tester RLS et les vues

**Note** : Pour nettoyer ces scripts de diagnostic, exécuter :

```bash
cd scripts/Test_fetchMediaArticles
rm apply-migration-articles-view.ts check-chapo-excerpt.ts check-rls-policies.ts \
   test-chapo-and-excerpt-separate.ts test-dal-pattern.ts test-public-view.ts \
   "test-rls-articles copy.ts" test-rls-articles.ts
```

## Références Techniques

### JWT Signing Keys (Supabase)

- **Format moderne** : `sb_publishable_*` (client) / `sb_secret_*` (serveur)
- **Format legacy** : `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY`
- **Avantage** : Vérification JWT locale (~2-5ms) vs appel réseau (~300ms)

### Pattern VIEW vs RLS

- **RLS** : Évaluation row-level pour chaque requête (flexible, complexe)
- **VIEW** : Filtre statique + permissions directes (simple, performant)
- **Cas d'usage** : Vue adaptée pour accès public simple avec filtre unique

---

**Date de création** : 09 octobre 2025  
**Auteur** : Équipe Rouge Cardinal Company  
**Statut** : Résolu et documenté
