# TASK090 Founder Content Admin

Objectif : rendre la section fondateur administrable depuis le dashboard existant, en l’intégrant au pipeline des sections compagnie déjà en place.

TASK préparée:

1. ID proposé: TASK090
2. Nom: Adminiser SectionFounder compagnie
3. Statut initial: Pending
4. Décisions verrouillées:

- Modèle: nouveau kind founder dans la table sections existante
- Milestones: liste éditable
- Emplacement admin: dans /admin/compagnie

## Étapes

1. Phase 1 — Modèle de données (bloquant)

- Étendre le schéma de supabase/schemas/07c_table_compagnie_presentation.sql pour supporter founder.
- Ajouter un stockage milestones structuré (recommandé: jsonb) pour éviter les formats fragiles.
- Dépendance: bloque DAL, UI admin et rendu public.

2. Phase 2 — Schémas TypeScript et DAL (bloquant, dépend de 1)

- Étendre lib/schemas/compagnie-admin.ts avec founder et milestones côté server + UI.
- Mettre à jour lib/dal/admin-compagnie-presentation.ts (DTO admin, mapping lecture/écriture).
- Mettre à jour lib/dal/compagnie-presentation.ts (mapping public).
- Conserver le pattern de sérialisation déjà utilisé (server/UI/transport).

3. Phase 3 — Rendu public data-driven (dépend de 2)

- Transformer components/features/public-site/compagnie/sections/SectionFounder.tsx pour lire les données de section au lieu de constantes hardcodées.
- Intégrer founder dans la map de rendu de components/features/public-site/compagnie/CompagnieView.tsx.
- Mettre à jour components/features/public-site/compagnie/sections/types.ts.

4. Phase 4 — UI Admin dans compagnie (dépend de 2)

- Étendre components/features/admin/compagnie/PresentationFormFields.tsx avec les champs founder: nom, rôle, bio, image, milestones.
- Ajouter un sous-composant milestones réutilisable (ajout/suppression/réordonnancement).
- Adapter components/features/admin/compagnie/PresentationForm.tsx et components/features/admin/compagnie/PresentationView.tsx pour kind founder.
- Réutiliser le pattern ImageField déjà présent.

5. Phase 5 — Actions serveur et revalidation (dépend de 2, parallèle avec 4)

- Mettre à jour app/(admin)/admin/compagnie/compagnie-presentation-actions.ts pour valider founder + milestones.
- Conserver la stratégie de revalidation admin + public déjà en place.

6. Phase 6 — Intégration dashboard (parallèle avec 4)

- Garder l’entrée sidebar existante components/admin/AdminSidebar.tsx (pas de nouvelle entrée requise).
- Ajouter une visibilité claire du bloc fondateur dans l’écran gestion compagnie.

7. Phase 7 — Migration générée (dépend de 1)

- Modifier le schéma déclaratif puis générer la migration.
- Vérifier que les policies actuelles restent cohérentes avec ce nouveau kind.

8. Phase 8 — Vérification
1. Lint: pnpm lint
2. Build: pnpm build
3. Typecheck: pnpm exec tsc --noEmit
4. Test manuel admin: /admin/compagnie (édition founder + milestones)
5. Test manuel public: /compagnie (rendu live, image, alt, ordre milestones)
6. Vérifier non-régression des sections hero/history/quote/values/team/mission/custom

### Fichiers principaux à toucher

- components/features/public-site/compagnie/sections/SectionFounder.tsx
- components/features/public-site/compagnie/CompagnieView.tsx
- components/features/public-site/compagnie/sections/types.ts
- components/features/admin/compagnie/PresentationFormFields.tsx
- components/features/admin/compagnie/PresentationForm.tsx
- components/features/admin/compagnie/PresentationView.tsx
- app/(admin)/admin/compagnie/compagnie-presentation-actions.ts
- lib/schemas/compagnie-admin.ts
- lib/dal/admin-compagnie-presentation.ts
- lib/dal/compagnie-presentation.ts
- supabase/schemas/07c_table_compagnie_presentation.sql

### Portée

Inclus:

- gestion complète du contenu fondateur dans /admin/compagnie
- milestones éditables
- rendu public branché sur la DB

Exclus:

- nouvelle page admin séparée hors /admin/compagnie
- refonte visuelle majeure de la section
