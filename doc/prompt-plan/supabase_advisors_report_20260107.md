# Rapport Supabase Advisors — 2026-01-07

Projet Supabase: `yvtrlvmbofklefxcxrzv`

Résumé bref

- Sécurité: 3 alertes (leaked passwords disabled (Pro Plan only), MFA insuffisante, postgres à mettre à jour).

> **Conseils de sécurité (détaillé)**

1. Leaked password protection désactivée (niveau: WARN)
   - Description : la vérification contre les mots de passe compromis (HaveIBeenPwned) n'est pas activée.
   - Impact : risque d'acceptation de mots de passe déjà compromis → comptes vulnérables (bruteforce/credential stuffing).
   - Remédiation (**Leaked password protection is available on the Pro Plan**): activer la protection dans la console Supabase (auth settings) et imposer une politique de force minimale des mots de passe.
   - Lien : https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection

2. Options MFA insuffisantes (niveau: WARN)
   - Description : trop peu d'options d'authentification multi-facteurs activées pour le projet.
   - Impact : augmentation du risque d'accès non autorisé pour comptes privilégiés.
   - Remédiation : activer au minimum OTP via application d'authentification et prévoir méthodes alternatives (backup codes, sms si nécessaire). Documenter le processus d'enrôlement pour les admins.
   - Lien : https://supabase.com/docs/guides/auth/auth-mfa

3. Version Postgres avec patchs disponibles (niveau: WARN)
   - Description : la version détectée `supabase-postgres-17.4.1.069` a des correctifs de sécurité disponibles.
   - Impact : exposition possible à vulnérabilités corrigées dans des versions plus récentes.
   - Remédiation : planifier une montée de version via le dashboard Supabase (sauvegardes complètes, fenêtre de maintenance). Tester sur staging avant prod.
   - Lien : https://supabase.com/docs/guides/platform/upgrading

> **Fin du rapport Supabase Advisors — 2026-01-07**
