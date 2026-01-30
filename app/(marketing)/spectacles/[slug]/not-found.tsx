import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Theater } from "lucide-react";

export default function SpectacleNotFound() {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center px-4">
            <div className="max-w-2xl mx-auto text-center">
                <div className="mb-8">
                    <Theater className="h-24 w-24 text-primary mx-auto mb-6" />
                    <h1 className="text-4xl md:text-6xl font-bold mb-4">
                        Spectacle introuvable
                    </h1>
                    <p className="text-xl text-muted-foreground mb-8">
                        Désolé, le spectacle que vous recherchez n&apos;existe pas ou
                        n&apos;est plus disponible.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button asChild size="lg" variant="default">
                        <Link href="/spectacles">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Voir tous les spectacles
                        </Link>
                    </Button>
                    <Button asChild size="lg" variant="outline">
                        <Link href="/">Retour à l&apos;accueil</Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
