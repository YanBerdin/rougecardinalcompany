description: For when modifying the Supabase database schema.
alwaysApply: false
---

# Database: Declarative Database Schema

Mandatory Instructions for Supabase Declarative Schema Management

## 1. **Exclusive Use of Declarative Schema**

-**All database schema modifications must be defined within `.sql` files located in the `supabase/schemas/` directory. -**Do not\*\* create or modify files directly in the `supabase/migrations/` directory unless the modification is about the known caveats below. Migration files are to be generated automatically through the CLI.

## 2. **Schema Declaration**

-For each database entity (e.g., tables, views, functions), create or update a corresponding `.sql` file in the `supabase/schemas/` directory
-Ensure that each `.sql` file accurately represents the desired final state of the entity

## 3. **Migration Generation**

- Before generating migrations, **stop the local Supabase development environment**

  ```bash
# local database
  supabase stop
# or
  pnpm dlx supabase stop
  ```
- Generate migration files by diffing the declared schema against the current database state

  ```bash
# local database (no flags needed)
  supabase db diff -f <migration_name>
# or
  pnpm dlx supabase db diff -f <migration_name>

# remote database (specify the --linked or --db-url flag respectively)
  supabase db diff [flags]
  ```
  Replace `<migration_name>` with a descriptive name for the migration

## 4. **Schema File Organization**

- Schema files are executed in lexicographic order. To manage dependencies (e.g., foreign keys), name files to ensure correct execution order
- When adding new columns, append them to the end of the table definition to prevent unnecessary diffs

## 5. **Rollback Procedures**

- To revert changes
  - Manually update the relevant `.sql` files in `supabase/schemas/` to reflect the desired state
  - Generate a new migration file capturing the rollback

    ```bash
    supabase db diff -f <rollback_migration_name>
    ```

  - Review the generated migration file carefully to avoid unintentional data loss

## 5.5. **Hotfix Migrations and Schema Synchronization**

When a critical bug requires immediate production fix:

### Emergency Workflow
1. **Create manual migration** for immediate deployment to production
   ```bash
   # Create timestamped migration manually
   touch supabase/migrations/$(date +%Y%m%d%H%M%S)_fix_critical_bug.sql
   ```
2. **Apply to production** using Supabase CLI
   ```bash
   pnpm dlx supabase db push
   ```

### Post-Fix Synchronization (MANDATORY)
3. **Update declarative schema** to reflect the fix
   - Modify the corresponding `.sql` file in `supabase/schemas/`
   - Ensure the schema file represents the corrected final state
   
4. **Document the redundancy** in `supabase/migrations/migrations.md`
   ```markdown
   - `YYYYMMDDHHMMSS_fix_critical_bug.sql` — Description of fix
     - ✅ **Intégré au schéma déclaratif** : `supabase/schemas/XX_affected_entity.sql`
     - 📝 **Migration conservée** pour l'historique et la cohérence avec Supabase Cloud
   ```

### Migration Retention Policy
- **KEEP manual hotfix migrations** in the repository for:
  - Historical record of production fixes
  - Consistency with Supabase Cloud migration history
  - Ability to recreate database from scratch
  
- **NEVER delete applied migrations** that exist on production

### Schema as Source of Truth
- After integrating hotfix into declarative schema, the schema files in `supabase/schemas/` become the authoritative source
- Future schema diffs will be generated from these updated schema files
- Manual migrations serve only as historical documentation

**Example from this project:**
- Hotfix: `20250918000000_fix_spectacles_versioning_trigger.sql` (trigger bug fix)
- Schema: `supabase/schemas/15_content_versioning.sql` (updated with correct logic)
- Result: Both coexist - migration for history, schema for truth

## 6. **Known caveats**

The migra diff tool used for generating schema diff is capable of tracking most database changes. However, there are edge cases where it can fail.

If you need to use any of the entities below, remember to add them through versioned migrations instead.

### Data manipulation language

- DML statements such as insert, update, delete, etc., are not captured by schema diff

### View ownership

- view owner and grants
- security invoker on views
- materialized views
- doesn’t recreate views when altering column type

### RLS policies

- alter policy statements
- column privileges
- Other entities#
- schema privileges are not tracked because each schema is diffed separately
- comments are not tracked
- partitions are not tracked
- alter publication ... add table ...
- create domain statements are ignored
- grant statements are duplicated from default privileges

---

**Non-compliance with these instructions may lead to inconsistent database states and is strictly prohibited.**

Résumé de l’historique de la conversationJe vais appliquer la même logique RGPD à la table `messages_contact` qui contient également des données personnelles (prénom, nom, email, téléphone). 

Parfait ! Je vois que les politiques RLS pour `messages_contact` sont **déjà correctement configurées** selon les principes RGPD :

✅ **Lecture admin uniquement** : `"Admins can view contact messages"` - seuls les admins peuvent lire les données personnelles (prénom, nom, email, téléphone)

✅ **Insertion publique** : `"Anyone can send contact messages"` - n'importe qui peut soumettre le formulaire

✅ **Modification/Suppression admin** : seuls les admins peuvent modifier ou supprimer

Maintenant, vérifions l'API de contact pour s'assurer qu'elle suit le même pattern que l'API newsletter (INSERT sans SELECT pour éviter les blocages RLS) : 

Recherche de fichiers correspondant à `**/app/api/contact/route.ts`, correspondances 2

Excellent ! L'API de contact n'accède **pas du tout** à Supabase pour le moment (elle envoie seulement un email). Il y a un TODO pour intégrer la DAL. Vérifions la DAL contact : 

