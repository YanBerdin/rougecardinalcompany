# create-graphify-sa.sh

Purpose
-------

Helper script to create a dedicated service account for Graphify (local use), grant it the minimal role to consume service usage quota (roles/serviceusage.serviceUsageAdmin), and generate a JSON key file for local ADC usage.

Security notes
--------------

- The generated JSON key is highly sensitive. Do NOT commit it to git. Add it to `.gitignore` immediately.
- Prefer running the script as a project owner. If you do not have permissions, ask the project owner to run it or run the alternate manual commands included below.

Usage
-----

Basic dry-run (prints actions):

```bash
bash scripts/create-graphify-sa.sh --project 237730481070 --dry-run
```

Create SA, grant role and produce key:

```bash
bash scripts/create-graphify-sa.sh --project 237730481070 --key-file ./graphify-sa-key.json
export GOOGLE_APPLICATION_CREDENTIALS="$PWD/graphify-sa-key.json"
gcloud auth activate-service-account --key-file="$PWD/graphify-sa-key.json"
```

Attempt to enable required APIs (may still fail if you lack permissions):

```bash
bash scripts/create-graphify-sa.sh --project 237730481070 --enable-apis
```

Manual commands for owner
-------------------------

If you prefer to run commands manually (as project owner), these are the equivalent operations:

```bash
# create SA
gcloud iam service-accounts create graphify-sa --display-name "Graphify service account" --project=237730481070

# grant role
gcloud projects add-iam-policy-binding 237730481070 \
  --member="serviceAccount:graphify-sa@237730481070.iam.gserviceaccount.com" \
  --role="roles/serviceusage.serviceUsageAdmin"

# create key
gcloud iam service-accounts keys create ./graphify-sa-key.json \
  --iam-account=graphify-sa@237730481070.iam.gserviceaccount.com --project=237730481070

# (optional) enable APIs
gcloud services enable generativelanguage.googleapis.com agentplatform.googleapis.com --project=237730481070
```

Troubleshooting
---------------

- If you see permission errors, you need a user with project-owner or appropriate IAM rights to run the script.
- If API enablement fails but the SA/key were created, you can still use the SA credentials for operations that don't require those APIs.

Contact
-------

If you want, grant me permission to run these commands and I can attempt the full flow; otherwise deliver this script to the project owner.
