# TASK028B - Cleanup Obsolete Audit Scripts

**Status:** Pending  
**Added:** 2025-10-26  
**Updated:** 2025-11-15  
**GitHub Issue:** #28

## Original Request

Propose deletion of obsolescent audit scripts created during Round 7 security campaign.

## Context

**From Issue #28**:

> Pendant la campagne de sécurité, plusieurs scripts d'audit/diagnostic temporaires ont été créés. Après la finalisation (Round 17, CI passed), certains fichiers sont redondants et encombrent le dépôt.
>
> **Fichiers proposés pour suppression**:
>
> - `supabase/scripts/quick_audit_test.sql` (version simplifiée redondante)
> - `supabase/scripts/check_round7b_grants.sh` (script bash spécifique Round 7b, utilisait un flag non supporté)
> - `supabase/migrations/verify_round7_grants.sql` (vérification Round 7 spécifique)

## Thought Process

Après une campagne d'audit sécurité intense (17 rounds), plusieurs scripts temporaires/spécifiques ont été créés pour le diagnostic. Maintenant que :

1. **CI est stable**: Round 17 passed, aucune régression
2. **Documentation exhaustive**: `SECURITY_AUDIT_SUMMARY.md` trace tout
3. **Scripts permanents créés**: `audit_grants.sql`, `quick_check_all_grants.sql`

Les scripts temporaires Round 7 peuvent être supprimés en toute sécurité, car :

- Leur rôle est terminé (diagnostic Round 7 spécifique)
- Information préservée dans documentation
- Encombrent le dépôt sans valeur future

## Implementation Plan

### Phase 1: Validation (30min)

- Confirmer aucune référence aux scripts à supprimer dans code/CI
- Vérifier documentation adequte dans `migrations.md` et `SECURITY_AUDIT_SUMMARY.md`
- Obtenir approbation équipe (issue discussion)

### Phase 2: Archivage Optionnel (15min)

Si demandé, créer archive historique :

```bash
mkdir -p archive/round7-scripts/
mv supabase/scripts/quick_audit_test.sql archive/round7-scripts/
mv supabase/scripts/check_round7b_grants.sh archive/round7-scripts/
mv supabase/migrations/verify_round7_grants.sql archive/round7-scripts/
```

### Phase 3: Suppression (15min)

Si pas d'archivage requis :

```bash
git rm supabase/scripts/quick_audit_test.sql
git rm supabase/scripts/check_round7b_grants.sh
git rm supabase/migrations/verify_round7_grants.sql
```

### Phase 4: Documentation & PR (30min)

- Mettre à jour `supabase/migrations/migrations.md` (noter suppression)
- Créer PR avec justification détaillée
- CI vérifie aucune référence cassée
- Fermer issue #28

## Progress Tracking

**Overall Status:** Not Started - 0%

### Subtasks

| ID | Description | Status | Updated | Notes |
|----|-------------|--------|---------|-------|
| 1.1 | Vérifier aucune référence code/CI | Not Started | - | grep/search |
| 1.2 | Confirmer documentation adéquate | Not Started | - | migrations.md OK? |
| 1.3 | Discussion équipe & approbation | Not Started | - | Issue #28 comments |
| 2.1 | Archivage optionnel (si demandé) | Not Started | - | archive/ folder |
| 3.1 | Suppression fichiers (git rm) | Not Started | - | 3 fichiers |
| 4.1 | Mise à jour migrations.md | Not Started | - | Note suppression |
| 4.2 | PR & CI validation | Not Started | - | Green CI requis |
| 4.3 | Fermeture issue #28 | Not Started | - | ⏳ |

## Progress Log

### 2025-10-26

- Issue #28 créée suite à TASK025B audit
- Proposition deletion après nettoyage Round 17
- En attente approbation équipe

### 2025-11-15

- Tâche ajoutée au memory-bank tasks index
- Discussion issue en attente

## Technical Details

### Files Proposed for Deletion

#### 1. `supabase/scripts/quick_audit_test.sql`

**Raison**: Version simplifiée de `audit_grants.sql`, redondante

