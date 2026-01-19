# Plan : Compléter l'audit sécurité TASK036 (final)

L'audit sécurité passe de **35%** à **100%** avec les 4 sous-tâches restantes. Décisions intégrées : rate limiting in-memory accepté, Free plan Supabase documenté.

## Étapes

### 1. Auditer secrets management (30 min)

Créer `scripts/audit-secrets-management.ts` pour grep patterns dangereux (`apikey=`, `password=` hardcodés), valider `lib/env.ts` (T3 Env complet), confirmer `.gitignore` exclut `.env*`.

**Corrections appliquées** :
- ✅ Exclure fichiers template (`.env.example`, `.env.*.template`)
- ✅ Accepter `.env*.local` comme équivalent à `.env.local`
- ✅ Créer `scripts/test-env-validation.ts` pour tester T3 Env avec chargement automatique de `.env.local` via dotenv

Marquer **1.8 Complete**.

### 2. Valider cookie flags (1h)

**Approche dual implémentée** :

1. **Analyse statique** : `scripts/audit-cookie-flags.ts`
   - Vérifie patterns dans `supabase/server.ts` et `proxy.ts`
   - Valide configuration `getAll/setAll` cookies
   - Détecte patterns dépréciés

2. **Test d'intégration** : `scripts/test-cookie-security.ts`
   - Inspecte cookies HTTP réels au runtime (nécessite `pnpm dev`)
   - Valide flags de sécurité effectifs : `httpOnly`, `secure`, `sameSite: lax`
   - Teste endpoints publics et auth

Marquer **1.6 Complete**.

### 3. Exécuter checklist OWASP (4h)

Créer `doc/OWASP-AUDIT-RESULTS.md` :

- A01 Broken Access Control → ✅ RLS 36 tables, `is_admin()` guards
- A02 Cryptographic Failures → Vérifier HTTPS enforcement
- A03 Injection → ✅ Supabase parameterized, Zod validation
- A04 Insecure Design → ✅ Rate limits Supabase Auth (30 anon/h, 360 OTP/h, 1800 refresh/h)
- A05 Security Misconfiguration → **Ajouter CSP, HSTS, X-Frame-Options** dans `next.config.ts`
- A10 SSRF → ✅ `validateImageUrl` fix

Marquer **1.7 Complete**.

### 4. Consolider production checklist (2h)

Créer `doc/PRODUCTION-READINESS-CHECKLIST.md` :

- ✅ Sécurité DB (RLS, SECURITY INVOKER, 36 tables)
- ✅ Dépendances (`pnpm audit` = 0 vulnérabilités)
- ✅ Rate limiting Auth (Supabase Dashboard)
- ✅ Rate limiting uploads (in-memory accepté, 10/min/user)
- ⚠️ **Backup strategy Free plan** : exports manuels via Dashboard, pas de PITR (upgrade Pro recommandé pré-prod)
- ⏳ Headers sécurité (CSP/HSTS à configurer)

Marquer **1.10 Complete**.

### 5. Mettre à jour TASK036

Passer status à **100%**, ajouter Progress Log 2026-01-03 avec :

- Décision rate limiting in-memory acceptée
- Free plan Supabase documenté (limitation backups)
- 4 sous-tâches complétées

## Résultats de l'audit

### Scripts de validation créés

| Script | Type | Statut | Notes |
|--------|------|--------|-------|
| `audit-secrets-management.ts` | Analyse statique | ✅ 4/4 PASSED | Exclut `.env.example`, accepte `.env*.local` |
| `audit-cookie-flags.ts` | Analyse statique | ⚠️ Partiel | Patterns validés, proxy.ts faux positif corrigé |
| `test-cookie-security.ts` | Intégration | ✅ 3/3 PASSED | Nécessite dev server, valide flags runtime |
| `test-env-validation.ts` | Intégration | ✅ 6/6 PASSED | Charge `.env.local` via dotenv |

### Documentation créée

- ✅ `doc/OWASP-AUDIT-RESULTS.md` (588 lignes) - Audit complet OWASP Top 10 (2021)
- ✅ `doc/PRODUCTION-READINESS-CHECKLIST.md` (661 lignes) - Checklist pré-lancement

### Améliorations apportées

- ✅ Security headers ajoutés à `next.config.ts` (CSP, HSTS, X-Frame-Options, etc.)
- ✅ Approche dual pour cookie testing (static + integration)
- ✅ Script T3 Env avec chargement automatique `.env.local`
- ✅ Exclusion fichiers template dans audit secrets

## Fichiers à créer/modifier (complétés)

| Action | Fichier | Statut |
|--------|---------|--------|
| Créer | `scripts/audit-secrets-management.ts` | ✅ 274 lignes, 4/4 tests |
| Créer | `scripts/audit-cookie-flags.ts` | ✅ 288 lignes (analyse statique) |
| Créer | `scripts/test-cookie-security.ts` | ✅ 339 lignes (intégration) |
| Créer | `scripts/test-env-validation.ts` | ✅ 114 lignes (T3 Env) |
| Créer | `doc/OWASP-AUDIT-RESULTS.md` | ✅ 588 lignes, 8/10 OWASP |
| Créer | `doc/PRODUCTION-READINESS-CHECKLIST.md` | ✅ 661 lignes, 85% ready |
| Modifier | `next.config.ts` | ✅ 6 security headers |
| Modifier | `memory-bank/tasks/TASK036-security-audit.md` | ✅ 100% complete |
