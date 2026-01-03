# Plan TASK030 - Display Toggles Epic Alignment

## Objectif

Aligner TASK030 Display Toggles avec l'Epic 14.7-back-office.md :
- Supprimer les toggles compagnie (non présents dans l'Epic)
- Ajouter les toggles Epic manquants (À la Une, Partenaires, Newsletter ×3)
- Implémenter le formulaire newsletter inline sur Agenda
- Ajouter le toggle newsletter sur Contact

---

## État actuel de la base de données

### ⚠️ CORRECTION (1er janvier 2026)

**Erreur identifiée** : Le plan initial mentionnait 3 toggles compagnie à supprimer, mais ces clés **n'ont jamais été créées** par le seed initial `20260101160100_seed_display_toggles.sql`.

**Clés supposées à SUPPRIMER (❌ ERREUR - n'ont jamais existé)** :
| Key | Status |
|-----|--------|
| ~~`display_toggle_compagnie_values`~~ | ❌ Jamais créé |
| ~~`display_toggle_compagnie_presentation`~~ | ❌ Jamais créé |
| ~~`display_toggle_compagnie_stats`~~ | ❌ Jamais créé |

**Impact** : La migration cleanup `20260101170000` contenait des DELETE pour ces clés inexistantes (0 rows affected, aucun impact fonctionnel).

**Corrections appliquées** :
1. Migration `20260101180000_fix_cleanup_display_toggles_no_compagnie.sql` (documentation + verification)
2. Fix UI admin (1er janvier 2026) : Ajout des sections Agenda et Contact manquantes dans l'interface Display Toggles
   - `types.ts` : Props `agendaToggles` + `contactToggles`
   - `DisplayTogglesContainer.tsx` : Fetch des categories `agenda_display` et `contact_display`
   - `DisplayTogglesView.tsx` : Ajout des sections "Page Agenda" et "Page Contact"

### Toggles existants à CONSERVER (4)
| Key | Section |
|-----|---------|
| `display_toggle_home_hero` | Hero homepage |
| `display_toggle_home_about` | À propos homepage |
| `display_toggle_home_spectacles` | Prochains Spectacles homepage |
| ~~`display_toggle_presse_articles`~~ | ⚠️ Renommé en `display_toggle_media_kit` (1er janvier 2026) |

### ⚠️ CORRECTION Presse Toggles (1er janvier 2026)

**Contexte** : Confusion initiale sur la fonction du toggle `display_toggle_presse_articles`.

**Problème identifié** :
- Le toggle `display_toggle_presse_articles` contrôlait la section **Kit Média**, pas les articles/communiqués
- Besoin d'un toggle séparé pour la section **Communiqués de Presse**

**Solution appliquée** :
1. Migration `20260101220000_fix_presse_toggles.sql` : Transformation des clés legacy
   - `public:presse:media_kit_enabled` → `display_toggle_media_kit` (contrôle Kit Média)
   - `public:presse:communiques_enabled` → `display_toggle_presse_articles` (contrôle Communiqués)
2. Fix `PresseView.tsx` : Masquage complet des sections quand toggles désactivés
3. Scripts utilitaires créés :
   - `scripts/check-presse-toggles.ts` — Vérification de l'état des toggles
   - `scripts/toggle-presse.ts` — Activation/désactivation rapide pour tests

**Toggles Presse finaux** (2 au lieu de 1) :
| Key | Description | Category |
|-----|-------------|----------|
| `display_toggle_media_kit` | Afficher la section Kit Média | `presse_display` |
| `display_toggle_presse_articles` | Afficher la section Communiqués de Presse | `presse_display` |

### Toggles à CRÉER (5)
| Key | Description | Category |
|-----|-------------|----------|
| `display_toggle_home_a_la_une` | À la Une (actualités presse) | `home_display` |
| `display_toggle_home_partners` | Partenaires homepage | `home_display` |
| `display_toggle_home_newsletter` | Newsletter homepage | `home_display` |
| `display_toggle_agenda_newsletter` | Newsletter CTA Agenda | `agenda_display` |
| `display_toggle_contact_newsletter` | Newsletter Contact | `contact_display` |

---

## Plan d'exécution

### Phase 1 : Migration Base de Données

**Fichier** : `supabase/migrations/20260101170000_cleanup_and_add_epic_toggles.sql`

```sql
-- Migration: Cleanup compagnie toggles + Add Epic-aligned toggles
-- Purpose: Align TASK030 with Epic 14.7-back-office.md

-- 1. DELETE compagnie toggles (not in Epic)
delete from public.configurations_site 
where key in (
  'display_toggle_compagnie_values',
  'display_toggle_compagnie_presentation',
  'display_toggle_compagnie_stats'
);

-- 2. INSERT Epic-aligned toggles
insert into public.configurations_site (key, value, description, category) values
  ('display_toggle_home_a_la_une', '{"enabled": true, "max_items": 3}'::jsonb, 'Afficher la section À la Une (actualités presse)', 'home_display'),
  ('display_toggle_home_partners', '{"enabled": true}'::jsonb, 'Afficher la section Nos Partenaires', 'home_display'),
  ('display_toggle_home_newsletter', '{"enabled": true}'::jsonb, 'Afficher la section Newsletter (homepage)', 'home_display'),
  ('display_toggle_agenda_newsletter', '{"enabled": true}'::jsonb, 'Afficher le formulaire Newsletter (Agenda)', 'agenda_display'),
  ('display_toggle_contact_newsletter', '{"enabled": true}'::jsonb, 'Afficher la section Newsletter (Contact)', 'contact_display')
on conflict (key) do nothing;
```

**Commandes** :
```bash
# Appliquer localement
pnpm dlx supabase db reset

# Appliquer sur Cloud
pnpm dlx supabase db push
```

---

### Phase 2 : Revert CompagnieContainer

**Action** : ✅ FAIT - `git checkout HEAD -- components/features/public-site/compagnie/CompagnieContainer.tsx`

---

### Phase 3 : Corriger NewsContainer

**Fichier** : `components/features/public-site/home/news/NewsContainer.tsx`

**Modification** : Ligne 11
```diff
- const toggleResult = await fetchDisplayToggle("public:home:news");
+ const toggleResult = await fetchDisplayToggle("display_toggle_home_a_la_une");
```

---

### Phase 4 : Vérifier PartnersContainer

**Fichier** : `components/features/public-site/home/partners/PartnersContainer.tsx`

**Vérifier** : Utilise `display_toggle_home_partners` ? Sinon corriger.

---

### Phase 5 : Vérifier NewsletterContainer

**Fichier** : `components/features/public-site/home/newsletter/NewsletterContainer.tsx`

**Vérifier** : Utilise `display_toggle_home_newsletter` ? Sinon corriger.

---

### Phase 6 : Implémenter Agenda Newsletter Inline

#### 6.1 AgendaContainer.tsx
**Ajouter** : Fetch du toggle `display_toggle_agenda_newsletter`

```typescript
const newsletterToggleResult = await fetchDisplayToggle("display_toggle_agenda_newsletter");
const showNewsletterSection = newsletterToggleResult.success && 
  newsletterToggleResult.data?.value?.enabled !== false;
```

**Passer** : `showNewsletterSection` à AgendaClientContainer

#### 6.2 AgendaClientContainer.tsx
**Ajouter** : Hook `useNewsletterSubscribe({ source: "agenda" })`

```typescript
const { 
  email, setEmail, 
  handleSubmit, 
  status, message 
} = useNewsletterSubscribe({ source: "agenda" });
```

**Passer** : Props newsletter à AgendaView

#### 6.3 AgendaView.tsx
**Remplacer** : Section CTA "Ne Manquez Rien" (lignes 205-226)

```tsx
{showNewsletterSection && (
  <section className="py-16 bg-hero-gradient">
    <div className="container max-w-2xl text-center">
      <h2 className="text-2xl font-bold text-white mb-4">
        Ne Manquez Rien
      </h2>
      <p className="text-white/80 mb-6">
        Inscrivez-vous pour recevoir les dernières actualités
      </p>
      <NewsletterForm
        email={email}
        setEmail={setEmail}
        handleSubmit={handleSubmit}
        status={status}
        message={message}
      />
    </div>
  </section>
)}
```

---

### Phase 7 : Implémenter Contact Newsletter Toggle

#### 7.1 ContactServerGate.tsx
**Ajouter** : Fetch du toggle `display_toggle_contact_newsletter`

```typescript
const newsletterToggleResult = await fetchDisplayToggle("display_toggle_contact_newsletter");
const showNewsletter = newsletterToggleResult.success && 
  newsletterToggleResult.data?.value?.enabled !== false;
```

**Passer** : `showNewsletter` prop à ContactPageView

#### 7.2 ContactPageView.tsx
**Ajouter** : Prop interface

```typescript
interface ContactPageViewProps {
  // ...existing props
  showNewsletter?: boolean;
}
```

**Conditionner** : Card Newsletter (lignes 438-482)

```tsx
{showNewsletter && (
  <Card className="...">
    {/* Newsletter content */}
  </Card>
)}
```

---

### Phase 8 : Mettre à jour le fichier seed

**Fichier** : `supabase/migrations/20260101160100_seed_display_toggles.sql`

**Actions** :
1. Supprimer les INSERT compagnie (lignes 93-107)
2. Supprimer les commentaires compagnie (lignes 23-25)
3. Ajouter les 5 nouveaux toggles Epic

---

### Phase 9 : Nettoyage des fichiers TypeScript (clés public:compagnie:*)

Les anciennes clés `public:compagnie:*` sont référencées dans 2 fichiers à nettoyer :

#### 9.1 site-config-actions.ts
**Fichier** : `lib/actions/site-config-actions.ts`

**Action** : Supprimer les entrées compagnie du pathMap (lignes 51-52)
```diff
  const pathMap: Record<string, string[]> = {
      "public:home:newsletter": ["/"],
      "public:home:partners": ["/"],
      "public:home:spectacles": ["/"],
      "public:home:news": ["/"],
-     "public:compagnie:values": ["/compagnie"],
-     "public:compagnie:presentation": ["/compagnie"],
      "public:presse:media_kit": ["/presse"],
  };
```

#### 9.2 ToggleCard.tsx
**Fichier** : `components/features/admin/site-config/ToggleCard.tsx`

**Action** : Supprimer les entrées compagnie du names map (lignes 48-49)
```diff
  const names: Record<string, string> = {
      "public:home:newsletter": "Newsletter",
      "public:home:partners": "Partenaires",
      "public:home:spectacles": "Spectacles à la une",
      "public:home:news": "Actualités",
-     "public:compagnie:values": "Valeurs",
-     "public:compagnie:presentation": "Présentation",
      "public:presse:media_kit": "Kit Média",
  };
```

---

### Phase 10 : Nettoyage de l'ancien fichier de plan (optionnel)

**Fichier** : `.github/prompts/plan-TASK030:-Display Toggles/plan-TASK030:-Display Toggles.prompt.md`

**Action** : Ce fichier contient l'ancien plan avec les clés `public:compagnie:*`. 
Options :
1. **Supprimer** le dossier entier (si obsolète)
2. **Archiver** vers `doc/deprecated/` 
3. **Conserver** comme historique (ajouter un avertissement en haut)

**Recommandation** : Supprimer le dossier car le nouveau plan `plan-task030DisplayTogglesEpicAlignment.prompt.md` le remplace.

```bash
rm -rf .github/prompts/plan-TASK030:-Display\ Toggles/
```

---

### Phase 11 : Fix Presse Toggles - Séparation Kit Média / Communiqués (1er janvier 2026)

**Contexte** : Le toggle `display_toggle_presse_articles` initial contrôlait en réalité la section Kit Média, pas les communiqués de presse. Cette confusion nécessitait un refactoring pour séparer les deux fonctionnalités.

#### 11.1 Migration fix_presse_toggles
**Fichier** : `supabase/migrations/20260101220000_fix_presse_toggles.sql`

**Action** : Transformer les clés legacy en nouveaux toggles
```sql
-- Transform public:presse:media_kit_enabled → display_toggle_media_kit
update public.configurations_site
set 
  key = 'display_toggle_media_kit',
  category = 'presse_display',
  description = 'Afficher la section Kit Média sur la page Presse.',
  value = jsonb_build_object('enabled', coalesce((value)::boolean, true), 'max_items', null)
where key = 'public:presse:media_kit_enabled';

-- Transform public:presse:communiques_enabled → display_toggle_presse_articles
update public.configurations_site
set 
  key = 'display_toggle_presse_articles',
  category = 'presse_display',
  description = 'Afficher la section Communiqués de Presse sur la page Presse.',
  value = jsonb_build_object('enabled', coalesce((value)::boolean, true), 'max_items', 12)
where key = 'public:presse:communiques_enabled';
```

**Commande** :
```bash
pnpm dlx supabase db push --linked
```

#### 11.2 PresseServerGate.tsx
**Fichier** : `components/features/public-site/presse/PresseServerGate.tsx`

**Action** : Utiliser les 2 toggles indépendants
```typescript
const [mediaKitToggleResult, pressReleasesToggleResult] = await Promise.all([
  fetchDisplayToggle("display_toggle_media_kit"),
  fetchDisplayToggle("display_toggle_presse_articles"),
]);

const showMediaKit = mediaKitToggleResult.success && 
  mediaKitToggleResult.data?.value.enabled !== false;

const showPressReleases = pressReleasesToggleResult.success && 
  pressReleasesToggleResult.data?.value.enabled !== false;

// Fetch data conditionally
const [pressReleasesResult, mediaKitResult] = await Promise.all([
  showPressReleases ? fetchPressReleases() : Promise.resolve({ success: true, data: [] }),
  showMediaKit ? fetchMediaKit() : Promise.resolve({ success: true, data: [] }),
]);
```

#### 11.3 PresseView.tsx
**Fichier** : `components/features/public-site/presse/PresseView.tsx`

**Action** : Masquer complètement les sections désactivées (y compris titres)
```tsx
{/* Communiqués de Presse */}
{pressReleases.length > 0 && (
  <section className="py-20">
    <h2>Communiqués de Presse</h2>
    {/* ... */}
  </section>
)}

{/* Kit Média */}
{mediaKit.length > 0 && (
  <section className="py-20">
    <h2>Kit Média</h2>
    {/* ... */}
  </section>
)}
```

#### 11.4 Scripts utilitaires
**Créer** :
1. `scripts/check-presse-toggles.ts` — Vérifier l'état des toggles presse
2. `scripts/toggle-presse.ts` — Activer/désactiver rapidement pour tests

**Commandes disponibles** :
```bash
# Vérifier l'état
pnpm exec tsx scripts/check-presse-toggles.ts

# Activer tout
pnpm exec tsx scripts/toggle-presse.ts enable-all

# Désactiver tout
pnpm exec tsx scripts/toggle-presse.ts disable-all

# Activer uniquement Kit Média
pnpm exec tsx scripts/toggle-presse.ts enable-media-kit

# Activer uniquement Communiqués
pnpm exec tsx scripts/toggle-presse.ts enable-press-releases
```

---

### Phase 11 : Tests de validation

```bash
# 1. Vérifier les toggles en base (10 toggles attendus)
pnpm exec tsx scripts/check-presse-toggles.ts

# 2. Tester l'admin UI
# Naviguer vers /admin/site-config
# Vérifier que les 10 toggles sont listés dans 5 sections :
#   - Home (6 toggles)
#   - Agenda (1 toggle)
#   - Contact (1 toggle)  
#   - Presse (2 toggles) ← NOUVELLE SECTION

# 3. Tester le rendu public
# - Homepage : Hero, About, Spectacles, À la Une, Partners, Newsletter
# - Agenda : Newsletter inline form
# - Contact : Newsletter Card
# - Presse : Communiqués de Presse + Kit Média (sections masquées si désactivées)

# 4. Tester les toggles presse
pnpm exec tsx scripts/toggle-presse.ts disable-all
# → Vérifier que les sections Communiqués et Kit Média disparaissent complètement

pnpm exec tsx scripts/toggle-presse.ts enable-media-kit
# → Vérifier que seul Kit Média s'affiche

pnpm exec tsx scripts/toggle-presse.ts enable-all
# → Vérifier que les deux sections s'affichent
```

---

## Résumé des fichiers à modifier

| Fichier | Action | Phase | Statut |
|---------|--------|-------|--------|
| `supabase/migrations/20260101170000_cleanup_and_add_epic_toggles.sql` | CREATE | 1 | ✅ Appliqué |
| `supabase/migrations/20260101180000_fix_cleanup_display_toggles_no_compagnie.sql` | CREATE (fix) | 1 | ✅ Appliqué |
| `components/features/admin/site-config/types.ts` | ADD agenda/contact props | - | ✅ Fix UI |
| `components/features/admin/site-config/DisplayTogglesContainer.tsx` | ADD agenda/contact fetch | - | ✅ Fix UI |
| `components/features/admin/site-config/DisplayTogglesView.tsx` | ADD agenda/contact sections | - | ✅ Fix UI |
| `components/features/public-site/home/news/NewsContainer.tsx` | UPDATE key | 3 | ✅ Déjà fait |
| `components/features/public-site/home/partners/PartnersContainer.tsx` | VERIFY key | 4 | ✅ Vérifié OK |
| `components/features/public-site/home/newsletter/NewsletterContainer.tsx` | VERIFY key | 5 | ✅ Vérifié OK |
| `components/features/public-site/agenda/AgendaContainer.tsx` | ADD toggle + pass prop | 6 | ✅ Déjà fait |
| `components/features/public-site/agenda/AgendaClientContainer.tsx` | ADD hook + pass props | 6 | ✅ Déjà fait |
| `components/features/public-site/agenda/AgendaView.tsx` | REPLACE CTA with NewsletterForm | 6 | ✅ Déjà fait |
| `components/features/public-site/contact/ContactServerGate.tsx` | ADD toggle + pass prop | 7 | ✅ Déjà fait |
| `components/features/public-site/contact/ContactPageView.tsx` | ADD prop + conditional render | 7 | ✅ Déjà fait |
| `supabase/migrations/20260101160100_seed_display_toggles.sql` | UPDATE seeds | 8 | ✅ Déjà OK (pas d'INSERT compagnie) |
| `lib/actions/site-config-actions.ts` | CLEANUP compagnie paths | 9 | ✅ Déjà OK (pas de refs) |
| `components/features/admin/site-config/ToggleCard.tsx` | CLEANUP compagnie names | 9 | ✅ Déjà OK (pas de refs) |
| `.github/prompts/plan-TASK030:-Display Toggles/` | DELETE folder | 10 | ✅ Supprimé |
| `supabase/migrations/20260101220000_fix_presse_toggles.sql` | CREATE (fix presse) | 11 | ✅ Appliqué (1er jan) |
| `components/features/public-site/presse/PresseView.tsx` | FIX hide sections | 11 | ✅ Fait (1er jan) |
| `components/features/public-site/presse/PresseServerGate.tsx` | UPDATE dual toggles | 11 | ✅ Fait (1er jan) |
| `scripts/check-presse-toggles.ts` | CREATE (verification) | 11 | ✅ Créé (1er jan) |
| `scripts/toggle-presse.ts` | CREATE (utility) | 11 | ✅ Créé (1er jan) |

---

## ✅ TASK030 - Statut Final : COMPLET

**Toutes les phases (1-11) ont été implémentées avec succès.**

### Résumé d'implémentation

**Infrastructure (Phases 1-2)** :
- ✅ 5 migrations créées et appliquées (dont 1 fix presse 1er janvier)
- ✅ 10 display toggles en base de données (9 initiaux + 1 media_kit)
- ✅ RLS policies configurées (public read, admin write)
- ✅ Indexes créés pour performance

**Admin UI (Fix UI)** :
- ✅ Route /admin/site-config créée
- ✅ 5 sections affichées correctement (Home, Compagnie, Presse, Agenda, Contact)
- ✅ Toggle switches avec Server Actions + revalidation
- ✅ Fix sections Agenda et Contact manquantes

**Public Site (Phases 3-7)** :
- ✅ NewsContainer utilise display_toggle_home_a_la_une
- ✅ PartnersContainer utilise display_toggle_home_partners
- ✅ NewsletterContainer utilise display_toggle_home_newsletter
- ✅ AgendaContainer avec newsletter inline + toggle
- ✅ ContactContainer avec newsletter card + toggle

**Public Site Presse (Phase 11 - 1er janvier)** :
- ✅ PresseServerGate utilise 2 toggles indépendants (media_kit + presse_articles)
- ✅ PresseView masque complètement les sections désactivées (titres inclus)
- ✅ Scripts utilitaires pour tests (check + toggle)

**Cleanup (Phases 8-10)** :
- ✅ Aucune référence public:compagnie:* dans le code
- ✅ Seed migration correcte (pas d'INSERT compagnie)
- ✅ Ancien plan supprimé

### État final validé

**Base de données** : 10 display toggles
- 6× home_display (hero, about, spectacles, a_la_une, partners, newsletter)
- 1× agenda_display (newsletter)
- 1× contact_display (newsletter)
- 2× presse_display (media_kit, presse_articles)

**Commits** :
- `b4d92f4` - 35 fichiers modifiés (+1378/-1283 lignes) - TASK030 phases 1-10
- *(à venir)* - Phase 11 fix presse toggles + masquage sections

**Documentation** : supabase/schemas/README.md + plan-task030DisplayTogglesEpicAlignment.prompt.md

---

## Toggles finaux après migration

| Key | Page | Section | Catégorie |
|-----|------|---------|-----------|
| `display_toggle_home_hero` | Homepage | Hero | `home_display` |
| `display_toggle_home_about` | Homepage | À propos | `home_display` |
| `display_toggle_home_spectacles` | Homepage | Prochains Spectacles | `home_display` |
| `display_toggle_home_a_la_une` | Homepage | À la Une (actualités) | `home_display` |
| `display_toggle_home_partners` | Homepage | Nos Partenaires | `home_display` |
| `display_toggle_home_newsletter` | Homepage | Newsletter | `home_display` |
| `display_toggle_agenda_newsletter` | Agenda | Newsletter CTA | `agenda_display` |
| `display_toggle_contact_newsletter` | Contact | Newsletter Card | `contact_display` |
| `display_toggle_media_kit` | Presse | Kit Média | `presse_display` |
| `display_toggle_presse_articles` | Presse | Communiqués de Presse | `presse_display` |

**Total** : 10 toggles alignés avec Epic 14.7-back-office.md (9 initiaux + 1 ajouté 1er janvier)
