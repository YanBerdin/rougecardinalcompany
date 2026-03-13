# Matrice de permissions

> **État au 2026-03-13** — Après implémentation complète de TASK076 (Editor Role Permissions).
> Le modèle d'autorisation est désormais hiérarchique : `user (0) < editor (1) < admin (2)`.
> La fonction SQL `has_min_role(required_role)` remplace `is_admin()` pour les tables éditoriales.
> Les gardes TypeScript sont dans `lib/auth/roles.ts` (`requireMinRole`, `requireBackofficeAccess`, `requireAdminOnly`).

## Hiérarchie des rôles

| Rôle | Niveau | Accès backoffice | Description |
| --- | --- | --- | --- |
| `user` | 0 | Non | Compte public, accès site uniquement |
| `editor` | 1 | Oui (éditorial) | CRUD sur contenu éditorial, bloqué sur zones admin-only |
| `admin` | 2 | Oui (complet) | Accès total, dont configuration et données sensibles |

## Matrice pages back-office

| Route | Domaine | Rôle minimum | `editor` | `admin` |
| --- | --- | --- | --- | --- |
| `/admin` | Dashboard | `editor` | Oui (dashboard filtré) | Oui (complet) |
| `/admin/agenda` | Éditorial | `editor` | Oui | Oui |
| `/admin/agenda/new` | Éditorial | `editor` | Oui | Oui |
| `/admin/agenda/[id]` | Éditorial | `editor` | Oui | Oui |
| `/admin/agenda/[id]/edit` | Éditorial | `editor` | Oui | Oui |
| `/admin/analytics` | Sensible | `admin` | Non | Oui |
| `/admin/audit-logs` | Sensible | `admin` | Non | Oui |
| `/admin/compagnie` | Éditorial | `editor` | Oui | Oui |
| `/admin/compagnie/presentation` | Éditorial | `editor` | Oui | Oui |
| `/admin/compagnie/valeurs` | Éditorial | `editor` | Oui | Oui |
| `/admin/debug-auth` | Sécurité/debug | `admin` | Non | Oui |
| `/admin/home/about` | Homepage structurante | `admin` | Non | Oui |
| `/admin/home/hero` | Homepage structurante | `admin` | Non | Oui |
| `/admin/lieux` | Éditorial | `editor` | Oui | Oui |
| `/admin/lieux/new` | Éditorial | `editor` | Oui | Oui |
| `/admin/lieux/[id]/edit` | Éditorial | `editor` | Oui | Oui |
| `/admin/media` | Éditorial | `editor` | Oui | Oui |
| `/admin/media/folders` | Éditorial média | `editor` | Oui | Oui |
| `/admin/media/library` | Éditorial média | `editor` | Oui | Oui |
| `/admin/media/tags` | Éditorial média | `editor` | Oui | Oui |
| `/admin/partners` | Structure / marketing | `admin` | Non | Oui |
| `/admin/partners/new` | Structure / marketing | `admin` | Non | Oui |
| `/admin/partners/[id]/edit` | Structure / marketing | `admin` | Non | Oui |
| `/admin/presse` | Éditorial | `editor` | Oui | Oui |
| `/admin/presse/articles/new` | Éditorial | `editor` | Oui | Oui |
| `/admin/presse/articles/[id]/edit` | Éditorial | `editor` | Oui | Oui |
| `/admin/presse/communiques/new` | Éditorial | `editor` | Oui | Oui |
| `/admin/presse/communiques/[id]/edit` | Éditorial | `editor` | Oui | Oui |
| `/admin/presse/communiques/[id]/preview` | Éditorial | `editor` | Oui | Oui |
| `/admin/presse/contacts/new` | Sensible presse (RGPD) | `admin` | Non | Oui |
| `/admin/presse/contacts/[id]/edit` | Sensible presse (RGPD) | `admin` | Non | Oui |
| `/admin/site-config` | Configuration | `admin` | Non | Oui |
| `/admin/spectacles` | Éditorial | `editor` | Oui | Oui |
| `/admin/spectacles/new` | Éditorial | `editor` | Oui | Oui |
| `/admin/spectacles/[id]` | Éditorial | `editor` | Oui | Oui |
| `/admin/spectacles/[id]/edit` | Éditorial | `editor` | Oui | Oui |
| `/admin/team` | Institutionnel / RH | `admin` | Non | Oui |
| `/admin/team/new` | Institutionnel / RH | `admin` | Non | Oui |
| `/admin/team/[id]/edit` | Institutionnel / RH | `admin` | Non | Oui |
| `/admin/users` | Sécurité / IAM | `admin` | Non | Oui |
| `/admin/users/invite` | Sécurité / IAM | `admin` | Non | Oui |

### Résumé par rôle minimum

