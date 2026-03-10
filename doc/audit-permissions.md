# Plan d’implémentation complet, pensé pour rendre editor réellement opérationnel sans fragiliser la sécurité existante

Je vais croiser les schémas RLS par grande zone fonctionnelle pour vous donner un tableau clair des permissions effectives, pas juste les rôles théoriques.

Voici la cartographie des permissions effectives par zone.

Point de lecture important avant le tableau : aujourd’hui, editor existe bien dans le modèle utilisateur, mais il n’a pas de matrice RLS dédiée. En pratique, editor est traité comme un utilisateur authentifié non-admin pour la plupart des contrôles sensibles, car l’autorisation forte repose sur is_admin() dans 02b_functions_core.sql et sur requireAdmin dans is-admin.ts.

> **Lecture rapide**

| Zone | anon | authenticated non-admin | editor | admin |
| --- | --- | --- | --- | --- |
| Site public | Oui, lecture publique prévue | Oui | Oui | Oui, avec visibilité élargie sur certains contenus |
| Backoffice contenu | Non | Non en général | Non en pratique | Oui |
| Gestion utilisateurs | Non | Non | Non | Oui |
| Analytics / audit / rétention | Non | Non | Non | Oui côté app, avec vues très protégées |
| Média / stockage | Lecture publique, pas d’upload DB | Upload média possible selon tables/bucket, droits limités | Même chose que authenticated | Oui, plein accès fonctionnel |

> **1. Site public**

| Ressource | anon | authenticated non-admin | editor | admin |
| --- | --- | --- | --- | --- |
| Spectacles publiés / archivés publics | Oui | Oui | Oui | Oui + voit aussi le non public |
| Événements | Oui | Oui | Oui | Oui |
| Partenaires actifs | Oui | Oui | Oui | Oui + voit inactifs |
| Tags / catégories actifs / relations publiques | Oui | Oui | Oui | Oui |
| Configurations publiques et display toggles | Oui | Oui | Oui | Oui + toutes les configs |

Sources principales :
61_rls_main_tables.sql
62_rls_advanced_tables.sql
10_tables_system.sql

Nuances utiles :

- Pour spectacles, le public voit seulement les entrées publiques avec status published ou archived ; l’admin voit tout dans 61_rls_main_tables.sql.
- Pour partners, anon et authenticated voient seulement les actifs ; admin voit tout dans 61_rls_main_tables.sql.
- Les display toggles sont lisibles par tout le monde pour que le site public fonctionne dans 10_tables_system.sql.

> **2. Backoffice contenu**

| Capacité | anon | authenticated non-admin | editor | admin |
| --- | --- | --- | --- | --- |
| Accéder aux pages admin | Non | Non | Redirection UI possible mais blocage réel ensuite | Oui |
| CRUD spectacles | Non | Non | Non en pratique | Oui |
| CRUD événements | Non | Non | Non | Oui |
| CRUD partenaires | Non | Non | Non | Oui |
| CRUD catégories / tags / relations | Non | Non | Non | Oui |
| SEO redirects / sitemap admin | Non | Non | Non | Oui |

Sources principales :
is-admin.ts
61_rls_main_tables.sql
62_rls_advanced_tables.sql

Nuances importantes :

- L’UI peut rediriger editor vers /admin après setup dans SetupAccountForm.tsx, mais les pages et DAL admin exigent requireAdmin.
- Exemple page admin protégée : app/(admin)/admin/team/page.tsx/admin/team/page.tsx#L16).
- Exemple DAL admin protégé : team.ts, admin-partners.ts, admin-press-releases.ts.

> **3. Gestion utilisateurs**

| Capacité | anon | authenticated non-admin | editor | admin |
| --- | --- | --- | --- | --- |
| Voir / modifier son propre profil | Non pour modifier, lecture publique des profils | Oui | Oui | Oui |
| Inviter un utilisateur | Non | Non | Non | Oui |
| Changer un rôle user/editor/admin | Non | Non | Non | Oui |
| Supprimer un utilisateur | Non | Non | Non | Oui |

Sources principales :
60_rls_profiles.sql
10b_tables_user_management.sql
app/(admin)/admin/users/actions.ts/admin/users/actions.ts)
admin-users.ts

Nuances utiles :

- Les profils sont lisibles publiquement dans 60_rls_profiles.sql.
- Un utilisateur authentifié peut insérer ou mettre à jour son propre profil ; un admin peut gérer n’importe quel profil dans 60_rls_profiles.sql.
- Les invitations et leur historique sont réservés aux admins via is_admin() dans 10b_tables_user_management.sql.
- Les rôles métiers possibles sont user, editor, admin dans admin-users.ts.

> **4. Analytics, audit, rétention**

