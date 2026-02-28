"use client";

import { Component } from "react";
import type { ReactNode, ErrorInfo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class HeroSlidesErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[ERR_HERO_SLIDES_001] Error caught in HeroSlides boundary:", error, errorInfo);
  }    render() {
        if (this.state.hasError) {
            return (
                <Card className="border-destructive/50 bg-destructive/5">
                    <CardContent className="pt-6">
                        <div className="flex flex-col items-center gap-4 text-center">
                            <AlertCircle className="h-12 w-12 text-destructive" />
                            <div>
                                <h3 className="font-semibold text-lg">Une erreur est survenue</h3>
                                <p className="text-sm text-muted-foreground">
                                    {this.state.error?.message || "Échec du chargement des diapositives principales"}
                                </p>
                            </div>
                            <Button
                                onClick={() => window.location.reload()}
                                variant="outline"
                            >
                                Recharger la page
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            );
        }

        return this.props.children;
    }
}
