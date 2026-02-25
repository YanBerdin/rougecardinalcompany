"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";

interface ErrorProps {
    error: Error & { digest?: string };
    reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
    useEffect(() => {
        Sentry.captureException(error, {
            tags: {
                errorHandler: "app/error.tsx",
            },
            extra: {
                digest: error.digest,
            },
        });
    }, [error]);

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
            <div className="max-w-md text-center">
                <AlertTriangle className="mx-auto mb-4 h-16 w-16 text-amber-500" />
                <h1 className="mb-2 text-5xl font-bold">Une erreur est survenue</h1>
                <p className="mb-6 text-muted-foreground">
                    Nous sommes désolés, quelque chose s&apos;est mal passé. Veuillez
                    réessayer.
                </p>
                <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                    <Button onClick={reset} variant="default">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Réessayer
                    </Button>
                    <Button variant="secondary" asChild>
                        <Link href="/">
                            <Home className="mr-2 h-4 w-4" />
                            Accueil
                        </Link>
                    </Button>
                </div>
                {process.env.NODE_ENV === "development" && (
                    <details className="mt-6 text-left">
                        <summary className="cursor-pointer text-sm text-muted-foreground">
                            Détails (dev only)
                        </summary>
                        <pre className="mt-2 overflow-auto rounded bg-muted p-4 text-xs">
                            {error.message}
                            {error.digest && `\nDigest: ${error.digest}`}
                        </pre>
                    </details>
                )}
            </div>
        </div>
    );
}
