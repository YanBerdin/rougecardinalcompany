# TASK200 - Migrer vers le correctif officiel Sharp / nft de Next.js

**Statut:** Planifiée  
**Ajoutée:** 2026-08-02  
**Mise à jour:** 2026-08-02  
**Priorité:** Moyenne  
**Dépend de:** TASK104

## Demande originale

Préparer la migration du workaround local de tracing Sharp vers le correctif officiel upstream lorsqu'une version stable de Next.js ou de `@vercel/nft` corrigera la prise en charge de Sharp `0.35.x`.

## Contexte

TASK104 a résolu le 500 de `/admin/media/library` après la mise à jour de Sharp vers `0.35.3`. Le problème provenait de la combinaison suivante :

- Next.js `16.2.x` vendorise une copie de `@vercel/nft` ;
- le cas spécial nft cherchait encore `sharp/lib/index.js` ;
- Sharp `0.35.x` utilise désormais `dist/index.cjs` ;
- `libvips-cpp.so.8.18.3` n'était pas toujours inclus dans le bundle serverless ;
- le module `.node` était présent, mais son chargement échouait avec `ERR_DLOPEN_FAILED`.

Le workaround actuellement en production est :

- `serverExternalPackages: ["sharp"]` dans `next.config.ts` ;
- `outputFileTracingIncludes` vers les chemins physiques `node_modules/.pnpm/@img+sharp-libvips-linux-x64@*/...` et `node_modules/.pnpm/@img+sharp-linux-x64@*/...` ;
- absence de `public-hoist-pattern[]=@img/sharp*` dans `.npmrc`, car le hoisting créait des symlinks refusés par le packager Vercel.

Références upstream :

