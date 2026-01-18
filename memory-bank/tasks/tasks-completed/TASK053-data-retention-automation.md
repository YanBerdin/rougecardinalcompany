# TASK053 - Data Retention Automation

**Status:** ✅ completed
**Priority:** P1 (Important)
**Added:** 2026-01-05
**Completed:** 2026-01-18

## Objectif

Automatiser les règles de rétention pour les données sensibles/volumineuses (newsletter unsubscribes, audit logs, contact messages) afin de rester conforme RGPD et alléger la base de données.

## Implémentation Complète

### Fichiers Créés

| Catégorie | Fichier | Description |
| ----------- | --------- | ------------- |
| SQL Schema | `supabase/schemas/21_data_retention_tables.sql` | Tables config + audit |
| SQL Schema | `supabase/schemas/22_data_retention_functions.sql` | 4 fonctions SECURITY DEFINER |
| SQL Schema | `supabase/schemas/41_views_retention.sql` | 2 vues monitoring |
| DAL | `lib/dal/data-retention.ts` | 12 fonctions DAL |
| Schemas | `lib/schemas/data-retention.ts` | 8 schemas Zod |
| Edge Function | `supabase/functions/scheduled-cleanup/index.ts` | Cron job quotidien |
| Test | `scripts/test-data-retention.ts` | Suite 8 tests |
| Doc | `doc/rgpd-data-retention-policy.md` | Documentation RGPD |

### Migration Générée

**Fichier**: `20260117234007_task053_data_retention.sql` (698 lignes)

### Tests Locaux

**Résultat**: ✅ ALL 8 TESTS PASSED

| Test | Description | Statut |
| ------ | ------------- | -------- |
| 1 | Configuration tables | ✅ 5 tables configurées |
| 2 | Test data insertion | ✅ Logs audit insérés |
| 3 | Manual cleanup | ✅ 2 rows deleted, 1ms |
| 4 | Audit trail | ✅ Logging complet |
| 5 | Health check | ✅ 4 tables never_run |
| 6 | Monitoring views | ✅ 5 tables visibles |
| 7 | Specific functions | ✅ Newsletter + contact |
| 8 | Configuration updates | ✅ Toggle enabled |

### Corrections Appliquées

1. **SQL ambiguity fix**: `audit.table_name` dans `check_retention_health()`
2. **Test timestamps**: `expires_at` 95/100 jours (pas 5/10) pour tester suppression
3. **Config table name**: `abonnes_newsletter` (pas `newsletter_subscriptions`)
4. **Added config**: `logs_audit` pour validation test

### Tables Configurées

| Table | Rétention | Colonne Date | Statut |
| ------- | ----------- | ------------- | -------- |
| logs_audit | 90j | expires_at | ✅ |
| abonnes_newsletter | 90j | unsubscribed_at | ✅ |
| messages_contact | 365j | created_at | ✅ |
| analytics_events | 90j | created_at | ✅ |
| data_retention_audit | 365j | executed_at | ✅ |

## Déploiement Production (Pending)

```bash
# 1. Deploy Edge Function
pnpm dlx supabase functions deploy scheduled-cleanup

# 2. Configure CRON_SECRET in Supabase Dashboard
openssl rand -base64 32

# 3. Configure cron schedule: 0 2 * * * (daily 2:00 AM UTC)
```

## Checklist Complète

- [x] Lister les tables concernées et champs de date
- [x] Définir politiques par table (90j / 365j / configurable)
- [x] Implémenter Edge Function
- [x] Ajouter tests/alertes en cas d'échec
- [x] Documentation RGPD complète
- [x] Tests locaux passés (8/8)
- [ ] Deploy Edge Function production
- [ ] Configurer CRON_SECRET
- [ ] Vérifier première exécution
