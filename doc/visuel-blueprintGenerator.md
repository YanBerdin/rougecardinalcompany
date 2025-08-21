# Schema Copilot Instructions BluePrint Generator

```text
         ┌─────────────────────────────────────┐
         │          CODEBASE EXISTANT          │
         │(code, tests, configs, instructions) │
         └─────────────────────┬───────────────┘
                               │
                               ▼
                 ┌────────────────────────────┐
                 │   Blueprint d’Architecture │
                 │  (patterns, diagrammes,    │
                 │   choix techniques)        │
                 └───────────┬────────────────┘
                             │
                             ▼
   ┌───────────────────────────────────────────────┐
   │ Copilot Instructions Blueprint Generator      │
   │  - Scanne la Memory Bank                      │
   │  - Lit le Blueprint d’Architecture            │
   │  - Analyse le code réel & détecte les versions│
   │  - Extrait les patterns de dev existants      │
   │  - Produit copilot-instructions.md            │
   └───────────────┬───────────────────────────────┘
                   │
                   ▼
     ┌────────────────────────────────────────────┐
     │    GitHub Copilot & Chat (en action)       │
     │  → utilise copilot-instructions.md         │
     │    pour générer du code 100% aligné        │
     │    sur ton projet                          │
     └────────────────────────────────────────────┘
```
