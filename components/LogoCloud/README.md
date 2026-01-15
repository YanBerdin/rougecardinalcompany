# LogoCloud Component

Composant de défilement infini de logos de partenaires pour Rouge Cardinal Company.

## Fonctionnalités

- ✨ Défilement horizontal infini et fluide
- 🎭 Design théâtral élégant adapté à l'identité Rouge Cardinal
- ⚡ Performance optimisée avec Next.js Image et Link
- 🎨 Effets de survol sophistiqués (grayscale → color)
- ⏸️ Pause au survol (configurable)
- 📱 Responsive design (mobile → desktop)
- ♿ Accessible avec `prefers-reduced-motion`
- 🎛️ Vitesse d'animation configurable

## Utilisation

### Exemple basique

```tsx
import { LogoCloud } from "@/components/LogoCloud";

const partners = [
  { name: "Théâtre National", logo: "/partners/theatre-national.png" },
  { name: "Ville de Paris", logo: "/partners/ville-paris.png" },
  { name: "Région Île-de-France", logo: "/partners/region-idf.png" },
];

export default function Page() {
  return <LogoCloud partners={partners} />;
}
```

### Exemple avancé

```tsx
<LogoCloud
  partners={partners}
  title="Nos Partenaires Culturels"
  subtitle="Ensemble, nous créons des expériences théâtrales inoubliables."
  speed="slow"
  pauseOnHover={true}
  className="bg-card"
/>
```

## Props

### `partners` (required)

Array d'objets Partner avec les propriétés suivantes :

```typescript
interface Partner {
  name: string;        // Nom du partenaire (utilisé pour l'alt text)
  logo: string;        // Chemin vers le logo
  width?: number;      // Largeur personnalisée (défaut: 150px)
  height?: number;     // Hauteur personnalisée (défaut: 60px)
}
```

### `title` (optional)

- **Type** : `string`
- **Défaut** : `"Nos Partenaires"`
- **Description** : Titre principal de la section

### `subtitle` (optional)

- **Type** : `string`
- **Défaut** : `"Ils nous font confiance pour créer des expériences théâtrales mémorables."`
- **Description** : Sous-titre descriptif

### `speed` (optional)

- **Type** : `"slow" | "normal" | "fast"`
- **Défaut** : `"normal"`
- **Description** : Vitesse de défilement
  - `slow`: 60 secondes pour un cycle complet
  - `normal`: 50 secondes
  - `fast`: 30 secondes

### `pauseOnHover` (optional)

- **Type** : `boolean`
- **Défaut** : `true`
- **Description** : Pause l'animation au survol de la souris

### `className` (optional)

- **Type** : `string`
- **Défaut** : `""`
- **Description** : Classes CSS additionnelles pour le conteneur principal

## Styling

Le composant utilise :

- **Couleurs** : Variables CSS du design system Rouge Cardinal
  - `--background` pour le fond
  - `--primary` pour les accents
  - `--muted-foreground` pour le texte secondaire
  
- **Effets** :
  - Grayscale par défaut avec transition couleur au survol
  - Opacité 60% → 100% au hover
  - Gradients de masquage sur les bords (32px)

- **Responsive** :
  - Mobile : Gap 8px, hauteur logo 48px
  - Tablet : Gap 12px, hauteur logo 56px
  - Desktop : Gap 16px, hauteur logo 64px

## Accessibilité

- ♿ Respecte `prefers-reduced-motion` (désactive l'animation)
- 🖼️ Texte alternatif sur toutes les images
- ⌨️ Navigation clavier supportée
- 📱 Touch-friendly sur mobile

## Performance

- Utilise `Next.js Image` avec `loading="lazy"`
- Animation CSS native (GPU-accelerated)
- Pas de JavaScript lourd côté client
- Clone DOM minimal pour le défilement infini

## Intégration avec DAL

Pour récupérer les partenaires depuis la base de données :

```tsx
// app/(marketing)/page.tsx
import { LogoCloud } from "@/components/LogoCloud";
import { fetchPartners } from "@/lib/dal/partners";

export default async function HomePage() {
  const result = await fetchPartners({ active: true });
  const partners = result.success ? result.data : [];

  return (
    <div>
      {/* ... autres sections ... */}
      <LogoCloud partners={partners} />
    </div>
  );
}
```

## Exemples de customisation

### Thème sombre

```tsx
<LogoCloud
  partners={partners}
  className="bg-black/90 border-t border-white/10"
/>
```

### Intégration section hero

```tsx
<section className="bg-gradient-to-b from-black to-card">
  <Hero />
  <LogoCloud
    partners={partners}
    title="Soutenus par"
    subtitle=""
    speed="slow"
    className="py-20"
  />
</section>
```

### Multi-rangées (variante future)

Pour afficher plusieurs rangées de logos, dupliquer le composant avec différentes vitesses :

```tsx
<div className="space-y-8">
  <LogoCloud partners={row1} speed="slow" />
  <LogoCloud partners={row2} speed="fast" direction="reverse" />
</div>
```

## Notes techniques

- L'animation utilise `transform: translateX()` pour de meilleures performances GPU
- Les logos sont dupliqués pour créer un défilement infini sans coupure
- Les gradients de masquage assurent une transition fluide sur les bords
- Le composant est **Client Component** pour gérer l'état de pause hover

## Roadmap

- [ ] Support direction reverse (droite → gauche)
- [ ] Variante verticale
- [ ] Mode grille statique (sans animation)
- [ ] Lazy loading des logos au scroll
- [ ] Analytics tracking des hovers
