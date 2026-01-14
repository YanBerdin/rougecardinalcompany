"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

interface GlobalErrorProps {
    error: Error & { digest?: string };
    reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
    useEffect(() => {
        Sentry.captureException(error, {
            tags: {
                errorHandler: "app/global-error.tsx",
                severity: "critical",
            },
            extra: {
                digest: error.digest,
            },
        });
    }, [error]);

    return (
        <html lang="fr">
            <body>
                <div
                    style={{
                        display: "flex",
                        minHeight: "100vh",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "1rem",
                        fontFamily: "system-ui, sans-serif",
                        backgroundColor: "#fafafa",
                    }}
                >
                    <div
                        style={{
                            maxWidth: "400px",
                            textAlign: "center",
                        }}
                    >
                        <div
                            style={{
                                width: "64px",
                                height: "64px",
                                margin: "0 auto 1rem",
                                borderRadius: "50%",
                                backgroundColor: "#fef3c7",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <span style={{ fontSize: "2rem" }}>⚠️</span>
                        </div>
                        <h1
                            style={{
                                fontSize: "1.5rem",
                                fontWeight: "bold",
                                marginBottom: "0.5rem",
                                color: "#1f2937",
                            }}
                        >
                            Erreur critique
                        </h1>
                        <p
                            style={{
                                color: "#6b7280",
                                marginBottom: "1.5rem",
                            }}
                        >
                            Une erreur inattendue s&apos;est produite. Notre équipe a été
                            notifiée.
                        </p>
                        <button
                            onClick={reset}
                            style={{
                                padding: "0.75rem 1.5rem",
                                backgroundColor: "#111827",
                                color: "#fff",
                                border: "none",
                                borderRadius: "0.5rem",
                                cursor: "pointer",
                                fontSize: "1rem",
                                fontWeight: "500",
                            }}
                        >
                            Réessayer
                        </button>
                    </div>
                </div>
            </body>
        </html>
    );
}
