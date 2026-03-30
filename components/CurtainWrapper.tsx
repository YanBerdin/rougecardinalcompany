"use client";

import { useState, useEffect, useCallback, startTransition } from "react";
import CurtainLoader from "./CurtainLoader";

const SESSION_KEY = "curtain-shown";

// "pre-check" : SSR + avant hydration — contenu masqué pour éviter le flash du hero
// "curtain"   : le rideau joue, contenu masqué derrière
// "revealed"  : contenu visible
type Phase = "pre-check" | "curtain" | "revealed";

interface CurtainWrapperProps {
    children: React.ReactNode;
}

export function CurtainWrapper({ children }: CurtainWrapperProps) {
    const [phase, setPhase] = useState<Phase>("pre-check");

    useEffect(() => {
        const reducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;
        const alreadyShown = sessionStorage.getItem(SESSION_KEY);

        startTransition(() => {
            setPhase(!reducedMotion && !alreadyShown ? "curtain" : "revealed");
        });
    }, []);

    const handleComplete = useCallback(() => {
        sessionStorage.setItem(SESSION_KEY, "1");
        setPhase("revealed");
    }, []);

    const isHidden = phase !== "revealed";

    return (
        <>
            {/*
             * Slot stable toujours présent : évite que React DevTools se plaigne
             * d'un nombre variable d'enfants entre les phases.
             * display:contents supprime la boîte CSS du div sans affecter le positionnement
             * des enfants fixed.
             */}
            <div className="contents">
                {phase === "pre-check" && (
                    <div className="fixed inset-0 z-[9999] bg-black pointer-events-none" />
                )}
                {phase === "curtain" && (
                    <CurtainLoader onComplete={handleComplete} />
                )}
            </div>

            {/* Slot contenu — toujours présent, opacité contrôlée */}
            <div
                className="transition-opacity duration-300"
                style={{
                    opacity: isHidden ? 0 : 1,
                    pointerEvents: isHidden ? "none" : undefined,
                }}
                aria-hidden={isHidden || undefined}
            >
                {children}
            </div>
        </>
    );
}
