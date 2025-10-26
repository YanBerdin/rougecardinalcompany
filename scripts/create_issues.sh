#!/usr/bin/env bash
set -euo pipefail

# Script to create GitHub issues for TASK021..TASK040 using gh CLI.
# Requirements: gh CLI installed and authenticated (`gh auth login`).
# Usage: ./scripts/create_issues.sh

if ! command -v gh >/dev/null 2>&1; then
  echo "gh CLI not found. Install it and authenticate (https://cli.github.com/)" >&2
  exit 2
fi

REPO="YanBerdin/rougecardinalcompany"

declare -a ISSUES=(
  "TASK021|Content management CRUD|Implémenter les interfaces CRUD pour la gestion du contenu (articles, pages, shows)."
  "TASK022|Team management|Interface admin pour gérer les membres de la compagnie et leurs rôles."
  "TASK023|Partners management|Gérer partenaires, logos, liens et pages de partenaires."
  "TASK024|Press management|Espace presse pour ajouter communiqués, dossiers de presse et contacts."
  "TASK025|Reserved|Placeholder task (réservé)."
  "TASK026|Homepage content management|Panneau pour éditer contenus d'accueil (hero, news, shows)."
  "TASK027|Company content management|Page de la compagnie: équipe, histoire, textes légaux."
  "TASK028|Content versioning UI|Interface pour versionner et restaurer anciennes versions de contenu."
  "TASK029|Media library|Gestion des médias (upload, tags, transformations, storage)."
  "TASK030|Display toggles|Basculer affichage de sections publiques (shows, news, partners)."
  "TASK031|Access controls for content|Rôles et permissions pour accès éditeur/admin."
  "TASK032|Audit log and activity|Historique des changements, export CSV et filtres."
  "TASK033|Bulk import/export|Import CSV / export JSON pour contenu et partenaires."
  "TASK034|Editorial workflow|Drafts, review, publish workflow pour articles."
  "TASK035|UI localization|Support langue FR/EN et gestion des traductions."
  "TASK036|Notifications & Email templates|Notifications admin et modèles d'email (Resend integration)."
  "TASK037|Data retention & purge|Politique de conservation des données et procédures de purge."
  "TASK038|Performance optimisation|Pagination, lazy-loading, caching pour gros volumes."
  "TASK039|Tests & QA|Tests unitaires, intégration, E2E pour back-office."
  "TASK040|Documentation|Documentation utilisateur et guide d'administration."
)

for item in "${ISSUES[@]}"; do
  IFS='|' read -r key title body <<<"$item"
  echo "Creating issue: [$key] $title"
  gh issue create --repo "$REPO" --title "${key} - ${title}" --body "$body" --label "backoffice" || {
    echo "failed to create issue $key" >&2
  }
done

echo "Done creating issues."
