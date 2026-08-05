# TASK104 - Remédiation des alertes Dependabot

**Statut:** Complétée  
**Ajoutée:** 2026-08-01  
**Mise à jour:** 2026-08-05

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

## Incident de production `/admin/media/library`

La mise à jour de Sharp a exposé un problème de runtime et de packaging sur Vercel après le passage à Sharp `0.35.3`.

### Symptômes et cause

- Le build Next.js réussissait, mais `/admin/media/library` retournait `500` lorsque le chemin de génération des miniatures touchait Sharp.
- Sentry signalait `Failed to load external module sharp-<hash>: Could not load the "sharp" module using the linux-x64 runtime`, puis une variante `Cannot find module 'sharp-<hash>'`.
- Sharp `0.35.x` a déplacé son point d'entrée de `lib/index.js` vers `dist/index.cjs`. Le cas spécial du traceur `@vercel/nft`, vendorisé par Next.js `16.2.x`, ciblait encore l'ancien chemin.
- Le module natif `.node` était tracé, mais la bibliothèque partagée `libvips-cpp.so` ne l'était pas toujours. Le build/local pouvait donc réussir alors que la fonction serverless Linux échouait au runtime.
- Le message npm `Error: canceled` était secondaire : il provenait de l'annulation d'une commande d'inspection, pas de la cause racine.

### Deux phases de correction

Le premier correctif (`6576f6d`) a externalisé Sharp et ajouté un traçage explicite. Une tentative intermédiaire de hoisting `@img/sharp-*` via `public-hoist-pattern[]=@img/sharp*` a fourni un chemin local stable, mais pnpm a créé des symlinks dans `node_modules/@img`. Vercel a ensuite rejeté le package final avec `invalid deployment package ... files in symlinked directories`.

Le correctif final (`81d538f`) conserve le layout pnpm isolé :

1. `serverExternalPackages: ["sharp"]` laisse Node charger Sharp nativement dans la fonction serverless.
2. `outputFileTracingIncludes` cible directement les fichiers physiques de `node_modules/.pnpm/` pour `@img/sharp-libvips-linux-x64` et `@img/sharp-linux-x64`.
3. `.npmrc` ne hoiste plus `@img/sharp-*`, car le packager Vercel refuse les répertoires symlinkés.
4. Le glob `@*` suit la version pnpm résolue sans réintroduire de chemin racine symlinké.

### Validation finale et leçons

- Build, type-check et 11/11 tests `image-compress` réussis.
- Inspection du `.nft.json` : `libvips-cpp.so.8.18.3` présent dans la trace.
- Déploiement Vercel réussi après `81d538f`.
- Accès production à `/admin/media/library` confirmé sans erreur 500.

Pour un incident similaire, distinguer le build de l'étape `Deploying outputs...`, inspecter le `.nft.json` généré et vérifier les chemins physiques sous `node_modules/.pnpm/`. Une dépendance native de sécurité doit être validée jusqu'au package serverless et au runtime de production, pas seulement par un build local.

## Fichiers concernés

- `package.json`
- `pnpm-lock.yaml`
- `lib/utils/image-compress.ts`
- Documentation du memory-bank : `activeContext.md`, `progress.md`, `techContext.md`, `tasks/_index.md`

## Clôture

La remédiation et le correctif de runtime sont complets pour la baseline Next.js `16.2.11`. Le commit associé est `81d538f`, le déploiement Vercel est réussi et `/admin/media/library` fonctionne en production. TASK200 migre séparément vers Next.js `16.3.0` et ne retire pas encore ce workaround : la configuration de TASK104 reste le rollback de référence jusqu'à la validation Vercel et cold start de TASK200.