| Rôle minimum | Domaines | Routes concernées |
| --- | --- | --- |
| `editor` | Éditorial | `/admin`, `/admin/spectacles/**`, `/admin/agenda/**`, `/admin/compagnie/**`, `/admin/lieux/**`, `/admin/presse` (articles + communiqués), `/admin/media/**` |
| `admin` | Sensible, institutionnel, configuration | `/admin/analytics`, `/admin/audit-logs`, `/admin/site-config`, `/admin/debug-auth`, `/admin/users/**`, `/admin/home/**`, `/admin/partners/**`, `/admin/team/**`, `/admin/presse/contacts/**` |

## Matrice tables, vues et buckets

| Ressource | Type | Lecture publique | Écriture backoffice | Rôle minimum écriture |
| --- | --- | --- | --- | --- |
| `profiles` | table | Oui | self-service + admin | `admin` (hors self-service) |
| `user_invitations` | table | Non | admin only | `admin` |
| `pending_invitations` | table | Non | admin only | `admin` |
| `media` | table | Oui | editor/admin | `editor` |
| `media_tags` | table | Oui | editor/admin | `editor` |
| `media_folders` | table | Oui | editor/admin | `editor` |
| `media_item_tags` | table | Oui | editor/admin | `editor` |
| `membres_equipe` | table | Oui si `active` | admin only | `admin` |
| `lieux` | table | Oui | editor/admin | `editor` |
| `spectacles` | table | Oui si public/published/archived | editor/admin | `editor` |
| `evenements` | table | Oui | editor/admin | `editor` |
| `partners` | table | Oui si `is_active` | admin only | `admin` |
| `articles_presse` | table | Oui si `published_at is not null` | editor/admin | `editor` |
| `communiques_presse` | table | Oui si `public=true` | editor/admin | `editor` |
| `contacts_presse` | table | Non | admin only | `admin` |
| `categories` | table | Oui si `is_active` | editor/admin | `editor` |
| `tags` | table | Oui | editor/admin | `editor` |
| `spectacles_categories` | table | Oui | editor/admin | `editor` |
| `spectacles_tags` | table | Oui | editor/admin | `editor` |
| `articles_categories` | table | Oui | editor/admin | `editor` |
| `articles_tags` | table | Oui | editor/admin | `editor` |
| `communiques_categories` | table | Oui selon parent | editor/admin | `editor` |
| `communiques_tags` | table | Oui selon parent | editor/admin | `editor` |
| `spectacles_membres_equipe` | table relation | Oui | admin only | `admin` |
| `spectacles_medias` | table relation | Oui | editor/admin | `editor` |
| `articles_medias` | table relation | Oui | editor/admin | `editor` |
| `communiques_medias` | table relation | Oui | editor/admin | `editor` |
| `compagnie_values` | table | Oui | editor/admin | `editor` |
| `compagnie_stats` | table | Oui | editor/admin | `editor` |
| `compagnie_presentation_sections` | table | Oui si `active` | editor/admin | `editor` |
| `home_hero_slides` | table | Oui si active/public | admin only | `admin` |
| `home_about_content` | table | Oui | admin only | `admin` |
| `content_versions` | table | Non | insert via triggers (auth), lecture/update/delete admin | `admin` |
| `seo_redirects` | table | Non | admin only | `admin` |
| `sitemap_entries` | table | Oui si `is_indexed` | admin only | `admin` |
| `analytics_events` | table | Non | insert public/authenticated validé, lecture admin | `admin` (lecture) |
| `abonnes_newsletter` | table | Non (select technique anti-doublon) | insert public/authenticated, update admin | `admin` |
| `messages_contact` | table | Non | insert public/authenticated, update/delete admin | `admin` |
| `configurations_site` | table | Oui partiellement (`display_toggle_%`) | admin only | `admin` |
| `logs_audit` | table | Non | triggers système, lecture admin | `admin` |
| `data_retention_config` | table | Non | admin only | `admin` |
| `data_retention_audit` | table | Non | lecture admin | `admin` |
| `messages_contact_admin` | vue | Non | service_role select | `admin` (serveur uniquement) |
| `analytics_summary` | vue | Non | service_role select | `admin` (serveur uniquement) |
| `analytics_summary_90d` | vue | Non | service_role select | `admin` (serveur uniquement) |
| `content_versions_detailed` | vue | Non | service_role select | `admin` (serveur uniquement) |
| `membres_equipe_admin` | vue | Non | service_role select | `admin` |
| `compagnie_presentation_sections_admin` | vue | Non | service_role select | `admin` |
| `partners_admin` | vue | Non | service_role select | `admin` |
| `data_retention_monitoring` | vue | Non | service_role select | `admin` (serveur uniquement) |
| `data_retention_stats` | vue | Non | service_role select | `admin` (serveur uniquement) |
| `data_retention_recent_audit` | vue | Non | service_role select | `admin` (serveur uniquement) |
| `storage.objects:medias` | bucket | Oui (lecture) | upload/update `editor/admin`, delete `admin` | `editor` (upload/update), `admin` (delete) |
| `storage.objects:backups` | bucket | Non | service_role only | n/a |
