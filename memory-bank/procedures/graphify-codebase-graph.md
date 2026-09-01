# Graphify — Cartographie sémantique du codebase

> Procédure d'installation, d'utilisation et de mise à jour du graphe sémantique avec Graphify.
> **Dernière exécution complète** : 2026-06-12

---

## État actuel du graphe (2026-06-12)

| Métrique | Valeur |
| --- | --- |
| Nœuds | 4 229 |
| Arêtes | 9 337 |
| Communautés nommées | 438 / 438 |
| Communautés affichées | 233 (205 "thin" omises) |

Fichiers générés : `graphify-out/graph.json`, `graphify-out/GRAPH_REPORT.md`, `graphify-out/graph.html` (3,8 Mo).

---

## Installation

```bash
# Depuis la racine du projet
python3 -m venv .graphify-venv
source .graphify-venv/bin/activate
pip install "graphifyy[gemini]"
python -m graphify --version  # doit afficher graphify 0.8.x
```

`.graphify-venv/` est dans `.gitignore` — ne jamais le committer.

---

## Fichier .graphifyignore

Le fichier `.graphifyignore` (à la racine) exclut les dossiers non-code du graphe :

```
.github/       # skills, agents, instructions AI → 1 068 nœuds parasites (20 %)
doc/           # documentation markdown
memory-bank/   # mémoire projet
```

**Important** : ce fichier remplace `.gitignore` pour graphify. Les patterns `node_modules/`, `.next/`, etc. y sont répliqués. Ne pas supprimer `.graphifyignore` sans y ajouter ces patterns.

---

## Clé API Gemini

La clé est stockée **uniquement** dans `.env.local` (ignoré par git) :

```bash
GOOGLE_API_KEY=AIzaSy...
```

**⚠️ Sécurité :**

- Ne jamais committer `.env.local`, `/tmp/gemini_api_key` ni aucune clé dans le dépôt.
- `.env.local` et `.graphify-venv/` sont dans `.gitignore` — vérifier avant tout `git add .`.
- La clé appartient au projet GCP `gen-lang-client-0216339933` (compte `yandevformation@gmail.com`).
- Si les ADC gcloud sont actifs (`~/.config/gcloud/application_default_credentials.json`), exporter `GOOGLE_API_KEY` explicitement dans le shell avant chaque commande graphify.

---

## Commandes de mise à jour (prochain run)

### 1. Extraction sémantique (si des fichiers ont changé)

```bash
source .graphify-venv/bin/activate
export GOOGLE_API_KEY=$(grep GOOGLE_API_KEY .env.local | cut -d= -f2)

python -m graphify extract . \
  --backend gemini \
  --model gemini-3.1-flash-lite \
  --token-budget 40000 \
  --max-concurrency 1 \
  2>&1 | tee graphify-run.log
```

**Pourquoi ces options :**

- `gemini-3.1-flash-lite` : seul modèle avec assez de quota (20 RPD +) sur ce compte free tier.
- `--token-budget 40000` : évite le rate limit de 250 000 tokens/min.
- `--max-concurrency 1` : évite les 429 par rafale.
- Le cache AST (1 864 fichiers) n'est pas re-traité si les fichiers n'ont pas changé.

Si des chunks 429 persistent, relancer la commande — le cache reprend là où ça s'est arrêté.

### 2. Labeling des communautés (après chaque extract)

```bash
source .graphify-venv/bin/activate
export GOOGLE_API_KEY=$(grep GOOGLE_API_KEY .env.local | cut -d= -f2)
export GRAPHIFY_GEMINI_MODEL=gemini-3.1-flash-lite
export GRAPHIFY_MAX_OUTPUT_TOKENS=8192

python -m graphify label . --backend gemini 2>&1 | tee graphify-label.log
```

**Pourquoi ces options :**

- `GRAPHIFY_GEMINI_MODEL=gemini-3.1-flash-lite` : override le modèle par défaut (`gemini-3-flash-preview`, quota 20 RPD épuisé rapidement).
- `GRAPHIFY_MAX_OUTPUT_TOKENS=8192` : sans ça, le JSON est tronqué à ~260 chars → batch échoue.

Si des batches échouent encore (JSON tronqué), relancer la commande à l'identique — c'est stochastique et ça passe en 1-2 tentatives.

### 3. Visualisation

`graph.html` est généré automatiquement par `cluster-only` (graphe sous les 5 000 nœuds grâce à `.graphifyignore`). Si le graphe venait à dépasser 5 000 nœuds :

```bash
GRAPHIFY_VIZ_NODE_LIMIT=6000 python -m graphify cluster-only . --backend gemini
```

---

## Quotas Gemini free tier (compte `gen-lang-client-0216339933`)

| Modèle | RPD | Tokens/min | Disponible |
| --- | --- | --- | --- |
| `gemini-3.1-flash-lite` | ~1000+ | 250 000 | ✅ Recommandé |
| `gemini-2.5-flash-lite` | 20 | 250 000 | ⚠️ Épuise vite |
| `gemini-3-flash-preview` | 20 | — | ⚠️ Défaut label, épuise vite |
| `gemini-2.0-flash` | 0 | — | ❌ Non disponible free tier |

Le quota RPD se réinitialise à **minuit UTC**.

---

## Consultation du graphe

```bash
# Chemin le plus court entre deux nœuds
python -m graphify path "ComponentA" "lib/dal/spectacles.ts"

# Explication d'un nœud
python -m graphify explain "createSpectacleAction"

# Nœuds impactés par un changement
python -m graphify affected "lib/dal/spectacles.ts"

# Requête sémantique libre
python -m graphify query "Où est géré l'upload d'images ?"
```

---

## Fichiers importants

| Fichier | Rôle |
| --- | --- |
| `graphify-out/graph.json` | Graphe principal (source de vérité) |
| `graphify-out/GRAPH_REPORT.md` | Rapport lisible, communautés nommées |
| `graphify-out/cache/ast/` | Cache AST — ne pas supprimer |
| `graphify-out/2026-06-12/` | Backup automatique du dernier run |
| `graphify-run.log` | Log de l'extraction |
| `graphify-label.log` | Log du labeling |
| `.graphify-venv/` | Venv Python — ne pas committer |
