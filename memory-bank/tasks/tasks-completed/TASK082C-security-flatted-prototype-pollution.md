# \[TASK082C] — Sécurité : flatted Prototype Pollution (Dependabot #38)

**Status:** Completed
**Added:** 2026-03-19
**Updated:** 2026-03-19

## Original Request

Corriger l'alerte Dependabot #38 : "Prototype Pollution via parse() in NodeJS flatted".  
`flatted < 3.4.2` permet de polluer la chaîne prototype de `Array.prototype` via un JSON forgé.

## Thought Process

Un override `pnpm.overrides` existait déjà dans `package.json` :

```json
"flatted": ">=3.4.0"
```

Cette plage était trop permissive — pnpm résolvait `flatted@3.4.1` (encore vulnérable).  
La correction consiste simplement à resserrer la contrainte à `>=3.4.2`.

Aucune modification de code applicatif n'est nécessaire : `flatted` est une dépendance
transitive utilisée uniquement par ESLint, pas par le runtime de production.

## Vulnérabilité détaillée

- **Package** : `flatted`
- **Versions affectées** : `< 3.4.2`
- **Fonction vulnérable** : `parse()` dans `esm/index.js`
- **Mécanisme** : `const tmp = input[value]` où `value` est une chaîne contrôlée par
  l'attaquant. La valeur `"__proto__"` résout via la chaîne prototype vers `Array.prototype`,
  passe les gardes `typeof tmp === 'object'` et `!parsed.has(tmp)`, et permet d'écrire
  sur le prototype global.
- **Preuve de concept** :

  ```js
  Flatted.parse('[{"x":"__proto__"}]')
  // Écrire sur l'objet retourné → pollue [].polluted
  ```

- **Chaînes transitives affectées** :
  - `eslint 9.39.3 → file-entry-cache → flat-cache → flatted 3.4.1`
  - `eslint-config-next 16.1.6 → flatted 3.4.1`

## Implementation Plan

- [x] Identifier le `pnpm.overrides` existant dans `package.json`
- [x] Resserrer la contrainte : `">=3.4.0"` → `">=3.4.2"`
- [x] Exécuter `pnpm install --frozen-lockfile=false`
- [x] Vérifier `pnpm-lock.yaml` (`flatted@3.4.2` résolu)
- [x] Commit + push
- [x] Mettre à jour le memory bank

## Progress Tracking

**Overall Status:** Completed — 100%

### Subtasks

| ID  | Description                                   | Status   | Updated    | Notes                        |
| --- | --------------------------------------------- | -------- | ---------- | ---------------------------- |
| 1.1 | Audit `pnpm-lock.yaml` version installée      | Complete | 2026-03-19 | `flatted@3.4.1` confirmé     |
| 1.2 | Override `package.json` : `>=3.4.0` → `>=3.4.2` | Complete | 2026-03-19 | Ligne ~177, bloc `pnpm.overrides` |
| 1.3 | `pnpm install --frozen-lockfile=false`        | Complete | 2026-03-19 | `Packages: +1 -1` en 45 s   |
| 1.4 | Vérification lockfile                         | Complete | 2026-03-19 | `flatted@3.4.2` ✅           |
| 1.5 | Commit + push master                          | Complete | 2026-03-19 | Commit `ce7ec9b`             |

## Progress Log

### 2026-03-19

- Alerte Dependabot #38 reçue : `flatted < 3.4.2` — Prototype Pollution via `parse()`
- Diagnostic : override existant `">=3.4.0"` permettait `3.4.1` (vulnérable)
- Correction : resserrement à `">=3.4.2"` dans `package.json` → bloc `pnpm.overrides`
- `pnpm install --frozen-lockfile=false` → `Packages: +1 -1`, total 45.3 s
- Vérification : `grep "flatted" pnpm-lock.yaml` → `flatted@3.4.2` ✅
- Commit `ce7ec9b` : `fix(deps): upgrade flatted to >=3.4.2 to fix prototype pollution (CVE)`
- Push → `master` (32c8ab9..ce7ec9b)
- Note : GitHub affiche encore "1 vulnerability found" — rescan Dependabot asynchrone, attendu

## Fichiers modifiés

| Fichier           | Changement                                          |
| ----------------- | --------------------------------------------------- |
| `package.json`    | `pnpm.overrides["flatted"]` : `>=3.4.0` → `>=3.4.2` |
| `pnpm-lock.yaml`  | `flatted@3.4.1` → `flatted@3.4.2`                  |

## Références

- Dependabot alert #38 : Prototype Pollution in flatted
- Contexte antérieur : TASK082B (Fix DoS flatted 3.4.1, commit `fix(security): force flatted >=3.4.0`) → override insuffisant
- Commit de correction : `ce7ec9b`
