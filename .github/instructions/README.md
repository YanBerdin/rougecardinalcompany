# .github/instructions/ — Guide rapide

Ce dossier contient les fichiers d'instructions et règles de style destinés à l'agent Copilot/aux développeurs.

Structure recommandée :

- `nextjs-supabase-auth-2025.instructions.md` (CANONICAL)
  - Règles prescriptives pour l'utilisation de Supabase Auth, JWT Signing Keys, et exigences pour génération de code automatisée (AI).
  - Contient les interdictions strictes (imports déconseillés), les patterns `createServerClient` + cookies `{ getAll, setAll }`, et la checklist de migration.

- `nextjs15-backend-with-supabase.instructions.md`
  - Guide Next.js 15 (App Router) pour backend, Server Components, headers/cookies usage, DAL patterns, et exemples d'implémentation.
  - Pour tout ce qui concerne l'auth Supabase, se référer au fichier CANONICAL ci‑dessus.

- `nextjs.instructions.md`, `nextjs15-backend-with-supabase.instructions.md`, `nextjs-supabase-auth-2025.instructions.md`, etc.
  - Garder des fichiers ciblés par domaine (Next.js patterns, Supabase Auth spécifique, sécurité générale).

Bonnes pratiques:

- Ne dupliquez pas la logique d'auth : mettez à jour le fichier `nextjs-supabase-auth-2025.instructions.md` et référencez-le.
- Rédigez les mises à jour de façon idempotente et mentionnez la date et la raison du changement.
- Lors d'un changement affectant les règles d'auth, mettre à jour aussi `.github/copilot-instructions.md` pour maintenir la cohérence.

---

Fichier canonique d'auth (modifications importantes) :

` .github/instructions/nextjs-supabase-auth-2025.instructions.md `

Merci de garder ce fichier comme source de vérité pour tous les patterns liés à Supabase Auth.
