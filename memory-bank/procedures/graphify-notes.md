# Graphify — Notes rapides

Graphe sémantique : **5 345 nœuds, 10 934 arêtes, 591 communautés** (run 2026-06-12).

## Commandes essentielles

```bash
# Activer le venv
source .graphify-venv/bin/activate
export GOOGLE_API_KEY=$(grep GOOGLE_API_KEY .env.local | cut -d= -f2)

# Extract incrémental
python -m graphify extract . --backend gemini --model gemini-3.1-flash-lite \
  --token-budget 40000 --max-concurrency 1

# Label (TOUJOURS avec ces 2 env vars)
export GRAPHIFY_GEMINI_MODEL=gemini-3.1-flash-lite
export GRAPHIFY_MAX_OUTPUT_TOKENS=8192
python -m graphify label . --backend gemini

# Update rapide (no LLM)
python -m graphify update .

# Pour y accéder
source .graphify-venv/bin/activate && python -m http.server 8765 --directory graphify-out
# → http://localhost:8765/graph.html
```

## Env vars critiques

- `GRAPHIFY_GEMINI_MODEL=gemini-3.1-flash-lite` — override le défaut `gemini-3-flash-preview` (20 RPD)
- `GRAPHIFY_MAX_OUTPUT_TOKENS=8192` — évite la troncature JSON du label
- `GOOGLE_API_KEY` — clé format `AIzaSy...` (AI Studio, jamais OAuth token `AQ.Ab8...`)

## Procédure complète

Voir `memory-bank/procedures/graphify-codebase-graph.md`
