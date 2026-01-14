"use client";

import * as Sentry from "@sentry/nextjs";
import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    eventId: string | null;
}

export class RootErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null, eventId: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, eventId: null };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        const eventId = Sentry.captureException(error, {
            extra: {
                componentStack: errorInfo.componentStack,
                errorBoundary: "RootErrorBoundary",
            },
            tags: {
                errorBoundary: "root",
            },
        });

        this.setState({ eventId });

        console.error("[RootErrorBoundary] Caught error:", error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null, eventId: null });
        window.location.href = "/";
    };

    handleReportFeedback = () => {
        if (this.state.eventId) {
            Sentry.showReportDialog({ eventId: this.state.eventId });
        }
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
                    <div className="max-w-md text-center">
                        <h1 className="mb-4 text-4xl font-bold text-destructive">
                            Une erreur est survenue
                        </h1>
                        <p className="mb-6 text-muted-foreground">
                            Nous sommes désolés, une erreur inattendue s&apos;est produite.
                            Notre équipe a été notifiée.
                        </p>
                        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                            <Button onClick={this.handleReset} variant="default">
                                Retour à l&apos;accueil
                            </Button>
                            {this.state.eventId && (
                                <Button onClick={this.handleReportFeedback} variant="outline">
                                    Signaler un problème
                                </Button>
                            )}
                        </div>
                        {process.env.NODE_ENV === "development" && this.state.error && (
                            <details className="mt-6 text-left">
                                <summary className="cursor-pointer text-sm text-muted-foreground">
                                    Détails de l&apos;erreur (dev only)
                                </summary>
                                <pre className="mt-2 overflow-auto rounded bg-muted p-4 text-xs">
                                    {this.state.error.stack}
                                </pre>
                            </details>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
