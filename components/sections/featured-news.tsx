"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { NewsSkeleton } from '@/components/skeletons/news-skeleton';

const news = [
  {
    id: 1,
    title: "Nomination aux Molières 2024",
    excerpt: "Notre spectacle 'Les Murmures du Temps' a été nominé dans la catégorie Meilleur Spectacle d'Auteur Contemporain.",
    date: "2025-08-15",
    image: "https://images.pexels.com/photos/3184421/pexels-photo-3184421.jpeg?auto=compress&cs=tinysrgb&w=600",
    category: "Prix"
  },
  {
    id: 2,
    title: "Tournée Nationale 2024",
    excerpt: "Retrouvez-nous dans 15 villes de France pour une tournée exceptionnelle de nos créations phares.",
    date: "2025-09-10",
    image: "https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=600",
    category: "Tournée"
  },
  {
    id: 3,
    title: "Résidence de Création",
    excerpt: "La compagnie entame une résidence de trois mois au Théâtre de la Ville pour sa prochaine création.",
    date: "2025-12-05",
    image: "https://images.pexels.com/photos/3184340/pexels-photo-3184340.jpeg?auto=compress&cs=tinysrgb&w=600",
    category: "Création"
  }
];

// Fonction pour déterminer si on a des actualités "à la une"
const getFeaturedNews = () => {
  // Ici vous pouvez ajouter votre logique pour filtrer les actualités "à la une"
  // Par exemple, filtrer par une propriété "featured" ou par date récente
  const featuredNews = news.filter(item => {
    const itemDate = new Date(item.date);
    const now = new Date();
    const daysDiff = (now.getTime() - itemDate.getTime()) / (1000 * 3600 * 24);
    return daysDiff <= 30; // Actualités des 30 derniers jours
  });
  
  return featuredNews;
};
export function FeaturedNews() {
  const [isLoading, setIsLoading] = useState(true);
  const [featuredNews, setFeaturedNews] = useState<typeof news>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const featured = getFeaturedNews();
      setFeaturedNews(featured);
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <NewsSkeleton />;
  }

  // Si pas d'actualités à la une, ne pas afficher la section
  if (featuredNews.length === 0) {
    return null;
  }
  
  return (
    <section className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">À la Une</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Suivez l'actualité de la compagnie Rouge-Cardinal
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {featuredNews.map((item, index) => (
            <Card key={item.id} className={`card-hover animate-fade-in-up news-card-dark`} style={{ animationDelay: `${index * 0.1}s` }}>
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
              
              <CardContent className="p-6">
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
                  {item.excerpt}
                </p>
              </CardContent>
              
              <CardFooter>
                <Button 
                  variant="ghost" 
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