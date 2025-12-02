#!/bin/bash

# Script de migration vers Route Groups - Rouge Cardinal Company
# Utilisation: ./migrate-route-groups.sh
# Rollback: git reset --hard HEAD (si erreur)

set -e  # Arrêt en cas d'erreur

# Couleurs pour l'output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Migration Route Groups - Rouge Cardinal Company  ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════╝${NC}"
echo ""

# Vérifier qu'on est dans le bon dossier
if [ ! -f "package.json" ] || [ ! -d "app" ]; then
    echo -e "${RED}❌ Erreur: Ce script doit être exécuté depuis la racine du projet${NC}"
    exit 1
fi

echo -e "${YELLOW}⚠️  Ce script va restructurer votre dossier app/.${NC}"
echo ""

# ========================================
# MODE DRY-RUN: Afficher les changements
# ========================================
echo -e "${BLUE}🔍 Analyse des changements à effectuer...${NC}"
echo ""

echo -e "${YELLOW}📋 Déplacements prévus:${NC}"
echo ""

echo -e "${BLUE}Routes publiques → (marketing)/${NC}"
[ -f "app/page.tsx" ] && echo "  • app/page.tsx → app/(marketing)/page.tsx"
[ -d "app/agenda" ] && echo "  • app/agenda/ → app/(marketing)/agenda/"
[ -d "app/compagnie" ] && echo "  • app/compagnie/ → app/(marketing)/compagnie/"
[ -d "app/spectacles" ] && echo "  • app/spectacles/ → app/(marketing)/spectacles/"
[ -d "app/presse" ] && echo "  • app/presse/ → app/(marketing)/presse/"
[ -d "app/contact" ] && echo "  • app/contact/ → app/(marketing)/contact/"
[ -d "app/protected" ] && echo "  • app/protected/ → app/(marketing)/protected/"

echo ""
echo -e "${BLUE}Routes admin → (admin)/${NC}"
[ -f "app/admin/layout.tsx" ] && echo "  • app/admin/layout.tsx → app/(admin)/layout.tsx"
[ -f "app/admin/page.tsx" ] && echo "  • app/admin/page.tsx → app/(admin)/page.tsx"
[ -d "app/admin/team" ] && echo "  • app/admin/team/ → app/(admin)/team/"

echo ""
echo -e "${BLUE}Nouveaux fichiers créés:${NC}"
echo "  • app/(marketing)/layout.tsx (avec Header + Footer)"
echo "  • app/(admin)/layout.tsx (avec Sidebar uniquement)"

echo ""
echo -e "${BLUE}Fichiers supprimés:${NC}"
[ -f "app/layout.tsx" ] && echo "  • app/layout.tsx (backup créé: app/layout.tsx.backup)"

echo ""
echo -e "${RED}⚠️  URLs modifiées:${NC}"
echo "  • /admin/team → /team"
echo "  • /admin/page → /page"

echo ""
echo -e "${YELLOW}════════════════════════════════════════════════════${NC}"
read -p "Appliquer ces changements? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}❌ Migration annulée${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}🚀 Application des changements...${NC}"
echo ""

# ========================================
# ÉTAPE 1: Backup du layout racine
# ========================================
echo -e "${BLUE}[1/7]${NC} Backup du layout racine..."
if [ -f "app/layout.tsx" ]; then
    cp app/layout.tsx app/layout.tsx.backup
    echo -e "${GREEN}  ✓ Backup créé: app/layout.tsx.backup${NC}"
fi

# ========================================
# ÉTAPE 2: Créer les route groups
# ========================================
echo -e "${BLUE}[2/7]${NC} Création des route groups..."
mkdir -p "app/(marketing)"
mkdir -p "app/(admin)"
echo -e "${GREEN}  ✓ Dossiers créés: (marketing) et (admin)${NC}"

# ========================================
# ÉTAPE 3: Déplacer les routes publiques
# ========================================
echo -e "${BLUE}[3/7]${NC} Déplacement des routes publiques vers (marketing)..."

# Homepage
if [ -f "app/page.tsx" ]; then
    mv app/page.tsx "app/(marketing)/page.tsx"
    echo -e "${GREEN}  ✓ Déplacé: page.tsx → (marketing)/page.tsx${NC}"
