# Phase 4.1 & 4.2 - Guide de Tests Manuels

**Objectif:** Valider les animations et l'accessibilité de MediaCard  
**Durée Estimée:** 20-30 minutes  
**Testeur:** Développeur ou QA

---

## 🖥️ Configuration Préalable

### 1. Lancer l'environnement

```bash
cd /home/yandev/projets/rougecardinalcompany
pnpm dev
```

### 2. Accéder à la page

```
http://localhost:3000/admin/medias
```

### 3. Préparer les outils

- **Navigateur:** Chrome/Firefox/Safari (tester multi-browser)
- **Lecteur d'écran:** NVDA (Windows) ou VoiceOver (Mac)
- **DevTools:** Accessibility Inspector
- **Extensions:** axe DevTools (optionnel)

---

## 🎨 Tests Animations (Phase 4.1)

### Test 1: Hover Card

**Action:** Survoler une MediaCard avec la souris

**Résultat Attendu:**

- ✅ Card se soulève légèrement (`-translate-y-1`)
- ✅ Ombre apparaît progressivement (`shadow-lg`)
- ✅ Transition fluide 200ms
- ✅ Retour à la normale quand souris quitte

**Validation:**

```
Transition smooth ? [ ] Oui [ ] Non
Shadow visible ? [ ] Oui [ ] Non
Lift perceptible ? [ ] Oui [ ] Non
```

---

### Test 2: Sélection Checkbox

**Action:** Cliquer sur une card pour la sélectionner

**Résultat Attendu:**

- ✅ Checkbox grossit légèrement (`scale-110`)
- ✅ Background devient primary (rouge)
- ✅ Checkmark icon fade-in (150ms)
- ✅ Ring border 2px primary apparaît

**Validation:**

```
Scale animation visible ? [ ] Oui [ ] Non
Icon fade-in smooth ? [ ] Oui [ ] Non
Border primary visible ? [ ] Oui [ ] Non
```

---

### Test 3: Image Fade-In

**Action:** Scroller pour déclencher lazy loading

**Résultat Attendu:**

- ✅ Skeleton pulse pendant chargement
- ✅ Image fade-in progressif (300ms)
- ✅ Transition opacity de 0 à 100
- ✅ Hover zoom (`scale-105`) fonctionne après load

**Validation:**

```
Skeleton visible d'abord ? [ ] Oui [ ] Non
Fade-in smooth ? [ ] Oui [ ] Non
Hover zoom fonctionne ? [ ] Oui [ ] Non
```

---

### Test 4: Reduced Motion

**Action:** Activer `prefers-reduced-motion` dans DevTools

**Chrome:**

1. F12 → Console
2. Taper: `document.body.style.setProperty('animation-duration', '0.01ms', 'important')`

**OU Settings OS:**

- Windows: Settings → Ease of Access → Display → Show animations OFF
- Mac: System Preferences → Accessibility → Display → Reduce motion

**Résultat Attendu:**

- ✅ Toutes les animations quasi-instantanées (<10ms)
- ✅ Pas de mouvement perceptible
- ✅ Fonctionnalité preserve (sélection, hover states)

**Validation:**

```
Animations désactivées ? [ ] Oui [ ] Non
Sélection fonctionne toujours ? [ ] Oui [ ] Non
```

---

## ♿ Tests Accessibilité (Phase 4.2)

### Test 5: Navigation Clavier

**Action:** Utiliser uniquement le clavier

1. **Tab** jusqu'à une MediaCard
2. **Space** pour sélectionner
3. **Tab** vers la card suivante
4. **Enter** pour sélectionner
5. **Shift+Tab** pour revenir en arrière

**Résultat Attendu:**

- ✅ Focus ring visible (2px primary + offset)
- ✅ Space sélectionne/désélectionne
- ✅ Enter sélectionne/désélectionne
- ✅ Tab navigue entre cards
- ✅ Shift+Tab navigue en arrière

