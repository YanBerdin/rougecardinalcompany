# Configuration du Linting

**Date**: 9 octobre 2025  
**Version**: 1.0.0

## 📋 Résumé

Configuration complète du linting pour le projet avec support TypeScript/JavaScript (ESLint) et Markdown (markdownlint-cli2).

---

## 🔧 Outils Installés

### ESLint (TypeScript/JavaScript/React)

**Package**: `eslint` v9  
**Plugins**:
- `eslint-config-next`: Configuration Next.js
- `@eslint/markdown`: Support des blocs de code dans Markdown
- `@eslint/eslintrc`: Compatibilité avec l'ancien format

**Configuration**: `eslint.config.mjs`

### Markdownlint (Markdown)

**Package**: `markdownlint-cli2` v0.18.1  
**Configuration**: `.markdownlint.jsonc`

---

## 📜 Scripts NPM Disponibles

```json
{
  "lint": "eslint .",                     // Lint TypeScript/JavaScript
  "lint:fix": "eslint . --fix",          // Auto-fix TypeScript/JavaScript
  "lint:md": "markdownlint-cli2 \"**/*.md\" \"#node_modules\"",  // Lint Markdown
  "lint:md:fix": "markdownlint-cli2 --fix \"**/*.md\" \"#node_modules\"",  // Auto-fix Markdown
  "lint:all": "pnpm lint && pnpm lint:md"  // Lint tout
}
```

### Usage

```bash
# Linter le code TypeScript/JavaScript
pnpm lint

# Auto-corriger le code TypeScript/JavaScript
pnpm lint:fix

# Linter les fichiers Markdown
pnpm lint:md

# Auto-corriger les fichiers Markdown
pnpm lint:md:fix

# Linter tout (code + Markdown)
pnpm lint:all
```

---

## 📊 État Actuel

### TypeScript/JavaScript
✅ **Configuration complète**
- ESLint configuré avec Next.js rules
- Support des blocs de code Markdown
- 0 erreur détectée dans le code

### Markdown
⚠️ **3442 erreurs détectées**

Principales catégories d'erreurs :
- `MD032` (blanks-around-lists): Listes non entourées de lignes vides
- `MD031` (blanks-around-fences): Blocs de code non entourés de lignes vides
- `MD022` (blanks-around-headings): Titres non entourés de lignes vides
- `MD049` (emphasis-style): Style d'emphase incohérent (asterisk vs underscore)
- `MD009` (no-trailing-spaces): Espaces en fin de ligne
- `MD040` (fenced-code-language): Blocs de code sans langage spécifié
- `MD007` (ul-indent): Indentation de liste incorrecte

---

## ⚙️ Configuration Markdownlint

Fichier: `.markdownlint.jsonc`

### Règles Désactivées

```json
{
  "MD013": false,  // Line length - Désactivé pour flexibilité
  "MD033": false,  // Inline HTML - Autorisé pour layouts complexes
  "MD034": false,  // Bare URL - Autorisé dans certains contextes
  "MD041": false   // First line heading - Pas obligatoire
}
```

### Règles Configurées

```json
{
  "MD024": { "siblings_only": true },     // Même titre OK dans sections différentes
  "MD046": { "style": "fenced" },         // Code blocks fencés obligatoires
  "MD049": { "style": "underscore" },     // Emphasis avec _underscore_
  "MD050": { "style": "asterisk" }        // Strong avec **asterisk**
}
```

---

## 🚀 Migration Next.js 15.5+

### Changements Appliqués

❌ **Déprécié** : `next lint`  
✅ **Nouveau** : `eslint .` (ESLint CLI direct)

**Raison** : Next.js 15.5 a déprécié `next lint` au profit d'ESLint ou Biome en direct.

**Documentation** : https://nextjs.org/blog/next-15-5#next-lint-deprecation

### Configuration ESLint

```javascript
// eslint.config.mjs
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
];

export default eslintConfig;
```

---

## 📝 Prochaines Étapes

### 1. Correction Progressive des Erreurs Markdown

**Priorité Haute** :
- [ ] Corriger `MD032` (blanks-around-lists) - Espaces autour des listes
- [ ] Corriger `MD031` (blanks-around-fences) - Espaces autour des blocs de code
- [ ] Corriger `MD022` (blanks-around-headings) - Espaces autour des titres

**Priorité Moyenne** :
- [ ] Corriger `MD049` (emphasis-style) - Uniformiser _underscore_ pour emphase
- [ ] Corriger `MD009` (no-trailing-spaces) - Supprimer espaces de fin de ligne
- [ ] Corriger `MD040` (fenced-code-language) - Ajouter langage aux blocs de code

**Priorité Basse** :
- [ ] Corriger `MD007` (ul-indent) - Indentation des listes
- [ ] Autres erreurs mineures

### 2. Intégration CI/CD

```yaml
# .github/workflows/lint.yml
name: Lint

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main, develop]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm lint:all
```

### 3. Pre-commit Hook (Optionnel)

Installer Husky pour linting automatique avant commit :

```bash
pnpm add -D husky lint-staged
pnpm exec husky init
```

```json
// package.json
{
  "lint-staged": {
    "*.{js,ts,tsx}": "eslint --fix",
    "*.md": "markdownlint-cli2 --fix"
  }
}
```

---

## 🔗 Ressources

- [ESLint Documentation](https://eslint.org/)
- [Markdownlint Rules](https://github.com/DavidAnson/markdownlint/blob/main/doc/Rules.md)
- [Next.js ESLint](https://nextjs.org/docs/app/building-your-application/configuring/eslint)
- [markdownlint-cli2](https://github.com/DavidAnson/markdownlint-cli2)

---

**Maintainers**: Development Team  
**Last Updated**: 9 octobre 2025