| Capacité | anon | authenticated non-admin | editor | admin |
| --- | --- | --- | --- | --- |
| Insérer certains événements analytics | Oui selon policy dédiée | Oui selon policy dédiée | Oui | Oui |
| Lire analytics_events | Non | Non | Non | Oui |
| Lire analytics_summary / vues admin analytics | Non | Non | Non | Oui côté logique applicative, vues SQL fortement verrouillées |
| Lire logs_audit | Non | Non | Non | Oui |
| Modifier / supprimer logs_audit | Non | Non | Non | Pratiquement non, car policy parle de super_admin mais ce rôle n’est pas dans le modèle courant |
| Vues de rétention | Non | Non | Non | Oui côté exploitation serveur/admin |

Sources principales :
62_rls_advanced_tables.sql
13_analytics_events.sql
10_tables_system.sql
41_views_retention.sql

Nuances utiles :

- Les événements analytics peuvent être insérés par anon et authenticated via migrations ciblées mentionnées dans 62_rls_advanced_tables.sql.
- La lecture analytics brute est admin-only.
- Les vues résumées analytics et rétention sont révoquées pour anon/authenticated puis accordées à service_role dans 13_analytics_events.sql et 41_views_retention.sql.
- Le cas super_admin dans les logs d’audit est incohérent avec la contrainte actuelle sur profiles.role, limitée à user/editor/admin dans 50_constraints.sql.

> **5. Média et stockage**

| Capacité | anon | authenticated non-admin | editor | admin |
| --- | --- | --- | --- | --- |
| Lire médias | Oui | Oui | Oui | Oui |
| Créer un enregistrement média | Non | Oui | Oui | Oui |
| Modifier / supprimer son propre média | Non | Oui | Oui | Oui |
| Modifier / supprimer n’importe quel média | Non | Non | Non | Oui |
| Lire bucket medias | Oui | Oui | Oui | Oui |
| Upload dans bucket medias | Non | Oui | Oui | Oui |
| Delete dans bucket medias | Non | Non | Non | Oui |
| Accès bucket backups | Non | Non | Non | Non côté utilisateur, service_role uniquement |

Sources principales :
61_rls_main_tables.sql
02c_storage_buckets.sql

Nuances importantes :

- La table medias autorise insert à tout utilisateur authentifié, puis update/delete à l’uploader ou à l’admin dans 61_rls_main_tables.sql.
- Le bucket medias autorise lecture publique et upload à authenticated, mais la suppression est admin-only dans 02c_storage_buckets.sql.
- Le bucket backups est réservé à service_role dans 02c_storage_buckets.sql.

> **Rôles techniques à ne pas confondre avec les rôles métier**

| Rôle technique | Usage |
| --- | --- |
| anon | visiteur non connecté |
| authenticated | tout utilisateur connecté |
| service_role | rôle serveur très privilégié, non attribué aux utilisateurs |
| admin_views_owner | rôle SQL technique pour posséder des vues admin sans les exposer |

Sources :
01_extensions.sql
systemPatterns.md

> **Conclusion nette**

- Le vrai découpage effectif aujourd’hui est surtout :
  - anon
  - authenticated non-admin
  - admin
  - rôles techniques serveur
- editor existe bien dans le modèle métier et dans l’UI, mais il n’a pas encore de permissions fortes différenciées au niveau RLS/backoffice.
- Donc, si vous me demandez “qui peut vraiment administrer l’app aujourd’hui ?”, la réponse est : admin uniquement.

Si vous voulez, je peux maintenant vous faire l’une de ces deux choses :

1. un tableau encore plus détaillé, ressource par ressource, pour chaque table principale ;
2. un audit ciblé des écarts entre le rôle editor prévu par l’UI et ses permissions réellement implémentées.

---
---
---

> **Cible**

Je recommande un modèle en 3 niveaux, simple et explicite :

| Rôle | Accès cible |
| --- | --- |
| user | aucun accès backoffice |
| editor | accès backoffice éditorial uniquement |
| admin | accès complet backoffice + sécurité + configuration |

Pour un premier lot cohérent, editor devrait pouvoir gérer :

- spectacles
- agenda / événements
- presse
- médias
- taxonomie liée à ces contenus si nécessaire

Et ne devrait pas pouvoir gérer :

- utilisateurs
- rôles
- analytics
- audit logs
- rétention / sécurité
- site-config
- debug-auth
- tout ce qui modifie la structure ou la sécurité du site

C’est aligné avec les user stories de 14.7-back‑office.md et le product context de productContext.md.

> **Principe d’architecture**

Le changement central à faire est de passer de "admin-only" à un **modèle hiérarchique de rôles**.

Aujourd'hui, presque tout repose sur :

- is-admin.ts
- app/(admin)/layout.tsx/layout.tsx#L21)
- des policies SQL basées sur public.is_admin() comme dans 61_rls_main_tables.sql et 62_rls_advanced_tables.sql

Pour faire de editor un vrai rôle, il faut introduire une **hiérarchie stricte** réutilisable partout :

```
user < editor < admin
```

