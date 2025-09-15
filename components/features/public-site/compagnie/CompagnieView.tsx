"use client";

import { Quote } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { CompagnieViewProps } from './types';
import { CompagnieSkeleton } from '@/components/skeletons/compagnie-skeleton';
import { compagniePresentation } from './data/presentation';

export function CompagnieView({ values, team, loading = false }: CompagnieViewProps) {
    if (loading) {
        return <CompagnieSkeleton />;
    }

    return (
        <div className="pt-16">
            {compagniePresentation.map((section) => {
                if (section.kind === 'hero') {
                    return (
                        <section key={section.id} className="py-20 hero-gradient text-white">
                            <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                                {section.title && (
                                    <h1 className="max-sm:text-4xl text-5xl md:text-6xl xl:text-7xl font-bold mb-6 animate-fade-in-up">
                                        {section.title}
                                    </h1>
                                )}
                                {section.subtitle && (
                                    <p className="max-sm:text-lg text-xl md:text-2xl opacity-90 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                                        {section.subtitle}
                                    </p>
                                )}
                            </div>
                        </section>
                    );
                }

                if (section.kind === 'history') {
                    return (
                        <section key={section.id} className="py-20">
                            <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
                                    <div className="animate-fade-in-up">
                                        {section.title && <h2 className="text-2xl xl:text-3xl font-bold mb-6">{section.title}</h2>}
                                        {section.content?.map((p, i) => (
                                            <p key={i} className={`text-lg xl:text-xl text-muted-foreground ${i < (section.content?.length || 0) - 1 ? 'mb-4' : ''} leading-relaxed`}>
                                                {p}
                                            </p>
                                        ))}
                                    </div>
                                    {section.image && (
                                        <div className="animate-fade-in max-md:p-2">
                                            <div
                                                className="aspect-[8/5] rounded-2xl bg-cover bg-center shadow-2xl"
                                                style={{ backgroundImage: `url(${section.image})` }}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>
                    );
                }

                if (section.kind === 'quote' && section.quote) {
                    return (
                        <section key={section.id} className="pt-0 -mt-12">
                            <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                                <div className="bg-muted/30 rounded-2xl p-8 mb-16">
                                    <div className="flex items-start space-x-4">
                                        <Quote className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
                                        <div>
                                            <blockquote className="text-lg xl:text-xl italic text-muted-foreground mb-4">
                                                {section.quote.text}
                                            </blockquote>
                                            {section.quote.author && (
                                                <cite className="text-primary font-semibold">{section.quote.author}</cite>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    );
                }

                if (section.kind === 'values') {
                    return (
                        <section key={section.id} className="py-20 bg-muted/30">
                            <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                                <div className="text-center mb-16">
                                    {section.title && <h2 className="max-sm:text-2xl text-3xl font-bold mb-4">{section.title}</h2>}
                                    {section.subtitle && (
                                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                                            {section.subtitle}
                                        </p>
                                    )}
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
                    );
                }

                if (section.kind === 'team') {
                    return (
                        <section key={section.id} className="py-20">
                            <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                                <div className="text-center mb-16">
                                    {section.title && <h2 className="text-3xl font-bold mb-4">{section.title}</h2>}
                                    {section.subtitle && (
                                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                                            {section.subtitle}
                                        </p>
                                    )}
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
                    );
                }

                if (section.kind === 'mission') {
                    return (
                        <section key={section.id} className="py-20 hero-gradient">
                            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                                {section.title && <h2 className="text-3xl font-bold mb-6 text-white">{section.title}</h2>}
                                {section.content?.[0] && (
                                    <p className="text-xl text-white/90 mb-8 leading-relaxed">
                                        {section.content[0]}
                                    </p>
                                )}
                                {section.content?.[1] && (
                                    <p className="text-lg text-white/80 leading-relaxed">
                                        {section.content[1]}
                                    </p>
                                )}
                            </div>
                        </section>
                    );
                }

                return null;
            })}
        </div>
    );
}
