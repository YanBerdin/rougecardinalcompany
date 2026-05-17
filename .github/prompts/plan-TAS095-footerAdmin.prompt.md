## Plan: Footer Administrable

Objectif: rendre éditables depuis l’admin les contenus actuellement hardcodés dans le footer public: description, contact (email, téléphone, adresse) et liens réseaux sociaux. Recommandation: réutiliser `public.configurations_site` avec une seule clé publique `public:footer:content`, car la table, les GRANT et les policies RLS autorisent déjà la lecture publique des clés `public:%` et réservent l’écriture aux admins. Cela évite une nouvelle table et garde le changement très ciblé.

**Steps**

1. Définir le modèle de données footer
   - Créer un schéma Zod dédié dans `lib/schemas/footer-config.ts`. **Ne pas réutiliser** `DisplayToggleInputSchema` qui est spécifique aux toggles d'affichage.
   - La clé `public:footer:content` est compatible avec le pattern RLS existant (`key like 'public:%'`).
   - Structure recommandée du JSON `value`: `description`, `contact.email`, `contact.phone`, `contact.address`, `socialLinks.facebook`, `socialLinks.instagram`, `socialLinks.twitter`.
   - Exporter une constante `FOOTER_DEFAULTS` correspondant au footer actuel, **réutilisée par le DAL (fallback), la migration seed et le rendu public en cas d'erreur** — évite la divergence entre seed SQL et code TS.
   - Valider: description non vide et bornée, email valide, téléphone non vide, adresse non vide, URLs sociales optionnelles ou valides (`z.string().url().optional().or(z.literal(''))`).

2. Ajouter le seed de configuration DB
   - Créer une migration DML dans `supabase/migrations/YYYYMMDDHHmmss_seed_footer_config.sql`, car les inserts ne sont pas capturés par le diff déclaratif.
   - Insérer `public:footer:content` dans `public.configurations_site` avec `category = 'footer_content'`, `description` explicite et `value` initial aligné sur `FOOTER_DEFAULTS`.
   - Utiliser `on conflict (key) do nothing` pour ne pas écraser une configuration déjà modifiée en production.
   - Ne pas modifier les policies RLS: `supabase/schemas/10_tables_system.sql` couvre déjà `key like 'public:%'` en SELECT pour `anon` et `authenticated`, et l'écriture reste admin-only.
   - Vérifier la présence d'un trigger `audit_trigger` sur `configurations_site`. Si présent, les UPDATE seront tracés automatiquement dans `audit_logs`. Sinon, considérer cela hors-scope de ce plan.
   - Documenter la migration dans `supabase/migrations/migrations.md`; optionnellement ajouter une note courte dans `supabase/schemas/README.md` si le projet documente les seeds de config.

3. Créer le DAL footer
   - Créer `lib/dal/footer-config.ts` avec `"use server"`, `import "server-only"`, `cache()` pour la lecture et `DALResult<T>` via `dalSuccess` / `dalError`.
   - Ajouter `fetchFooterConfig()` qui lit `configurations_site.key = 'public:footer:content'`, parse `value` avec le schéma Zod et retourne le DTO ou les defaults en fallback contrôlé.
   - Ajouter `updateFooterConfig(input)` qui appelle `requireAdminOnly()`, récupère l’utilisateur courant pour `updated_by`, puis fait un `upsert` ou `update` sur `configurations_site`.
   - Recommandation: `upsert` côté DAL pour tolérer une DB locale sans seed, tout en gardant la migration comme source de vérité production.
   - Ne mettre aucun `revalidatePath()` dans le DAL.

4. Créer la Server Action admin
   - Recommandation: créer `lib/actions/footer-config-actions.ts` pour rester cohérent avec `site-config-actions.ts` voisin.
   - Exporter `updateFooterConfigAction(input: unknown): Promise<ActionResult>`.
   - Valider avec `FooterConfigFormSchema.parseAsync(input)`, appeler le DAL, puis revalider :
     ```ts
     revalidatePath('/', 'layout'); // invalide toutes les routes marketing partageant le layout
     revalidatePath('/admin/footer');
     ```
     Next.js 16 supporte le second argument `'layout'`. Évite de lister chaque route marketing manuellement.
   - Retourner uniquement `{ success: true }` ou `{ success: false, error }`, sans données BigInt.

