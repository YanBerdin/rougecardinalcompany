import type { Metadata } from "next";
import { Geist, Bodoni_Moda } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { RootErrorBoundary } from "@/components/error-boundaries";
import "./globals.css";

const defaultUrl = process.env.NEXT_PUBLIC_SITE_URL
  ? `https://${process.env.NEXT_PUBLIC_SITE_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Compagnie Rouge Cardinal",
  description:
    "Collectif de jeunes diplômés des grandes écoles théâtrales françaises, la compagnie Rouge-Cardinal est née d'une envie commune : créer un théâtre qui parle à notre époque tout en puisant dans la richesse du patrimoine dramatique",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "/",
    siteName: "Compagnie Rouge Cardinal",
    title: "Compagnie Rouge Cardinal | Compagnie de théâtre",
    description:
      "Découvrez les créations et l'actualité de la compagnie de théâtre Rouge Cardinal.",
    images: [
      {
        url: "/home-page-desktop.jpeg",
        width: 1920,
        height: 1080,
        alt: "Scène de théâtre éclairée par des projecteurs",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Compagnie Rouge Cardinal | Compagnie de théâtre",
    description:
      "Découvrez les créations et l'actualité de la compagnie de théâtre Rouge Cardinal.",
    images: ["/home-page-desktop.jpeg"],
  },
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

const bodoniModa = Bodoni_Moda({
  variable: "--font-bodoni-moda",
  display: "swap",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning data-scroll-behavior="smooth" className={`${bodoniModa.variable}`}>
      <body
        className={`${geistSans.className} antialiased`}
        suppressHydrationWarning
      >
        <RootErrorBoundary>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster
              richColors
              position="top-right"
              expand={true}
              closeButton
              toastOptions={{
                duration: 5000,
                className: "toast-custom",
              }}
            />
          </ThemeProvider>
        </RootErrorBoundary>
      </body>
    </html>
  );
}
