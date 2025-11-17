# TASK007 - Update memory bank

**Status:** Completed
**Added:** 2025-10-27
**Updated:** 2025-10-27

## Original Request

Mettre à jour le `memory-bank/` en appliquant les règles du fichier `.github/instructions/memory-bank.instructions.md` et en documentant l'incident RLS/GRANT ainsi que les actions CI prises.

## Thought Process

Le dépôt a subi un incident où une campagne de révoquation des GRANTs a causé des erreurs 42501 en production. Il est essentiel de capturer l'état du projet, les décisions prises, et les nouvelles conventions (GRANT + RLS, CI gates, allowed_exposed_objects). Le memory-bank doit contenir le contexte actif et les actions suivies.

## Implementation Plan

- Créer les fichiers core du memory-bank: projectbrief.md, productContext.md, activeContext.md, systemPatterns.md, techContext.md, progress.md
- Créer le dossier `tasks/` et ajouter `_index.md` et `TASK007-update-memory-bank.md` avec le journal de ce travail.
- Mettre à jour la todo list (fait via tool).

## Progress Log

### 2025-10-27

- Création des fichiers memory-bank ci-dessus et enregistrement dans le dépôt (branche `feature/backoffice`).
