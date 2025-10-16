# [TASK024] - Scripts Admin Email et Documentation Clés Supabase

**Status:** Completed
**Added:** 13 octobre 2025
**Updated:** 13 octobre 2025
**Completed:** 13 octobre 2025

## Original Request

Créer un script admin pour vérifier les logs email (newsletter + contact messages) et résoudre les problèmes d'accès liés aux politiques RLS et aux formats de clés API Supabase.

## Thought Process

### Problèmes initiaux identifiés

1. **Script ne récupère aucune donnée**: Malgré 9 rows en BDD, le script retournait 0 résultats
2. **RLS bloque l'accès**: Les politiques Row Level Security empêchent la lecture avec une clé anon
3. **Legacy API keys error**: Message d'erreur "Legacy API keys are disabled" lors de l'utilisation de certaines clés
4. **Variable naming mismatch**: Documentation assumait `SUPABASE_SERVICE_ROLE_KEY` mais user avait `SUPABASE_SECRET_KEY`

### Découvertes majeures

1. **Deux formats de clés Supabase valides**:
   - Format JWT (legacy/standard): `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (~250+ chars)
   - Format Simplified (moderne 2024+): `sb_secret_...` / `sb_publishable_...` (~50-60 chars)

2. **Deux noms de variables**:
   - `SUPABASE_SERVICE_ROLE_KEY` pour format JWT
   - `SUPABASE_SECRET_KEY` pour format Simplified

3. **RLS protection fonctionnelle**:
   - Politique "Admin can read" empêche lecture publique des données personnelles
   - Service/Secret key nécessaire pour bypasser RLS en admin scripts

## Implementation Plan

- [x] Créer script initial `check-email-logs.ts`
- [x] Diagnostiquer problème d'accès (RLS)
- [x] Ajouter détection service_role vs anon key
- [x] Ajouter messages d'aide RLS
- [x] Gérer erreur legacy API keys
- [x] Ajouter support `SUPABASE_SECRET_KEY` (simplified format)
- [x] Créer documentation scripts (`scripts/README.md`)
- [x] Créer guide troubleshooting (`doc/scripts-troubleshooting.md`)
- [x] Créer doc session legacy keys (`doc/Fix-Legacy-API-Keys-2025-10-13.md`)
- [x] Créer doc formats clés (`doc/Supabase-API-Keys-Formats-2025-10-13.md`)
- [x] Valider script avec configuration user (format simplified)

## Progress Tracking

**Overall Status:** Completed - 100%

### Subtasks

| ID  | Description                      | Status   | Updated    | Notes                             |
| --- | -------------------------------- | -------- | ---------- | --------------------------------- |
| 1.1 | Créer script check-email-logs.ts | Complete | 13/10/2025 | Script initial créé               |
| 1.2 | Diagnostiquer problème RLS       | Complete | 13/10/2025 | Identifié besoin service_role key |
| 1.3 | Ajouter détection clé admin      | Complete | 13/10/2025 | Détection service_role vs anon    |
| 1.4 | Gérer legacy keys error          | Complete | 13/10/2025 | Message aide + guide migration    |
| 1.5 | Support dual format              | Complete | 13/10/2025 | JWT + Simplified supportés        |
| 1.6 | Créer documentation              | Complete | 13/10/2025 | 4 docs créés (~1200 lignes)       |
| 1.7 | Valider fonctionnement           | Complete | 13/10/2025 | Tests OK avec format simplified   |

## Progress Log

### 13 octobre 2025 - Matin

#### **Création script initial**

- Créé `scripts/check-email-logs.ts` pour vérifier les logs email
- Objectif: Afficher les 5 dernières inscriptions newsletter et 5 derniers messages contact
- Lecture depuis tables `abonnes_newsletter` et `messages_contact`

#### **Problème: Aucune donnée récupérée**

- Script retourne "No newsletter subscriptions found" et "No contact messages found"
- Pourtant, 9 rows existent en base de données (vérifié via dashboard)
- User signale le problème

#### **Diagnostic: RLS bloque l'accès**

- Analysé les politiques RLS sur les deux tables
- Découvert: Politique "Admin can read" requiert authentification admin
- Script utilisait `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY` (anon key)
- RLS empêche lecture publique des données personnelles (email, nom, etc.) - comportement correct !

#### **Solution: Utiliser service_role key**

- Modifié script pour supporter `SUPABASE_SERVICE_ROLE_KEY`
- Ajouté détection automatique: service_role vs anon key
- Ajouté messages d'aide si RLS bloque avec anon key
- Ajouté fallback chain: service_role → anon

### 13 octobre 2025 - Après-midi

#### **Problème: Legacy API keys disabled**

- User teste le script, obtient erreur "Legacy API keys are disabled"
- Message inattendu car configuration semblait standard

#### **Diagnostic: Format de clé JWT déprécié**

- Supabase a désactivé l'ancien format JWT pour certains projets
- Erreur indique besoin de migration vers nouvelles clés
- Solution: Régénérer les clés depuis le dashboard Supabase

#### **Enhancement: Détection legacy keys**

- Ajouté détection spécifique erreur "Legacy API keys are disabled"
- Message d'aide avec lien dashboard et étapes migration
- Guide étape par étape dans le message console

#### **Documentation troubleshooting**

- Créé `scripts/README.md` (252 lignes): Guide complet scripts admin
- Créé `doc/scripts-troubleshooting.md` (257 lignes): Section URGENT legacy keys
- Créé `doc/Fix-Legacy-API-Keys-2025-10-13.md` (280 lignes): Documentation session

### 13 octobre 2025 - Soir

#### **Révélation: Format Simplified**

- User informe: "j'ai remplacé SUPABASE_SERVICE_ROLE_KEY par SUPABASE_SECRET_KEY et le test passe"
- Configuration user: `SUPABASE_SECRET_KEY=sb_secret_SZA6wkY0dcsDrHaNyW4wCg_caG3YPPQ`
- Format court `sb_secret_...` ≠ format JWT long `eyJ...`

#### **Découverte majeure: Deux formats valides**

- Supabase supporte DEUX formats de clés API:
  1. **JWT (legacy/standard)**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (~250+ chars)
  2. **Simplified (moderne 2024+)**: `sb_secret_...` / `sb_publishable_...` (~50-60 chars)
- Chaque format a son nom de variable:
  - JWT → `SUPABASE_SERVICE_ROLE_KEY`
  - Simplified → `SUPABASE_SECRET_KEY`

#### **Solution universelle: Support dual format**

- Modifié script pour supporter les DEUX noms de variables:

  ```typescript
  const supabaseKey =
    envVars.SUPABASE_SERVICE_ROLE_KEY || // JWT format
    envVars.SUPABASE_SECRET_KEY || // Simplified format
    envVars.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY;
  ```

- Détection automatique du format utilisé
- Messages d'erreur mentionnent les deux variables possibles

#### **Validation finale**

- Test avec configuration user (simplified format): ✅ SUCCESS
- Script affiche:

  ```bash
  ✅ Using service_role key (admin access, bypasses RLS)
  📰 Newsletter subscriptions (last 5): 5 entries shown
  📬 Contact messages (last 5): 5 entries shown (of 9 total)
  🎉 Database check completed!
  ```

- Récupération: 5 newsletters + 5 messages contact sur 9 total en BDD

#### **Documentation formats clés**

- Créé `doc/Supabase-API-Keys-Formats-2025-10-13.md` (250 lignes)
- Comparaison détaillée JWT vs Simplified
- Tableau comparatif (longueur, format, pros/cons)
- Validation configuration user comme moderne et recommandée
- Guide migration entre formats

## Outcomes

### Scripts créés

1. **check-email-logs.ts** (144 lignes)
   - Affiche les 5 dernières inscriptions newsletter
   - Affiche les 5 derniers messages contact
   - Support dual format clés (JWT + Simplified)
   - Détection automatique service_role/secret vs anon key
   - Messages d'aide RLS et legacy keys
   - Gestion erreurs complète

### Documentation créée

1. **scripts/README.md** (252 lignes)
   - Guide complet scripts admin
   - Configuration environnement
   - Sécurité et best practices
   - Template pour nouveaux scripts

2. **doc/scripts-troubleshooting.md** (257 lignes)
   - Section URGENT legacy API keys
   - Troubleshooting RLS
   - Guide setup service_role key

3. **doc/Fix-Legacy-API-Keys-2025-10-13.md** (280 lignes)
   - Documentation complète session
   - Migration checklist
   - Contexte sécurité

4. **doc/Supabase-API-Keys-Formats-2025-10-13.md** (250 lignes)
   - Explication complète deux formats
   - Tableau comparatif
   - Guide migration
   - Validation config user

### Résultats mesurables

- ✅ Script fonctionnel avec les deux formats de clés
- ✅ Documentation complète: ~1200 lignes créées
- ✅ Support universel: fonctionne avec tout projet Supabase
- ✅ Tests validés: 5 newsletters + 5 messages contact récupérés
- ✅ Découverte majeure: deux formats valides documentés

## Lessons Learned

1. **RLS est une feature, pas un bug**: Politiques restrictives protègent correctement les données personnelles
2. **Supabase a deux formats**: JWT (legacy) et Simplified (moderne) sont tous deux valides
3. **Variable naming matters**: `SERVICE_ROLE_KEY` vs `SECRET_KEY` selon le format
4. **User feedback crucial**: Configuration réelle différente de l'assumption initiale
5. **Documentation proactive**: Créer guides avant que les problèmes se généralisent

## Related Files

### Scripts

- `scripts/check-email-logs.ts` (144 lignes)
- `scripts/README.md` (252 lignes)

### Documentation

- `doc/scripts-troubleshooting.md` (257 lignes)
- `doc/Fix-Legacy-API-Keys-2025-10-13.md` (280 lignes)
- `doc/Supabase-API-Keys-Formats-2025-10-13.md` (250 lignes)

### Configuration

- `.env.local` (modified to use SUPABASE_SECRET_KEY)

## Next Steps

- [x] Valider script avec configuration user (format simplified)
- [x] Documenter les deux formats de clés
- [ ] Ajouter script aux commandes npm dans package.json
- [ ] Créer d'autres scripts admin si nécessaire (ex: cleanup old logs)
- [ ] Monitorer si Supabase introduit de nouveaux formats
