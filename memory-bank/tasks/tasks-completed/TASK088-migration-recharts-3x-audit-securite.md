# TASK088 — Migration recharts 3.x, audit sécurité dépendances, documentation, memory-bank

## Statut

✅ **Clôturée le 2026-04-07**

## Résumé

- Migration de recharts 2.x → 3.8.1 pour supprimer la dépendance lodash (faille critique)
- Mise à jour Vite (8.0.8), Next.js (dernier patch sécurisé)
- Audit complet des usages recharts : seuls `PageviewsChart.tsx` et `ui/chart.tsx` utilisent recharts, wrappers compatibles 3.x
- `pnpm audit` : 0 vulnérabilité
- Documentation migration : `/memories/repo/dependency-migrations.md` créée
- Commit migration + documentation
- Synchronisation memory-bank : tous les fichiers relus, synchronisés, aucune tâche en attente

## Détail des actions

1. **Mise à jour des dépendances**
   - `pnpm update vite next recharts`
   - Vite 8.0.8, Next.js sécurisé, recharts 3.8.1
2. **Vérification code**
   - Audit usages recharts : wrappers centralisés, aucune modification requise
3. **Audit sécurité**
   - `pnpm audit` → 0 vulnérabilité
4. **Documentation**
   - `/memories/repo/dependency-migrations.md` : résumé migration, audit, vérification code
5. **Commit**
   - Commit détaillé migration + documentation
6. **Synchronisation memory-bank**
   - `progress.md`, `activeContext.md`, `tasks/_index.md` mis à jour

## Clôture

- Toutes les dépendances sont à jour, aucune vulnérabilité connue
- Documentation migration et audit centralisée
- Memory-bank synchronisé, aucune tâche en cours
- Tâche clôturée le 2026-04-07

---

## Suites post-clôture

### 2026-04-12 — Erreurs TypeScript build (recharts 3.x breaking change)

Recharts 3 déplace `payload`, `active`, `label`, etc. dans `PropertiesReadFromContext`, les excluant des props publiques de `<Tooltip>` et `<Legend>`. `React.ComponentProps<typeof Tooltip/Legend>` ne les expose plus.

**Fixes dans `components/ui/chart.tsx` :**

- `ChartTooltipContent` : ajout type explicite `ChartTooltipPayloadItem`, suppression du spread `React.ComponentProps<typeof Tooltip>`, optional chaining `item.payload?.fill` — commit `fb919b2`
- `ChartLegendContent` : remplacement de `Pick<LegendProps, "payload" | "verticalAlign">` par type explicite `ChartLegendPayloadItem` — commit `376025b`

### 2026-04-13 — Nouveaux CVE + fix CI `--frozen-lockfile`

- **Next.js CVE** (>= 16.0.0-beta.0 < 16.2.3) : `pnpm add next@16.2.3` — commit `0ccafad`
- **vite CVE path traversal** (<= 8.0.4, transitif via vitest) : `vite@^8.0.8` ajouté en devDependency — commit `0ccafad`
- **CI `--frozen-lockfile`** : `pnpm.overrides.vite: ">=8.0.5"` conflictait avec la devDependency `"^8.0.8"` → `ERR_PNPM_OUTDATED_LOCKFILE`; override supprimé, lockfile régénéré — commit `f07b33b`
- `pnpm audit` : 0 vulnérabilité ✅
- Merge develop → master ✅
