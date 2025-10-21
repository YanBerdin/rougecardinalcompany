# .github/instructions/ — Guide rapide

Ce dossier contient les fichiers d'instructions et règles de style destinés à l'agent Copilot/aux développeurs.

Structure recommandée :

- `nextjs-supabase-auth-2025.instructions.md` (CANONICAL)
  - Règles prescriptives pour l'utilisation de Supabase Auth, JWT Signing Keys, et exigences pour génération de code automatisée (AI).
  - Contient les interdictions strictes (imports déconseillés), les patterns `createServerClient` + cookies `{ getAll, setAll }`, et la checklist de migration.
  - **Mise à jour oct. 2025** : Workaround RLS/JWT Signing Keys via vues publiques pour contourner l'incompatibilité avec les nouveaux tokens JWT.

- `nextjs15-backend-with-supabase.instructions.md`
  - Guide Next.js 15 (App Router) pour backend, Server Components, headers/cookies usage, DAL patterns, et exemples d'implémentation.
  - Pour tout ce qui concerne l'auth Supabase, se référer au fichier CANONICAL ci‑dessus.
  - **Référence canonique pour auth** : `.github/instructions/nextjs-supabase-auth-2025.instructions.md`

- `nextjs.instructions.md`, `nextjs15-backend-with-supabase.instructions.md`, `nextjs-supabase-auth-2025.instructions.md`, etc.
  - Garder des fichiers ciblés par domaine (Next.js patterns, Supabase Auth spécifique, sécurité générale).

Bonnes pratiques:

- Ne dupliquez pas la logique d'auth : mettez à jour le fichier `nextjs-supabase-auth-2025.instructions.md` et référencez-le.
- Rédigez les mises à jour de façon idempotente et mentionnez la date et la raison du changement.
- Lors d'un changement affectant les règles d'auth, mettre à jour aussi `.github/copilot-instructions.md` pour maintenir la cohérence.
- **Workflow hotfix déclaratif** : Pour les migrations DDL urgentes, suivre le processus documenté dans les fichiers de migration et schemas.

---

## Résolutions de problèmes courants

### Problème RLS/JWT Signing Keys (oct. 2025)

**Symptôme** : Requêtes anonymes bloquées malgré des politiques RLS correctement configurées avec les nouveaux JWT Signing Keys.

**Solution** : Créer une vue publique qui contourne l'évaluation RLS :

```sql
-- Exemple : articles_presse_public
create view articles_presse_public as
select id, title, author, type, chapo, excerpt, source_publication, source_url, published_at, created_at
from articles_presse
where published_at is not null;

grant select on articles_presse_public to anon, authenticated;
```

**Impact** :
- Sécurité identique (même filtre que RLS)
- Performance améliorée (pas d'overhead RLS)
- Migration hotfix + intégration au schéma déclaratif

**Références** :
- Migration : `supabase/migrations/20251021000001_create_articles_presse_public_view.sql`
- Schéma : `supabase/schemas/08_table_articles_presse.sql`
- Documentation : `supabase/migrations/migrations.md`, `scripts/Test_fetchMediaArticles/README.md`

---

Fichier canonique d'auth (modifications importantes) :

` .github/instructions/nextjs-supabase-auth-2025.instructions.md `

Garder ce fichier comme source de vérité pour tous les patterns liés à Supabase Auth.