Chaque rôle hérite des permissions de tous les rôles inférieurs. Pas de matrice de capabilities individuelles : avec seulement 3 rôles, une hiérarchie simple est plus lisible, plus facile à auditer et moins sujette aux erreurs.

Le guard central devient `requireMinRole(role)` au lieu de `requireAdmin()` :

- `requireMinRole("editor")` → autorise editor et admin
- `requireMinRole("admin")` → autorise admin uniquement

Ce pattern s'applique uniformément à :

- pages
- composants de navigation
- DAL
- Server Actions
- RLS SQL

## **Plan par phases**

> **Phase 1. Définir la hiérarchie de rôles**

Créer un module de rôles côté app :

- lib/auth/roles.ts

Contenu attendu :

```typescript
export const ROLE_HIERARCHY = ["user", "editor", "admin"] as const;
export type UserRole = (typeof ROLE_HIERARCHY)[number];

/** Vérifie que le rôle courant est ≥ au rôle minimum requis */
export function isRoleAtLeast(current: UserRole, minRequired: UserRole): boolean {
  return ROLE_HIERARCHY.indexOf(current) >= ROLE_HIERARCHY.indexOf(minRequired);
}
```

Classification des pages par rôle minimum requis :

- `editor` (rôle minimum) :
  - spectacles, agenda, presse (articles + communiqués), media, taxonomie
- `admin` (rôle minimum) :
  - users, analytics, audit-logs, site-config, debug-auth, team, lieux, partners, compagnie, home

Résultat attendu :

- une seule source de vérité : la hiérarchie `user < editor < admin`
- plus de logique implicite disséminée
- pas de matrice de capabilities à maintenir

> **Phase 2. Introduire des guards hiérarchiques côté Next.js**

Ajouter dans le module de rôles ou un fichier voisin :

- `getCurrentUserRole()` → résout le rôle depuis les claims / profile
- `hasMinRole(minRole)` → retourne `true` si le rôle courant ≥ `minRole`
- `requireMinRole(minRole)` → guard qui throw si le rôle est insuffisant
- `requireBackofficeAccess()` → alias de `requireMinRole("editor")`

Conserver `is-admin.ts` pour les zones purement admin, mais arrêter d'en faire le garde global du backoffice.

Ensuite :

- remplacer dans app/(admin)/layout.tsx/layout.tsx#L21) le `requireAdmin` par `requireBackofficeAccess()` (= `requireMinRole("editor")`)
- garder `requireMinRole("admin")` page par page pour les sections sensibles

But :

- admin et editor peuvent entrer dans le backoffice
- seules certaines sections restent admin-only via `requireMinRole("admin")`

> **Phase 3. Rendre les routes admin "scope-aware"**

Faire un audit et une classification explicite de chaque section dans `app/(admin)/admin/` :

Editor + Admin (rôle minimum `editor`) :

- /admin/spectacles
- /admin/agenda
- /admin/presse
- /admin/media

Admin-only (rôle minimum `admin`) :

- /admin/users
- /admin/analytics
- /admin/audit-logs
- /admin/site-config
- /admin/debug-auth
- probablement /admin/team
- probablement /admin/lieux
- probablement /admin/home
- probablement /admin/partners
- probablement /admin/compagnie au premier lot, sauf décision métier contraire

Pourquoi ce choix :

- il limite le périmètre MVP à l'éditorial pur
- il évite d'ouvrir trop tôt des zones structurelles ou sensibles

À faire :

- sur chaque page, remplacer `requireAdmin()` par `requireMinRole(...)` avec le rôle approprié
- exemple :
  - spectacles → `requireMinRole("editor")`
  - presse → `requireMinRole("editor")`
  - media → `requireMinRole("editor")`
  - analytics → `requireMinRole("admin")`

> **Phase 4. Adapter la navigation et les redirections**

Corriger immédiatement le faux signal actuel dans SetupAccountForm.tsx, qui envoie editor sur /admin alors qu’il est ensuite bloqué.

Deux options propres :

1. garder /admin comme hub commun mais le rendre role-aware
2. rediriger editor vers une première section utile, par exemple /admin/spectacles ou /admin/media

Je recommande :

- /admin pour tout le monde connecté au backoffice
- dashboard role-aware :
  - editor voit seulement les cartes utiles à son périmètre
  - admin voit le dashboard complet

Le composant `app/(admin)/admin/page.tsx` devra donc devenir conditionnel selon le rôle de l'utilisateur.

Le sidebar admin devra aussi masquer les entrées non autorisées.

> **Phase 5. Faire évoluer le DAL**

Aujourd’hui, presque tous les DAL admin font requireAdmin(), par exemple :

- admin-partners.ts
- admin-press-releases.ts
- media.ts
- spectacles.ts

Il faut remplacer les guards selon le domaine :

- spectacle / agenda / presse / media → `requireMinRole("editor")`
- analytics / audit / users / site-config → `requireMinRole("admin")` (ou conserver `requireAdmin()`)

Important :

- ne pas dupliquer les règles
- le DAL doit rester le boundary de sécurité côté app