- Next.js : [vercel/next.js#96064](https://github.com/vercel/next.js/issues/96064)
- Correctif nft : [vercel/nft#595](https://github.com/vercel/nft/pull/595)
- Problème Sharp/Turbopack associé : [lovell/sharp#4567](https://github.com/lovell/sharp/issues/4567)

## Objectif

Remplacer progressivement le workaround spécifique au dépôt par une version stable de Next.js qui embarque le correctif de tracing Sharp `0.35.x`, tout en conservant la compatibilité de production et la protection contre le retour du 500.

Le retrait de la configuration manuelle ne doit être fait qu'après validation du package serverless produit par Vercel. Une version canary ou une mise à jour de `@vercel/nft` non utilisée par la copie vendorisée de Next.js ne suffit pas à clôturer cette tâche.

## Déclencheur de la tâche

Démarrer uniquement lorsqu'une release stable remplit au moins l'un des critères suivants :

- Next.js annonce explicitement le correctif de tracing Sharp `0.35.x` dans ses notes de version ;
- la version stable de Next.js embarque une copie de `@vercel/nft` contenant le correctif équivalent à nft PR #595 ;
- un test reproductible confirme que le fichier `libvips-cpp.so` est automatiquement inclus avec Sharp `0.35.3` sur Next.js stable, pnpm isolé et Vercel.

Ne pas considérer comme preuve suffisante : un build local réussi, une installation de Sharp `0.35.x` seule, ou un test qui ne passe pas par le packaging et le runtime serverless Vercel.

## Plan d'implémentation

### 1. Identifier la release candidate stable

- Relever la version stable de Next.js contenant le correctif et le lien vers la release, le commit ou la PR upstream.
- Vérifier que le correctif est dans la copie vendorisée de `@vercel/nft` utilisée par Next.js, et non seulement dans une dépendance directe du projet.
- Lire les notes de migration et les changements de compatibilité Next.js/Turbopack.
- Vérifier si la version modifie le comportement de `serverExternalPackages` ou de `outputFileTracingIncludes`.

### 2. Préparer une branche et un état de référence

- Créer une branche dédiée à TASK200.
- Conserver le workaround actuel dans le premier commit de test.
- Capturer l'état de référence : `next --version`, Sharp résolu, `pnpm-lock.yaml`, résultat de `pnpm type-check`, tests image-compress et contenu pertinent des fichiers `.nft.json`.
- Ne pas supprimer le workaround avant d'avoir un commit de migration facilement réversible.

### 3. Mettre à jour Next.js de façon contrôlée

- Mettre à jour Next.js vers la première version stable corrigée, avec les paquets Next associés requis par le dépôt.
- Régénérer le lockfile avec `pnpm install --lockfile-only` ou la procédure projet appropriée.
- Conserver Sharp `0.35.3` ou la version sécurisée minimale validée par l'audit ; ne pas revenir à Sharp `<0.35.0` pour contourner le problème.
- Vérifier que les overrides PNPM de sécurité ne forcent pas une combinaison incompatible avec la version de Next.js.
- Examiner le diff du lockfile pour détecter un changement inattendu de runtime natif (`linux-x64`, `linuxmusl-x64`, architecture ou version libvips).

### 4. Tester d'abord avec le workaround conservé

- Exécuter `pnpm install --frozen-lockfile` dans un environnement propre.
- Exécuter le type-check, les tests `image-compress` et le build Next.js.
- Inspecter les traces `.nft.json` et vérifier la présence de `libvips-cpp.so`.
- Déployer sur un environnement Vercel de preview.
- Vérifier que le packaging ne produit pas d'erreur de symlink et que `/admin/media/library` ainsi que la génération de thumbnail fonctionnent.

### 5. Retirer uniquement les éléments devenus inutiles

Après validation de la release upstream, tester séparément les suppressions suivantes :

1. Retirer `outputFileTracingIncludes` de `next.config.ts`.
2. Relancer le build et inspecter les `.nft.json`.
3. Déployer une preview et vérifier le runtime Sharp.
4. Si le tracing automatique est fiable, conserver ou retirer `serverExternalPackages: ["sharp"]` selon la recommandation officielle et le résultat du bundle.
5. Ne jamais réintroduire `public-hoist-pattern[]=@img/sharp*` ni `node-linker=hoisted` sans preuve que Vercel accepte le package final.

Chaque suppression doit être un changement isolé afin d'identifier précisément la configuration encore nécessaire.

### 6. Valider la production

- Comparer la taille et le contenu du package serverless avant/après.
- Déployer en preview puis en production avec approbation explicite.
- Tester `/admin/media/library`, la liste des médias, l'upload d'une image, la génération d'une miniature et sa régénération.
- Vérifier les logs Vercel et Sentry après un cold start, pas uniquement après une fonction déjà chaude.
- Confirmer l'absence de `ERR_DLOPEN_FAILED`, `Cannot find module 'sharp-<hash>'` et d'erreur `invalid deployment package`.
- Conserver le rollback vers le workaround TASK104 jusqu'à la fin de la fenêtre d'observation.

### 7. Nettoyer la documentation

- Mettre à jour TASK104 pour indiquer que son workaround a été remplacé par le correctif upstream.
- Ajouter dans `activeContext.md` la version Next.js retenue et la date de validation production.
- Mettre à jour `progress.md` et `techContext.md` pour retirer la recommandation de tracing manuel si elle n'est plus nécessaire.
- Documenter la version minimale sûre de Next.js et Sharp dans la fiche de dépendances.
- Ajouter le lien vers l'issue et la release upstream retenue.

## Fichiers susceptibles d'être modifiés

- `package.json`
- `pnpm-lock.yaml`
- `next.config.ts`
- `.npmrc` uniquement si une entrée de workaround a été ajoutée ultérieurement
- `memory-bank/tasks/tasks-completed/TASK104-dependabot-dependency-remediation.md`
- `memory-bank/activeContext.md`
- `memory-bank/progress.md`
- `memory-bank/techContext.md`
- `memory-bank/tasks/_index.md`

Aucun changement de schéma Supabase, de RLS ou de données n'est attendu pour cette migration.

## Validation obligatoire

### Dépendances et build

- `pnpm audit --prod` : aucune vulnérabilité.
- `pnpm audit` : aucune nouvelle vulnérabilité pertinente.
- `pnpm install --frozen-lockfile` : réussite.
- `pnpm type-check` : réussite.
- `pnpm vitest run __tests__/utils/image-compress.test.ts` : 11/11 tests minimum.
- `pnpm build` : réussite.
- `git diff --check` : réussite.

### Tracing et packaging

- Le `.nft.json` contient la bibliothèque native nécessaire à Sharp, ou la release upstream prouve que le nouveau mécanisme la trace automatiquement.
- Aucun chemin hoisté symlinké n'est requis.
- Le packaging Vercel termine sans `invalid deployment package`.
- Le runtime Linux x64 charge Sharp après cold start.

### Fonctionnel et observabilité

- `/admin/media/library` répond sans 500.
- Upload, création et régénération de thumbnails réussissent.
- Les logs Vercel et Sentry ne contiennent plus les erreurs Sharp connues après un déploiement réel.
- Les routes publiques et les autres routes admin ne présentent pas de régression.

## Critères de clôture

La TASK200 est complète seulement lorsque :

- une version stable upstream corrigée est déployée en production ;
- le workaround manuel est supprimé ou réduit à ce que la documentation officielle recommande ;
- deux déploiements consécutifs, dont un après cold start, fonctionnent ;
- `/admin/media/library` et le pipeline thumbnail sont validés ;
- le rollback vers la configuration TASK104 a été testé ou est immédiatement disponible ;
- le Memory Bank indique clairement la version minimale validée et la date de retrait du workaround.

## Stratégie de rollback

En cas d'échec du build, du packaging ou du runtime :

1. Restaurer la version précédente de Next.js et le lockfile.
2. Restaurer `serverExternalPackages: ["sharp"]` et le tracing physique sous `node_modules/.pnpm/`.
3. Vérifier l'absence de `public-hoist-pattern[]=@img/sharp*`.
4. Redéployer la configuration connue comme fonctionnelle de TASK104.
5. Conserver les logs Vercel/Sentry et le `.nft.json` de l'échec pour le suivi upstream.

## Progression

| ID | Description | Statut | Notes |
| --- | --- | --- | --- |
| 1.1 | Identifier une release stable contenant le correctif nft/Next.js | À faire | Ne pas se baser uniquement sur une version canary |
| 1.2 | Tester la mise à jour avec le workaround actuel | À faire | Preview Vercel obligatoire |
| 1.3 | Retirer le tracing manuel par étapes | À faire | Un changement de configuration à la fois |
| 1.4 | Valider Sharp après cold start en production | À faire | Vérifier Sentry et les logs Vercel |
| 1.5 | Mettre à jour le Memory Bank et clôturer | À faire | Référencer la release upstream |

## Journal de progression

### 2026-08-02

- Tâche planifiée à la suite de TASK104 et de l'analyse de Next.js issue #96064.
- Le workaround de production est conservé comme référence de rollback.
- Aucun retrait de configuration n'est autorisé avant une release stable corrigée et une validation Vercel réelle.
