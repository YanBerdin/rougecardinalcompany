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
- `plus.unsplash.com`
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

## ➕ Ajouter un nouveau domaine autorisé

> ⚠️ **À faire à chaque nouveau domaine source d'images.** Il y a **3 fichiers à modifier** et il faut les maintenir synchronisés.

### Symptôme à reconnaître

L'erreur suivante dans le formulaire signifie que le domaine n'est pas dans l'allowlist :

```
Hostname not allowed: mon-nouveau-domaine.com. Only Supabase Storage URLs are permitted.
```

### Étape 1 — `lib/utils/validate-image-url.ts`

C'est la **validation SSRF côté serveur** (la plus critique). Ajouter une ligne dans la `Map` `ALLOWED_HOSTNAMES` :

```typescript
// Avant
const ALLOWED_HOSTNAMES: ReadonlyMap<string, string> = new Map([
    ["images.unsplash.com", "images.unsplash.com"],
    // ...
]);

// Après
const ALLOWED_HOSTNAMES: ReadonlyMap<string, string> = new Map([
    ["images.unsplash.com", "images.unsplash.com"],
    ["mon-nouveau-domaine.com", "mon-nouveau-domaine.com"], // ← ajouter ici
    // ...
]);
```

> Le format est `["hostname_entrant", "hostname_canonique"]`. En pratique les deux valeurs sont identiques sauf cas particulier de réécriture.

### Étape 2 — `next.config.ts`

C'est l'autorisation pour le composant `<Image>` de Next.js. Ajouter une entrée dans `images.remotePatterns` :

```typescript
{
  protocol: "https",
  hostname: "mon-nouveau-domaine.com",
  port: "",
  pathname: "/**",
},
```

### Étape 3 — Ce fichier (`doc/guide-url-images-externes.md`)

Tenir à jour la section **Domaines autorisés** ci-dessus pour que la documentation reste la source de vérité.

### Étape 4 — Mettre à jour le script de test (optionnel mais recommandé)

Le script `scripts/test-ssrf-validation.ts` contient une liste de domaines autorisés à tester. Ajouter le nouveau domaine dans la liste des cas "doit passer" pour éviter les régressions.

### Checklist rapide

```
□ lib/utils/validate-image-url.ts  → ALLOWED_HOSTNAMES Map
□ next.config.ts                   → images.remotePatterns
□ doc/guide-url-images-externes.md → section "Domaines autorisés"
□ scripts/test-ssrf-validation.ts  → cas de test (optionnel)
```

---

**Dernière mise à jour** : 21 février 2026