Recommandation de structure :

- nouveau helper serveur dans `lib/auth/roles.ts` :
  - `requireMinRole("editor")` pour les pages éditoriales
  - `requireMinRole("admin")` pour les pages sensibles
  - `requireBackofficeAccess()` alias de `requireMinRole("editor")`

> **Phase 6. Ajouter la fonction SQL de rôle hiérarchique**

Côté base, public.is_admin() ne suffit plus.

Il faut ajouter au minimum :

- `public.has_min_role(required_role text)` — vérifie que le rôle de l'utilisateur est au moins `required_role` dans la hiérarchie `user < editor < admin`

Logique interne de `has_min_role` :

- `has_min_role('user')` → `role IN ('user', 'editor', 'admin')`
- `has_min_role('editor')` → `role IN ('editor', 'admin')`
- `has_min_role('admin')` → `role IN ('admin')` (équivalent de `is_admin()`)

Exemple d'usage futur dans les policies :

- `has_min_role('editor')` pour l'éditorial
- `is_admin()` ou `has_min_role('admin')` pour le sensible

Cette fonction doit suivre le standard du repo :

- security definer
- set search_path = ''
- stable (lecture seule)
- appui sur `public.profiles.role`

> **Phase 7. Refactorer les RLS des tables éditoriales**

C’est la phase la plus importante côté permissions effectives.

À ouvrir à admin + editor :

- spectacles
- evenements
- communiques_presse
- articles_presse
- medias
- probablement tags/categories/relations si l’éditeur doit gérer le classement

À laisser admin-only :

- configurations_site
- logs_audit
- analytics_events en lecture
- user_invitations
- pending_invitations
- data_retention_*
- vues admin sensibles

Concrètement :

- remplacer sur les tables éditoriales les `with check` / `using` basés sur `is_admin()` par `has_min_role('editor')`
- garder les tables système sensibles en admin-only

Attention particulière :

- 61_rls_main_tables.sql
- 62_rls_advanced_tables.sql
- les schémas spécifiques presse, spectacles, media, relations

> **Phase 8. Clarifier la politique sur media**

Le média mérite une décision explicite.

Aujourd’hui :

- authenticated peut créer certains enregistrements média
- bucket medias permet l’upload à authenticated dans 02c_storage_buckets.sql

Si editor devient un vrai rôle backoffice, il faut décider entre deux modèles :

1. média reste “authenticated broad”
2. média devient “editor/admin only” pour le backoffice

Je recommande de resserrer :

- upload / édition / suppression de médias backoffice : editor + admin
- lecture publique : inchangée

Sinon, editor n’a toujours pas une vraie permission distincte, puisqu’un simple authenticated aurait déjà presque les mêmes droits.

> **Phase 9. Revoir les vues admin et le dashboard**

Les vues sensibles doivent rester admin-only :

- analytics_summary
- data_retention_*
- messages_contact_admin
- content_versions_detailed
- autres vues possédées par admin_views_owner

Aucun changement ici sauf si vous voulez créer des vues “editor-safe” séparées.

Je recommande :

- ne pas exposer les vues admin sensibles à editor
- créer, si besoin, de nouvelles vues éditoriales dédiées aux besoins editor
- ne pas élargir admin_views_owner / service_role sans nécessité

> **Phase 10. Mettre à jour l’UI de gestion des rôles**

Aujourd’hui l’UI promet déjà :

- editor = “Peut créer et modifier du contenu” dans InviteUserForm.tsx

Une fois les permissions en place, il faut :

- documenter précisément ce que editor peut gérer
- afficher un texte exact dans les formulaires d’invitation et de changement de rôle
- éventuellement ajouter un résumé des permissions par rôle

Tant que l’implémentation n’est pas terminée, cette description est trompeuse.

> **Phase 11. Tests**

Il faut prévoir trois niveaux de tests.

1. Tests auth/helpers

- `getCurrentUserRole()`
- `hasMinRole(role)`
- `requireMinRole(role)`
- `isRoleAtLeast(currentRole, minimumRole)`
- fallback app_metadata / user_metadata / profile si applicable

2. Tests intégration DAL

- editor peut créer/modifier/supprimer spectacle
- editor peut gérer presse
- editor peut gérer media
- editor ne peut pas accéder users / analytics / audit / site-config

3. Tests RLS SQL / scripts

- anon : accès public uniquement
- authenticated user : pas d’accès éditorial
- editor : accès éditorial seulement
- admin : accès complet

4. E2E

- onboarding editor
- redirection vers backoffice autorisé
- sidebar filtrée
- blocage propre sur pages admin-only

> **Phase 12. Migration et rollout**

Je recommande une livraison en 2 lots.

Lot A, fondation :

- matrice de permissions
- guards app
- dashboard / navigation
- redirection editor
- pas encore de changement RLS massif

Lot B, permissions effectives :

- nouvelles fonctions SQL
- migration RLS éditoriale
- DAL refactor
- tests d’intégration complets

