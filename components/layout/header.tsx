"use client";

import { useState, useEffect, useMemo, useRef } from "react";
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

//TODO: Increase nav link touch target: min-h-11 (44px, WCAG 2.5.5)
/*
interface HeaderProps {
  authContent: ReactNode;
}
*/
//export function Header({ authContent }: HeaderProps) {
export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLight, setIsLight] = useState(false);
  const pathname = usePathname();
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);

  // Helper pour la couleur du texte du header (logo + navigation)
  const headerTextColor = useMemo(() => {
    if (isScrolled) return "text-muted-foreground font-semibold";
    if (pathname === "/" && isLight) return "text-white/70";
    return "text-muted-foreground font-text-muted-foreground";
  }, [isScrolled, pathname, isLight]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close the mobile panel when clicking/tapping outside of it, or pressing Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      const clickedInsideMenu = mobileMenuRef.current?.contains(target);
      const clickedToggleButton = mobileMenuButtonRef.current?.contains(target);
      // The ThemeSwitcher dropdown (Radix) renders its content in a portal
      // appended to <body>, outside mobileMenuRef. Ignore clicks there so
      // picking a theme doesn't force-close the mobile panel.
      const clickedInPortalMenu =
        target instanceof Element &&
        target.closest('[role="menu"], [data-radix-popper-content-wrapper]');

      if (!clickedInsideMenu && !clickedToggleButton && !clickedInPortalMenu) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const updateTheme = () => {
      const hasDarkClass = document.documentElement.classList.contains("dark");
      setIsLight(!hasDarkClass);
    };

    let themeUpdateTimeout: number | null = null;

    const scheduleUpdateTheme = () => {
      if (themeUpdateTimeout !== null) {
        window.clearTimeout(themeUpdateTimeout);
      }
      themeUpdateTimeout = window.setTimeout(() => {
        updateTheme();
      }, 50);
    };

    updateTheme();

    const observer = new MutationObserver(() => {
      scheduleUpdateTheme();
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const mqlListener = () => {
      scheduleUpdateTheme();
    };
    if (mql.addEventListener) mql.addEventListener("change", mqlListener);
    else mql.addListener(mqlListener);

    return () => {
      if (themeUpdateTimeout !== null) {
        window.clearTimeout(themeUpdateTimeout);
      }
      observer.disconnect();
      if (mql.removeEventListener) mql.removeEventListener("change", mqlListener);
      else mql.removeListener(mqlListener); //todo deprecated but still widely supported ?
    };
  }, []);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out",
          isScrolled
            ? "liquid-glass-header header-scrolled"
            : "bg-transparent header-transparent"
        )}
      >
        <nav className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-nowrap justify-between items-center max-sm:h-12 md:h-16 gap-4">
            {/* Logo */}
            <Link href="/" className="logo-container flex-shrink-0">
              <Image
                src="/logo-florian.png"
                alt="Rouge-Cardinal Logo"
                width={40}
                height={40}
                className="logo-image"
                priority
              />
              {/*<span className={cn("logo-text whitespace-nowrap", headerTextColor)}>
              Rouge Cardinal
            </span>*/}
            </Link>

            {/* Navigation Desktop */}
            <div className="hidden md:flex items-center space-x-1 lg:space-x-2 justify-center">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "nav-link-glass text-xs sm:text-sm md:text-md px-2 lg:px-3 py-1 inline-flex items-center font-medium whitespace-nowrap transition-all duration-300 relative z-10",
                    pathname === item.href ? "text-primary active" : headerTextColor
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

              <ThemeSwitcher iconClassName={headerTextColor} />
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center space-x-2">
              <Button
                ref={mobileMenuButtonRef}
                variant="ghost"
                size="sm"
                aria-expanded={isOpen}
                aria-controls="mobile-menu"
                aria-label={isOpen ? "Fermer le menu" : "Ouvrir le menu"}
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                  "nav-link-glass ripple-effect hover:text-accent min-h-11 min-w-11",
                  headerTextColor
                )}
              >
                {isOpen ? (
                  <X className="size-6" />
                ) : (
                  <Menu className="size-6" />
                )}
              </Button>
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile Navigation backdrop - rendered as a sibling of <header> (not a
          descendant) so hovering it never bubbles :hover state up to <header>,
          which was causing the header's hover blur to flicker/tremble whenever
          the cursor moved over the dimmed hero area below the open panel. */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 top-12 z-40 bg-black/40 backdrop-blur-sm animate-fade-in"
          aria-hidden="true"
        />
      )}

      {/* Mobile Navigation - fixed sibling of <header>, positioned right below
          it (top-12 = mobile header height) so it opens as a full-width panel
          outside the header instead of being squeezed inside it */}
      {isOpen && (
        <div
          id="mobile-menu"
          ref={mobileMenuRef}
          className="md:hidden fixed top-12 left-0 right-0 z-50 w-full liquid-glass-mobile border-t animate-fade-in"
        >
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-2">
            {navigation.map((item, index) => (
              <Link
                key={navigation[index].name}
                href={navigation[index].href}
                className={cn(
                  "block px-4 py-3 text-base font-medium transition-all duration-300 nav-link-glass",
                  pathname === navigation[index].href
                    ? "text-primary bg-primary/10 font-bold border border-primary/20 active"
                    : "text-popover-foreground"
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
            <div className="px-2 lg:px-3 border-t border-border/50 pt-3 mt-1">
              <ThemeSwitcher iconClassName="text-popover-foreground" />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
