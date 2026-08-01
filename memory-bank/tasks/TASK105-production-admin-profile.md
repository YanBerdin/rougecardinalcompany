# TASK105 - Créer le profil admin manquant en production

**Status:** Pending  
**Added:** 2026-08-01  
**Updated:** 2026-08-01

## Original Request

Point restant, indépendant, identifié à la fin de la session de restauration des GRANTs `service_role` :
aucun enregistrement `public.profiles` avec `role = 'admin'` n'existe sur le projet Supabase de production
`hjmwctzqljfszuwkaadd`.

## Thought Process

Le diagnostic `SUPABASE_ENV=production pnpm run diagnose:admin-views` remonte
`❌ Profil admin introuvable` (`Cannot coerce the result to a single JSON object` = 0 ligne retournée),
alors que les deux autres contrôles du script passent :

- RPC `communiques_presse_dashboard()` ✅
- Vue `analytics_summary` ✅ 3 lignes

Sur staging (`yvtrlvmbofklefxcxrzv`) le même script affiche `✅ Administrateur — role: admin`.

Il ne s'agit **pas** d'un problème de privilèges : la restauration des GRANTs `service_role`
(migration `20260801134257_restore_service_role_baseline_grants.sql`) a supprimé le
`permission denied for table profiles` qui masquait initialement le diagnostic. Ce qui reste est
un écart de **données**, pas de schéma.

Point de vigilance : la source de vérité pour l'autorisation est `auth.users.raw_app_meta_data.role`
(JWT `app_metadata.role`), `public.profiles.role` servant de miroir applicatif avec fallback.
Les deux doivent être cohérents, sinon `has_min_role()` / `is_admin()` peuvent diverger entre le
chemin JWT et le chemin base.

## Implementation Plan

- Lister les comptes existants dans `auth.users` en production et identifier le compte administrateur légitime
- Vérifier `raw_app_meta_data->>'role'` de ce compte (doit valoir `admin`)
- Vérifier la présence et le contenu de la ligne `public.profiles` correspondante
- Créer ou corriger la ligne `profiles` (`role = 'admin'`), en réutilisant `scripts/create-admin-user.ts`
  ou `scripts/seed-admin.ts` avec `SUPABASE_ENV=production` plutôt qu'un INSERT manuel
- Vérifier que le trigger de synchronisation `profiles` (`supabase/schemas/05_profiles_auto_sync.sql`)
  n'a pas été contourné, et comprendre pourquoi la ligne est absente (compte créé avant le trigger ?
  suppression manuelle ?)
- Valider avec `SUPABASE_ENV=production pnpm run diagnose:admin-views` → `✅ Tout est opérationnel`
- Valider un accès réel au backoffice de production avec ce compte

## Progress Tracking

**Overall Status:** Not Started - 0%

### Subtasks

| ID  | Description                                                       | Status      | Updated    | Notes                                          |
| --- | ----------------------------------------------------------------- | ----------- | ---------- | ---------------------------------------------- |
| 1.1 | Inventorier `auth.users` en production                            | Not Started | 2026-08-01 |                                                |
| 1.2 | Vérifier `raw_app_meta_data.role` du compte admin                 | Not Started | 2026-08-01 | Source de vérité pour l'autorisation           |
| 1.3 | Créer / corriger la ligne `public.profiles` avec `role = 'admin'` | Not Started | 2026-08-01 | Passer par les scripts existants               |
| 1.4 | Identifier la cause de l'absence (trigger contourné ?)            | Not Started | 2026-08-01 | Éviter que le cas se reproduise                |
| 1.5 | Valider via `diagnose:admin-views` et un login réel               | Not Started | 2026-08-01 |                                                |

## Progress Log

### 2026-08-01

- Tâche créée à l'issue de la session de restauration des GRANTs `service_role`
- Constat confirmé après le fix des privilèges : l'erreur n'est plus `permission denied for table profiles`
  mais bien `Cannot coerce the result to a single JSON object`, soit zéro ligne admin en base
- Staging est sain sur ce point, seule la production est concernée
