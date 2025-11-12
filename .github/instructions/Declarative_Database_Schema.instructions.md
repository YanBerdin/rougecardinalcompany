---
applyTo: "**"
---

description: For when modifying the Supabase database schema.
alwaysApply: false

---

# Database: Declarative Database Schema

Mandatory Instructions for Supabase Declarative Schema Management

## 1. **Exclusive Use of Declarative Schema**

**All database schema modifications must be defined within `.sql` files located in the `supabase/schemas/` directory. -**Do not\*\* create or modify files directly in the `supabase/migrations/` directory unless the modification is about the known caveats below. Migration files are to be generated automatically through the CLI.

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

#### 1. **Create manual migration** for immediate deployment to production

```bash
# Create timestamped migration manually
touch supabase/migrations/$(date +%Y%m%d%H%M%S)_fix_critical_bug.sql
```

#### 2. **Apply to production** using Supabase CLI

```bash
pnpm dlx supabase db push
```

### Post-Fix Synchronization (MANDATORY)

#### 1. **Update declarative schema** to reflect the fix

- Modify the corresponding `.sql` file in `supabase/schemas/`
- Ensure the schema file represents the corrected final state

#### 2. **Document the redundancy** in `supabase/migrations/migrations.md`

- `YYYYMMDDHHMMSS_fix_critical_bug.sql` — Description of fix
  - ✅ **Intégré au schéma déclaratif** : `supabase/schemas/XX_affected_entity.sql`
  - 📝 **Migration conservée** pour l'historique et la cohérence avec Supabase Cloud

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
