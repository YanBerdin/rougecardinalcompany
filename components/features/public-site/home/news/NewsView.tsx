import Link from 'next/link';
import { Calendar, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { NewsViewProps } from './types';

// Composant pour afficher les actualités "À la Une"
export function NewsView({ news }: NewsViewProps) {
    if (news.length === 0) {
        return null;
    }

    return (
        <section className="py-20 bg-muted/30">
            <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold mb-4">À la Une</h2>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Suivez l'actualité de la compagnie Rouge-Cardinal
                    </p>
                </div>

                <div className="flex flex-wrap justify-center gap-8 mb-12">
                    {news.map((item, index) => (
                        <Card key={item.id} className={`card-hover animate-fade-in-up news-card-dark w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.33rem)] max-w-sm flex flex-col`} style={{ animationDelay: `${index * 0.1}s` }}>
                            <div className="relative overflow-hidden rounded-t-lg">
                                <div
                                    className="h-48 bg-cover bg-center transition-transform duration-300 hover:scale-105"
                                    style={{ backgroundImage: `url(${item.image})` }}
                                />
                                <div className="absolute top-4 left-4">
                                    <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                                        {item.category}
                                    </span>
                                </div>
                            </div>

                            <CardContent className="p-6 flex flex-col flex-1">
                                <div className="flex items-center card-date text-sm mb-3">
                                    <Calendar className="h-4 w-4 mr-2" />
                                    {new Date(item.date).toLocaleDateString('fr-FR', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </div>

                                <h3 className="text-xl font-semibold mb-3 hover:text-primary transition-colors card-title">
                                    <Link href={`/actualites/${item.id}`}>
                                        {item.title}
                                    </Link>
                                </h3>
                                <p className="leading-relaxed card-text">
                                    {item.short_description}
                                </p>
                            </CardContent>

                            <CardFooter className="mt-auto">
                                <Button
                                    variant="ghost"
                                    size="lg"
                                    className="p-0 h-auto font-medium bg-white/10 border-white/30 text-foreground backdrop-blur-sm hover:bg-primary hover:text-primary-foreground transition-all duration-300 shadow-lg border px-4 py-2 rounded-lg"
                                    asChild
                                >
                                    <Link href={`/actualites/${item.id}`}>
                                        Lire la suite
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>

                <div className="text-center">
                    <Button
                        variant="outline"
                        size="lg"
                        asChild
                        className="cta-blur-button"
                    >
                        <Link href="/actualites">
                            Voir toutes les actualités
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                    </Button>
                </div>
            </div>
        </section>
    );
}
