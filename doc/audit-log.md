# Audit Log - traçabilité immuable (couche 7)

L'audit log est un système de traçabilité automatique qui enregistre toutes les opérations de modification (INSERT, UPDATE, DELETE) sur les tables critiques de l'application.

Le système trace automatiquement **toute modification de données** (qui, quoi, quand, depuis où) sur les tables critiques. Il sert à :

| Besoin | Ce qu'il résout |
| --- | --- |
| Sécurité | Qui a modifié quoi, depuis quelle IP, avec quel navigateur |
| RGPD | Preuve des actions sur données personnelles (newsletter, contacts) |
| Débogage | Historique complet avec `old_values`/`new_values` en JSONB |
| Audit interne | Contrôle des actions des administrateurs et éditeurs |
| Détection d'anomalies | Identifier des patterns suspects ou accès non autorisés |

## Fonctionnement en 4 couches

1. **Trigger PostgreSQL** (`audit_trigger()`, `SECURITY DEFINER`) — déclenché automatiquement `AFTER INSERT OR UPDATE OR DELETE` sur 27 tables. Capture `user_id`, `action`, `table_name`, `record_id`, `old_values`/`new_values` (JSONB), `ip_address`, `user_agent`.
2. **Intégrité du log** — `INSERT` direct dans `logs_audit` bloqué par RLS (aucune policy INSERT utilisateur). Seul le trigger `SECURITY DEFINER` peut écrire → impossibilité de falsifier les logs.
3. **RPC PostgreSQL** (`get_audit_logs_with_email`) — résout les emails depuis `auth.users` (inaccessible directement). Gère filtres, pagination et recherche côté DB.
4. **Rétention RGPD** — colonne `expires_at` (90 jours) + fonction `cleanup_expired_audit_logs()` planifiable via GitHub Actions.

```bash
Action admin (ex. UPDATE spectacle)
        ↓
  Trigger trg_audit (AFTER INSERT|UPDATE|DELETE)
        ↓
  audit_trigger() — SECURITY DEFINER
  → capture user_id, action, table_name, record_id,
    old_values, new_values, ip_address, user_agent
        ↓
  INSERT dans logs_audit (bloqué pour les users directs)
        ↓
  Interface /admin/audit-logs
  → RPC get_audit_logs_with_email (résolution email)
  → Filtres, pagination, export CSV
```

**27 tables trackées**, rétention automatique à 90 jours (RGPD) :

`profiles`, `medias`, `membres_equipe`, `lieux`, `spectacles`, `evenements`, `articles_presse`, `partners`, `abonnes_newsletter`, `messages_contact`, `configurations_site`, `communiques_presse`, `contacts_presse`, `home_about_content`, `user_invitations`, `pending_invitations`, `home_hero_slides`, `compagnie_presentation_sections`, `compagnie_values`, `compagnie_stats`, `categories`, `tags`, `media_folders`, `media_tags`, `articles_tags`, `communiques_tags`, `media_item_tags`, `spectacles_tags`.

**Interface admin (`/admin/audit-logs`) :** filtres multiples (action, table, utilisateur, plage de dates, recherche libre), pagination, modal détails JSON, export CSV jusqu'à 10 000 entrées.

**Sécurité clé** : aucun utilisateur ne peut écrire directement dans `logs_audit` (pas de policy INSERT RLS). Seul le trigger `SECURITY DEFINER` peut le faire → logs inviolables.
