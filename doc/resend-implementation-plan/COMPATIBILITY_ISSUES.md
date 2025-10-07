# Issues de Compatibilité - Resend Integration

## 🚨 Problèmes Identifiés

### 1. Auth Helpers Déprécié

**Fichier:** `resend_supabase_integration.md`
**Problème:** Utilise `@supabase/auth-helpers-nextjs` (déprécié)
**Solution:** Migrer vers `@supabase/ssr` avec patterns `getAll/setAll`

### 2. Conflits avec DAL Existante

**Fichier:** Section 5.3 & 5.4 du document
**Problème:** Propose une nouvelle structure DAL qui duplique l'existant
**Solution:** S'adapter aux patterns existants dans `lib/dal/`

### 3. RLS Policies Redondantes

**Fichier:** Section 8.1
**Problème:** Policies déjà implémentées dans `supabase/schemas/10_tables_system.sql`
**Solution:** Référencer les policies existantes

### 4. Server Actions Non-Conformes

**Fichier:** Sections avec `"use server"`
**Problème:** Exports non-async dans fichiers Server Actions
**Solution:** Respecter les contraintes Next.js 15

## ✅ Éléments Réutilisables

1. **Templates React Email** - Structure email parfaitement utilisable
2. **Configuration Resend** - Variables d'environnement et setup
3. **Webhooks Logic** - Gestion des événements Resend
4. **Hooks Client** - `useNewsletterSubscription` adaptable
5. **Types Email** - Interfaces TypeScript utiles

## 🔄 Plan d'Adaptation

### Phase 1: Configuration Resend

- [ ] Installer `resend` et `@react-email/components`
- [ ] Configurer variables d'environnement
- [ ] Adapter templates email au design existant

### Phase 2: Intégration Auth

- [ ] Migrer les patterns auth vers `@supabase/ssr`
- [ ] Adapter le middleware aux patterns existants
- [ ] Intégrer avec la DAL contact existante

### Phase 3: Templates & Hooks

- [ ] Adapter les templates email
- [ ] Intégrer `useNewsletterSubscription` avec l'API existante
- [ ] Tester l'intégration complète

### Phase 4: Webhooks & Monitoring

- [ ] Implémenter les webhooks Resend
- [ ] Ajouter le monitoring des bounces
- [ ] Configurer les alertes

## 📋 Checklist de Validation

- [ ] Aucun import de `auth-helpers-nextjs`
- [ ] Patterns cookies `getAll/setAll` uniquement
- [ ] Réutilisation de la DAL existante
- [ ] Conformité Server Actions Next.js 15
- [ ] RLS policies non-dupliquées
- [ ] Tests d'intégration passants
- [ ] Documentation mise à jour
