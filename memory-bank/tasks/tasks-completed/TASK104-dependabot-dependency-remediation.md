# TASK104 - Remédiation des alertes Dependabot

**Statut:** Complétée  
**Ajoutée:** 2026-08-01  
**Mise à jour:** 2026-08-01

## Demande originale

Résoudre les alertes de sécurité Dependabot restantes, documenter les corrections dans le memory-bank et créer le commit associé.

## Diagnostic

L'audit initial signalait 14 vulnérabilités, dont 9 HIGH et 5 MODERATE. Après les premières mises à jour, une alerte Sharp persistait via le chemin transitif `next > sharp`; une alerte `js-yaml` restait également dans les dépendances de développement.

## Corrections

- Next.js : `16.2.6` → `16.2.11`.
- Sharp : `^0.34.5` → `^0.35.0`, avec l'override PNPM global `sharp >=0.35.0`.
- PostCSS : `^8.5.10` → `^8.5.18`, avec l'override `postcss >=8.5.18`.
- Dépendances transitives : `brace-expansion >=5.0.8`, `fast-uri >=3.1.4` et `js-yaml >=5.2.2`.
- Lockfile régénéré avec des résolutions vérifiées : Next `16.2.11`, Sharp `0.35.3`, PostCSS `8.5.25`.
- Adaptation de `lib/utils/image-compress.ts` à Sharp 0.35 : `applyFormat()` utilise `ReturnType<typeof sharp>` au lieu du type supprimé ou incompatible `sharp.Sharp`.

## Validation

- ✅ `pnpm audit --prod` : aucune vulnérabilité connue.
- ✅ `pnpm audit` : aucune vulnérabilité connue.
- ✅ `pnpm install --frozen-lockfile` : installation reproductible.
- ✅ `pnpm type-check`.
- ✅ `pnpm vitest run __tests__/utils/image-compress.test.ts` : 11/11 tests.
- ✅ `git diff --check`.
- ⚠️ `pnpm lint` reste bloqué par une fixture E2E indépendante : `e2e/tests/auth/invite-setup/invite-setup.fixtures.ts`, appel de `use` dans `setupAccountPage` contraire à `react-hooks/rules-of-hooks`. Ce problème est hors périmètre et n'est pas inclus dans ce commit.

## Fichiers concernés

- `package.json`
- `pnpm-lock.yaml`
- `lib/utils/image-compress.ts`
- Documentation du memory-bank : `activeContext.md`, `progress.md`, `techContext.md`, `tasks/_index.md`

## Clôture

La remédiation est complète et prête à être livrée. Le commit associé est créé après vérification finale du diff.