"use client";

"use client";
import { Download, FileText, Video, Image as ImageIcon, Calendar, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PresseSkeleton } from '@/components/skeletons/presse-skeleton';
import { useEffect, useState } from 'react';
// metadata est exporté dans metadata.ts



const pressReleases = [
    {
        id: 1,
        title: "Nomination aux Molières 2024",
        date: "2024-01-15",
        description: "La compagnie Rouge-Cardinal nominée dans la catégorie Meilleur Spectacle d'Auteur Contemporain.",
        fileUrl: "/docs/cp-molieres-2024.pdf",
        fileSize: "245 KB"
    },
    {
        id: 2,
        title: "Tournée Nationale 2024",
        date: "2024-01-10",
        description: "Lancement de la tournée nationale avec 15 dates dans toute la France.",
        fileUrl: "/docs/cp-tournee-2024.pdf",
        fileSize: "312 KB"
    },
    {
        id: 3,
        title: "Nouvelle Création - Fragments d'Éternité",
        date: "2023-12-05",
        description: "Présentation de notre dernière création originale en première au Théâtre des Abbesses.",
        fileUrl: "/docs/cp-fragments-eternite.pdf",
        fileSize: "198 KB"
    }
];

const mediaArticles = [
    {
        id: 1,
        title: "Une compagnie qui marie tradition et modernité",
        publication: "Le Figaro",
        date: "2024-01-20",
        author: "Marie Lecomte",
        type: "Article",
        url: "https://lefigaro.fr/...",
        excerpt: "Rouge-Cardinal réussit le pari audacieux de rendre les classiques accessibles à un public contemporain..."
    },
    {
        id: 2,
        title: "Les Murmures du Temps : un spectacle bouleversant",
        publication: "Télérama",
        date: "2024-01-18",
        author: "Jean-Michel Ribes",
        type: "Critique",
        url: "https://telerama.fr/...",
        excerpt: "Rarement une création aura su toucher avec autant de justesse les cordes sensibles du spectateur..."
    },
    {
        id: 3,
        title: "Interview vidéo - Marie Dubois",
        publication: "France Culture",
        date: "2024-01-12",
        author: "Laure Adler",
        type: "Interview",
        url: "https://franceculture.fr/...",
        excerpt: "La directrice artistique de Rouge-Cardinal nous parle de sa vision du théâtre contemporain..."
    },
    {
        id: 4,
        title: "Portrait d'une compagnie engagée",
        publication: "Les Inrockuptibles",
        date: "2024-01-08",
        author: "Sophie Grassin",
        type: "Portrait",
        url: "https://lesinrocks.com/...",
        excerpt: "Depuis 15 ans, Rouge-Cardinal développe un théâtre exigeant et accessible, miroir de notre époque..."
    }
];

const mediaKit = [
    {
        type: "Photos haute définition",
        description: "Portraits de l'équipe et photos de spectacles",
        icon: ImageIcon,
        fileSize: "45 MB",
        fileUrl: "/media/photos-hd.zip"
    },
    {
        type: "Dossier de presse complet",
        description: "Présentation de la compagnie et biographies",
        icon: FileText,
        fileSize: "2.3 MB",
        fileUrl: "/media/dossier-presse-2024.pdf"
    },
    {
        type: "Vidéos promotionnelles",
        description: "Bandes-annonces et extraits de spectacles",
        icon: Video,
        fileSize: "120 MB",
        fileUrl: "/media/videos-promo.zip"
    }
];