**Validation:**

```
Focus visible ? [ ] Oui [ ] Non
Space fonctionne ? [ ] Oui [ ] Non
Enter fonctionne ? [ ] Oui [ ] Non
Navigation Tab OK ? [ ] Oui [ ] Non
Shift+Tab OK ? [ ] Oui [ ] Non
```

---

### Test 6: ARIA Attributes (DevTools)

**Action:** Inspecter une MediaCard

1. F12 → Elements
2. Sélectionner une `<div role="button">`
3. Vérifier Accessibility Inspector

**Attributs Attendus:**

```html
<div
  role="button"
  tabindex="0"
  aria-label="Sélectionner photo.jpg"
  aria-selected="false"
>
```

**Validation:**

```
role="button" présent ? [ ] Oui [ ] Non
tabindex="0" présent ? [ ] Oui [ ] Non
aria-label descriptif ? [ ] Oui [ ] Non
aria-selected dynamique ? [ ] Oui [ ] Non
```

---

### Test 7: Checkbox ARIA

**Action:** Inspecter la checkbox de sélection

**Attributs Attendus:**

```html
<div
  role="checkbox"
  aria-checked="true"
>
```

**Validation:**

```
role="checkbox" présent ? [ ] Oui [ ] Non
aria-checked dynamique ? [ ] Oui [ ] Non
```

---

### Test 8: Loading State

**Action:** Observer une image en cours de chargement (throttle network)

**Attribut Attendu:**

```html
<div
  role="status"
  aria-label="Chargement de l'image"
>
```

**Validation:**

```
role="status" présent ? [ ] Oui [ ] Non
aria-label descriptif ? [ ] Oui [ ] Non
```

---

### Test 9: Error State

**Action:** Provoquer une erreur image (modifier src dans DevTools)

**Attribut Attendu:**

```html
<div
  role="img"
  aria-label="Erreur de chargement d'image"
>
  <svg aria-hidden="true">
```

**Validation:**

```
role="img" présent ? [ ] Oui [ ] Non
aria-label présent ? [ ] Oui [ ] Non
svg aria-hidden ? [ ] Oui [ ] Non
```

---

### Test 10: Tags List

**Action:** Inspecter une card avec tags

**Structure Attendue:**

```html
<div role="list" aria-label="Tags du média">
  <span role="listitem">Nature</span>
  <span role="listitem">Paysage</span>
  <span aria-label="2 tags supplémentaires">+2</span>
</div>
```

**Validation:**

```
role="list" présent ? [ ] Oui [ ] Non
role="listitem" sur chaque tag ? [ ] Oui [ ] Non
aria-label sur "+N" ? [ ] Oui [ ] Non
```

---

## 🔊 Tests Lecteur d'Écran

### Test 11: NVDA (Windows) / VoiceOver (Mac)

**Action:** Activer lecteur d'écran et naviguer

**NVDA:**

1. Télécharger: https://www.nvaccess.org/
2. Lancer avec Ctrl+Alt+N
3. Tab jusqu'à MediaCard
4. Écouter l'annonce

**VoiceOver (Mac):**

1. Cmd+F5 pour activer
2. VO+Right pour naviguer
3. Écouter l'annonce

**Annonce Attendue (Card non sélectionnée):**
> "Sélectionner photo.jpg, bouton"

**Annonce Attendue (Card sélectionnée):**
> "Désélectionner photo.jpg, bouton, sélectionné"

**Validation:**

```
Nom fichier annoncé ? [ ] Oui [ ] Non
"bouton" annoncé ? [ ] Oui [ ] Non
État sélection annoncé ? [ ] Oui [ ] Non
Action claire ? [ ] Oui [ ] Non
```

---

### Test 12: Tags avec Lecteur

**Annonce Attendue:**
> "Tags du média, liste, 3 éléments: Nature, Paysage, Montagne"

**Validation:**

