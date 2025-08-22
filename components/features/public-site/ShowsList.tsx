import Link from 'next/link';
import { Calendar, MapPin, Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShowsListProps } from './types';

export function ShowsList({ shows }: ShowsListProps) {
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
