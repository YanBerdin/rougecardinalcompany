#!/usr/bin/env bash
set -euo pipefail
IFS=$'\n\t'

PROJ=""
SA_NAME="graphify-sa"
KEY_FILE="graphify-sa-key.json"
ENABLE_APIS=false
DRY_RUN=false

print_usage() {
  cat <<EOF
Usage: $0 [--project PROJECT_ID] [--sa-name NAME] [--key-file PATH] [--enable-apis] [--dry-run]

Creates a service account `graphify-sa` in the target project, grants it
the role `roles/serviceusage.serviceUsageAdmin`, and creates a JSON key file.

Options:
  --project PROJECT_ID   GCP project id (defaults to gcloud configured project)
  --sa-name NAME         service account name (default: graphify-sa)
  --key-file PATH        output key file (default: graphify-sa-key.json)
  --enable-apis          attempt to enable generativelanguage & agentplatform APIs
  --dry-run              print commands without executing them
  -h, --help             show this help

Security:
  - the JSON key is sensitive. Do NOT commit it. Add it to .gitignore.
  - this script may require project-owner permissions to modify IAM and enable services.
EOF
}

run() {
  if [ "$DRY_RUN" = true ]; then
    echo "[DRY] $*"
  else
    echo "+ $*"
    eval "$*"
  fi
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --project) PROJ="$2"; shift 2;;
    --sa-name) SA_NAME="$2"; shift 2;;
    --key-file) KEY_FILE="$2"; shift 2;;
    --enable-apis) ENABLE_APIS=true; shift;;
    --dry-run) DRY_RUN=true; shift;;
    -h|--help) print_usage; exit 0;;
    *) echo "Unknown option: $1"; print_usage; exit 1;;
  esac
done

if ! command -v gcloud >/dev/null 2>&1; then
  echo "gcloud not found in PATH. Install Google Cloud SDK first." >&2
  exit 2
fi

if [ -z "$PROJ" ]; then
  PROJ=$(gcloud config get-value project 2>/dev/null || true)
fi

if [ -z "$PROJ" ]; then
  echo "project id is required (use --project or set gcloud config)." >&2
  exit 1
fi

SA_EMAIL="${SA_NAME}@${PROJ}.iam.gserviceaccount.com"

echo "Project: $PROJ"
echo "Service account: $SA_EMAIL"
echo "Key file: $KEY_FILE"
echo "Dry run: $DRY_RUN"

# 1) create service account if not exists
exists=$(gcloud iam service-accounts list --project="$PROJ" --filter="email:$SA_EMAIL" --format="value(email)" 2>/dev/null || true)
if [ -z "$exists" ]; then
  run "gcloud iam service-accounts create $SA_NAME --display-name 'Graphify service account' --project=$PROJ"
else
  echo "Service account already exists: $SA_EMAIL"
fi

# 2) add IAM binding for serviceusage (if not already bound)
bound=$(gcloud projects get-iam-policy "$PROJ" --format="flattened(bindings[])" 2>/dev/null | grep -E "bindings\.role=roles/serviceusage.serviceUsageAdmin" -A2 | grep "$SA_EMAIL" || true)
if [ -z "$bound" ]; then
  run "gcloud projects add-iam-policy-binding $PROJ --member=serviceAccount:$SA_EMAIL --role=roles/serviceusage.serviceUsageAdmin"
else
  echo "Role roles/serviceusage.serviceUsageAdmin already granted to $SA_EMAIL"
fi

# 3) create key
if [ -f "$KEY_FILE" ]; then
  echo "Key file $KEY_FILE already exists. Will not overwrite." >&2
else
  run "gcloud iam service-accounts keys create \"$KEY_FILE\" --iam-account=$SA_EMAIL --project=$PROJ"
fi

# 4) optionally enable APIs
if [ "$ENABLE_APIS" = true ]; then
  echo "Attempting to enable Generative Language and Agent Platform APIs (may require permissions)..."
  run "gcloud services enable generativelanguage.googleapis.com agentplatform.googleapis.com --project=$PROJ --quiet"
fi

echo "\nDone. Next steps:\n"
echo "  - keep $KEY_FILE secure (do NOT commit it)."
echo "  - export GOOGLE_APPLICATION_CREDENTIALS=\"$(pwd)/$KEY_FILE\" to use the key locally."
echo "  - optionally run: gcloud auth activate-service-account --key-file=\"$(pwd)/$KEY_FILE\""

exit 0
