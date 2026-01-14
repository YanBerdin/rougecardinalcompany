import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { RootErrorBoundary } from "@/components/error-boundaries";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Compagnie Rouge Cardinal",
  description:
    "Collectif de jeunes diplômés des grandes écoles théâtrales françaises, la compagnie Rouge-Cardinal est née d'une envie commune : créer un théâtre qui parle à notre époque tout en puisant dans la richesse du patrimoine dramatique",
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
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
