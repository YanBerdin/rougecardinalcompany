# Shadcn n'est plus juste une bibliothèque — Tutoriel pratique (FR)

**But**: Ce tutoriel explique pas à pas comment utiliser un MCP server pour shadcn/ui, comment planifier l'UI, récupérer des démos sans erreur, puis personnaliser le thème avec TweakCN.

---

## 1) Contexte et problème

- Shadcn/ui fournit des composants React populaires. Mais les agents d'IA (Cursor, Claude, etc.) produisent souvent des implémentations cassées si on ne leur donne pas le contexte d'utilisation exact.
- Solution présentée: un **MCP server spécialisé pour shadcn/ui**. Il fournit au modèle l'accès aux composants, aux blocs, aux démos et aux métadonnées. Résultat: moins d'hallucinations, composants implémentés correctement du premier coup.

---

## 2) Ressources et outils cités

- **Shadcn UI** (cli, docs, installation). Fichiers fréquents: `components.json`, dossier `components/ui`.
- **MCP server** pour shadcn/ui (GitHub repo: `shadcn-ui-mcp-server`).
- **Cursor** (éditeur/agent IA utilisé pour générer/installer le code).
- **Claude** (utilisé pour brainstormer et générer le plan d'implémentation UI).
- **TweakCN** (éditeur visuel de thèmes shadcn/ui pour personnaliser l'apparence).
- **GitHub Personal Access Token (PAT)** pour augmenter limites et permettre accès au repo via l'agent.
- Fichiers mentionnés dans la vidéo: `MCP store.md`, **rule files** (fichiers de règles pour l'agent), config MCP dans le repo GitHub.

---

## 3) Architecture conceptuelle (diagramme)

```bash
[Designer / You] --> Claude (brainstorm)
                           |
                           v
                  MCP store.md (plan UI, composants listés)
                           |
                           v
Cursor + MCP server <---> MCP server (shadcn-ui-mcp-server)
      |                    (outils: list-components, get-component, get-component-demo,
      |                     list-blocks, get-blocks)
      v
  Projet Shadcn App (Next.js)  <-- install + modifications automatiques
      |
      v
  TweakCN (thème) -> copier commande -> Cursor installe thème

```

---

## 4) Flux recommandé, pas à pas

### A. Préparer le plan UI (phase non-code)

1. Brainstormer l'idée de l'application ou la page.
2. Demander à Claude de produire **un plan d'implémentation UI**. Exporte le résultat dans un fichier nommé `MCP store.md`.
   - Ce fichier contient la structure UI, le parcours utilisateur, et les noms des composants à utiliser.
   - Important: à ce stade **pas de code**. Seulement la structure et le mapping composants -> zones.

> Exemple (extrait logique de `MCP store.md`):

```md
# MCP store.md

- Page: Login
  - Block: login-block (Form, Input, Button, Alert)
- Page: Dashboard
  - Block: dashboard-overview (Sidebar, Topbar, Cards, Charts)
```

### B. Installer et configurer le MCP server

1. Cloner le repo MCP server (ex: `jpisnice/shadcn-ui-mcp-server` ou équivalent).
2. Lancer en local ou déployer (le repo contient une section `MCP configuration` et instructions pour différents environnements).
3. Dans les agents (Cursor, Claude Desktop, Windsurf...), ajouter l'URL du MCP server dans **Tools/Integrations**.
4. Optionnel mais recommandé: fournir un **GitHub PAT** si demandé pour augmenter les quotas (ex: 5000 requêtes/heure). Le PAT se génère ici: `https://github.com/settings/tokens`.

**Remarque**: la vidéo montre l'option «sans token» et «avec token». Préférer «avec token» en prod.

### C. Outils fournis par le MCP server et leur rôle

- `list-components` : retourne la liste complète des composants disponibles.
- `get-component` : renvoie les métadonnées d'un composant précis.
- `get-component-demo` : récupère la **démonstration d'utilisation réelle** (code d'exemple). Outil crucial pour éviter les erreurs d'implémentation.
- `list-blocks` / `get-blocks` : blocs composés (combinations of components). Ex: `login block`, `dashboard block`.

**Règle pratique**: quand vous générez du code, appelez d'abord `get-component-demo` pour chaque composant utilisé.

### D. Règles (rule file) pour l'agent — fichier exemple

Créez un fichier de règles (JSON/YAML) que votre agent utilisera automatiquement. Exemple simplifié en JSON:

```json
{
  "name": "shadcn-rule-file",
  "rules": [
    {
      "when": "work_with_shadcn_components",
      "action": "use_mcp_server"
    },
    {
      "when": "planning_phase",
      "action": "apply_existing_components_or_blocks"
    },
    {
      "when": "implementation_phase",
      "action": "call_get_component_demo_first"
    }
  ]
}
```

- Explication:
  - règle 1: tout travail sur shadcn passe par l'MCP.
  - règle 2: en planification, préférer les blocs (réutilisables) quand ils existent.
  - règle 3: en implémentation, appeler `get-component-demo` pour récupérer l'usage exact.

### E. Génération automatique: plan -> code

1. Importer `MCP store.md` dans l'agent (Cursor) et référencer le rule file.
2. Demander à Cursor d'implémenter le plan **dans votre application Shadcn**.
3. Cursor suit les règles. Pour chaque composant:
   - appelle `get-component-demo` depuis l'MCP,
   - copie l'exemple d'usage exact dans le projet,
   - installe ou modifie les fichiers nécessaires (ex: `components/ui/...`, `components.json`).

4. Après qu'un ensemble de composants/blocs a été ajouté, l'agent re-appelle les outils pour vérifier consistance. Ainsi il ne s'écarte jamais du process.

**Résultat attendu**: composants correctement implémentés et responsive dès la première passe ou presque.

### F. Personnalisation visuelle: TweakCN

1. Ouvrir `https://tweakcn.com`.
2. Créer / modifier un thème pour shadcn/ui dans l'éditeur visuel.
3. Quand le thème est prêt, cliquer sur **Code**. Copier la commande fournie.
4. Donner cette commande à Cursor pour qu'il l'exécute dans votre projet. Si Cursor échoue, coller manuellement les modifications de configuration listées dans le panneau Code.

**But**: éviter que toutes les apps shadcn ressemblent à la même chose.

### G. Installer shadcn/ui et commandes utiles

- Initialiser un projet shadcn (exemples recommandés par la doc officielle):

```bash
# initialiser le projet (Next.js ou Vite)
npx shadcn@latest init
# ajouter un composant
npx shadcn@latest add button
# ou avec pnpm
pnpm dlx shadcn@latest init
```

- Dépendances importantes (extrait docs): `class-variance-authority`, `clsx`, `tailwind-merge`, `lucide-react`, `tw-animate-css`.

### H. Config MCP dans GitHub / Cursor (paramètres)

1. Copier la configuration `claw desktop` / `Claude Desktop` fournie dans le repo MCP (la vidéo mentionne une config spécifique pour l'exécution via cloud code / Cursor / Windsurf).
2. Dans Cursor: `Settings > Tools & Integrations > add MCP server`.
3. Coller l'URL du MCP server et, si demandé, coller le GitHub PAT. Sauvegarder.

**Conseil**: copiez le PAT **une seule fois**. GitHub l'affiche uniquement à la génération.

### I. Erreurs fréquentes et corrections rapides

- **Composant cassé**: l'agent n'a pas appelé `get-component-demo`. Solution: forcer l'appel du demo tool et remplacer le code.
- **Thème partiellement appliqué**: Cursor n'a pas modifié tous les fichiers. Solution: exécuter manuellement la commande affichée dans TweakCN.
- **Quota trop bas**: utiliser un PAT pour augmenter le nombre de requêtes.

---

## 5) Exemples concrets (scénarios de la vidéo)

- **Bouton**: simple. `get-component-demo` retourne la structure JSX/TSX exacte et les props.
- **Dialogue / Modal**: a besoin d'un pattern particulier (ex: `Dialog.Trigger`, `Dialog.Content`). Le demo montre l'ordre et les wrappers à utiliser. Sans le demo, l'agent oublie souvent le `Dialog.Portal` ou le `Dialog.Overlay` et le modal casse.
- **Login block**: bloc pré-construit. L'agent récupère le bloc via `get-blocks` et le place comme un ensemble unique.

---

## 6) Modèle de checklist avant PR

- [ ] `get-component-demo` appelé pour chaque nouveau composant.
- [ ] Tous les blocks réutilisables préférés ont été utilisés.
- [ ] Thème TweakCN appliqué et vérifié sur la page principale.
- [ ] Tests manuels: responsive (mobile / tablette / desktop).
- [ ] `components.json` / `components/ui` mis à jour et commités.

---

## 7) Notes finales et bonnes pratiques

- Séparer plan (MCP store.md) et code. Le plan guide l'IA. Le code est construit ensuite.
- Toujours appeler les **démos** avant d'implémenter. Elles réduisent les retours en arrière.
- Utiliser des blocs quand disponibles. Ils contiennent déjà le bon contexte et les dépendances.
- TweakCN est l'outil pratique pour rendre unique une UI shadcn.

---

## 8) Annexes utiles

- Fichier `rule-file` minimal (YAML):

```yaml
name: shadcn-rules
rules:
  - when: "work_with_shadcn_components"
    action: "use_mcp_server"
  - when: "planning_phase"
    action: "apply_blocks_if_available"
  - when: "implementation_phase"
    action: "call_get_component_demo_first"
```

- Exemple d'arborescence après ajout de composants:

```
my-app/
├─ components/
│  └─ ui/
│     ├─ button.tsx
│     ├─ dialog/
│     │  ├─ index.tsx
│     │  └─ styles.css
│     └─ login-block/
│        └─ index.tsx
├─ app/
│  └─ dashboard/page.tsx
├─ components.json
└─ tailwind.config.cjs
```

---

workflow recommandé: **planifier avec Claude -> documenter en `MCP store.md` -> implémenter via Cursor + MCP server -> personnaliser via TweakCN**.

---
