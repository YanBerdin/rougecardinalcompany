# TASK098 — Pages légales + Conformité RGPD/Cookies

**Status:** Completed ✅  
**Added:** 2026-06-13  
**Updated:** 2026-06-13

## Original Request

3 pages légales sont liées dans le footer mais renvoient 404 : `/mentions-legales`, `/politique-confidentialite`, `/cookies`. De plus, la collecte analytics (`PageViewTracker.tsx`) enregistre l'IP brute dans `analytics_events.ip_address` sans anonymisation, ce qui fragilise la base légale « intérêt légitime » revendiquée. Créer les 3 pages statiques, anonymiser l'IP dans la fonction SQL `track_analytics_event()` pour valider l'exemption CNIL 2020-091, et ajouter un bandeau cookie informatif non-bloquant.

## Thought Process

- Audit de conformité RGPD mené le 2026-06-13. Ce qui est déjà conforme : formulaire contact (consent + consent_at enforced par RLS), newsletter (même pattern), purge automatique via Edge Function `scheduled-cleanup` (quotidienne 2h UTC), `RGPD_DATA_RETENTION_POLICY.md` complet.
- Lacunes identifiées : (1) 3 pages légales absentes (obligation LCEN art. L.6), (2) IP stockée brute dans `analytics_events` malgré un commentaire SQL indiquant « anonymisée », (3) aucun bandeau cookie / CMP.
- Décision : pas de CMP tiers (OneTrust/Axeptio) car 0 traceurs tiers (0 Google Analytics, 0 Hotjar). L'exemption CNIL délibération 2020-091 s'applique si : IP tronquée (≥ 2 derniers octets), session ID volatile (sessionStorage ✅), usage strictement interne. → bandeau informatif non-bloquant suffisant.
- Contenu légal (SIRET, RCS, hébergeur) fourni avec placeholders `[À REMPLIR]` — données que seul le client peut communiquer.

## Implementation Plan `.github/prompts/plan-TASK098-legalPagesCmpRgpd.prompt.md`

- [x] Phase 1 — Pages légales statiques (P0 — LCEN obligatoire)
  - [x] 1.1 Créer `app/(marketing)/mentions-legales/page.tsx`
  - [x] 1.2 Créer `app/(marketing)/politique-confidentialite/page.tsx`
  - [x] 1.3 Créer `app/(marketing)/cookies/page.tsx`
- [x] Phase 2 — Anonymisation IP analytics (P0 — prérequis exemption CNIL)
  - [x] 2.1 Modifier `supabase/schemas/13_analytics_events.sql` — anonymiser IP dans `track_analytics_event()`
  - [x] 2.2 Créer migration `supabase/migrations/20260613120000_anonymize_analytics_ip.sql`
- [x] Phase 3 — Bandeau cookie informatif (P1 — transparence)
  - [x] 3.1 Créer `components/features/analytics/CookieBanner.tsx`
  - [x] 3.2 Ajouter `<CookieBanner />` dans `app/(marketing)/layout.tsx`

## Fichiers concernés

| Fichier | Action | Détail |
| --- | --- | --- |
| `app/(marketing)/mentions-legales/page.tsx` | Créer | Server Component statique, métadonnées SEO, contenu tiré de `doc/mentions-cookies-rgpd.md`, placeholders `[À REMPLIR]` |
| `app/(marketing)/politique-confidentialite/page.tsx` | Créer | Données collectées (IP anonymisée, user-agent, session sessionStorage, formulaires), bases légales, durées rétention (90j analytics, 1 an contact, 90j newsletter), droits RGPD, `privacy@rougecardinalcompany.fr` |
| `app/(marketing)/cookies/page.tsx` | Créer | Liste `rc_session_id` (sessionStorage), `next-theme` (localStorage), catégories essentiels/analytics, exemption CNIL mentionnée |
| `components/features/analytics/CookieBanner.tsx` | Créer | Client Component, `role="dialog"`, `aria-label`, bouton « Compris », `localStorage.setItem("rc_cookie_notice_seen", "true")`, se masque si déjà vu, WCAG 2.2 AA |
| `app/(marketing)/layout.tsx` | Modifier | Ajouter `<CookieBanner />` après `<Footer />` |
| `supabase/schemas/13_analytics_events.sql` | Modifier | IPv4 : `regexp_replace(ip, '\d+\.\d+$', '0.0')`, IPv6 : préfixe /64, mise à jour commentaire colonne |
| `supabase/migrations/YYYYMMDDHHMMSS_anonymize_analytics_ip.sql` | Créer | Recréation fonction + `COMMENT ON COLUMN analytics_events.ip_address` |