```sql
-- Version simplifiée pour Round 7 diagnostics
-- Maintenant remplacée par:
-- - supabase/scripts/audit_grants.sql (version complète)
-- - supabase/scripts/quick_check_all_grants.sql (diagnostic rapide)
```

**Impact suppression**: Aucun (remplacé par scripts permanents)

#### 2. `supabase/scripts/check_round7b_grants.sh`

**Raison**: Script bash spécifique Round 7b avec flag PostgreSQL non supporté

```bash
#!/bin/bash
# Script diagnostic Round 7b
# Utilisait un flag deprecated/non supporté
# Maintenant remplacé par test-views-security-invoker.ts
```

**Impact suppression**: Aucun (workflow remplacé par CI script TypeScript)

#### 3. `supabase/migrations/verify_round7_grants.sql`

**Raison**: Migration vérification Round 7 spécifique, plus pertinente

```sql
-- Vérification permissions Round 7
-- Documenté dans SECURITY_AUDIT_SUMMARY.md
-- CI gate détecte futures régressions
```

**Impact suppression**: Aucun (documentation exhaustive + CI gate)

### Scripts Permanents à Conserver

**Confirmer présence** (ne PAS supprimer) :

- ✅ `supabase/scripts/audit_grants.sql` - Audit complet permissions (référence non filtrée)
- ✅ `supabase/scripts/quick_check_all_grants.sql` - Diagnostic rapide complet
- ✅ `scripts/test-views-security-invoker.ts` - CI validation vues INVOKER
- ✅ `.ci/check_revoke_in_schemas.sh` - CI gate REVOKE detection

### Validation Checklist

Avant suppression, confirmer :

- [ ] Aucune référence dans code source (`grep -r "quick_audit_test"`)
- [ ] Aucune référence dans CI config (`.github/workflows/`)
- [ ] Aucune référence dans documentation (`doc/`, `memory-bank/`)
- [ ] Information préservée dans `SECURITY_AUDIT_SUMMARY.md`
- [ ] Scripts permanents couvrent même fonctionnalité

## Alternative: Archivage

Si équipe souhaite conserver historique :

```
archive/
  round7-audit-scripts/
    README.md                      # Pourquoi archivé
    quick_audit_test.sql           # Script simplifié
    check_round7b_grants.sh        # Script bash Round 7b
    verify_round7_grants.sql       # Migration vérification
```

**Avantage archivage**:

- Historique préservé pour référence future
- Pas de pollution dépôt principal
- Facilite audit forensique si nécessaire

## Workflow Recommandé

**From Issue #28**:

> **Proposition de workflow**:
>
> 1. Ouvrir cette issue pour discussion & approbation
> 2. Après approbation : PR unique supprimant les 3 fichiers + mise à jour `migrations.md` indiquant leur suppression
> 3. CI vérifie que rien ne référence ces fichiers (search) et merge

## Checklist (Pre-Completion)

- [ ] Discussion issue #28 : Approbation équipe obtenue
- [ ] Validation: Aucune référence cassée
- [ ] Décision: Suppression directe OU archivage
- [ ] PR créée avec justification complète
- [ ] CI green (aucune référence cassée)
- [ ] `migrations.md` mis à jour
- [ ] PR mergée
- [ ] Issue #28 fermée

## Dependencies

- **Bloqué par**: Approbation équipe (discussion issue #28)
- **Coordonné avec**: TASK026B, TASK027B (même contexte audit)

## Estimated Effort

- **Dev Time**: 1-2 heures (validation + PR)
- **Discussion Time**: Variable (dépend feedback équipe)
- **Risk Level**: Très faible (suppression documentée)

## Impact

**Bénéfices**:

- ✅ Dépôt plus propre et maintenable
- ✅ Réduit bruit pour futurs audits
- ✅ Simplifie navigation scripts

**Risques**:

- ❌ Aucun si validation correcte (information préservée)

## Notes

- Suppression peut être faite n'importe quand après approbation
- Pas urgent, mais bonne pratique housekeeping
- Template pour futurs nettoyages post-audit

## References

- Issue GitHub: https://github.com/YanBerdin/rougecardinalcompany/issues/28
- Documentation: `supabase/migrations/SECURITY_AUDIT_SUMMARY.md`
- Scripts permanents: `supabase/scripts/README.md`