5. Rendre le footer public dynamique
   - Modifier `components/layout/footer.tsx` en Server Component async qui appelle `fetchFooterConfig()`.
   - Conserver la structure visuelle existante, mais remplacer description, email, téléphone, adresse et URLs sociales par les valeurs de config.
   - Garder la navigation et les liens légaux hardcodés hors scope.
   - Utiliser `FOOTER_DEFAULTS` si `fetchFooterConfig()` échoue pour éviter un footer vide sur le site public.
   - **Impact rendu statique**: rendre le footer async impacte la génération des pages marketing. Vérifier que toutes les pages marketing (`app/(marketing)/**/page.tsx`) ont déjà `export const dynamic = 'force-dynamic'` — c'est le cas selon la convention Next.js 16 du projet (voir `copilot-instructions.md`). Sinon, les ajouter.
   - Pour les réseaux sociaux: **rendu conditionnel** `{config.socialLinks.facebook && <Button…>}` plutôt qu'un lien désactivé ou un `href=""` (a11y: pas de focus sur cible vide).
   - Conserver les attributs d'accessibilité existants (`aria-label`, `title`, `target`, `rel`) et la classe `min-h-11 min-w-11` (WCAG 2.5.8 target size).

6. Créer la route admin footer
   - Créer `app/(admin)/admin/footer/page.tsx` avec `requireAdminPageAccess()`, `dynamic = 'force-dynamic'` et `revalidate = 0`.
   - Ajouter une metadata claire: “Footer | Admin”.
   - Créer `components/features/admin/footer/FooterConfigContainer.tsx` Server Component qui appelle `fetchFooterConfig()` et passe les données initiales à la vue client.
   - En cas d’erreur DAL, afficher un état d’erreur admin sobre avec message, mais permettre de repartir des defaults si le produit préfère une réparation par sauvegarde.

7. Créer l’interface admin
   - Créer `components/features/admin/footer/FooterConfigView.tsx` en Client Component avec `useState(initialConfig)` et `useEffect(() => setState(initialConfig), [initialConfig])` après `router.refresh()`.
   - Créer `components/features/admin/footer/FooterConfigForm.tsx` avec React Hook Form + Zod resolver si déjà présent dans les formulaires admin, sinon rester cohérent avec les formulaires voisins.
   - Champs attendus: textarea “Description”, input email, input téléphone, textarea/input adresse, inputs URL Facebook/Instagram/Twitter.
   - Ajouter une zone d’aperçu compacte du footer ou un résumé lisible après les champs, sans surcharger l’écran.
   - Gérer pending state, toast success/error, `router.refresh()` après succès, et `form.reset()` avec les données fraîches.
   - Garder les composants sous 300 lignes; extraire `ContactFields.tsx` et `SocialLinksFields.tsx` si le formulaire grossit.

