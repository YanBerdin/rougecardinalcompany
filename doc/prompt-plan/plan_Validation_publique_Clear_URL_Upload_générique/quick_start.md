# Quick Start Guide: Validation Publique + Upload Générique

**⏱️ Temps estimé**: 15 minutes  
**Pré-requis**: Accès admin au projet

---

## 🚀 Installation (3 minutes)

### Étape 1: Créer les nouveaux fichiers

Copiez les fichiers suivants depuis les artefacts Claude :

```bash
# Types et actions
lib/actions/types.ts
lib/actions/media-actions.ts
lib/actions/index.ts

# Versions consolidées
components/features/admin/spectacles/SpectacleForm.tsx
components/features/admin/media/ImageFieldGroup.tsx
```

### Étape 2: Mettre à jour team/actions.ts

Ajoutez le ré-export deprecated :

```typescript
// app/(admin)/admin/team/actions.ts

/**
 * @deprecated Use uploadMediaImage from @/lib/actions instead
 * Will be removed in v2.0
 */
export { uploadMediaImage as uploadTeamMemberPhoto } from "@/lib/actions";
```

### Étape 3: Vérifier les dépendances

Aucune nouvelle dépendance npm nécessaire ! Tout utilise les packages existants.

---

## ✅ Test rapide (5 minutes)

### Test 1: Brouillon spectacle (pas de blocage)

```bash
# Naviguer vers création spectacle
http://localhost:3000/admin/spectacles/new
```

**Actions** :

1. Remplir uniquement `title`: "Test Brouillon"
2. Garder `public: false` (default)
3. Cliquer "Créer le spectacle"

**Résultat attendu** : ✅ Succès (toast vert)

---

### Test 2: Publication incomplète (validation bloque)

**Actions** :

1. Même page `/admin/spectacles/new`
2. Remplir `title`: "Test Public"
3. Cocher `public: true`
4. Laisser tout le reste vide
5. Cliquer "Créer le spectacle"

**Résultat attendu** :

- 🔴 Alerte rouge visible en haut
- 🔴 Astérisques rouges sur labels
- ❌ Soumission bloquée par Zod

---

### Test 3: Upload image spectacle

**Actions** :

1. Sur `/admin/spectacles/new`
2. Cliquer "Téléverser" (nouveau bouton)
3. Sélectionner une image (< 5MB)
4. Vérifier preview et URL remplie

**Résultat attendu** :

- ✅ Upload réussi (toast vert)
- ✅ Image preview visible
- ✅ `isImageValidated = true` (automatique)

---

### Test 4: Non-régression TeamMemberForm

```bash
# Naviguer vers team
http://localhost:3000/admin/team/new
```

**Actions** :

1. Remplir nom
2. Upload photo (comme avant)
3. Sauvegarder

**Résultat attendu** : ✅ Fonctionne exactement comme avant

---

## 🐛 Troubleshooting (5 minutes)

### Erreur: "Cannot find module '@/lib/actions'"

**Cause** : Fichiers pas créés ou mauvais emplacement

**Solution** :

```bash
# Vérifier structure
ls -la lib/actions/
# Devrait afficher: types.ts, media-actions.ts, index.ts
```

---

### Erreur: "uploadMediaImage is not a function"

**Cause** : Import incorrect

**Solution** :

```typescript
// ❌ Mauvais
import uploadMediaImage from "@/lib/actions";

// ✅ Bon
import { uploadMediaImage } from "@/lib/actions";
```

---

### Alerte rouge ne disparaît pas

**Cause** : `useEffect` dependencies manquantes

**Solution** : Vérifier que SpectacleForm.tsx contient :

```typescript
useEffect(() => {
  // ... logic
}, [
  isPublic,
  currentStatus,
  imageUrl,
  isImageValidated,
  form.watch("genre"),
  form.watch("premiere"),
  form.watch("short_description"),
  form.watch("description"),
]);
```

---

### Upload échoue silencieusement

**Cause** : Permissions Supabase Storage

**Solution** :

```sql
-- Vérifier RLS policies
SELECT * FROM storage.objects WHERE bucket_id = 'medias' LIMIT 1;

-- Si vide, re-run migration
psql $DATABASE_URL < supabase/schemas/02c_storage_buckets.sql
```

---

## 📊 Checklist finale (2 minutes)

Avant de merger :

- [ ] ✅ Test 1 (brouillon) passe
- [ ] ✅ Test 2 (validation) passe
- [ ] ✅ Test 3 (upload) passe
- [ ] ✅ Test 4 (non-régression) passe
- [ ] ✅ Aucune erreur console
- [ ] ✅ TypeScript compile sans erreur
- [ ] ✅ Code formatté (Prettier)
- [ ] ✅ Commit message clair

---

## 🎯 Métriques de succès

**Performance** :

- Upload < 2s pour image 1MB
- Validation URL < 1s
- Form feedback < 100ms

**Qualité** :

- 0 erreurs TypeScript
- 0 warnings ESLint
- 0 console.error en dev

**UX** :

- Feedback visuel immédiat
- Messages clairs et en français
- Workflow intuitif

---

## 🔗 Documentation complète

Pour plus de détails :

- **Architecture** → `IMPLEMENTATION_SUMMARY.md`
- **Migration v2.0** → `MIGRATION.md`
- **Tests exhaustifs** → `TEST_PLAN.md`
- **API Actions** → `lib/actions/README.md`
- **Changements** → `CHANGES_SUMMARY.md`
- **Storage** → `STORAGE_ORGANIZATION.md`

---

## 💬 Support

**Problème persistant ?**

1. Vérifier la documentation ci-dessus
2. Chercher dans les issues GitHub
3. Demander dans #engineering-help (Slack)
4. Créer une issue avec :
   - Version navigateur
   - Logs console
   - Steps pour reproduire

---

## 🎉 C'est tout

Vous avez maintenant :

- ✅ Validation publique progressive
- ✅ Upload générique de médias
- ✅ Feedback visuel temps réel
- ✅ Code type-safe et maintenable

**Prochain step** : Déployer en staging et tester en conditions réelles.

---

**Happy coding!** 🚀