Pourquoi :

- ça réduit le risque
- ça permet de valider le design avant d’ouvrir réellement les droits editor

> **Ordre d’exécution conseillé**

1. Définir la hiérarchie de rôles
2. Ajouter les helpers auth côté app
3. Rendre le layout admin accessible à editor
4. Filtrer navigation + dashboard
5. Activer editor sur 1 seul domaine pilote
   - je recommande spectacles
6. Ajouter fonctions SQL de rôle
7. Migrer RLS du domaine pilote
8. Tester end-to-end
9. Étendre à presse, agenda, media
10. Finaliser documentation et scripts

> **Domaine pilote recommandé**

Je recommande de commencer par :

- spectacles

Pourquoi :

- domaine éditorial central
- surface de permissions claire
- déjà fortement structuré dans le repo
- bon test pour pages, DAL, Server Actions, media liés, RLS

Ensuite :

- presse
- agenda
- media

> **Changements de fichiers probables**

Côté app :

- app/(admin)/layout.tsx/layout.tsx)
- app/(admin)/admin/page.tsx/admin/page.tsx)
- pages de sections éditoriales sous app/(admin)/admin/admin)
- is-admin.ts ou nouveau lib/auth/roles.ts à créer
- DAL éditoriaux dans dal

Côté DB :

- 02b_functions_core.sql
- 61_rls_main_tables.sql
- 62_rls_advanced_tables.sql
- schémas spécifiques presse / médias / relations

Côté docs :

- systemPatterns.md
- productContext.md
- doc de procédure rôle/editor à créer ou compléter

> **Décision produit à prendre avant implémentation**

Il faut trancher explicitement ce périmètre editor :

Option A, editor minimal

- spectacles
- agenda
- presse
- media

Option B, editor étendu

- Option A
- home
- compagnie
- partners
- lieux

Je recommande Option A pour le premier passage. Elle est plus sûre, plus simple à tester, et colle mieux aux user stories existantes.

> **Résumé exécutif**

Le bon plan n’est pas “remplacer admin par editor à quelques endroits”.
Le bon plan est :

- introduire une hiérarchie de rôles (`user < editor < admin`) avec héritage
- ouvrir le layout admin aux rôles backoffice (`editor` + `admin`)
- limiter `editor` à un sous-ensemble éditorial clair
- refactorer DAL + RLS en conséquence avec `requireMinRole()` / `has_min_role()`
- livrer par domaine pilote

## Matrice de permissions détaillée

### Hypothèses de lecture

- `Actuel` décrit l'état réellement implémenté aujourd'hui.
- `Cible` décrit la permission recommandée pour faire de `editor` un vrai rôle éditorial.
- `Actuel` est presque partout `admin-only` côté back-office à cause du garde global sur `app/(admin)/layout.tsx` et des guards DAL / RLS basés sur `public.is_admin()`.
- `Cible` est volontairement progressive : ouverture de l'éditorial pur, maintien des zones sécurité/configuration en `admin-only`.

### Matrice pages back-office

