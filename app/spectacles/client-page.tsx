"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, MapPin, Clock, Users, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SpectaclesSkeleton } from '@/components/skeletons/spectacles-skeleton';

const currentShows = [
    {
        id: 1,
        title: "Les Murmures du Temps",
        description: "Un voyage poétique à travers les âges, où passé et présent se rencontrent dans un dialogue bouleversant. Cette création originale explore les liens invisibles qui nous unissent à travers le temps.",
        genre: "Drame contemporain",
        duration: "1h30",
        cast: 4,
        premiere: "2023-10-15",
        image: "https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=600",
        status: "En tournée",
        awards: ["Nominé aux Molières 2024"]
    },
    {
        id: 2,
        title: "Fragments d'Éternité",
        description: "Une création originale qui explore les liens invisibles qui nous unissent, entre rire et larmes. Un spectacle touchant sur la condition humaine et nos quêtes de sens.",
        genre: "Création originale",
        duration: "1h45",
        cast: 6,
        premiere: "2024-01-12",
        image: "https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=600",
        status: "Nouvelle création",
        awards: []
    }
];

const archivedShows = [
    {
        id: 3,
        title: "La Danse des Ombres",
        description: "Adaptation moderne d'un classique, revisité avec audace et sensibilité par notre équipe artistique.",
        genre: "Classique revisité",
        year: "2023",
        image: "https://images.pexels.com/photos/3184340/pexels-photo-3184340.jpeg?auto=compress&cs=tinysrgb&w=600",
        awards: ["Prix du Public - Festival d'Avignon"]
    },
    {
        id: 4,
        title: "Échos de Liberté",
        description: "Un spectacle engagé sur les droits humains et la liberté d'expression dans le monde contemporain.",
        genre: "Théâtre documentaire",
        year: "2022",
        image: "https://images.pexels.com/photos/3184421/pexels-photo-3184421.jpeg?auto=compress&cs=tinysrgb&w=600",
        awards: ["Mention spéciale - Théâtre et Société"]
    },
    {
        id: 5,
        title: "Rêves d'Enfance",
        description: "Un spectacle familial poétique qui ravive la magie de l'enfance chez petits et grands.",
        genre: "Tout public",
        year: "2021",
        image: "https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=600",
        awards: []
    },
    {
        id: 6,
        title: "Solitudes Partagées",
        description: "Une réflexion intimiste sur la solitude moderne et les moyens de créer du lien dans notre société.",
        genre: "Drame psychologique",
        year: "2020",
        image: "https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=600",
        awards: ["Prix de la Critique"]
    }
];

export default function SpectaclesClientPage() {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Simulate loading time
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    if (isLoading) {
        return <SpectaclesSkeleton />;
    }

    return (
        <div className="pt-16">
            {/* Hero Section */}
            <section className="py-20 hero-gradient text-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in-up">
                        Nos Spectacles
                    </h1>
                    <p className="text-xl md:text-2xl opacity-90 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                        Découvrez notre univers artistique
                    </p>
                </div>
            </section>

            {/* Spectacles Actuels */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">À l'Affiche</h2>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            Nos créations actuellement en représentation
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {currentShows.map((show, index) => (
                            <Card key={show.id} className={`card-hover animate-fade-in-up overflow-hidden shows-card-dark`} style={{ animationDelay: `${index * 0.1}s` }}>
                                <div className="grid grid-cols-1 md:grid-cols-2 h-full">
                                    <div className="relative">
                                        <div
                                            className="h-64 md:h-full bg-cover bg-center"
                                            style={{ backgroundImage: `url(${show.image})` }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/60 to-transparent" />
                                        <div className="absolute top-4 left-4">
                                            <Badge className="bg-primary text-primary-foreground">
                                                {show.status}
                                            </Badge>
                                        </div>
                                        {show.awards.length > 0 && (
                                            <div className="absolute bottom-4 left-4">
                                                <Badge variant="secondary" className="bg-yellow-500 text-yellow-900">
                                                    {show.awards[0]}
                                                </Badge>
                                            </div>
                                        )}
                                    </div>

                                    <CardContent className="p-6 flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="text-sm text-primary font-medium card-meta">{show.genre}</span>
                                                <span className="text-sm card-date">
                                                    Première : {new Date(show.premiere).toLocaleDateString('fr-FR')}
                                                </span>
                                            </div>

                                            <h3 className="text-2xl font-bold mb-4 hover:text-primary transition-colors card-title">
                                                <Link href={`/spectacles/${show.id}`}>
                                                    {show.title}
                                                </Link>
                                            </h3>

                                            <p className="mb-6 leading-relaxed card-text">
                                                {show.description}
                                            </p>

                                            <div className="grid grid-cols-2 gap-4 text-sm mb-6 card-meta">
                                                <div className="flex items-center">
                                                    <Clock className="h-4 w-4 mr-2 text-primary" />
                                                    {show.duration}
                                                </div>
                                                <div className="flex items-center">
                                                    <Users className="h-4 w-4 mr-2 text-primary" />
                                                    {show.cast} comédiens
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex space-x-3">
                                            <Button
                                                className="flex-1 btn-primary"
                                                asChild
                                            >
                                                <Link href={`/spectacles/${show.id}`}>
                                                    Réserver
                                                </Link>
                                            </Button>
                                            <Button
                                                variant="outline"
                                                asChild
                                                className="btn-outline"
                                            >
                                                <Link href={`/spectacles/${show.id}`}>
                                                    Détails
                                                    <ArrowRight className="ml-2 h-4 w-4" />
                                                </Link>
                                            </Button>
                                        </div>
                                    </CardContent>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Archives */}
            <section className="py-20 bg-muted/30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">Nos Créations Passées</h2>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            15 ans de créations théâtrales qui ont marqué notre parcours
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {archivedShows.map((show, index) => (
                            <Card key={show.id} className={`card-hover animate-fade-in-up overflow-hidden shows-card-dark`} style={{ animationDelay: `${index * 0.1}s` }}>
                                <div className="relative">
                                    <div
                                        className="h-48 bg-cover bg-center"
                                        style={{ backgroundImage: `url(${show.image})` }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                    <div className="absolute top-4 left-4">
                                        <Badge variant="secondary">
                                            {show.year}
                                        </Badge>
                                    </div>
                                    {show.awards.length > 0 && (
                                        <div className="absolute bottom-4 left-4">
                                            <Badge className="bg-yellow-500 text-yellow-900 text-xs">
                                                {show.awards[0]}
                                            </Badge>
                                        </div>
                                    )}
                                    <div className="absolute bottom-4 right-4 text-white text-sm card-meta">
                                        {show.genre}
                                    </div>
                                </div>

                                <CardContent className="p-6">
                                    <h3 className="text-xl font-semibold mb-3 hover:text-primary transition-colors card-title">
                                        <Link href={`/spectacles/${show.id}`}>
                                            {show.title}
                                        </Link>
                                    </h3>
                                    <p className="text-sm leading-relaxed mb-4 card-text">
                                        {show.description}
                                    </p>
                                </CardContent>

                                <CardFooter>
                                    <Button
                                        variant="ghost"
                                        className="w-full btn-outline px-4 py-2 rounded-lg"
                                        asChild
                                    >
                                        <Link href={`/spectacles/${show.id}`}>
                                            Voir les détails
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>

                    <div className="text-center mt-12">
                        <p className="text-muted-foreground mb-6">
                            Plus de 40 autres créations depuis 2008...
                        </p>
                        <Button
                            variant="outline"
                            size="lg"
                            className="cta-blur-button"
                        >
                            Voir toutes nos créations
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    );
}
