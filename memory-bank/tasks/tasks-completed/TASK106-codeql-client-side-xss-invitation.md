# TASK106 - Remédiation CodeQL XSS client-side invitation

**Statut:** Complétée localement - en attente de réanalyse CodeQL après push

**Ajoutée:** 2026-08-03

**Mise à jour:** 2026-08-03

## Demande originale

Corriger l'alerte CodeQL #28 `js/xss` dans le flux d'acceptation d'invitation,
documenter le correctif dans le Memory Bank, puis committer et pousser sur
`master`.

## Symptôme et modèle de menace

La page `app/(marketing)/auth/accept-invitation/page.tsx` lisait le paramètre
de query `url`, qui contient le lien Supabase de vérification à usage unique.
Après une validation cliente, le clic exécutait :

```ts
window.location.href = targetUrl;
```

`targetUrl` provenait indirectement d'une entrée contrôlable par un tiers.
Même si `isSafeInvitationUrl()` appliquait déjà une whitelist stricte, CodeQL
ne pouvait pas prouver cette fonction de sanitisation personnalisée avant le
sink de navigation. L'alerte signalait donc à juste titre qu'une valeur de
query était écrite dans une API de navigation DOM sensible.

Un attaquant peut aussi contourner toute validation cliente en fabriquant une
requête ou en modifiant le champ caché depuis les outils navigateur. La
validation côté client ne peut donc pas être la frontière de sécurité.

## Cause racine

Le flux mélangeait deux responsabilités :

1. la validation UX dans le Client Component, indispensable pour afficher un
   lien invalide et désactiver le bouton ;
2. la décision de sécurité et la navigation vers une URL externe, exécutées
   directement dans le navigateur.

La redirection restait ainsi liée à une chaîne provenant de `window.location`
au lieu d'être décidée à une frontière serveur revalidant l'entrée.

## Correction appliquée

### Server Action locale

Le nouveau fichier `app/(marketing)/auth/accept-invitation/actions.ts` expose
`continueInvitationAction(formData)` :

1. extrait `invitationUrl` de `FormData` et le traite comme non fiable ;
2. utilise les variables validées de `lib/env.ts` côté serveur ;
3. revalide l'URL avec `isSafeInvitationUrl()` ;
4. redirige les données absentes ou invalides vers
   `/auth/accept-invitation` ;
5. appelle `redirect(invitationUrl)` seulement après cette validation.

La revalidation conserve les garanties existantes : HTTPS, hôte Supabase exact,
chemin `/auth/v1/verify`, présence de `redirect_to` et comparaison exacte de
l'origine de retour avec l'origine configurée ou l'origine publique officielle.

### Formulaire côté client

La page conserve `parseInvitationFromLocation()` dans un `useEffect` afin de
préserver le correctif d'hydratation précédent. Une URL valide active le bouton,
mais celui-ci soumet désormais un formulaire POST à la Server Action :

```tsx
<form action={continueInvitationAction}>
  <input name="invitationUrl" type="hidden" value={targetUrl ?? ""} />
  <Button type="submit" disabled={!targetUrl}>
    Continuer vers l'activation
  </Button>
</form>
```

Le sink `window.location.href = targetUrl` est supprimé. Toute valeur altérée
dans le formulaire est rejetée ou autorisée par le même validateur côté serveur.

## Effets fonctionnels et sécurité

- Le lien Supabase reste consommé uniquement après une action explicite de la
  personne invitée.
- Les scanners de messagerie qui effectuent un simple `GET` de la page
  intermédiaire ne soumettent pas le formulaire et ne consomment pas le jeton.
- Le formulaire conserve la progressive enhancement des Server Actions : le
  navigateur soumet la requête POST même si JavaScript n'est pas encore chargé.
- Une destination invalide renvoie à la page intermédiaire, qui expose son état
  d'erreur existant sans afficher le lien fourni.
- La validation cliente est une optimisation UX ; seule la revalidation serveur
  fait autorité pour la navigation externe.

## Fichiers concernés

- `app/(marketing)/auth/accept-invitation/page.tsx`
- `app/(marketing)/auth/accept-invitation/actions.ts`
- `__tests__/utils/validate-invitation-url.test.ts` (couverture existante du
  validateur réutilisé)

## Validation

- ✅ `pnpm test:unit:invitation-url` : 5/5 tests réussis.
- ✅ `pnpm type-check`.
- ✅ Diagnostics VS Code sur les deux fichiers modifiés : aucune erreur.
- ✅ `git diff --check`.
- ⏳ GitHub Code Scanning doit réanalyser `master` après le push pour confirmer
  la fermeture de l'alerte #28.

## Leçons durables

- Une URL validée uniquement dans un Client Component reste une entrée hostile
  à la frontière serveur.
- Pour une navigation vers une URL externe provenant d'une query string,
  préférer une Server Action qui revalide puis appelle `redirect()` plutôt que
  l'affectation directe à `window.location`.
- Les validateurs d'URL doivent comparer des composants parsés (`origin`,
  `host`, `protocol`), jamais des sous-chaînes ou préfixes textuels.