| Route | Domaine | Actuel | Cible `editor` | Cible `admin` | Rôle minimum |
| --- | --- | --- | --- | --- | --- |
| `/admin` | Dashboard | Admin only | Oui, dashboard filtré | Oui | `editor` |
| `/admin/agenda` | Éditorial | Admin only | Oui | Oui | `editor` |
| `/admin/agenda/new` | Éditorial | Admin only | Oui | Oui | `editor` |
| `/admin/agenda/[id]` | Éditorial | Admin only | Oui | Oui | `editor` |
| `/admin/agenda/[id]/edit` | Éditorial | Admin only | Oui | Oui | `editor` |
| `/admin/analytics` | Sensible | Admin only | Non | Oui | `admin` |
| `/admin/audit-logs` | Sensible | Admin only | Non | Oui | `admin` |
| `/admin/compagnie` | Structure contenu | Admin only | Non au MVP | Oui | `admin` |
| `/admin/compagnie/presentation` | Structure contenu | Admin only | Non au MVP | Oui | `admin` |
| `/admin/compagnie/valeurs` | Structure contenu | Admin only | Non au MVP | Oui | `admin` |
| `/admin/debug-auth` | Sécurité/debug | Admin only | Non | Oui | `admin` |
| `/admin/home/about` | Homepage structurante | Admin only | Non au MVP | Oui | `admin` |
| `/admin/home/hero` | Homepage structurante | Admin only | Non au MVP | Oui | `admin` |
| `/admin/lieux` | Référentiel | Admin only | Non au MVP | Oui | `admin` |
| `/admin/lieux/new` | Référentiel | Admin only | Non au MVP | Oui | `admin` |
| `/admin/lieux/[id]/edit` | Référentiel | Admin only | Non au MVP | Oui | `admin` |
| `/admin/media` | Éditorial | Admin only | Oui | Oui | `editor` |
| `/admin/media/folders` | Éditorial média | Admin only | Oui | Oui | `editor` |
| `/admin/media/library` | Éditorial média | Admin only | Oui | Oui | `editor` |
| `/admin/media/tags` | Éditorial média | Admin only | Oui | Oui | `editor` |
| `/admin/partners` | Structure / marketing | Admin only | Non au MVP | Oui | `admin` |
| `/admin/partners/new` | Structure / marketing | Admin only | Non au MVP | Oui | `admin` |
| `/admin/partners/[id]/edit` | Structure / marketing | Admin only | Non au MVP | Oui | `admin` |
| `/admin/presse` | Éditorial | Admin only | Oui | Oui | `editor` |
| `/admin/presse/articles/new` | Éditorial | Admin only | Oui | Oui | `editor` |
| `/admin/presse/articles/[id]/edit` | Éditorial | Admin only | Oui | Oui | `editor` |
| `/admin/presse/communiques/new` | Éditorial | Admin only | Oui | Oui | `editor` |
| `/admin/presse/communiques/[id]/edit` | Éditorial | Admin only | Oui | Oui | `editor` |
| `/admin/presse/communiques/[id]/preview` | Éditorial | Admin only | Oui | Oui | `editor` |
| `/admin/presse/contacts/new` | Sensible presse | Admin only | Non | Oui | `admin` |
| `/admin/presse/contacts/[id]/edit` | Sensible presse | Admin only | Non | Oui | `admin` |
| `/admin/site-config` | Configuration | Admin only | Non | Oui | `admin` |
| `/admin/spectacles` | Éditorial | Admin only | Oui | Oui | `editor` |
| `/admin/spectacles/new` | Éditorial | Admin only | Oui | Oui | `editor` |
| `/admin/spectacles/[id]` | Éditorial | Admin only | Oui | Oui | `editor` |
| `/admin/spectacles/[id]/edit` | Éditorial | Admin only | Oui | Oui | `editor` |
| `/admin/team` | Institutionnel / RH public | Admin only | Non au MVP | Oui | `admin` |
| `/admin/team/new` | Institutionnel / RH public | Admin only | Non au MVP | Oui | `admin` |
| `/admin/team/[id]/edit` | Institutionnel / RH public | Admin only | Non au MVP | Oui | `admin` |
| `/admin/users` | Sécurité / IAM | Admin only | Non | Oui | `admin` |
| `/admin/users/invite` | Sécurité / IAM | Admin only | Non | Oui | `admin` |

### Résumé de découpage par rôle minimum

| Rôle minimum | Domaines | Pages concernées |
| --- | --- | --- |
| `editor` | Éditorial pur | `/admin`, `/admin/spectacles/**`, `/admin/agenda/**`, `/admin/presse` (articles + communiqués), `/admin/media/**` |
| `admin` | Sensible, institutionnel, configuration | `/admin/analytics`, `/admin/audit-logs`, `/admin/site-config`, `/admin/debug-auth`, `/admin/users/**`, `/admin/home/**`, `/admin/compagnie/**`, `/admin/partners/**`, `/admin/team/**`, `/admin/lieux/**`, `/admin/presse/contacts/**` |

### Matrice tables, vues et buckets