fi

# Pages publiques
for dir in agenda compagnie spectacles presse contact; do
    if [ -d "app/$dir" ]; then
        mv "app/$dir" "app/(marketing)/$dir"
        echo -e "${GREEN}  ✓ Déplacé: $dir/ → (marketing)/$dir/${NC}"
    fi
done

# Protected (zone utilisateur authentifié)
if [ -d "app/protected" ]; then
    mv app/protected "app/(marketing)/protected"
    echo -e "${GREEN}  ✓ Déplacé: protected/ → (marketing)/protected/${NC}"
fi

# ========================================
# ÉTAPE 4: Déplacer les routes admin
# ========================================
echo -e "${BLUE}[4/7]${NC} Déplacement des routes admin vers (admin)..."

if [ -d "app/admin" ]; then
    # Déplacer le contenu
    if [ -f "app/admin/layout.tsx" ]; then
        mv app/admin/layout.tsx "app/(admin)/layout.tsx"
        echo -e "${GREEN}  ✓ Déplacé: admin/layout.tsx → (admin)/layout.tsx${NC}"
    fi
    
    if [ -f "app/admin/page.tsx" ]; then
        mv app/admin/page.tsx "app/(admin)/page.tsx"
        echo -e "${GREEN}  ✓ Déplacé: admin/page.tsx → (admin)/page.tsx${NC}"
    fi
    
    # Déplacer team/
    if [ -d "app/admin/team" ]; then
        mv app/admin/team "app/(admin)/team"
        echo -e "${GREEN}  ✓ Déplacé: admin/team/ → (admin)/team/${NC}"
    fi
    
    # Supprimer le dossier admin vide
    if [ -d "app/admin" ] && [ -z "$(ls -A app/admin)" ]; then
        rmdir app/admin
        echo -e "${GREEN}  ✓ Supprimé: dossier admin/ vide${NC}"
    fi
else
    echo -e "${YELLOW}  ⚠️  Dossier app/admin non trouvé (peut-être déjà migré?)${NC}"
fi

# ========================================
# ÉTAPE 5: Créer le layout marketing
# ========================================
echo -e "${BLUE}[5/7]${NC} Création du layout marketing..."

cat > "app/(marketing)/layout.tsx" << 'EOF'
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import type { Metadata } from "next";
// Import globals.css pour Tailwind
import "../globals.css";

