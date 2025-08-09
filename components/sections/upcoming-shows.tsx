"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, MapPin, Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const shows = [
  {
    id: 1,
    title: "Les Murmures du Temps",
    description: "Un voyage poétique à travers les âges, où passé et présent se rencontrent dans un dialogue bouleversant.",
    date: "2025-08-15",
    time: "20h30",
    venue: "Théâtre de la Ville",
    location: "Paris",
    image: "https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=600",
    status: "Bientôt complet",
    genre: "Drame contemporain"
  },
  {
    id: 2,
    title: "Fragments d'Éternité",
    description: "Une création originale qui explore les liens invisibles qui nous unissent, entre rire et larmes.",
    date: "2025-09-28",
    time: "19h00",
    venue: "Théâtre des Abbesses",
    location: "Paris",
    image: "https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=600",
    status: "Première",
    genre: "Création originale"
  },
  {
    id: 3,
    title: "La Danse des Ombres",
    description: "Adaptation moderne d'un classique, revisité avec audace et sensibilité par notre équipe artistique.",
    date: "2025-08-12",
    time: "20h00",
    venue: "Centre Culturel",
    location: "Lyon",
    image: "https://images.pexels.com/photos/3184340/pexels-photo-3184340.jpeg?auto=compress&cs=tinysrgb&w=600",
    status: "Tournée",
    genre: "Classique revisité"
  }
];

export function UpcomingShows() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="h-8 bg-muted animate-pulse rounded mb-4 max-w-md mx-auto" />
            <div className="h-6 bg-muted animate-pulse rounded max-w-2xl mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card rounded-lg overflow-hidden">
                <div className="h-48 bg-muted animate-pulse" />
                <div className="p-6 space-y-4">
                  <div className="h-6 bg-muted animate-pulse rounded" />
                  <div className="h-4 bg-muted animate-pulse rounded" />
                  <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                  <div className="space-y-2">
                    <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
                    <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
                    <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
                  </div>
                  <div className="flex space-x-2">
                    <div className="h-10 bg-muted animate-pulse rounded flex-1" />
                    <div className="h-10 bg-muted animate-pulse rounded w-20" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Prochains Spectacles</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Découvrez notre programmation et réservez vos places
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {shows.map((show, index) => (
            <Card key={show.id} className={`card-hover animate-fade-in-up overflow-hidden shows-card-dark`} style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="relative">
                <div
                  className="h-48 bg-cover bg-center"
                  style={{ backgroundImage: `url(${show.image})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute top-4 left-4">
                  <Badge variant={
                    show.status === 'Première' ? 'default' :
                      show.status === 'Bientôt complet' ? 'destructive' : 'secondary'
                  } className={
                    show.status === 'Première' ? 'bg-primary text-primary-foreground' :
                      show.status === 'Bientôt complet' ? 'bg-orange-500 text-white' : ''
                  }>
                    {show.status}
                  </Badge>
                </div>
                <div className="absolute bottom-4 left-4 text-white card-meta">
                  <div className="text-sm opacity-90">{show.genre}</div>
                </div>
              </div>

              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-3 hover:text-primary transition-colors card-title">
                  <Link href={`/spectacles/${show.id}`}>
                    {show.title}
                  </Link>
                </h3>
                <p className="mb-4 text-sm leading-relaxed card-text">
                  {show.description}
                </p>

                <div className="space-y-2 text-sm card-meta">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-3 text-primary" />
                    {new Date(show.date).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-3 text-primary" />
                    {show.time}
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-3 text-primary" />
                    {show.venue} - {show.location}
                  </div>
                </div>
              </CardContent>

              <CardFooter className="pt-0">
                <div className="flex space-x-2 w-full">
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
                    size="sm"
                    asChild
                    className="btn-outline"
                  >
                    <Link href={`/spectacles/${show.id}`}>
                      Détails
                    </Link>
                  </Button>
                </div>
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
            <Link href="/agenda">
              Voir tout l'agenda
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}