```
"liste" annoncé ? [ ] Oui [ ] Non
Nombre d'éléments annoncé ? [ ] Oui [ ] Non
Noms tags annoncés ? [ ] Oui [ ] Non
```

---

### Test 13: Loading State avec Lecteur

**Annonce Attendue:**
> "Chargement de l'image, status"

**Validation:**

```bash
"Chargement" annoncé ? [ ] Oui [ ] Non
"status" indiqué ? [ ] Oui [ ] Non
```

---

## 🎯 Contraste Couleurs

### Test 14: Focus Ring Contrast

**Action:** Vérifier contraste avec axe DevTools ou manuellement

1. Installer axe DevTools
2. F12 → axe → Scan All Page
3. Vérifier "Contrast" issues

**Ratios Requis (WCAG AA):**

- Text normal: 4.5:1
- Text large: 3:1
- UI components: 3:1

**Focus ring primary (#ad0000):**

- Vs background light (#faf4e7): Ratio ?
- Vs background dark (#1C1C1C): Ratio ?

**Validation:**

```
Focus ring contraste OK light ? [ ] Oui [ ] Non [ ] À tester
Focus ring contraste OK dark ? [ ] Oui [ ] Non [ ] À tester
```

---

## 📱 Tests Multi-Browser

### Test 15: Compatibilité

**Navigateurs à tester:**

- [ ] Chrome (Desktop)
- [ ] Firefox (Desktop)
- [ ] Safari (Mac)
- [ ] Edge (Windows)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

**Validation par navigateur:**

```
Browser: _________
Animations OK ? [ ] Oui [ ] Non
Keyboard nav OK ? [ ] Oui [ ] Non
ARIA attributes OK ? [ ] Oui [ ] Non
Focus visible ? [ ] Oui [ ] Non
```

---

## 📋 Checklist Finale

### Animations (Phase 4.1)

- [ ] Hover card (shadow + lift)
- [ ] Checkbox scale animation
- [ ] Image fade-in
- [ ] Checkmark icon fade-in
- [ ] Reduced motion support

### Accessibilité (Phase 4.2)

- [ ] Navigation clavier (Tab, Space, Enter)
- [ ] Focus indicators visibles
- [ ] ARIA role="button" sur card
- [ ] ARIA role="checkbox" sur checkbox
- [ ] ARIA role="status" sur loading
- [ ] ARIA role="img" sur error
- [ ] ARIA role="list/listitem" sur tags
- [ ] Lecteur d'écran annonces correctes
- [ ] Contraste couleurs WCAG AA

### Multi-Browser

- [ ] Chrome Desktop
- [ ] Firefox Desktop
- [ ] Safari Mac
- [ ] Edge Windows
- [ ] Mobile (iOS/Android)

---

## 🐛 Rapport de Bugs

**Si problème trouvé, documenter:**

```markdown
### Bug #X: [Titre court]

**Sévérité:** [ ] Critique [ ] Majeur [ ] Mineur

**Navigateur:** Chrome 120 / Firefox 121 / etc.

**Étapes de reproduction:**
1. Step 1
2. Step 2
3. Step 3

**Résultat Observé:**
[Description]

**Résultat Attendu:**
[Description]

**Capture d'écran:** (si applicable)

**Attributs ARIA manquants/incorrects:**
- `role` attendu: ...
- `aria-label` attendu: ...
```

---

## ✅ Validation Finale

**Tous les tests passés ?**

- [ ] Phase 4.1 Animations: **VALIDÉ**
- [ ] Phase 4.2 Accessibilité: **VALIDÉ**
- [ ] Multi-browser: **VALIDÉ**
- [ ] Aucun bug critique: **CONFIRMÉ**

**Signature Testeur:** _____________  
**Date:** _____________  
**Commentaires:**

---

**Guide créé par:** GitHub Copilot  
**Date:** 2025-12-28  
**Version:** 1.0
