"use client";

import { useState, useEffect } from 'react';
import { ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const partners = [
    {
        id: 1,
        name: "Théâtre de la Ville",
        type: "Partenaire principal",
        description: "Soutien artistique et technique pour nos créations",
        logo: "https://logo.clearbit.com/theatredelaville-paris.com",
        website: "https://theatredelaville.com"
    },
    {
        id: 2,
        name: "Région Île-de-France",
        type: "Soutien public",
        description: "Subvention pour le développement culturel",
        logo: "https://logo.clearbit.com/iledefrance.fr",
        website: "https://iledefrance.fr"
    },
    {
        id: 3,
        name: "Crédit Agricole",
        type: "Mécénat",
        description: "Soutien financier pour nos projets éducatifs",
        logo: "https://logo.clearbit.com/credit-agricole.fr",
        website: "https://fondation.credit-agricole.com"
    },
    {
        id: 4,
        name: "Orange",
        type: "Partenaire professionnel",
        description: "Partenaire technologique et mécénat culturel",
        logo: "https://logo.clearbit.com/orange.fr",
        website: "https://orange.fr"
    },
    {
        id: 5,
        name: "BNP Paribas",
        type: "Partenaire artistique",
        description: "Mécénat et soutien aux arts de la scène",
        logo: "https://logo.clearbit.com/bnpparibas.com",
        website: "https://bnpparibas.com"
    },
    {
        id: 6,
        name: "SNCF Connect",
        type: "Partenaire éducatif",
        description: "Partenaire mobilité pour les tournées",
        logo: "https://logo.clearbit.com/sncf-connect.com",
        website: "https://sncf-connect.com"
    }
];

export function Partners() {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 600);

        return () => clearTimeout(timer);
    }, []);

    if (isLoading) {
        return (
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <div className="h-8 bg-muted animate-pulse rounded mb-4 max-w-md mx-auto" />
                        <div className="h-6 bg-muted animate-pulse rounded max-w-2xl mx-auto" />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="bg-card rounded-lg p-6 border">
                                <div className="h-16 bg-muted animate-pulse rounded mb-4" />
                                <div className="h-4 bg-muted animate-pulse rounded mb-2" />
                                <div className="h-3 bg-muted animate-pulse rounded" />
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold mb-4">Nos Partenaires</h2>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Ils nous accompagnent et soutiennent notre démarche artistique
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-12">
                    {partners.map((partner, index) => (
                        <Card
                            key={partner.id}
                            className="card-hover animate-fade-in-up group cursor-pointer transition-all duration-300 hover:shadow-xl"
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            <CardContent className="p-6 text-center h-full flex flex-col justify-between">
                                <div>
                                    <div className="relative mb-4 overflow-hidden rounded-lg">
                                        <div className="h-16 flex items-center justify-center bg-white/5 dark:bg-white/10 rounded-lg transition-transform duration-300 group-hover:scale-110">
                                            <img
                                                src={partner.logo}
                                                alt={`Logo ${partner.name}`}
                                                className="max-h-12 max-w-full object-contain filter brightness-0 dark:brightness-100 dark:invert-0 group-hover:brightness-100 transition-all duration-300"
                                                onError={(e) => {
                                                    // Fallback si le logo ne charge pas
                                                    const target = e.target as HTMLImageElement;
                                                    target.style.display = 'none';
                                                    const fallback = document.createElement('div');
                                                    fallback.className = 'w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center text-primary font-bold text-lg';
                                                    fallback.textContent = partner.name.charAt(0);
                                                    target.parentNode?.appendChild(fallback);
                                                }}
                                            />
                                        </div>
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    </div>

                                    <h3 className="font-semibold text-sm mb-2 group-hover:text-primary transition-colors">
                                        {partner.name}
                                    </h3>

                                    <p className="text-xs text-primary font-medium mb-2">
                                        {partner.type}
                                    </p>

                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        {partner.description}
                                    </p>
                                </div>

                                <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <ExternalLink className="h-4 w-4 mx-auto text-primary" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Message de remerciement */}
                <div className="text-center">
                    <div className="bg-muted/30 rounded-2xl p-8 max-w-4xl mx-auto">
                        <h3 className="text-2xl font-semibold mb-4 text-primary">
                            Un Grand Merci
                        </h3>
                        <p className="text-lg text-muted-foreground leading-relaxed">
                            Grâce au soutien de nos partenaires, nous pouvons continuer à créer,
                            innover et partager notre passion pour les arts de la scène.
                            Leur confiance nous permet de développer des projets ambitieux
                            et de toucher un public toujours plus large.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}