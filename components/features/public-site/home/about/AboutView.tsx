import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AboutProps } from './types';

export function AboutView({ stats, content }: AboutProps) {
    return (
        <section className="py-20 pt-16">
            <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    {/* Content */}
                    <div className="animate-fade-in-up">
                        <h2 className="text-4xl font-bold mb-6">{content.title}</h2>
                        <p className="text-lg text-muted-foreground mb-6 leading-relaxed">{content.intro1}</p>
                        <p className="text-lg text-muted-foreground mb-8 leading-relaxed">{content.intro2}</p>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-6 mb-8">
                            {stats.map((stat, index) => (
                                <div key={index} className="text-center">
                                    <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-3">
                                        <stat.icon className="h-6 w-6 text-primary" />
                                    </div>
                                    <div className="text-2xl font-bold text-primary mb-1">{stat.value}</div>
                                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                                </div>
                            ))}
                        </div>

                        <Button
                            size="lg"
                            asChild
                            className="cta-blur-button"
                        >
                            <Link href="/compagnie">
                                Découvrir notre histoire
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                        </Button>
                    </div>

                    {/* Image */}
                    <div className="relative animate-fade-in">
                        <div className="relative">
                            <div className="aspect-[4/5] rounded-2xl bg-cover bg-center shadow-2xl" style={{ backgroundImage: `url(${content.imageUrl})` }} />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl" />
                        </div>

                        {/* Floating Card */}
                        <div className="absolute -bottom-6 -left-6 bg-card p-6 rounded-xl shadow-lg border max-w-xs">
                            <h3 className="font-semibold mb-2 text-primary">{content.missionTitle}</h3>
                            <p className="text-sm text-muted-foreground">{content.missionText}</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
