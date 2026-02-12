# Plan Final : Sécurisation stricte des vues admin avec rôle dédié

**TL;DR** : Migration consolidée idempotente créant le rôle `admin_views_owner`, révoquant les privilèges sur 7 vues admin, modifiant les DEFAULT PRIVILEGES, et mettant à jour les schémas déclaratifs. Scripts de test et validation inclus.

## Contexte

Le test `scripts/test-views-security-authenticated.ts` échoue car la vue `communiques_presse_dashboard` retourne un tableau vide `[]` au lieu d'une erreur `permission denied`. 

**Cause racine** : Les DEFAULT PRIVILEGES de Supabase accordent automatiquement `ALL` aux rôles `anon`/`authenticated` lors de la création de vues dans le schéma `public`. Les vues admin sont donc accessibles (mais filtrées par `is_admin()` dans la définition de la vue).

**Solution** : Créer un rôle dédié `admin_views_owner` pour isoler les vues admin, révoquer strictement les privilèges, et modifier les DEFAULT PRIVILEGES pour ce rôle.

## Vues admin concernées (7)

| Vue | Fichier schéma déclaratif |
|-----|---------------------------|
| `communiques_presse_dashboard` | `41_views_communiques.sql` |
| `membres_equipe_admin` | `41_views_admin_content_versions.sql` |
| `compagnie_presentation_sections_admin` | `41_views_admin_content_versions.sql` |
| `partners_admin` | `41_views_admin_content_versions.sql` |
| `messages_contact_admin` | `10_tables_system.sql` |
| `content_versions_detailed` | `41_views_admin_content_versions.sql` |
| `analytics_summary` | `13_analytics_events.sql` |

## Architecture du rôle dédié

```bash
postgres (superuser)
├── anon (public access)
├── authenticated (logged-in users)
├── service_role (backend/admin)
└── admin_views_owner (NEW)
    └── Owns all *_admin views
    └── DEFAULT PRIVILEGES: no auto-grant to anon/authenticated
```

## Étapes

### 1. Créer migration consolidée idempotente

**Fichier** : `supabase/migrations/20260105120000_admin_views_security_hardening.sql` (~80 lignes)

**Contenu** :
- `DO $$ ... IF NOT EXISTS` pour création rôle `admin_views_owner`
- `REVOKE ALL` sur les 7 vues admin pour `anon`, `authenticated`
- `ALTER VIEW ... OWNER TO admin_views_owner` (7 vues)
- `ALTER DEFAULT PRIVILEGES FOR ROLE admin_views_owner IN SCHEMA public REVOKE ALL ON TABLES FROM anon, authenticated`
- `GRANT SELECT` uniquement à `service_role` sur les 7 vues

### 2. Appliquer au cloud via MCP

Exécuter le SQL sur le projet `yvtrlvmbofklefxcxrzv` via `mcp_supabase_execute_sql`.

### 3. Mettre à jour 5 schémas déclaratifs

Ajouter après chaque `CREATE VIEW *_admin` :
- `ALTER VIEW ... OWNER TO admin_views_owner;`
- `REVOKE ALL ON ... FROM anon, authenticated;`
- `GRANT SELECT ON ... TO service_role;`

**Fichiers concernés** :
- `supabase/schemas/41_views_communiques.sql` (1 vue)
- `supabase/schemas/41_views_admin_content_versions.sql` (4 vues)
- `supabase/schemas/10_tables_system.sql` (1 vue)
- `supabase/schemas/13_analytics_events.sql` (1 vue)

### 4. Étendre test sécurité authentifié

Modifier `scripts/test-views-security-authenticated.ts` pour vérifier les 7 vues admin avec assertion `permission denied` strict (pas tableau vide).

### 5. Créer script validation owner

### 6. Documenter dans migrations.md

Ajouter entrée dans `supabase/migrations/migrations.md` avec contexte sécurité et référence aux schémas mis à jour.

## Fichiers à créer/modifier

| Action | Fichier | Lignes estimées |
|--------|---------|-----------------|
| Créer | `supabase/migrations/20260105120000_admin_views_security_hardening.sql` | ~80 |
| Modifier | `supabase/schemas/41_views_communiques.sql` | +5 |
| Modifier | `supabase/schemas/41_views_admin_content_versions.sql` | +20 |
| Modifier | `supabase/schemas/10_tables_system.sql` | +5 |
| Modifier | `supabase/schemas/13_analytics_events.sql` | +5 |
| Modifier | `scripts/test-views-security-authenticated.ts` | +30 |
| Modifier | `supabase/migrations/migrations.md` | +20 |

## Tests de validation

```bash
# 1. Appliquer migration locale
pnpm dlx supabase db reset

# Appliquer migration cloud
# avec pnpm dlx (utilisé pour Rouge Cardinal Company):
pnpm dlx supabase db push --linked
# ou
pnpm dlx supabase db push --linked --dry-run

# 2. Vérifier propriétaire des vues

# 3. Test sécurité authenticated (7 vues bloquées)
pnpm exec tsx scripts/test-views-security-authenticated.ts

# 4. Test sécurité anon existant
pnpm exec tsx scripts/check-views-security.ts
```

## Décisions prises

1. **Rôle dédié `admin_views_owner`** — Isole les vues admin des DEFAULT PRIVILEGES du schéma public. Les futures vues admin créées par ce rôle n'auront pas de grants automatiques à `anon`/`authenticated`.

2. **Migration idempotente** — Avec `IF NOT EXISTS` / `DROP ROLE IF EXISTS` pour permettre ré-exécution sans erreur.

4. **Permissions `service_role`** — Le DAL admin utilise `createAdminClient()` qui passe par `service_role`. Les vues admin resteront accessibles via ce rôle uniquement.

5. **Test étendu** — Vérification des 7 vues admin (pas seulement `communiques_presse_dashboard`) avec assertion `permission denied` strict.
