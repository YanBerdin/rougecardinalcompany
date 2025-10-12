# Décision de Design : Gestion des Hotfix Migrations

**Date** : 7 octobre 2025  
**Contexte** : Migration Supabase Cloud - Synchronisation schéma déclaratif  
**Statut** : ✅ Décision adoptée et documentée

---

## 🎯 Question Initiale

> "Il faudra inclure par la suite, dans le schéma déclaratif, les correctifs appliqués via migration ?"

## ✅ Décision Retenue

**OUI**, les correctifs appliqués via migrations hotfix **DOIVENT** être intégrés au schéma déclaratif, MAIS les migrations sont **conservées** dans l'historique.

## 🧠 Raisonnement

### Principe Fondamental

Le **schéma déclaratif** (`supabase/schemas/`) doit **toujours** être la **source de vérité unique** pour l'état de la base de données.

### Rôle des Migrations Hotfix

Les migrations manuelles de correctifs sont des **instantanés temporels** pour :

- Déploiement rapide en production
- Traçabilité des bugs critiques
- Cohérence avec l'historique Supabase Cloud

### Architecture de la Solution

```bash
┌─────────────────────────────────────────────────────────────┐
│                    SCHÉMA DÉCLARATIF                        │
│                  supabase/schemas/*.sql                     │
│                                                             │
│              📋 Source de Vérité Unique                     │
│          État Cible de la Base de Données                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                           ▲
                           │
                     Synchronisation
                      (OBLIGATOIRE)
                           │
┌─────────────────────────┴───────────────────────────────────┐
│                  MIGRATIONS HOTFIX                           │
│             supabase/migrations/*.sql                        │
│                                                              │
│         📝 Historique Temporel des Correctifs               │
│      Conservation Permanente pour Traçabilité                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 📋 Workflow Établi

### Phase 1 : Déploiement Hotfix (Urgence)

```bash
# 1. Créer migration manuelle
touch supabase/migrations/$(date +%Y%m%d%H%M%S)_fix_critical_bug.sql

# 2. Appliquer sur production
pnpm dlx supabase db push
```

### Phase 2 : Synchronisation (OBLIGATOIRE)

```bash
# 3. Éditer le fichier correspondant dans supabase/schemas/
# Appliquer les MÊMES modifications que la migration

# 4. Documenter dans migrations.md
```

### Phase 3 : Conservation

```markdown
## Corrections et fixes critiques

- `YYYYMMDDHHMMSS_fix_critical_bug.sql` — Description
  - ✅ **Intégré au schéma déclaratif** : `supabase/schemas/XX_file.sql`
  - 📝 **Migration conservée** pour l'historique
```

## 🔍 Cas Réels du Projet

### Exemple 1 : Trigger Versioning

| Élément | Valeur |
|---------|--------|
| **Migration** | `20250918000000_fix_spectacles_versioning_trigger.sql` |
| **Schéma** | `supabase/schemas/15_content_versioning.sql` |
| **Bug** | Référence à `published_at` inexistant |
| **Fix** | Utilisation de `public` (boolean) |
| **Statut** | ✅ Synchronisé |

### Exemple 2 : Table Home About

| Élément | Valeur |
|---------|--------|
| **Migration** | `20250921112900_add_home_about_content.sql` |
| **Schéma** | `supabase/schemas/07e_table_home_about.sql` |
| **Problème** | Table absente sur Cloud |
| **Fix** | Création complète avec RLS |
| **Statut** | ✅ Synchronisé |

## ✅ Avantages de cette Approche

| Avantage | Explication |
|----------|-------------|
| 📚 **Historique Complet** | Toutes les corrections sont tracées |
| 🔄 **Cohérence Cloud** | Historique Supabase Cloud préservé |
| 🏗️ **Reconstruction** | DB reconstruisible depuis zéro |
| 📖 **Source Unique** | Schéma déclaratif reste la référence |
| 🔍 **Auditabilité** | Chaque correctif est documenté |

## ❌ Alternatives Rejetées

### Option A : Supprimer les Migrations Hotfix

**Raison du rejet** :

- ❌ Perte de l'historique temporel
- ❌ Incohérence avec Supabase Cloud
- ❌ Impossible de reconstruire DB historiquement

### Option B : Garder uniquement les Migrations

**Raison du rejet** :

- ❌ Pas de source de vérité claire
- ❌ Difficile de générer des diffs futurs
- ❌ Violations du principe déclaratif

## 📚 Documentation Créée

| Document | Objectif |
|----------|----------|
| [`declarative-schema-hotfix-workflow.md`](./declarative-schema-hotfix-workflow.md) | Workflow complet illustré |
| [`.github/instructions/Declarative_Database_Schema.Instructions.md`](../.github/instructions/Declarative_Database_Schema.Instructions.md) | Section 5.5 - Hotfix et synchronisation |
| [`supabase/migrations/migrations.md`](../supabase/migrations/migrations.md) | Notes de synchronisation par migration |
| [`20251007-migration-supabase-cloud-success.md`](./conversation%20Coplilot/20251007-migration-supabase-cloud-success.md) | Section décision de design |

## 🎓 Principes de Design Appliqués

1. **Single Source of Truth** : Schéma déclaratif = référence unique
2. **Immutable History** : Migrations = journal immuable
3. **Explicit Documentation** : Redondance clairement documentée
4. **Separation of Concerns** : Schéma (état) vs Migrations (transitions)

## 🔮 Impact Futur

### Sur les Futurs Correctifs

Tout futur hotfix devra suivre le workflow établi :

1. Migration temporaire
2. Synchronisation schéma
3. Documentation redondance
4. Conservation des deux

### Sur la Génération de Diffs

Les futurs `supabase db diff` seront générés depuis le **schéma déclaratif synchronisé**, garantissant que les correctifs ne seront pas régénérés.

### Sur les Nouveaux Développeurs

La documentation claire permet aux nouveaux contributeurs de :

- Comprendre l'historique
- Suivre le workflow établi
- Éviter les erreurs de synchronisation

## ✅ Checklist de Validation

Pour valider qu'un hotfix est correctement synchronisé :

- [ ] Migration créée et appliquée sur production
- [ ] Schéma déclaratif mis à jour avec les mêmes modifications
- [ ] `migrations.md` documenté avec notes de synchronisation
- [ ] Test local : `pnpm dlx supabase db reset` fonctionne
- [ ] Commit Git : migration + schéma + docs ensemble
- [ ] Documentation workflow référencée

## 🎯 Conclusion

Cette décision établit un **équilibre optimal** entre :

- ✅ Traçabilité historique (migrations conservées)
- ✅ Source de vérité claire (schéma déclaratif)
- ✅ Pragmatisme opérationnel (hotfix rapides possibles)
- ✅ Maintenance long terme (documentation explicite)

**Règle d'Or** :
> "Chaque modification de schéma existe **une fois** dans le schéma déclaratif, mais peut avoir **plusieurs traces** dans l'historique des migrations."

---

**Approuvé par** : Équipe développement  
**Date d'application** : 7 octobre 2025  
**Révision prévue** : Après 6 mois d'utilisation
