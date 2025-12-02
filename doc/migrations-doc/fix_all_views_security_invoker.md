# Documentation Projet - Rouge Cardinal Company

## 🔒 Corrections de Sécurité Récentes (Novembre 2025)

### ✅ Vue messages_contact_admin - SECURITY DEFINER → INVOKER

**Date** : 23 novembre 2024  
**Migration** : `20251022160000_fix_all_views_security_invoker.sql`  
**Problème identifié** : Vulnérabilité critique - vue utilisant `SECURITY DEFINER` permettant contournement RLS  
**Solution appliquée** : Changement vers `SECURITY INVOKER` avec `security_invoker = true`  
**Validation** : Testée et appliquée en production ✅

### ✅ Fonction restore_content_version - Correction schéma

**Date** : 23 novembre 2024  
**Migration** : `20251123143116_fix_restore_content_version_published_at.sql`  
**Problème identifié** : Référence à colonne inexistante `published_at` dans table `spectacles`  
**Solution appliquée** : Remplacement par champ `public` (boolean) correct  
**Validation** : `supabase db lint --linked` passe sans erreurs ✅

**Impact global** : Sécurité renforcée + intégrité schéma validée

**Dernière mise à jour** : 213 novembre 2025  