| Ressource | Type | Lecture publique actuelle | Écriture actuelle | Cible `editor` | Cible `admin` | Décision recommandée |
| --- | --- | --- | --- | --- | --- | --- |
| `profiles` | table | Oui | self-service + admin | Non | Oui | laisser hors périmètre editor |
| `user_invitations` | table | Non | admin only | Non | Oui | rester admin-only |
| `pending_invitations` | table | Non | admin only | Non | Oui | rester admin-only |
| `medias` | table | Oui | authenticated insert, owner/admin update-delete | Oui | Oui | resserrer à `editor/admin` pour le backoffice |
| `media_tags` | table | Oui | admin only | Oui | Oui | ouvrir à `editor/admin` |
| `media_folders` | table | Oui | admin only | Oui | Oui | ouvrir à `editor/admin` |
| `media_item_tags` | table | Oui | admin only | Oui | Oui | ouvrir à `editor/admin` |
| `membres_equipe` | table | Oui si `active` | admin only | Non au MVP | Oui | rester admin-only au MVP |
| `lieux` | table | Oui | admin only | Non au MVP | Oui | rester admin-only au MVP |
| `spectacles` | table | Oui si public/published/archived | admin or owner | Oui | Oui | ouvrir à `editor/admin` |
| `evenements` | table | Oui | admin only | Oui | Oui | ouvrir à `editor/admin` |
| `events_recurrence` | table | Oui | admin only | Oui | Oui | ouvrir avec `evenements` |
| `partners` | table | Oui si `is_active` | admin only | Non au MVP | Oui | rester admin-only au MVP |
| `articles_presse` | table | Oui si `published_at is not null` | admin only | Oui | Oui | ouvrir à `editor/admin` |
| `communiques_presse` | table | Oui si `public=true` | admin only | Oui | Oui | ouvrir à `editor/admin` |
| `contacts_presse` | table | Non | admin only | Non | Oui | rester admin-only |
| `categories` | table | Oui si `is_active` | admin only | Oui | Oui | ouvrir à `editor/admin` si taxonomie éditoriale |
| `tags` | table | Oui | admin only | Oui | Oui | ouvrir à `editor/admin` |
| `spectacles_categories` | table | Oui | admin only | Oui | Oui | ouvrir à `editor/admin` |
| `spectacles_tags` | table | Oui | admin only | Oui | Oui | ouvrir à `editor/admin` |
| `articles_categories` | table | Oui | admin only | Oui | Oui | ouvrir à `editor/admin` |
| `articles_tags` | table | Oui | admin only | Oui | Oui | ouvrir à `editor/admin` |
| `communiques_categories` | table | Oui selon parent | admin only | Oui | Oui | ouvrir à `editor/admin` |
| `communiques_tags` | table | Oui selon parent | admin only | Oui | Oui | ouvrir à `editor/admin` |
| `spectacles_membres_equipe` | table relation | Oui | admin only | Non au MVP | Oui | rester admin-only si équipe hors scope |
| `spectacles_medias` | table relation | Oui | admin only | Oui | Oui | ouvrir à `editor/admin` |
| `articles_medias` | table relation | Oui | admin only | Oui | Oui | ouvrir à `editor/admin` |
| `communiques_medias` | table relation | Oui | admin only | Oui | Oui | ouvrir à `editor/admin` |
| `compagnie_values` | table | Oui | admin only | Non au MVP | Oui | rester admin-only au MVP |
| `compagnie_stats` | table | Oui | admin only | Non au MVP | Oui | rester admin-only au MVP |
| `compagnie_presentation_sections` | table | Oui si `active` | admin only | Non au MVP | Oui | rester admin-only au MVP |
| `home_hero_slides` | table | Oui si active/public | admin only | Non au MVP | Oui | rester admin-only au MVP |
| `home_about_content` | table | Oui | admin only | Non au MVP | Oui | rester admin-only au MVP |
| `content_versions` | table | Non | authenticated insert via triggers, admin read/update/delete | Non au MVP | Oui | conserver admin-only en lecture |
| `seo_redirects` | table | Non | admin only | Non | Oui | rester admin-only |
| `sitemap_entries` | table | Oui si `is_indexed` | admin only | Non | Oui | rester admin-only |
| `analytics_events` | table | Non | insert public/authenticated validé, lecture admin | Non | Oui | rester hors scope editor |
| `abonnes_newsletter` | table | Non directement, select technique pour doublons | insert public/authenticated, update admin | Non | Oui | rester hors scope editor |
| `messages_contact` | table | Non | insert public/authenticated, update/delete admin | Non | Oui | rester hors scope editor |
| `configurations_site` | table | Oui partiellement (`public:` / `display_toggle_%`) | admin only | Non | Oui | rester admin-only |
| `logs_audit` | table | Non | trigger system + admin/super-admin limité | Non | Oui | rester admin-only |
| `data_retention_config` | table | Non | admin only | Non | Oui | rester admin-only |
| `data_retention_audit` | table | Non | lecture admin | Non | Oui | rester admin-only |
| `messages_contact_admin` | vue | Non | service_role select | Non | Oui côté serveur uniquement | ne pas ouvrir à editor |
| `analytics_summary` | vue | Non | service_role select | Non | Oui côté serveur uniquement | ne pas ouvrir à editor |
| `analytics_summary_90d` | vue | Non | service_role select | Non | Oui côté serveur uniquement | ne pas ouvrir à editor |
| `content_versions_detailed` | vue | Non | service_role select | Non | Oui côté serveur uniquement | ne pas ouvrir à editor |
| `membres_equipe_admin` | vue | Non | service_role select | Non au MVP | Oui | rester admin-only |
| `compagnie_presentation_sections_admin` | vue | Non | service_role select | Non au MVP | Oui | rester admin-only |
| `partners_admin` | vue | Non | service_role select | Non au MVP | Oui | rester admin-only |
| `data_retention_monitoring` | vue | Non | service_role select | Non | Oui côté serveur uniquement | rester admin-only |
| `data_retention_stats` | vue | Non | service_role select | Non | Oui côté serveur uniquement | rester admin-only |
| `data_retention_recent_audit` | vue | Non | service_role select | Non | Oui côté serveur uniquement | rester admin-only |
| `storage.objects:medias` | bucket/policies | Oui | upload/update authenticated, delete admin | Oui | Oui | resserrer upload/update à `editor/admin` si cohérence backoffice voulue |
| `storage.objects:backups` | bucket/policies | Non | service_role only | Non | Non | inchangé |

### Fonctions SQL et helpers à introduire pour supporter la matrice