export const metadata: Metadata = {
  title: {
    default: "Rouge Cardinal Company",
    template: "%s | Rouge Cardinal Company"
  },
  description: "Compagnie de théâtre professionnelle",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
EOF

echo -e "${GREEN}  ✓ Créé: (marketing)/layout.tsx${NC}"

# ========================================
# ÉTAPE 6: Adapter le layout admin
# ========================================
echo -e "${BLUE}[6/7]${NC} Adaptation du layout admin..."

cat > "app/(admin)/layout.tsx" << 'EOF'
import { requireAdmin } from "@/lib/auth/is-admin";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
// Import globals.css pour Tailwind
import "../globals.css";

export const metadata: Metadata = {
  title: {
    default: "Dashboard Admin",
    template: "%s | Admin - Rouge Cardinal"
  },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Protection admin
  try {
    await requireAdmin();
  } catch {
    redirect("/auth/login");
  }

  return (
    <html lang="fr">
      <body className="min-h-screen bg-gray-50">
        <div className="flex h-screen">
          {/* Sidebar */}
          <aside className="w-64 bg-white border-r">
            <div className="p-4 border-b">
              <h1 className="text-xl font-bold text-primary">
                Rouge Cardinal Admin
              </h1>
            </div>
            <nav className="p-4 space-y-2">
              <a href="/page" className="block px-4 py-2 rounded hover:bg-gray-100 transition-colors">
                📊 Dashboard
              </a>
              <a href="/team" className="block px-4 py-2 rounded hover:bg-gray-100 transition-colors">
                👥 Équipe
              </a>
              <a href="/" className="block px-4 py-2 rounded hover:bg-gray-100 text-gray-600 transition-colors">
                🏠 Retour au site
              </a>
            </nav>
          </aside>

          {/* Main content */}
          <main className="flex-1 overflow-y-auto p-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
EOF

echo -e "${GREEN}  ✓ Créé: (admin)/layout.tsx${NC}"

# ========================================
# ÉTAPE 7: Supprimer le layout racine
# ========================================
echo -e "${BLUE}[7/7]${NC} Suppression du layout racine..."

if [ -f "app/layout.tsx" ]; then
    rm app/layout.tsx
    echo -e "${GREEN}  ✓ Supprimé: app/layout.tsx (backup disponible)${NC}"
fi

# ========================================
# RÉSUMÉ
# ========================================
echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║          ✅ Migration terminée avec succès!        ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${BLUE}📁 Structure finale:${NC}"
echo -e "  app/"
echo -e "  ├── ${GREEN}(marketing)/${NC}        → Site public (Header + Footer)"
echo -e "  │   ├── layout.tsx"
echo -e "  │   ├── page.tsx       → ${YELLOW}/${NC}"
echo -e "  │   ├── agenda/        → ${YELLOW}/agenda${NC}"
echo -e "  │   ├── compagnie/     → ${YELLOW}/compagnie${NC}"
echo -e "  │   ├── spectacles/    → ${YELLOW}/spectacles${NC}"
echo -e "  │   ├── presse/        → ${YELLOW}/presse${NC}"
echo -e "  │   ├── contact/       → ${YELLOW}/contact${NC}"
echo -e "  │   └── protected/     → ${YELLOW}/protected${NC}"
echo -e "  ├── ${GREEN}(admin)/${NC}           → Backoffice (Sidebar uniquement)"
echo -e "  │   ├── layout.tsx"
echo -e "  │   ├── page.tsx       → ${YELLOW}/page${NC} (dashboard)"
echo -e "  │   └── team/          → ${YELLOW}/team${NC}"
echo -e "  ├── auth/             → ${YELLOW}/auth/*${NC} (inchangé)"
echo -e "  └── api/              → ${YELLOW}/api/*${NC} (inchangé)"
echo ""

echo -e "${YELLOW}⚠️  IMPORTANT - URLs modifiées:${NC}"
echo -e "  • ${RED}/admin/team${NC} → ${GREEN}/team${NC}"
echo -e "  • ${RED}/admin/page${NC} → ${GREEN}/page${NC}"
echo ""

echo -e "${BLUE}📝 Prochaines étapes:${NC}"
echo -e "  1. ${YELLOW}Vérifier les changements:${NC}"
echo -e "     git status"
echo -e "     git diff app/"
echo ""
echo -e "  2. ${YELLOW}Tester l'application:${NC}"
echo -e "     pnpm dev"
echo ""
echo -e "  3. ${YELLOW}Vérifier les pages dans le navigateur:${NC}"
echo -e "     • http://localhost:3000 (homepage avec Header)"
echo -e "     • http://localhost:3000/compagnie (avec Header + Footer)"
echo -e "     • http://localhost:3000/team (admin sans Header, Sidebar uniquement)"
echo ""
echo -e "  4. ${YELLOW}Si tout fonctionne, commiter:${NC}"
echo -e "     git add app/"
echo -e "     git commit -m \"refactor(layout): separate marketing and admin with route groups\""
echo ""
echo -e "  5. ${YELLOW}Mettre à jour les liens internes:${NC}"
echo -e "     • Rechercher '/admin/team' → remplacer par '/team'"
echo -e "     • Rechercher '/admin/' dans navigation"
echo -e "     • Vérifier middleware.ts (protection routes)"
echo ""

echo -e "${YELLOW}🔄 Rollback si problème:${NC}"
echo -e "  # Annuler tous les changements non commités"
echo -e "  git reset --hard HEAD"
echo -e "  git clean -fd  # Supprime les nouveaux fichiers"
echo ""
echo -e "  # Restaurer le backup manuel"
echo -e "  mv app/layout.tsx.backup app/layout.tsx"
echo ""

echo -e "${GREEN}✨ Migration terminée!${NC}"
echo ""
echo -e "${YELLOW}💡 Conseil: Faites 'git status' et 'git diff' pour voir exactement ce qui a changé${NC}"