## Décisions

- **Exemption CNIL délibération 2020-091** : justifiée si IP tronquée (2 octets), sessionStorage (session uniquement), usage interne uniquement, pas de tiers. Pas de consentement préalable requis → bandeau non-bloquant.
- **Pas de CMP tiers** : 0 Google Analytics, 0 Hotjar → OneTrust/Axeptio inutiles.
- **Bandeau informatif** (non-bloquant) — le `PageViewTracker` n'est PAS conditionné au clic « Compris ».
- **Pages légales en français uniquement** — site de compagnie de théâtre locale.
- **Priorité implémentation** : Phase 2 (IP anonymisation, P0 technique) → Phase 1 (pages légales, P0 légal) → Phase 3 (bandeau, P1).

## Hors Périmètre

- CMP tiers bloquant (OneTrust, Axeptio) — aucun traceur tiers présent
- Interface admin pour éditer les pages légales
- Modification newsletter / formulaire contact (consentement déjà implémenté)
- Traduction en anglais
- Upload vidéo ou gestion médias

## Références

- `doc/mentions-cookies-rgpd.md` — brouillon contenu pages légales
- `memory-bank/RGPD_DATA_RETENTION_POLICY.md` — durées de rétention officielles
- `supabase/schemas/13_analytics_events.sql` — fonction `track_analytics_event()` à modifier
- `components/features/analytics/PageViewTracker.tsx` — collecte analytics existante
- `app/(marketing)/layout.tsx` — layout à modifier pour le bandeau
- `.github/prompts/plan-TASK098-legalPagesCmpRgpd.prompt.md` — plan détaillé de la tâche

## Vérification

1. `pnpm lint && pnpm build` — 0 erreur TypeScript/ESLint
2. Naviguer `/mentions-legales`, `/politique-confidentialite`, `/cookies` → pages rendues (plus de 404)
3. SQL : vérifier que `track_analytics_event()` stocke `192.168.0.0` et non `192.168.1.23`
4. Bandeau affiché → clic « Compris » → masqué → rechargement → toujours absent (localStorage)
5. WCAG : focus visible sur le bouton, `role="dialog"` présent

## Progress Log

### 2026-06-13

- Audit RGPD mené — 3 lacunes identifiées (404 pages légales, IP brute, absence bandeau)
- Plan rédigé et sauvegardé dans `.github/prompts/plan-TASK098-legalPagesCmpRgpd.prompt.md`
- **Phase 2** : `supabase/schemas/13_analytics_events.sql` mis à jour — IPv4 tronqué via `regexp_replace`, IPv6 préfixe /64, commentaire colonne corrigé. Migration `20260613120000_anonymize_analytics_ip.sql` créée.
- **Phase 1** : 3 pages légales créées — `/mentions-legales`, `/politique-confidentialite`, `/cookies` (Server Components statiques, metadata SEO, contenu conforme RGPD, placeholders `[À REMPLIR]` pour SIRET/hébergeur).
- **Phase 3** : `CookieBanner.tsx` créé avec `useSyncExternalStore` (pattern conforme règle `react-hooks/set-state-in-effect`), intégré dans `app/(marketing)/layout.tsx`.
- `pnpm build` : ✅ exit 0 — 3 nouvelles routes compilées (`/cookies`, `/mentions-legales`, `/politique-confidentialite`).
