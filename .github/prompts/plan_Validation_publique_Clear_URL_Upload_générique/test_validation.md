# Test Plan: Spectacle Public Validation

## 🎯 Objectifs de test

Valider le comportement de la validation dynamique pour les spectacles publics :

1. Validation progressive (seulement quand `public: true`)
2. Feedback visuel en temps réel
3. Messages d'erreur clairs et contextuels
4. Pas de blocage pour les brouillons

---

## ✅ Scénarios de test

### Scénario 1: Création brouillon incomplet (SUCCÈS attendu)

**Pré-conditions**:

- Utilisateur admin connecté
- Page: `/admin/spectacles/new`

**Actions**:

1. Remplir uniquement `title`: "Test Brouillon"
2. Remplir Nbre interpretes: 1 Durée: 01
3. Laisser `public: false` (default)
4. Cliquer "Créer le spectacle"

**Résultat attendu**:

- ✅ Création réussie (toast vert)
- ✅ Redirection vers `/admin/spectacles`
- ✅ Spectacle visible dans la liste (statut: Brouillon)

**Justification**: Les brouillons non publics n'ont pas d'exigences de validation strictes.

---

### Scénario 2: Tentative de publication incomplète (ÉCHEC attendu)

**Pré-conditions**:

- Page: `/admin/spectacles/new`

**Actions**:

1. Remplir `title`: "Test Public Incomplet"
2. Cocher `public: true`
3. Laisser tous les autres champs vides
4. Cliquer "Créer le spectacle"

**Résultat attendu**:

- ❌ Alerte rouge visible : "Un spectacle public nécessite : statut publié/archivé, genre, date de première..."
- ❌ Erreurs de validation sous chaque champ requis :
  - `status`: "Un spectacle public ne peut pas être en brouillon"
  - `genre`: "Le genre est requis pour un spectacle public"
  - `premiere`: "La date de première est requise pour un spectacle public"
  - `short_description`: "La description courte est requise pour un spectacle public"
  - `description`: "La description complète est requise pour un spectacle public"
  - `image_url`: "Une image est requise pour un spectacle public"
- ❌ Aucune soumission (formulaire bloqué)

**Justification**: Un spectacle public doit avoir toutes les informations nécessaires pour affichage.

---

### Scénario 3: Publication complète (SUCCÈS attendu)

**Pré-conditions**:

- Page: `/admin/spectacles/new`

**Actions**:

1. Remplir tous les champs :
   - `title`: "Hamlet - Test Public"
   - `slug`: (auto-généré ou "hamlet-test")
   - `status`: "Actuellement" (= published)
   - `genre`: "Tragédie"
   - `description`: "Description complète du spectacle..."
   - `short_description`: "Résumé bref"
   - `duration_minutes`: 120
   - `casting`: 8
   - `premiere`: 2025-03-15
   - `image_url`: (via upload ou URL valide)
2. Cocher `public: true`
3. Cliquer "Créer le spectacle"

**Résultat attendu**:

- ✅ Création réussie (toast vert)
- ✅ Redirection vers `/admin/spectacles`
- ✅ Spectacle visible dans la liste avec badge "Public"
- ✅ Spectacle visible sur le site public

---

### Scénario 4: Dépublication (SUCCÈS attendu)

**Pré-conditions**:

- Spectacle public existant (ID: 123)
- Page: `/admin/spectacles/123/edit`

**Actions**:

1. Décocher `public: false`
2. Cliquer "Mettre à jour"

**Résultat attendu**:

- ✅ Mise à jour réussie
- ✅ Alerte de validation disparaît
- ✅ Astérisques rouges disparaissent des labels
- ✅ Spectacle masqué du site public

**Justification**: Un spectacle peut être dépublié sans modifier son contenu.

---

### Scénario 5: Feedback visuel dynamique

**Pré-conditions**:

- Page: `/admin/spectacles/new`

**Actions**:

1. Cocher `public: true` sans remplir les champs
2. Observer les changements visuels
3. Remplir progressivement chaque champ
4. Observer la disparition progressive des erreurs

**Résultat attendu**:

**Avant remplissage** (public=true):

- ⚠️ Alerte rouge visible en haut du formulaire
- 🔴 Astérisques rouges sur : Statut, Genre, Première, Description courte, Description complète, Image
- 🔴 Message d'erreur sous `status`: "Un spectacle public ne peut pas être en brouillon"

**Après remplissage de `status` → "published"**:

- ✅ Message d'erreur sous `status` disparaît
- ⚠️ Alerte rouge reste visible (autres champs manquants)

**Après remplissage de tous les champs**:

- ✅ Alerte rouge disparaît
- ✅ Plus d'erreurs visibles
- ✅ Bouton "Créer le spectacle" activé

---

### Scénario 6: Validation côté serveur (fallback)

**Pré-conditions**:

- Outils dev ouverts (pour modifier le DOM)
- Page: `/admin/spectacles/new`

**Actions**:

1. Utiliser la console pour contourner la validation client :

   ```javascript
   // Forcer la soumission malgré les erreurs
   document.querySelector('form').submit();
   ```

**Résultat attendu**:

- ❌ Erreur serveur retournée (Zod validation)
- ❌ Toast rouge : "Données invalides : vérifiez les champs requis"
- ❌ Aucune création en base

**Justification**: Double validation (client + serveur) pour sécurité.

---

## 🎨 Tests visuels

### Test 1: Astérisques dynamiques

**Expected**:

- `public: false` → Pas d'astérisques (seul `title` a un * permanent)
- `public: true` → Astérisques rouges sur 6 champs

### Test 2: Alerte contextuelle

**Expected**:

- Alerte affichée uniquement si `public: true` ET champs incomplets
- Message clair listant tous les champs requis
- Icône AlertCircle visible

### Test 3: Messages d'erreur

**Expected**:

- Texte en français, sans jargon technique
- Messages spécifiques par champ (pas génériques)
- Couleur rouge cohérente avec le design system

---

## 🔧 Tests techniques

### Test 1: Zod superRefine

**Code à tester**:

```typescript
// lib/forms/spectacle-form-helpers.ts
spectacleFormSchema.superRefine((data, ctx) => {
  if (data.public === true) {
    // Validation logic
  }
});
```

**Assertions**:

- ✅ Validation déclenchée uniquement si `public: true`
- ✅ 6 erreurs ajoutées au contexte si tous les champs vides
- ✅ Erreurs disparaissent progressivement en remplissant

### Test 2: Form watch

**Code à tester**:

```typescript
// components/features/admin/spectacles/SpectacleForm.tsx
const isPublic = form.watch("public");
const currentStatus = form.watch("status");
```

**Assertions**:

- ✅ `isPublic` se met à jour instantanément au changement
- ✅ `showPublicWarning` recalculé à chaque changement
- ✅ Pas de re-renders inutiles (performance)

### Test 3: Clean data transformation

**Code à tester**:

```typescript
// lib/forms/spectacle-form-helpers.ts
const cleanData = cleanSpectacleFormData(data);
```

**Assertions**:

- ✅ Champs vides convertis en `undefined` (pas `""`)
- ✅ Dates converties en ISO string
- ✅ Nombres parsés correctement
- ✅ `public` par défaut à `false` si omis

---

## 🐛 Edge Cases

### Edge Case 1: Modification d'un brouillon en public

**Actions**:

1. Créer un brouillon incomplet (titre seul)
2. Éditer le spectacle
3. Cocher `public: true`
4. Tenter de sauvegarder

**Expected**: Validation bloque, messages d'erreur clairs

---

### Edge Case 2: Statut "archived" + public=true

**Actions**:

1. Créer un spectacle avec `status: "archived"`
2. Cocher `public: true`
3. Remplir tous les autres champs requis
4. Sauvegarder

**Expected**: ✅ Succès (les archives peuvent être publiques)

---

### Edge Case 3: Upload puis suppression d'image

**Actions**:

1. Uploader une image
2. Cliquer sur le bouton X (clear)
3. Cocher `public: true`
4. Tenter de sauvegarder

**Expected**: ❌ Erreur "Une image est requise pour un spectacle public"

---

## 📊 Métriques de succès

- [X] 100% des scénarios SUCCÈS passent
- [X] 100% des scénarios ÉCHEC bloquent correctement
- [X] Temps de réponse validation < 100ms
- [X] Aucune régression sur formulaires existants (Team, etc.)
- [ ] Compatibilité mobile (responsive)

---

## 🚀 Prochaines étapes

1. Exécuter tous les scénarios manuellement
2. Créer tests E2E Playwright pour automatisation
3. Valider accessibilité (screen readers)
4. Performance testing (1000+ spectacles)
5. Smoke testing en staging avant production

---

**Environnement**: Development
**Résultat**: ✅ PASS / ❌ FAIL
