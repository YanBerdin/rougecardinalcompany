import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer";
import { PageViewTracker } from "@/components/features/analytics/PageViewTracker";
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
    <div className="min-h-screen flex flex-col marketing-content">
      {/* Skip link — WCAG 2.4.1 : contourner la navigation répétée */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-background focus:text-foreground focus:ring-2 focus:ring-ring"
      >
        Aller au contenu principal
      </a>
      <PageViewTracker />
      <Header />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
