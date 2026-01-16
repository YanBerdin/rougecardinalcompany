# Guide : Utilisation d'URLs d'images externes

## Problème courant

❌ **ERREUR** : `Invalid image type: text/html`

Cette erreur survient quand vous utilisez une URL de **page web** au lieu d'une URL pointant vers le **fichier image lui-même**.

---

## Comment obtenir l'URL correcte

### Unsplash

1. Allez sur la page de la photo (ex: `https://unsplash.com/fr/photos/...`)
2. **Clic droit** sur l'image
3. Sélectionnez **"Copier l'adresse de l'image"** ou **"Copy image address"**
4. Collez l'URL copiée dans le formulaire

**Exemple de bonne URL** :

```bash
https://images.unsplash.com/photo-1234567890123-abc?w=1920&q=80
```

---

### Pexels

Même processus qu'Unsplash :

1. Clic droit sur l'image
2. "Copier l'adresse de l'image"

**Exemple de bonne URL** :

```bash
https://images.pexels.com/photos/123456/photo.jpg
```

---

### Images génériques

Pour toute source d'image, l'URL doit :

- ✅ Se terminer par `.jpg`, `.png`, `.webp`, `.gif`, ou `.svg`
- ✅ Utiliser le protocole `https://`
- ✅ Pointer vers un domaine autorisé (voir `next.config.ts`)

---

## Domaines autorisés

Consultez `next.config.ts` → `images.remotePatterns` pour la liste des domaines autorisés :

- `images.unsplash.com`
- `unsplash.com`
- `images.pexels.com`
- `dummyimage.com`
- `raw.githubusercontent.com`
- `media.licdn.com`
- `*.supabase.co` (votre projet Supabase)

---

## Validation SSRF

Pour des raisons de sécurité, toutes les URLs externes sont validées côté serveur :

1. **Protocole** : Seul `https://` est autorisé
2. **Hostname** : Doit être dans l'allowlist (voir `lib/utils/validate-image-url.ts`)
3. **Type MIME** : Doit être un type image valide (`image/jpeg`, `image/png`, etc.)
4. **Taille** : Recommandé < 5MB

---

## Tests

Exécutez les tests de validation SSRF :

```bash
pnpm exec tsx scripts/test-ssrf-validation.ts
```

Ce script teste 23 cas (16 attaques bloquées + 7 domaines autorisés).

---

## Support

En cas de problème avec une URL, vérifiez :

1. ✅ L'URL pointe bien vers le fichier image (pas la page web)
2. ✅ Le domaine est dans `next.config.ts` → `images.remotePatterns`
3. ✅ Le domaine est dans `lib/utils/validate-image-url.ts` → `ALLOWED_HOSTNAMES`
4. ✅ L'image est accessible publiquement (pas derrière authentification)

---

**Dernière mise à jour** : 8 décembre 2025
