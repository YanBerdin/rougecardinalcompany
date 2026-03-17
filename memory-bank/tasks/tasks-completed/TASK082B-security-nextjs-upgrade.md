# TASK082B — Sécurité : upgrade Next.js 16.1.5 → 16.1.7 (5 CVEs)

**Status:** Completed  
**Added:** 2026-03-17  
**Updated:** 2026-03-17

## Original Request

Récupérer les alertes Dependabot de GitHub pour `YanBerdin/rougecardinalcompany`, appliquer les correctifs de sécurité, et créer une PR.

## Thought Process

Le token GitHub dans `.env.local` étant expiré (401 Bad Credentials), l'accès à l'API Dependabot directe a échoué. Fallback via `pnpm audit` qui a révélé 5 vulnérabilités toutes localisées dans `next@16.1.5`, toutes corrigées par `next@16.1.7`.

Stratégie retenue :

1. Branche dédiée `fix/security-upgrade-nextjs-16.1.7` (non-breaking, impact limité)
2. Upgrade ciblé unique `pnpm update next@16.1.7`
3. Vérification post-fix `pnpm audit` → `No known vulnerabilities found`
4. Commit + push + PR sur `master`

## Implementation Plan

- [x] `pnpm audit` — identifier les vulnérabilités
- [x] `git checkout -b fix/security-upgrade-nextjs-16.1.7`
- [x] `pnpm update next@16.1.7`
- [x] `pnpm audit` — confirmer 0 vulnérabilité
- [x] `git commit -m "fix(security): upgrade next 16.1.5 → 16.1.7 (5 CVEs)"`
- [x] `git push -u origin fix/security-upgrade-nextjs-16.1.7`
- [x] PR #33 créée via MCP GitHub

## Progress Tracking

**Overall Status:** Completed — 100%

### Subtasks

| ID | Description | Status | Updated | Notes |
| --- | --- | --- | --- | --- |
| 82.1 | Audit vulnérabilités | Complete | 2026-03-17 | `pnpm audit` — 5 CVEs next@16.1.5 |
| 82.2 | Créer branche dédiée | Complete | 2026-03-17 | `fix/security-upgrade-nextjs-16.1.7` |
| 82.3 | Upgrade `next@16.1.7` | Complete | 2026-03-17 | `pnpm update next@16.1.7` |
| 82.4 | Vérification post-fix | Complete | 2026-03-17 | `No known vulnerabilities found` ✅ |
| 82.5 | Commit + push | Complete | 2026-03-17 | Commit `5abf71f` |
| 82.6 | PR GitHub | Complete | 2026-03-17 | PR #33 ouverte |

## CVEs Corrigées

| Advisory | Sévérité | Description |
| --- | --- | --- |
| GHSA-mq59-m269-xvcx | Moderate | CSRF bypass via null origin (Server Actions) |
| GHSA-ggv3-7p47-pfv8 | Moderate | HTTP request smuggling dans les rewrites |
| GHSA-3x4c-7xq6-9pq8 | Moderate | next/image unbounded disk cache growth (DoS) |
| GHSA-h27x-g6w4-24gq | Moderate | DoS via unbounded postponed resume buffering |
| GHSA-jcc7-9wpm-mj36 | Low | CSRF bypass null origin (HMR WebSocket dev only) |

## Fichiers Modifiés

```bash
package.json       # next: "16.1.5" → "16.1.7"
pnpm-lock.yaml     # lockfile mis à jour (92 insertions, 90 suppressions)
```

## Références

- PR : https://github.com/YanBerdin/rougecardinalcompany/pull/33
- Commit : `5abf71f`
- Branche : `fix/security-upgrade-nextjs-16.1.7`

## Note Technique

Le token GitHub dans `.env.local` (`ghp_B3Mh...`) est expiré — renouveler pour un accès futur à l'API Dependabot directe via MCP ou `curl`.

## Progress Log

### 2026-03-17

- `pnpm audit` révèle 5 CVEs dans `next@16.1.5` (4 moderate, 1 low)
- Branche `fix/security-upgrade-nextjs-16.1.7` créée depuis `master`
- `pnpm update next@16.1.7` — lockfile mis à jour
- `pnpm audit` post-fix : `No known vulnerabilities found` ✅
- Commit `5abf71f` : `fix(security): upgrade next 16.1.5 → 16.1.7 (5 CVEs: CSRF, smuggling, DoS)`
- Push vers origin + PR #33 créée
- Memory bank mise à jour (activeContext, progress, _index, TASK082)
