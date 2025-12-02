# TASK027B - Security Definer Rationale Requirement

**Status:** Pending  
**Added:** 2025-10-26  
**Updated:** 2025-11-15  
**GitHub Issue:** #27

## Original Request

Require explicit SECURITY DEFINER rationale in function headers for all functions using privileged execution mode.

## Context

**From Issue #27**:

> Les conventions demandent de privilégier `security invoker` pour les fonctions. `security definer` ne doit être utilisé que lorsqu'une justification claire est fournie dans l'en-tête de la migration/fonction.
>
> **Problème**: Plusieurs fonctions utilisent `security definer` sans justification explicite dans l'en-tête (ex. `public.reorder_team_members`). Cela rend les revues plus difficiles et augmente le risque d'usage impropre des privilèges.

## Thought Process

SECURITY DEFINER est une fonctionnalité puissante mais dangereuse :

- **Avantage**: Permet d'exécuter des opérations nécessitant des privilèges élevés de manière contrôlée
- **Risque**: Élévation de privilèges si mal utilisée (injection SQL, bypass RLS)

Pour maintenir la sécurité, chaque SECURITY DEFINER doit :

1. **Être justifié**: Pourquoi INVOKER ne suffit pas?
2. **Documenter les risques**: Quels contrôles sont en place?
3. **Tracer la validation**: Tests de sécurité effectués

## Implementation Plan

### Phase 1: Template & Guidelines (1h)

Créer template d'en-tête obligatoire :

```sql
/*
 * Function: public.reorder_team_members
 * Purpose: Atomically reorder team members with concurrent access protection
 * 
 * Security Model: SECURITY DEFINER
 * 
 * Rationale:
 *   - Requires DEFINER to call is_admin() function (RLS helper)
 *   - Advisory lock requires elevated privileges for pg_advisory_xact_lock()
 *   - INVOKER would fail for authenticated users due to function ownership
 * 
 * Risks Assessed:
 *   - SQL Injection: Mitigated via jsonb parameter validation
 *   - Privilege Escalation: Explicit is_admin() check in function body
 *   - RLS Bypass: Intentional, required for admin operations
 * 
 * Validation:
 *   - Manual tests: scripts/test-admin-access.ts
 *   - CI tests: Verified anon users blocked, admins succeed
 *   - Code review: Approved by @YanBerdin on 2025-10-24
 */

CREATE OR REPLACE FUNCTION public.reorder_team_members(items jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Explicit authorization check
  IF NOT (SELECT public.is_admin()) THEN
    RAISE EXCEPTION 'Unauthorized: admin required';
  END IF;
  
  -- ... function body ...
END;
$$;
```

### Phase 2: Audit Existing Functions (2h)

- Lister toutes les fonctions SECURITY DEFINER dans projet
- Pour chaque fonction, documenter:
  - Pourquoi DEFINER nécessaire?
  - Quels risques atténués?
  - Tests de validation effectués?

### Phase 3: Add Headers (2-3h)

Créer PRs pour chaque fonction (ou groupées par module) :

- **Lot 1**: Fonctions critiques (admin, auth)
- **Lot 2**: Fonctions RPC publiques
- **Lot 3**: Fonctions utility/helper

### Phase 4: Update Documentation (1h)

- Mettre à jour `.github/instructions/Database_Create_functions.Instructions.md`
- Ajouter section "SECURITY DEFINER Checklist"
- Créer exemples annotés

## Progress Tracking

**Overall Status:** Not Started - 0%

### Subtasks

| ID | Description | Status | Updated | Notes |
|----|-------------|--------|---------|-------|
| 1.1 | Créer template en-tête SECURITY DEFINER | Not Started | - | Markdown + SQL |
| 1.2 | Mettre à jour instructions.md | Not Started | - | Section checklist |
| 2.1 | Audit: Lister fonctions SECURITY DEFINER | Not Started | - | Script SQL requis |
| 2.2 | Documenter rationale pour chaque fonction | Not Started | - | Template rempli |
| 3.1 | Lot 1: Fonctions critiques (headers) | Not Started | - | Admin, auth |
| 3.2 | Lot 2: Fonctions RPC publiques | Not Started | - | Impact utilisateurs |
| 3.3 | Lot 3: Fonctions helper | Not Started | - | Moindre priorité |
| 4.1 | Créer exemples annotés | Not Started | - | Documentation |
| 4.2 | PR et fermeture issue | Not Started | - | ⏳ |

## Progress Log

### 2025-10-26

- Issue #27 créée suite à TASK025B audit
- Identifiée comme amélioration non-blocking

### 2025-11-15

