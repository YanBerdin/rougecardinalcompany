"use client";

import * as Sentry from "@sentry/nextjs";
import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    componentName?: string;
    showError?: boolean;
    className?: string;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ComponentErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
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
                errorBoundary: "ComponentErrorBoundary",
                componentName: this.props.componentName,
            },
            tags: {
                errorBoundary: "component",
                component: this.props.componentName || "unknown",
            },
            level: "warning",
        });

        console.error("[ComponentErrorBoundary] Caught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div
                    className={cn(
                        "flex items-center justify-center rounded-lg border border-dashed border-muted-foreground/25 bg-muted/50 p-4",
                        this.props.className,
                    )}
                >
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <AlertCircle className="h-4 w-4" />
                        <span>
                            {this.props.showError && this.state.error
                                ? this.state.error.message
                                : "Composant indisponible"}
                        </span>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
