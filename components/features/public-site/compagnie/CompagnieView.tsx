"use client";

import { Quote } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { CompagnieViewProps } from './types';
import { CompagnieSkeleton } from '@/components/skeletons/compagnie-skeleton';

export function CompagnieView({ values, team, loading = false }: CompagnieViewProps) {
    if (loading) {
        return <CompagnieSkeleton />;
    }

    return (
        <div className="pt-16">
            {/* Hero Section */}
            <section className="py-20 hero-gradient text-white">
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="max-sm:text-4xl text-5xl md:text-6xl xl:text-7xl font-bold mb-6 animate-fade-in-up">
                        La Compagnie Rouge-Cardinal
                    </h1>
                    <p className="max-sm:text-lg text-xl md:text-2xl opacity-90 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                        15 ans de passion pour les arts de la scène
                    </p>
                </div>
            </section>

            {/* Histoire */}
            <section className="py-20">
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
                        <div className="animate-fade-in-up">
                            <h2 className="text-2xl xl:text-3xl font-bold mb-6">Notre Histoire</h2>
                            <p className="text-lg xl:text-xl text-muted-foreground mb-4 leading-relaxed">
                                Fondée en 2008 par un collectif de jeunes diplômés des grandes écoles théâtrales françaises,
                                la compagnie Rouge-Cardinal est née d'une envie commune : créer un théâtre qui parle à notre époque
                                tout en puisant dans la richesse du patrimoine dramatique.
                            </p>
                            <p className="text-lg xl:text-xl text-muted-foreground mb-4 leading-relaxed">
                                Le nom "Rouge-Cardinal" évoque à la fois la passion qui nous anime et la noblesse de notre art.
                                Comme le cardinal, oiseau au plumage éclatant, nous cherchons à apporter couleur et vie sur scène.
                            </p>
                            <p className="text-lg xl:text-xl text-muted-foreground leading-relaxed">
                                Depuis nos débuts, nous avons créé plus de 50 spectacles, tourné dans toute la France et à l'étranger,
                                et remporté plusieurs prix prestigieux pour nos créations originales.
                            </p>
                        </div>
                        <div className="animate-fade-in max-md:p-2">
                            <div
                                className="aspect-[8/5] rounded-2xl bg-cover bg-center shadow-2xl"
                                style={{
                                    backgroundImage: 'url(https://images.pexels.com/photos/3184421/pexels-photo-3184421.jpeg?auto=compress&cs=tinysrgb&w=800)'
                                }}
                            />
                        </div>
                    </div>

                    <div className="bg-muted/30 rounded-2xl p-8 mb-16">
                        <div className="flex items-start space-x-4">
                            <Quote className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
                            <div>
                                <blockquote className="text-lg xl:text-xl italic text-muted-foreground mb-4">
                                    "Le théâtre doit être un miroir de l'âme humaine, un lieu où l'émotion et la réflexion se rencontrent
                                    pour créer du sens et du lien entre les êtres."
                                </blockquote>
                                <cite className="text-primary font-semibold">Marie Dubois, Directrice artistique</cite>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Valeurs */}
            <section className="py-20 bg-muted/30">
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="max-sm:text-2xl text-3xl font-bold mb-4">Nos Valeurs</h2>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            Les principes qui guident notre travail artistique et notre vision du théâtre
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {values.map((value, index) => (
                            <Card key={index} className="text-center card-hover animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                                <CardContent className="p-6">
                                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-lg mb-4">
                                        <value.icon className="h-8 w-8 text-primary" />
                                    </div>
                                    <h3 className="text-xl font-semibold mb-3">{value.title}</h3>
                                    <p className="text-muted-foreground">{value.description}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Équipe */}
            <section className="py-20">
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">Notre Équipe</h2>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            Rencontrez les artistes et techniciens qui donnent vie à nos spectacles
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {team.map((member, index) => (
                            <Card key={index} className="card-hover animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                                <div className="relative overflow-hidden rounded-t-lg">
                                    <div
                                        className="h-64 bg-cover bg-center transition-transform duration-300 hover:scale-105"
                                        style={{ backgroundImage: `url(${member.image})` }}
                                    />
                                </div>
                                <CardContent className="p-6">
                                    <h3 className="text-xl font-semibold mb-2">{member.name}</h3>
                                    <p className="text-primary font-medium mb-3">{member.role}</p>
                                    <p className="text-muted-foreground text-sm leading-relaxed">{member.bio}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Mission */}
            <section className="py-20 hero-gradient">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold mb-6 text-white">Notre Mission</h2>
                    <p className="text-xl text-white/90 mb-8 leading-relaxed">
                        Créer des spectacles qui émeuvent, questionnent et rassemblent les publics autour de l'art vivant.
                        Nous nous attachons à rendre le théâtre accessible à tous, en développant des projets artistiques
                        de qualité qui résonnent avec les enjeux de notre société.
                    </p>
                    <p className="text-lg text-white/80 leading-relaxed">
                        Notre engagement va au-delà de la simple représentation : nous menons des actions culturelles
                        en milieu scolaire, participons à des festivals, et soutenons la création contemporaine par
                        des résidences d'artistes et des collaborations avec de jeunes talents.
                    </p>
                </div>
            </section>
        </div>
    );
}