8. Ajouter l'entrée de navigation admin
   - Modifier `components/admin/AdminSidebar.tsx` pour ajouter « Footer » dans `otherItems`.
   - Icône recommandée: `LayoutTemplate` depuis lucide-react (sémantiquement proche d'un footer). Éviter `PanelBottom` qui n'existe pas dans la version installée — vérifier dans `node_modules/lucide-react` si besoin.
   - `minRole: 'admin'` pour rester cohérent avec `configurations_site` admin-only.
   - Ne pas modifier les permissions RLS pour donner accès aux éditeurs, sauf décision produit explicite.

9. Ajouter ou ajuster les tests
   - Ajouter `__tests__/schemas/footer-config.test.ts` (ou `__tests__/utils/footer-config.test.ts` selon convention existante) couvrant: URLs invalides, email invalide, description vide, `FOOTER_DEFAULTS` valide vis-à-vis du schéma Zod.
   - Ajouter `__tests__/dal/footer-config.test.ts` si les tests d'intégration Supabase sont actifs: lecture publique de `public:footer:content`, update admin-only, fallback `FOOTER_DEFAULTS` si config absente.
   - Pour le rendu, validation manuelle suffisante (pas de Playwright requis pour cette itération).

10. Vérifier l'implémentation
   - Lancer `pnpm lint`.
   - Lancer les tests ciblés ajoutés, par exemple `pnpm vitest run __tests__/schemas/footer-config.test.ts` ou le chemin retenu.
   - Lancer `pnpm build` si le changement touche le Server Component footer global.
   - Si une migration est créée, appliquer localement avec le workflow Supabase du projet puis vérifier que la clé existe dans `configurations_site` et qu'elle est lisible en anon.
   - Vérifier manuellement `/admin/footer` puis une page publique marketing.

11. Documentation Memory Bank
   - Mettre à jour `memory-bank/activeContext.md` avec le pattern « Footer admin via `configurations_site` ».
   - Créer/mettre à jour la task `memory-bank/tasks/TAS095-footer-admin.md` avec subtasks et progress log (cf. `memory-bank.instructions.md`).
   - Mettre à jour `memory-bank/tasks/_index.md`.

12. Vérification sécurité finale
   - Tester en anon (via Supabase SQL editor ou script): `select * from public.configurations_site where key = 'public:footer:content'` doit retourner la ligne.
   - Tester en authenticated non-admin: `update public.configurations_site set value = ... where key = 'public:footer:content'` doit échouer (RLS).
   - Confirmer aucune fuite d'info sensible dans `value` (pas de clés API, tokens, identifiants…).
   - Confirmer que le trigger d'audit (si présent) trace les modifications avec `user_id` correct.

**Relevant files**

- `components/layout/footer.tsx` — remplacer les valeurs hardcodées par `fetchFooterConfig()` et conserver le rendu existant.
- `app/(marketing)/layout.tsx` — référence actuelle du footer; a priori aucune modification nécessaire.
- `lib/schemas/footer-config.ts` — nouveau schéma Zod, types DTO/form, clé `public:footer:content`, defaults.
- `lib/dal/footer-config.ts` — nouveau DAL server-only pour lecture publique et mutation admin.
- `lib/actions/footer-config-actions.ts` ou `app/(admin)/admin/footer/actions.ts` — action de mise à jour avec revalidation.
- `app/(admin)/admin/footer/page.tsx` — nouvelle page admin protégée.
- `components/features/admin/footer/FooterConfigContainer.tsx` — container Server Component.
- `components/features/admin/footer/FooterConfigView.tsx` — vue client avec synchronisation props/état.
- `components/features/admin/footer/FooterConfigForm.tsx` — formulaire admin.
- `components/features/admin/footer/types.ts` — props colocalisées.
- `components/admin/AdminSidebar.tsx` — ajout entrée de menu admin (icône `LayoutTemplate`).
- `supabase/migrations/YYYYMMDDHHmmss_seed_footer_config.sql` — seed DML idempotent.
- `supabase/migrations/migrations.md` — documentation de la migration.
- `supabase/schemas/README.md` — documentation des schémas.
- `supabase/schemas/10_tables_system.sql` — référence RLS existante; normalement pas à modifier.
- `memory-bank/activeContext.md` — documenter le nouveau pattern.
- `memory-bank/tasks/TAS095-footer-admin.md` — nouvelle task.
- `memory-bank/tasks/_index.md` — référencer la task.

**Verification**

1. `pnpm lint` doit passer.
2. Tests ciblés de validation Zod pour le footer: valeurs par défaut, email invalide, URL invalide, champs vides.
3. Si test DAL ajouté: vérifier lecture `public:footer:content` et mutation admin-only.
4. `pnpm build` pour vérifier que le footer async global ne casse pas les pages marketing.
5. Vérification manuelle: `/admin/footer` permet de modifier description/contact/réseaux, sauvegarder, puis le footer public affiche les nouvelles valeurs après refresh.
6. Vérification accessibilité minimale: liens sociaux gardent un nom accessible, liens mail/tel restent des liens natifs, focus visible via composants existants.

**Decisions**

- Inclus: description du footer, contact email/téléphone/adresse, URLs Facebook/Instagram/Twitter, page admin dédiée, seed DB, rendu public dynamique.
- Exclu: navigation footer, liens légaux, logo, texte copyright, toggle pour masquer le footer, gestion de réseaux sociaux arbitraires au-delà des trois liens existants.
- Stockage recommandé: une seule ligne `configurations_site` avec clé `public:footer:content`, pas de nouvelle table.
- Permissions recommandées: admin-only pour l’édition, public read via RLS existante.
- Fallback public: toujours afficher les valeurs par défaut actuelles si la config est absente ou invalide, pour éviter une régression visible.

**Further Considerations**

1. Si le footer est considéré comme contenu éditorial, on peut ouvrir l’édition aux `editor` plus tard, mais cela demande d’ajuster les policies de `configurations_site` ou de choisir une table dédiée. Recommandation actuelle: rester admin-only.
2. Si l’équipe veut ajouter LinkedIn/YouTube/Mastodon ensuite, prévoir une structure `socialLinks` extensible en tableau; pour cette première itération, les trois champs fixes sont plus simples et plus sûrs.
3. Revalidation : choix retenu = `revalidatePath('/', 'layout')` (Next.js 16) qui couvre l'ensemble des routes partageant le layout marketing. Si un futur split de layouts apparaît, revoir ce point.
4. Audit trail : vérifier au moment de l'implémentation si un trigger `audit_trigger` existe sur `configurations_site`. Si non et que la traçabilité est requise, créer une migration séparée (hors-scope de ce plan).