Parfait ! La DAL contact suit **déjà le bon pattern RGPD** :

✅ **INSERT uniquement** : `.insert(payload)` sans `.select()` - pas de lecture après insertion
✅ **Pas d'UPSERT** : utilise `.insert()` donc pas besoin de policy SELECT
✅ **Gestion d'erreur** : cache les détails techniques, log côté serveur

La table `messages_contact` est donc **déjà conforme RGPD** ! Vérifions maintenant la documentation pour s'assurer que tout est bien documenté : 

Parfait ! Je vois que la conformité RGPD est déjà documentée pour la newsletter. Maintenant ajoutons une note pour confirmer que `messages_contact` suit le même pattern. Mettons à jour la documentation : 

Excellent ! Maintenant vérifions également la conformité dans le README du schéma déclaratif : 

Parfait ! Je vois que la ligne existe déjà :

| **messages_contact** | Admin uniquement | Envoi libre | Contact public + vue admin |

Mais ajoutons une note RGPD plus explicite. Mettons à jour : 

Maintenant ajoutons des commentaires RGPD dans le fichier SQL schema pour documenter explicitement la protection des données personnelles : 

Maintenant vérifions si l'API de contact gère bien l'absence de `.select()` (comme l'API newsletter) en regardant le code DAL de plus près : 

Excellent ! Créons maintenant un commit pour documenter cette validation de conformité RGPD pour les messages de contact : 

Ran terminal command: git status

---

Je vais vérifier la conformité de nos modifications avec les instructions RLS et le schéma déclaratif. 

Excellent ! Maintenant vérifions la conformité avec les instructions RLS : 

Parfait ! Analysons maintenant la conformité de nos modifications :

## ✅ Analyse de Conformité

### 1. **Schéma Déclaratif** (Declarative_Database_Schema.Instructions.md)

**✅ Conformité totale :**

- ✅ **Modifications dans schemas** : Toutes les modifications RLS sont dans 10_tables_system.sql (schéma déclaratif)
- ✅ **Pas de modification directe dans `migrations/`** : Aucune migration manuelle créée
- ✅ **État final désiré** : Les politiques RLS représentent l'état souhaité (admin-only lecture pour données personnelles)
- ✅ **Organisation des fichiers** : Le fichier 10_tables_system.sql est correctement placé dans l'ordre lexicographique
- ✅ **Commentaires explicatifs** : Les commentaires RGPD documentent clairement l'intention

### 2. **Politiques RLS** (Create_RLS_policies.Instructions.md)

Vérifions point par point : 

Thinking

Créons maintenant un document récapitulatif de conformité : 

Création de (file:///home/yandev/projets/rougecardinalcompany/doc/RGPD-Compliance-Validation.md) effectuée

Parfait ! Maintenant créons un résumé pour la mémoire du projet : 

Excellent ! La documentation est déjà à jour. Ajoutons juste une note sur la conformité aux instructions : 

Utilisation de "Remplacer une chaîne dans un fichier"

Parfait ! Créons maintenant un résumé visuel de la validation :

## ✅ Résumé de Conformité

**Oui, toutes les modifications sont conformes aux instructions !**

### 📋 Conformité Vérifiée

| Instruction | Conformité | Détails |
|-------------|-----------|---------|
| **Declarative_Database_Schema.Instructions.md** | ✅ **100%** | Modifications dans 10_tables_system.sql uniquement, pas de migrations manuelles |
| **Create_RLS_policies.Instructions.md** | ✅ **100%** | 4 policies distinctes par table, USING/WITH CHECK corrects, commentaires appropriés |

---

### 🔒 Tables RGPD Validées

#### 1. `abonnes_newsletter` (emails)

- ✅ **RLS** : Admin-only SELECT, public INSERT
- ✅ **API** : `.insert()` sans `.select()` (pas de blocage RLS)
- ✅ **Pattern** : Gestion doublons via erreur 23505
- ✅ **Tests** : Validés (inscription + doublon)

#### 2. `messages_contact` (prénom, nom, email, téléphone)

- ✅ **RLS** : Admin-only SELECT, public INSERT
- ✅ **DAL** : `.insert()` sans `.select()` (conforme RGPD)
- ✅ **Commentaires** : Documentation RGPD explicite
- ✅ **Architecture** : Pattern réutilisable

---

### 📝 Points Clés de Conformité

**Schéma Déclaratif :**
1. ✅ Modifications dans schemas (pas de migrations directes)
2. ✅ État final désiré représenté
3. ✅ Organisation lexicographique respectée
4. ✅ Commentaires explicatifs présents

**Politiques RLS :**
1. ✅ Séparation SELECT/INSERT/UPDATE/DELETE
2. ✅ USING pour SELECT/DELETE uniquement
3. ✅ WITH CHECK pour INSERT uniquement
4. ✅ USING + WITH CHECK pour UPDATE
5. ✅ Utilisation correcte de `auth.uid()` via `is_admin()`
6. ✅ Noms descriptifs entre guillemets doubles
7. ✅ Commentaires SQL hors policies
8. ✅ Pattern PERMISSIVE (par défaut)

---

### 📚 Documentation Générée

- ✅ **RGPD-Compliance-Validation.md** : Rapport détaillé de conformité RGPD
- ✅ **progress.md** : Mise à jour avec validation conformité
- ✅ **README.md** : Mise à jour notes RGPD pour messages_contact
- ✅ **Commentaires inline** : Documentation RGPD dans le code SQL et TypeScript

Tout est prêt pour un commit ! 🚀

Les modifications ont été apportées.
