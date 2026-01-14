"use client";

import * as Sentry from "@sentry/nextjs";
import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    pageName?: string;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

interface InternalProps extends Props {
    pathname: string;
}

class PageErrorBoundaryClass extends Component<InternalProps, State> {
    constructor(props: InternalProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        Sentry.captureException(error, {
            extra: {
                componentStack: errorInfo.componentStack,
                errorBoundary: "PageErrorBoundary",
                pageName: this.props.pageName,
                pathname: this.props.pathname,
            },
            tags: {
                errorBoundary: "page",
                page: this.props.pageName || this.props.pathname,
            },
        });

        console.error("[PageErrorBoundary] Caught error:", error, errorInfo);
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="flex min-h-[400px] flex-col items-center justify-center p-8">
                    <AlertTriangle className="mb-4 h-12 w-12 text-amber-500" />
                    <h2 className="mb-2 text-xl font-semibold">
                        Impossible de charger cette page
                    </h2>
                    <p className="mb-6 text-center text-muted-foreground">
                        Une erreur s&apos;est produite lors du chargement de cette section.
                    </p>
                    <Button onClick={this.handleRetry} variant="outline">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Réessayer
                    </Button>
                </div>
            );
        }

        return this.props.children;
    }
}

interface PageErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode;
    pageName?: string;
}

export function PageErrorBoundary({
    children,
    fallback,
    pageName,
}: PageErrorBoundaryProps) {
    // Get pathname from window in client component
    const pathname =
        typeof window !== "undefined" ? window.location.pathname : "unknown";

    return (
        <PageErrorBoundaryClass
            pathname={pathname}
            pageName={pageName}
            fallback={fallback}
        >
            {children}
        </PageErrorBoundaryClass>
    );
}
