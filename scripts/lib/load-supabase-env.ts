/**
 * Charge le fichier d'environnement Supabase correspondant à la cible demandée.
 *
 * Cible via `SUPABASE_ENV` : `staging` (défaut, .env.local) ou `production` (.env).
 * Le staging est le défaut volontairement : un script de diagnostic lancé sans
 * réflexion ne doit jamais interroger la production.
 *
 * IMPORTANT : ce module s'exécute à l'import. Il doit être importé AVANT tout
 * module lisant `process.env` au chargement (ex. `lib/env.ts`).
 */
import * as dotenv from "dotenv";
import { resolve } from "path";

const ENV_FILES = {
  staging: ".env.local",
  production: ".env",
} as const;

export type SupabaseTarget = keyof typeof ENV_FILES;

function resolveTarget(): SupabaseTarget {
  const raw = process.env.SUPABASE_ENV ?? "staging";

  if (!(raw in ENV_FILES)) {
    throw new Error(
      `SUPABASE_ENV invalide: "${raw}". Valeurs attendues: staging | production`
    );
  }

  return raw as SupabaseTarget;
}

export const SUPABASE_TARGET = resolveTarget();
export const SUPABASE_ENV_FILE = ENV_FILES[SUPABASE_TARGET];

dotenv.config({
  path: resolve(process.cwd(), SUPABASE_ENV_FILE),
  override: true,
});

export function describeTarget(): string {
  const ref = process.env.SUPABASE_PROJECT_REF ?? "?";
  return `${SUPABASE_TARGET} (${SUPABASE_ENV_FILE}, projet ${ref})`;
}
