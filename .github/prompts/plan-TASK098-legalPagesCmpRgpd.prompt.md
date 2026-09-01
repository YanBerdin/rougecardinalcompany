# Plan : TASK098 — Pages légales + Conformité RGPD/Cookies

**TL;DR** : 3 pages légales sont liées dans le footer mais renvoient 404. La `PageViewTracker` stocke l'IP brute sans anonymisation. Approche : créer les 3 pages statiques + anonymiser l'IP dans la fonction SQL (ce qui qualifie l'analytics en "intérêt légitime" CNIL) + bandeau cookie informatif non-bloquant.

---

## Phase 1 — Pages légales statiques *(P0 — LCEN obligatoire)*

1. Créer `app/(marketing)/mentions-legales/page.tsx` — Server Component, `export const metadata`, contenu adapté du brouillon `doc/mentions-cookies-rgpd.md`, placeholders `[À REMPLIR]` pour SIRET/RCS/hébergeur que seul le client peut fournir
2. Créer `app/(marketing)/politique-confidentialite/page.tsx` — données collectées (IP anonymisée, user-agent, session sessionStorage, formulaires), bases légales, durées de rétention depuis `memory-bank/RGPD_DATA_RETENTION_POLICY.md` (90j analytics, 1 an contact, 90j newsletter), droits RGPD, contact `privacy@rougecardinalcompany.fr`
3. Créer `app/(marketing)/cookies/page.tsx` — liste `rc_session_id` (sessionStorage, analytics interne), `next-theme` (localStorage, thème), catégories essentiels/analytics, exemption CNIL mentionnée

---

## Phase 2 — Anonymisation IP analytics *(P0 — prérequis exemption CNIL 2020-091)*

4. Modifier `supabase/schemas/13_analytics_events.sql` — dans `track_analytics_event()` : `regexp_replace(ip, '\d+\.\d+$', '0.0')` pour IPv4, préfixe /64 pour IPv6. Mettre à jour le commentaire de colonne. *Dépend de rien.*
5. Créer `supabase/migrations/YYYYMMDDHHMMSS_anonymize_analytics_ip.sql` — recréation de la fonction + mise à jour du commentaire colonne. *Dépend du step 4.*

**Pourquoi c'est un P0** : tant que l'IP brute est stockée, la base légale "intérêt légitime" est fragilisée pour l'analytics. L'anonymisation débloque l'exemption CNIL et rend le bandeau non-bloquant suffisant.

---

## Phase 3 — Bandeau cookie informatif *(P1 — transparence)*

6. Créer `components/features/analytics/CookieBanner.tsx` — Client Component, `role="dialog"`, `aria-label`, bouton « Compris », stocke `rc_cookie_notice_seen=true` dans `localStorage`, se masque si déjà vu, focus visible (WCAG 2.2 AA). **Non-bloquant** : le `PageViewTracker` n'est pas conditionné.
7. Ajouter `<CookieBanner />` dans `app/(marketing)/layout.tsx` après `<Footer />`. *Dépend du step 6.*

---

## Fichiers concernés

| Fichier | Action |
|---|---|
| `app/(marketing)/mentions-legales/page.tsx` | Créer |
| `app/(marketing)/politique-confidentialite/page.tsx` | Créer |
| `app/(marketing)/cookies/page.tsx` | Créer |
| `components/features/analytics/CookieBanner.tsx` | Créer |
| `app/(marketing)/layout.tsx` | Modifier — ajouter `<CookieBanner />` |
| `supabase/schemas/13_analytics_events.sql` | Modifier — anonymisation IP |
| `supabase/migrations/YYYYMMDDHHMMSS_anonymize_analytics_ip.sql` | Créer |

---

## Vérification

1. `pnpm lint && pnpm build` — 0 erreur TypeScript/ESLint
2. Naviguer `/mentions-legales`, `/politique-confidentialite`, `/cookies` → rendu (plus de 404)
3. SQL : vérifier que `track_analytics_event()` stocke `192.168.0.0` et non `192.168.1.23`
4. Bandeau : affiché → « Compris » → masqué → rechargement → toujours absent (localStorage)

---

## Décisions

- **Exemption CNIL** : IP tronquée + sessionStorage volatile + 0 tiers → bandeau informatif non-bloquant suffisant, pas de CMP complet.
- **Contenu légal** : placeholders `[À REMPLIR]` balisés pour SIRET, RCS, hébergeur — données que seul le client peut fournir.
- **Pas de CMP tiers** : 0 Google Analytics, 0 Hotjar → inutile d'intégrer Axeptio/OneTrust.

---

## Hors périmètre

- CMP tiers bloquant (pas de traceurs tiers sur le site)
- Interface admin pour éditer les pages légales
- Traduction en anglais
