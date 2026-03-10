# Prompts VSCode — Génération des documents E2E RCC

> À utiliser dans VSCode avec GitHub Copilot Chat en mode agent
> Sélectionner l'agent `skill-creator` ou `playwright-test-generator` selon le contexte

---

## Prompt 1 — Générer `E2E_Seed_Strategy_RCC.md`

**Agent cible** : `skill-creator` ou Copilot Chat (`@workspace`)

**Mode** : Coller dans la fenêtre de chat Copilot, avec l'agent activé

```bash
En te basant sur :
- @e2e-tests/E2E_Tests_QuickReference_RCC.md (patterns existants du projet)
- Le schéma Supabase du projet (tables : spectacles, lieux, evenements, membres_equipe, partenaires, hero_slides)
- La stack : Next.js 16 + Supabase + Playwright + TypeScript

Génère le fichier `e2e-tests/E2E_Seed_Strategy_RCC.md` qui documente :

1. Un client Supabase de test (service_role, bypass RLS) dans `e2e/helpers/db.ts`
2. Des factories typées pour chaque entité principale :
   - lieuFactory
   - spectacleFactory  
   - eventFactory (avec createWithDependencies qui crée lieu + spectacle + événement)
   - teamMemberFactory
   - partnerFactory
   - heroSlideFactory
3. Une fixture Playwright `seed.fixture.ts` qui compose les factories avec setup/teardown automatique
4. La stratégie de nommage des données de test (préfixe [TEST] ou équivalent)
5. La gestion des BigInt IDs (spécifique au projet RCC)
6. Un globalSetup pour le reset en CI

Contraintes :
- Respecter les conventions du QuickReference (Page Objects, authTest/base, getByRole first)
- Toutes les données de test créées doivent être nettoyées après chaque test
- Les slugs doivent être uniques entre runs parallèles
- Les événements créés doivent toujours être dans le futur pour apparaître dans l'agenda public

Format : markdown avec blocs de code TypeScript complets et commentaires explicatifs.
```

---

## Prompt 2 — Générer `E2E_Auth_Setup_RCC.md`

**Agent cible** : `skill-creator` ou Copilot Chat (`@workspace`)

```bash
En te basant sur :
- @e2e-tests/E2E_Tests_QuickReference_RCC.md
- La configuration Supabase Auth du projet (JWT, sessions, cookies)
- La stack : Next.js 16 + Supabase + Playwright

Génère le fichier `e2e-tests/E2E_Auth_Setup_RCC.md` qui documente :

1. Le fichier `e2e/tests/admin/auth.setup.ts` complet :
   - Login via /auth/login avec les credentials E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD
   - Sauvegarde de la session dans e2e/.auth/admin.json
   - Vérification que la redirection vers /admin a bien eu lieu

2. La configuration `playwright.config.ts` avec :
   - Projet "setup" qui s'exécute en premier (testMatch: /*.setup.ts/)
   - Projet "chromium-admin" avec storageState pointant vers .auth/admin.json, dépendant de setup
   - Projet "chromium-public" sans storageState
   - Projets firefox et webkit pour les tests publics critiques

3. La fixture `e2e/fixtures/auth.fixture.ts` :
   - authTest qui étend base avec adminPage
   - Détection de session expirée avec message d'erreur explicite

4. Les variables d'environnement .env.e2e nécessaires

5. Les scripts package.json incluant test:e2e:reset-auth

6. Un tableau de dépannage des erreurs courantes (session expirée, env manquant, CI failures)

Contraintes :
- La fixture adminPage ne doit PAS faire de re-login — la session est chargée via storageState
- Tests admin → authTest.extend(), tests publics → base.extend() (règle du QuickReference)
- .auth/admin.json doit être gitignored

Format : markdown avec blocs de code TypeScript complets et tableaux de référence.
```

---

## Prompt 3 — Générer les factories depuis le schéma Supabase réel

**Agent cible** : `playwright-test-generator` (a accès aux outils Supabase MCP)

```bash
En utilisant les outils Supabase disponibles :
1. Appelle supabase/list_tables pour récupérer la liste des tables du projet
2. Appelle supabase/generate_typescript_types pour obtenir les types Database
3. Pour chaque table identifiée comme entité de test 
   (spectacles, lieux, evenements, membres_equipe, partenaires, hero_slides) :
   - Génère une factory TypeScript dans e2e/factories/[table].factory.ts
   - Respecte les types Insert/Row générés par Supabase
   - Inclut build(), create(), createMany(), cleanup()
   - Préfixe [TEST] sur le champ textuel principal
   - Ajoute Date.now() dans les champs d'unicité (slug, nom si unique)
4. Génère e2e/factories/index.ts avec les exports centralisés
5. Génère e2e/helpers/db.ts avec le client service_role

Contraintes :
- Respecter les contraintes FK (ne pas créer d'événement sans spectacle et lieu existants)
- Les BigInt IDs sont gérés nativement par les types Supabase générés
- Le service_role key est dans process.env.SUPABASE_SERVICE_ROLE_KEY

Sauvegarder chaque fichier dans le répertoire e2e/ du projet.
```

---

## Prompt 4 — Mettre à jour webapp-testing/SKILL.md

**Agent cible** : `skill-creator`

```bash
Met à jour le fichier @.github/skills/testing/test/webapp-testing/SKILL.md pour :

1. Ajouter une section "Gestion des données de test" qui référence :
   - E2E_Seed_Strategy_RCC.md (factories, seed fixtures, cleanup)
   - E2E_Auth_Setup_RCC.md (auth.setup.ts, storageState, fixture adminPage)

2. Mettre à jour la section "References" existante pour inclure les deux nouveaux fichiers

3. Ajouter dans "When to Use This Skill" :
   - "Insérer des données de test via les factories Supabase"
   - "Gérer l'authentification admin dans les tests E2E"

Ne pas modifier les sections existantes, uniquement ajouter.
```

---

## Ordre d'exécution recommandé

```bash
Prompt 3 (factories depuis schéma réel)
    ↓
Prompt 1 (Seed Strategy doc)
    ↓
Prompt 2 (Auth Setup doc)
    ↓
Prompt 4 (mise à jour SKILL.md)
```

> Commencer par le Prompt 3 si tu as accès aux outils Supabase MCP dans VSCode.
> Sinon commencer par le Prompt 1 avec le schéma en contexte manuel.
