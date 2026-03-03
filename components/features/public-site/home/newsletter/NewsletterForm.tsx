"use client";

import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNewsletterContext } from "./NewsletterContext";

export function NewsletterForm() {
    const { email, isLoading, handleEmailChange, handleSubmit } =
        useNewsletterContext();

    return (
        <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4"
        >
            <label htmlFor="email-address" className="sr-only">
                Adresse email
            </label>
            <div className="relative flex-1">
                <Mail
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/50 pointer-events-none"
                    aria-hidden="true"
                />
                <Input
                    id="email-address"
                    name="email"
                    type="email"
                    required
                    placeholder="Votre email"
                    autoComplete="email"
                    value={email}
                    onChange={handleEmailChange}
                    className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/70 focus:bg-white/20 focus:border-white transition-all duration-200"
                />
            </div>
            <Button
                type="submit"
                variant="outline"
                size="lg"
                disabled={isLoading}
                className="bg-chart-6 border-white/30 hover:text-white hover:backdrop-blur-md hover:bg-white/30 text-red-800 hover:scale-95 active:scale-100 transition-all duration-200 shadow-lg whitespace-nowrap disabled:opacity-50 disabled:hover:scale-90"
            >
                {isLoading ? "Inscription..." : "S'inscrire"}
            </Button>
        </form>
    );
}

