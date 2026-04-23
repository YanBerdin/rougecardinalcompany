# TASK089 — Suppression de display_toggle_home_hero

**Statut** : ✅ Complété  
**Date** : 2026-04-23  
**Branche** : `develop`

---

## Résumé

`display_toggle_home_hero` a été implémenté par erreur dans le système de display toggles admin. Ce toggle permettait de masquer le Hero Banner depuis l'interface admin site-config. Sa suppression est motivée par le fait que le Hero Banner doit être **toujours visible**, conditionné uniquement par la présence de slides actifs — exactement comme avant l'introduction des toggles.

---

## Périmètre

### Fichiers modifiés (6 fichiers source)

| Fichier | Modification |
| --------- | ------------- |
| `components/features/admin/site-config/ToggleCard.tsx` | Suppression de `"display_toggle_home_hero": "Hero Banner"` dans `SECTION_NAMES` |
| `lib/actions/site-config-actions.ts` | Suppression de `"display_toggle_home_hero": ["/", ADMIN_PATH]` dans `pathMap` |
| `components/features/public-site/home/hero/HeroContainer.tsx` | Suppression de la gate toggle + suppression de l'import `fetchDisplayToggle` |
| `scripts/check-display-toggles.ts` | Suppression entrée hero dans `EXPECTED_TOGGLES` + label `9 au total` |
| `e2e/tests/admin/site-config/site-config.spec.ts` | Voir détail ci-dessous |
| `supabase/migrations/20260101190000_remove_display_toggle_home_hero.sql` | Nouvelle migration SQL |

### Fichiers de documentation créés/mis à jour

| Fichier | Modification |
| --------- | ------------- |
| `supabase/migrations/migrations.md` | Ajout entrée pour `20260101190000_remove_display_toggle_home_hero.sql` |
| `supabase/schemas/README.md` | Ajout dans "Mises à jour récentes (avril 2026)" |
| `memory-bank/tasks/tasks-completed/TASK089-remove-display-toggle-home-hero.md` | Ce fichier |

---

## Détail des modifications

### HeroContainer.tsx

**Avant :** `fetchDisplayToggle("display_toggle_home_hero")` utilisé comme gate — retournait `null` si désactivé.  
**Après :** Le composant appelle directement `fetchActiveHomeHeroSlides()` sans gate toggle. Le hero s'affiche toujours si des slides actifs existent.

### site-config.spec.ts

- `PUBLIC_SECTIONS` : suppression de l'entrée `display_toggle_home_hero`
- `ADM-CONFIG-001` : `toHaveCount(6)` → `toHaveCount(5)` (groupe Home passe de 6 à 5 toggles)
- `ADM-CONFIG-002` : test supprimé (désactivation hero → section absente)
- `ADM-CONFIG-003` : test supprimé (réactivation hero → section réapparaît)
- Imports supprimés : `HeroSlideFactory`, `supabaseAdmin` (devenus inutilisés)

### Migration SQL

**Fichier** : `supabase/migrations/20260101190000_remove_display_toggle_home_hero.sql`

```sql
delete from public.configurations_site
where key = 'display_toggle_home_hero';
```

Idempotente : 0 rows affected si la clé est déjà absente.

---

## État après suppression

- **DB** : 9 display toggles (5 home + 2 presse + 1 agenda + 1 contact)
- **Admin UI** : groupe "Page d'Accueil" affiche 5 toggles (sans Hero Banner)
- **Page publique `/`** : Hero Banner toujours visible si slides actifs existent
- **Migration `20260101180000`** : vérifie exactement 9 toggles — toujours correct après suppression

---

## Validation

- ✅ MIG-002 : SQL en minuscules conforme aux règles supabase-agent
- ✅ `scripts/check-display-toggles.ts` : 9 toggles attendus, compte à jour
- ✅ Migration appliquée cloud : `pnpm dlx supabase db push --include-all` (2026-04-23)
  - Note : `--include-all` requis car timestamp Jan 2026 antérieur à la dernière migration remote (Avr 2026)