export default function PressePage() {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 2000); // Simule un appel API de 2s
        return () => clearTimeout(timer);
    }, []);

    if (loading) {
        return <PresseSkeleton />;
    }

    return (
        <div className="pt-16">
            {/* Hero Section */}
            <section className="py-20 hero-gradient text-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in-up">
                        Espace Presse
                    </h1>
                    <p className="text-xl md:text-2xl opacity-90 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                        Ressources et actualités pour les médias
                    </p>
                </div>
            </section>

            {/* Contact Presse */}
            <section className="py-12 bg-muted/30">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Card>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="text-lg font-semibold mb-3">Contact Presse</h3>
                                    <div className="space-y-2 text-muted-foreground">
                                        <p><strong>Marie Dubois</strong> - Directrice artistique</p>
                                        <p>📧 presse@rouge-cardinal.fr</p>
                                        <p>📱 +33 6 12 34 56 78</p>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold mb-3">Informations pratiques</h3>
                                    <div className="space-y-2 text-muted-foreground">
                                        <p>Délai de réponse : 24-48h</p>
                                        <p>Accréditations disponibles</p>
                                        <p>Interviews et photos sur demande</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </section>

            {/* Communiqués de Presse */}
            <section className="py-20">
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">Communiqués de Presse</h2>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            Les dernières actualités officielles de la compagnie
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {pressReleases.map((release, index) => (
                            <Card key={release.id} className={`card-hover animate-fade-in-up`} style={{ animationDelay: `${index * 0.1}s` }}>
                                <CardHeader>
                                    <div className="flex items-center justify-between mb-2">
                                        <Badge variant="outline">
                                            {new Date(release.date).toLocaleDateString('fr-FR')}
                                        </Badge>
                                        <span className="text-sm text-muted-foreground">{release.fileSize}</span>
                                    </div>
                                    <CardTitle className="text-lg">{release.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
                                        {release.description}
                                    </p>
                                    <Button className="w-full" asChild>
                                        <a href={release.fileUrl} download>
                                            <Download className="mr-2 h-4 w-4" />
                                            Télécharger le PDF
                                        </a>
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Revue de Presse */}
            <section className="py-20 bg-muted/30">
                <div className=" mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">Revue de Presse</h2>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            Ce que les médias disent de Rouge-Cardinal
                        </p>
                    </div>

                    <div className="space-y-6">
                        {mediaArticles.map((article, index) => (
                            <Card key={article.id} className={`card-hover animate-fade-in-up`} style={{ animationDelay: `${index * 0.05}s` }}>
                                <CardContent className="p-6">
                                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                                        <div className="lg:col-span-3">
                                            <div className="flex items-center space-x-3 mb-3">
                                                <Badge variant={
                                                    article.type === 'Critique' ? 'default' :
                                                        article.type === 'Interview' ? 'secondary' :
                                                            article.type === 'Portrait' ? 'outline' : 'destructive'
                                                }>
                                                    {article.type}
                                                </Badge>
                                                <span className="text-sm text-primary font-medium">{article.publication}</span>
                                                <span className="text-sm text-muted-foreground">
                                                    {new Date(article.date).toLocaleDateString('fr-FR')}
                                                </span>
                                            </div>

                                            <h3 className="text-xl font-semibold mb-2 hover:text-primary transition-colors">
                                                {article.title}
                                            </h3>

                                            <p className="text-muted-foreground mb-3 italic">
                                                "{article.excerpt}"
                                            </p>

                                            <p className="text-sm text-muted-foreground">
                                                Par {article.author}
                                            </p>
                                        </div>

                                        <div className="flex items-center justify-center lg:justify-end">
                                            <Button variant="outline" asChild>
                                                <a href={article.url} target="_blank" rel="noopener noreferrer">
                                                    <ExternalLink className="mr-2 h-4 w-4" />
                                                    Lire l'article
                                                </a>
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Kit Média */}
            <section className="py-20">
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">Kit Média</h2>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            Ressources haute qualité pour vos publications
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {mediaKit.map((item, index) => (
                            <Card key={index} className={`card-hover animate-fade-in-up text-center`} style={{ animationDelay: `${index * 0.1}s` }}>
                                <CardContent className="p-6">
                                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-lg mb-4">
                                        <item.icon className="h-8 w-8 text-primary" />
                                    </div>

                                    <h3 className="text-xl font-semibold mb-3">{item.type}</h3>
                                    <p className="text-muted-foreground mb-4">{item.description}</p>
                                    <p className="text-sm text-muted-foreground mb-6">Taille : {item.fileSize}</p>

                                    <Button className="w-full" asChild>
                                        <a href={item.fileUrl} download>
                                            <Download className="mr-2 h-4 w-4" />
                                            Télécharger
                                        </a>
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Accréditation - MAINTENANT ROUGE COMME "RESTEZ INFORMÉ" */}
            <section className="py-20 hero-gradient">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold mb-6 text-white">Demande d'Accréditation</h2>
                    <p className="text-xl text-white/90 mb-8">
                        Journalistes et critiques, demandez votre accréditation pour nos spectacles
                    </p>
                    <div className="space-y-4 text-white/90 mb-8">
                        <p>
                            Pour toute demande d'accréditation, merci d'envoyer un email à
                            <strong className="text-white"> presse@rouge-cardinal.fr</strong> en précisant :
                        </p>
                        <ul className="text-left max-w-md mx-auto space-y-2">
                            <li>• Votre nom et média</li>
                            <li>• Le spectacle qui vous intéresse</li>
                            <li>• La date souhaitée</li>
                            <li>• Votre carte de presse</li>
                        </ul>
                    </div>
                    <Button size="lg" className="bg-white/10 border-white/30 text-white backdrop-blur-sm hover:bg-white hover:text-black transition-all duration-300 shadow-lg border" asChild>
                        <a href="mailto:presse@rouge-cardinal.fr?subject=Demande d'accréditation">
                            Faire une demande
                        </a>
                    </Button>
                </div>
            </section>
        </div>
    );
}
