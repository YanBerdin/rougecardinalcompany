# TASK103 - Retirer le grant `authenticated` résiduel sur `cleanup_expired_audit_logs()`

**Status:** Pending
**Added:** 2026-07-15
**Updated:** 2026-07-15

## Original Request

Suite à la correction de l'alerte advisor Supabase "Signed-In Users Can Execute SECURITY DEFINER Function" sur `public.audit_trigger()` (voir migration `20260715120000_revoke_audit_trigger_execute_from_authenticated.sql`), un finding connexe a été identifié mais volontairement laissé de côté pour traitement ultérieur : `public.cleanup_expired_audit_logs()` présente le même profil de risque.

## Thought Process

- `public.cleanup_expired_audit_logs()` est `SECURITY DEFINER` et dispose d'un `grant execute ... to authenticated` explicite dans `supabase/schemas/20_audit_logs_retention.sql` (commentaire d'origine : "for manual cleanup via admin UI").
- Contrairement à `audit_trigger()`, cette fonction **ne retourne pas** le pseudo-type `trigger` — elle est directement invocable via `/rest/v1/rpc/cleanup_expired_audit_logs` par **n'importe quel utilisateur authentifié**, y compris un simple rôle `user` sans droits admin.
- Aucune vérification `is_admin()` interne dans le corps de la fonction (elle fait uniquement `delete from public.logs_audit where expires_at < now()`).
- Aucun appel trouvé dans le code applicatif (`lib/`, `app/`) ni dans un workflow GitHub Actions (`.github/workflows/*.yml`) — le grant semble être un vestige non exploité en pratique (la purge RGPD documentée comme "planifiable via GitHub Actions" n'a jamais été câblée).
- Ses 3 fonctions sœurs de nettoyage (`cleanup_expired_data`, `cleanup_old_contact_messages`, `cleanup_unsubscribed_newsletter`) sont toutes restreintes à `service_role` uniquement — `cleanup_expired_audit_logs` est la seule incohérente avec ce pattern.
- Risque réel : faible (suppression de lignes déjà expirées uniquement, pas de fuite de données), mais viole le principe du moindre privilège et deviendra probablement la prochaine alerte advisor.

## Implementation Plan

- [ ] Vérifier une dernière fois qu'aucun appel `.rpc('cleanup_expired_audit_logs')` n'existe côté client/app avant de retirer l'accès `authenticated`.
- [ ] Décider si une purge automatique RGPD (cron) doit réellement être mise en place via GitHub Actions (`service_role` key) — si oui, l'implémenter à cette occasion.
- [ ] Migration : `revoke execute on function public.cleanup_expired_audit_logs() from authenticated;` + `grant execute on function public.cleanup_expired_audit_logs() to service_role;` (aligné sur le pattern des 3 fonctions sœurs).
- [ ] Mettre à jour le schéma déclaratif `supabase/schemas/20_audit_logs_retention.sql` (grant + commentaire Security Model).
- [ ] Appliquer sur staging puis sur le projet Supabase client, vérifier avec `get_advisors` que le finding ne réapparaît pas.
- [ ] Documenter dans `supabase/migrations/migrations.md`.

## Progress Tracking

**Overall Status:** Not Started - 0%

### Subtasks

| ID  | Description | Status | Updated | Notes |
| --- | --- | --- | --- | --- |
| 103.1 | Vérifier absence d'appel applicatif au RPC | Not Started | 2026-07-15 | — |
| 103.2 | Décider du besoin réel d'un cron RGPD | Not Started | 2026-07-15 | — |
| 103.3 | Écrire + appliquer la migration revoke/grant | Not Started | 2026-07-15 | — |
| 103.4 | Synchroniser schéma déclaratif | Not Started | 2026-07-15 | — |
| 103.5 | Vérifier advisor + documenter | Not Started | 2026-07-15 | — |

## Progress Log

### 2026-07-15

- Tâche créée suite à l'audit de l'alerte `audit_trigger()` sur le projet Supabase du client (`hjmwctzqljfszuwkaadd`). Finding connexe identifié mais non corrigé dans l'immédiat, planifié ici.
