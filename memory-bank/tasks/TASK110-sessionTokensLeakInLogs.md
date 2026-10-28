# TASK110 - Fuite des jetons de session dans les logs du middleware

**Statut:** In Progress

**Ajoutée:** 2026-10-28

**Mise à jour:** 2026-10-28

## Demande originale

Expliquer pourquoi l'écriture de l'en-tête `cookie` dans les logs du middleware
permet de reprendre une session admin, puis neutraliser les blocs de diagnostic
(en les commentant dans un premier temps) et ajouter des protections pour que
cela ne se reproduise pas.

## Constat

`supabase/middleware.ts` (`updateSession()`, exécuté à chaque requête via
`proxy.ts`) contenait trois blocs de diagnostic introduits par le commit
`7b4d103` (2025-10-19, TASK022) :

- avant et après `getClaims()` : `console.debug` de l'en-tête `cookie` **complet**
  (`rawCookieHeader`, `rawCookieHeaderAfter`) et des claims (UUID, e-mail, rôle) ;
- en tête de fonction : les 200 premiers caractères de l'en-tête `cookie` quand
  `request.cookies.getAll()` était vide.

Le cookie `sb-<ref>-auth-token` contient l'`access_token` (JWT ES256, 1 h) et le
`refresh_token`. Toute personne lisant les logs Vercel (membre du projet, compte
Vercel ou GitHub compromis, log drain tiers, logs copiés dans un ticket) pouvait
rejouer la session admin : cookie recréé dans un navigateur, appel direct à
PostgREST en `Bearer`, prolongation via le refresh token.

Sentry : `beforeSend` (serveur) retirait l'en-tête `cookie` des événements, mais
pas des breadcrumbs `console` ; la config edge n'avait aucun nettoyage.

## Pourquoi les audits ne l'ont pas vu

- Commentaire trompeur (`only keep a short sample`) sur la ligne précédant le
  log de l'en-tête brut.
- Règle de nettoyage limitée à `console.log` ; `console.debug` non couvert et
  émis en production (pas de `compiler.removeConsole`).
- Aucun secret littéral dans le code : les scanners de secrets et la
  détection CodeQL par nom de variable ne le classent pas comme sensible.
- Audits centrés sur RLS, GRANT, vues et en-têtes HTTP ; OWASP A09
  (journalisation) non vérifié explicitement.

## Décisions

- Les trois blocs sont **commentés** (et non supprimés) dans un premier temps,
  chacun avec une ligne `SECURITY: disabled 2026-10-28`.
- `no-console` (autorise `error` / `warn`) : `error` sur `proxy.ts`,
  `supabase/*.ts`, `lib/auth/**` ; `warn` ailleurs ; `off` pour scripts, tests,
  E2E et Edge Functions.
- Nettoyage Sentry centralisé dans `lib/sentry/scrub-sensitive.ts`, branché sur
  les configs serveur et edge.

## Plan d'implémentation

1. Commenter les blocs de diagnostic du middleware.
2. Ajouter `scrubSensitiveHeaders` (`beforeSend`) et
   `dropSensitiveConsoleBreadcrumb` (`beforeBreadcrumb`) aux configs Sentry
   serveur et edge, avec tests unitaires.
3. Ajouter la règle ESLint `no-console`.
4. Compléter la checklist de `.github/instructions/security-and-owasp.instructions.md`.
5. Actions manuelles (dashboards) : invalidation des sessions, vérification des
   accès aux logs.
6. Plus tard : supprimer définitivement les blocs commentés.

## Progress Tracking

**Overall Status:** In Progress - 65%

### Subtasks

| ID | Description | Status | Updated | Notes |
| --- | --- | --- | --- | --- |
| 1.1 | Commenter les 3 blocs de diagnostic du middleware | Complete | 2026-10-28 | |
| 1.2 | Nettoyage Sentry serveur + edge, tests | Complete | 2026-10-28 | `__tests__/utils/sentry-scrub.test.ts` 5/5 |
| 1.3 | Règle ESLint `no-console` | Complete | 2026-10-28 | 0 erreur, 158 avertissements hors auth |
| 1.4 | Checklist sécurité OWASP | Complete | 2026-10-28 | |
| 2.1 | Changer le mot de passe admin et supprimer ses sessions (`auth.sessions`) | Not Started | 2026-10-28 | Dashboard Supabase |
| 2.2 | Vérifier « Secure password change » | Not Started | 2026-10-28 | Dashboard Supabase |
| 2.3 | Vérifier log drains, membres du projet et 2FA Vercel/GitHub | Not Started | 2026-10-28 | |
| 2.4 | Chercher `sb-` / `rawCookieHeader` dans les breadcrumbs Sentry | Not Started | 2026-10-28 | |
| 3.1 | Supprimer définitivement les blocs commentés | Not Started | 2026-10-28 | Après validation |
| 3.2 | Réduire les 158 avertissements `no-console` restants | Not Started | 2026-10-28 | Non bloquant |

## Progress Log

### 2026-10-28

- Faille identifiée en documentant le flux d'authentification (TASK109).
- Trois blocs de diagnostic commentés dans `supabase/middleware.ts`.
- `lib/sentry/scrub-sensitive.ts` créé et branché dans `sentry.server.config.ts`
  et `sentry.edge.config.ts` (la config edge ne nettoyait aucun en-tête).
- Règle `no-console` ajoutée dans `eslint.config.mjs`.
- Deux `console.log` de `lib/actions/media-actions.ts` commentés.
- Validation : `pnpm tsc --noEmit` OK, tests de nettoyage Sentry 5/5,
  `pnpm lint` 0 erreur.