- Tâche ajoutée au memory-bank tasks index
- En attente de priorisation

## Technical Details

### Template Header (Proposed)

```sql
/*
 * Function: [schema.function_name]
 * Purpose: [Brief description]
 * 
 * Security Model: SECURITY DEFINER
 * 
 * Rationale:
 *   - [Reason 1: Why INVOKER insufficient]
 *   - [Reason 2: What elevated privileges needed]
 *   - [Reason 3: Business requirement justification]
 * 
 * Risks Assessed:
 *   - [Risk 1]: [Mitigation strategy]
 *   - [Risk 2]: [Mitigation strategy]
 * 
 * Validation:
 *   - [Test 1: Script/method]
 *   - [Test 2: CI check]
 *   - [Review: Approver + date]
 */
```

### Functions Requiring Headers (Examples)

**From Issue #27**:

- `public.reorder_team_members(jsonb)` - Atomic reordering with advisory lock
- `public.is_admin()` - RLS helper function (?)
- Autres à identifier via audit

### Security Review Checklist (Draft)

Pour chaque SECURITY DEFINER :

- [ ] **Nécessité**: Impossible avec SECURITY INVOKER?
- [ ] **Authorization**: Vérification explicite dans fonction (ex: is_admin())?
- [ ] **Input Validation**: Paramètres validés (SQL injection prevention)?
- [ ] **Search Path**: `SET search_path = ''` présent?
- [ ] **Minimal Privileges**: Seulement les privilèges nécessaires?
- [ ] **Testing**: Tests avec rôles anon/authenticated/admin?
- [ ] **Documentation**: Rationale dans header?
- [ ] **Review**: Code review par pair?

## Example: Before/After

### Before (Non-Compliant)

```sql
CREATE OR REPLACE FUNCTION public.reorder_team_members(items jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER  -- ⚠️ Pas de justification
AS $$
BEGIN
  -- ... code ...
END;
$$;
```

### After (Compliant)

```sql
/*
 * Function: public.reorder_team_members
 * Purpose: Atomically reorder team members with concurrent protection
 * 
 * Security Model: SECURITY DEFINER
 * 
 * Rationale:
 *   - Requires DEFINER to call is_admin() RLS helper function
 *   - Advisory lock (pg_advisory_xact_lock) requires elevated privileges
 *   - Authenticated users would get permission denied with INVOKER
 * 
 * Risks Assessed:
 *   - SQL Injection: Mitigated via jsonb parameter (type-safe)
 *   - Privilege Escalation: Explicit is_admin() check blocks non-admins
 *   - RLS Bypass: Intentional for admin bulk operations
 * 
 * Validation:
 *   - Manual: scripts/test-admin-access.ts (anon blocked, admin succeeds)
 *   - CI: Round 17 security audit passed
 *   - Review: @YanBerdin approved 2025-10-24
 */

CREATE OR REPLACE FUNCTION public.reorder_team_members(items jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Explicit authorization
  IF NOT (SELECT public.is_admin()) THEN
    RAISE EXCEPTION 'Unauthorized: admin required';
  END IF;
  
  -- Advisory lock for concurrency
  PERFORM pg_advisory_xact_lock(hashtext('reorder_team_members'));
  
  -- ... rest of function ...
END;
$$;
```

## Checklist (Pre-Completion)

- [ ] Template header créé et validé
- [ ] Instructions.md mis à jour (section SECURITY DEFINER)
- [ ] Audit complet fonctions SECURITY DEFINER effectué
- [ ] Headers ajoutés à toutes les fonctions identifiées
- [ ] Exemples annotés créés (before/after)
- [ ] Tests CI verts (pas de régression)
- [ ] PR créée avec rationale complète
- [ ] Issue #27 fermée

## Dependencies

- **Coordonné avec**: TASK026B (même ensemble de fonctions à auditer)
- **Bloqué par**: Aucune (peut démarrer immédiatement)

## Estimated Effort

- **Dev Time**: 5-6 heures (audit + documentation + PRs)
- **Review Time**: 1-2 heures
- **Risk Level**: Très faible (documentation pure, pas de code change)

## Notes

- Travail principalement documentaire, impact code minimal
- Bénéfice majeur pour revues de sécurité futures
- Template réutilisable pour nouvelles fonctions
- Peut être combiné avec TASK026B pour efficacité

## References

- Issue GitHub: https://github.com/YanBerdin/rougecardinalcompany/issues/27
- Instructions: `.github/instructions/Database_Create_functions.Instructions.md`
- PostgreSQL Docs: https://www.postgresql.org/docs/current/sql-createfunction.html
- OWASP: https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html
