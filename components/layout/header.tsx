"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
//import type { ReactNode } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { ThemeSwitcher } from "@/components/theme-switcher";

const navigation = [
  { name: "Accueil", href: "/" },
  { name: "La Compagnie", href: "/compagnie" },
  { name: "Spectacles", href: "/spectacles" },
  { name: "Agenda", href: "/agenda" },
  { name: "Presse", href: "/presse" },
  { name: "Contact", href: "/contact" },
];
/*
interface HeaderProps {
  authContent: ReactNode;
}
*/
//export function Header({ authContent }: HeaderProps) {
export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out",
        isScrolled
          ? "liquid-glass-header header-scrolled"
          : "bg-transparent header-transparent"
      )}
    >
      <nav className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-nowrap justify-between items-center h-16">
          {/* Logo - STABILISÉ */}
          <Link href="/" className="logo-container">
            <Image
              src="/logo-florian.png"
              alt="Rouge-Cardinal Logo"
              width={40}
              height={40}
              className="logo-image"
              priority
            />
            <span className="logo-text whitespace-nowrap">Rouge-Cardinal</span>
          </Link>

          {/* Navigation Desktop */}
          <div className="hidden md:flex items-center space-x-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "nav-link-glass sm:text-sm md:text-md font-medium whitespace-nowrap transition-all duration-300 relative z-10",
                  pathname === item.href
                    ? "text-primary font-bold active"
                    : isScrolled
                      ? "text-foreground font-bold"
                      : "text-foreground font-bold"
                )}
              >
                {item.name}
                {pathname === item.href && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-primary rounded-full animate-shimmer" />
                )}
              </Link>
            ))}

            {/* Auth Component */}
            {/*<div className="ml-4">{authContent}</div>*/}

            <ThemeSwitcher />
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
              className={cn(
                "nav-link-glass ripple-effect",
                isScrolled
                  ? "text-foreground hover:text-accent"
                  : "text-foreground hover:text-accent"
              )}
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden animate-fade-in px-4">
            <div className="px-2 pt-4 pb-3 space-y-2 liquid-glass-mobile rounded-2xl mt-4 border">
              {navigation.map((item, index) => (
                <Link
                  key={navigation[index].name}
                  href={navigation[index].href}
                  className={cn(
                    "block px-4 py-3 text-base font-medium transition-all duration-300 nav-link-glass",
                    pathname === navigation[index].href
                      ? "text-primary bg-primary/10 font-bold border border-primary/20 active"
                      : "text-foreground"
                  )}
                  onClick={() => setIsOpen(false)}
                  style={{
                    animationDelay: `${index * 0.1}s`,
                    animation: "fade-in-up 0.4s ease-out forwards",
                  }}
                >
                  <div className="flex items-center justify-between">
                    {navigation[index].name}
                    {pathname === navigation[index].href && (
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                    )}
                  </div>
                </Link>
              ))}

              {/*<div className="px-4 pt-4">{authContent}</div>*/}
              <div className="px-2 space-y-2 nav-link-glass">
              <ThemeSwitcher />
</div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