| Élément | But | Remplace / complète |
| --- | --- | --- |
| `public.has_min_role(text)` | Vérifier le rôle minimum côté RLS avec héritage hiérarchique | complète `public.is_admin()` |
| `getCurrentUserRole()` | Résoudre le rôle courant côté app | centralise lecture claims / profile |
| `hasMinRole(role)` | Vérifier un rôle minimum côté app avec héritage | remplace `requireAdmin()` pour l'éditorial |
| `requireMinRole(role)` | Guard réutilisable pages / DAL / actions | remplace le garde binaire admin-only |
| `requireBackofficeAccess()` | Autoriser `editor` et `admin` dans le layout admin | alias de `requireMinRole("editor")` |

### Ordre recommandé d'ouverture des permissions `editor`

| Vague | Périmètre | Pourquoi |
| --- | --- | --- |
| Vague 1 | `spectacles`, `evenements`, `articles_presse`, `communiques_presse`, `medias` | noyau éditorial utile, faible risque organisationnel |
| Vague 2 | taxonomie (`categories`, `tags`, relations), `media_tags`, `media_folders` | autonomie éditoriale complète |
| Vague 3 | `partners`, `compagnie`, `home`, `lieux`, `team` | contenus plus institutionnels, gouvernance à valider |
| Jamais ou plus tard | `users`, `analytics`, `audit`, `site-config`, `debug-auth`, rétention | zones sécurité / gouvernance |

---

# Bugs identifiés et corrigés (2026-03-10)

L'analyse croisée du code source avec cet audit a révélé 4 bugs concrets, corrigés dans les fichiers correspondants.

## Bug P0 — Policy RESTRICTIVE bloquant les articles publiés pour authenticated

> **Fichier** : `supabase/schemas/08_table_articles_presse.sql`
>
> **Problème** : La policy `"Admins can view all press articles"` était déclarée `as restrictive`. Or en PostgreSQL, les policies RESTRICTIVE s'appliquent en AND avec les policies PERMISSIVE. Résultat : pour le rôle `authenticated`, la condition finale devenait `published_at is not null AND is_admin()`. Les utilisateurs authentifiés non-admin ne voyaient **aucun** article — seuls `anon` (qui n'est pas ciblé par la RESTRICTIVE) et les admins pouvaient voir les articles publiés.
>
> **Correction** : Retrait de `as restrictive`, la policy est maintenant PERMISSIVE (défaut). Les deux policies SELECT s'évaluent en OR : les non-admins voient les articles publiés, les admins voient tout.

### Bug P1 — Policies `super_admin` mortes sur `logs_audit`

> **Fichier** : `supabase/schemas/10_tables_system.sql`
>
> **Problème** : Les policies UPDATE/DELETE sur `logs_audit` exigeaient `role = 'super_admin'` dans le profil. Or la contrainte `profiles_role_check` dans `50_constraints.sql` n'autorise que `user`, `editor`, `admin`. Le rôle `super_admin` ne peut jamais exister, rendant ces policies toujours fausses (aucun UPDATE/DELETE possible, même pour un admin).
>
> **Correction** : Remplacement par des policies admin-only simples avec `is_admin()`. Ajout d'un commentaire signalant que UPDATE/DELETE sur les logs d'audit doit rester exceptionnel.

## Bug P1 — Inconsistance `is_admin()` dans les policies spectacles

> **Fichier** : `supabase/schemas/61_rls_main_tables.sql`
>
> **Problème** : Les policies INSERT, UPDATE et DELETE sur `spectacles` utilisaient un subquery inline `exists(select 1 from profiles where user_id = auth.uid() and role = 'admin')` au lieu de la fonction centralisée `is_admin()`, contrairement à toutes les autres tables (evenements, partners, medias, etc.). Cela créait une incohérence de maintenance et ne bénéficiait pas du cache `initPlan` de la fonction.
>
> **Correction** : Remplacement des subqueries inline par `(select public.is_admin())` pour INSERT, et `created_by = (select auth.uid()) or (select public.is_admin())` pour UPDATE/DELETE (pattern owner-or-admin conservé).

## Bug P2 — Description trompeuse du rôle editor dans InviteUserForm

> **Fichier** : `components/features/admin/users/InviteUserForm.tsx`
>
> **Problème** : La description affichée pour le rôle `editor` était « Peut créer et modifier du contenu », alors qu'aucune permission éditoriale n'est implémentée en RLS ni côté DAL. Le rôle `editor` est effectivement traité comme un `authenticated` standard sans privilège particulier.
>
> **Correction** : Description modifiée en « Accès en lecture seule (permissions éditoriales à venir) » pour refléter l'état réel du système.

## Note importante sur la policy `articles_presse` (correction de l'audit)

La section « Analytics, audit, rétention » de l'audit mentionnait correctement que `super_admin` n'existe pas dans le modèle. En revanche, l'audit **ne signalait pas** le bug RESTRICTIVE sur `articles_presse` qui est le plus critique (P0) car il rendait les articles invisibles pour les utilisateurs connectés non-admin.
