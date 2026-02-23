import Header from "@/components/layout/header"
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
    <div className="min-h-screen flex flex-col marketing-content">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
