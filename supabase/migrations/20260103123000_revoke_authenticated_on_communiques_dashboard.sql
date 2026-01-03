-- Migration: revoke SELECT on communiques_presse_dashboard from authenticated
-- Date: 2026-01-03 12:30:00 UTC
-- Objectif: supprimer un grant historique qui autorisait le rôle `authenticated`
--           à lire la vue admin `communiques_presse_dashboard`.
-- Notes: non-destructive (revoke); safe to apply in production but verify
--        that no legitimate consumer relies on this grant.

begin;

revoke select on public.communiques_presse_dashboard from authenticated;

commit;
