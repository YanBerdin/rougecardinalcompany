import type { Metadata } from "next";
import {
    LEGAL_CONTENT_STYLES,
    SectionHeading,
} from "@/components/features/public-site/legal/legal-components";

export const metadata: Metadata = {
    title: "Politique cookies",
    description:
        "Politique cookies de Rouge Cardinal Company — liste et gestion des cookies déposés sur ce site.",
    robots: { index: true, follow: false },
};

export default function CookiesPage() {
    return (
        <>
            <header className="max-sm:pt-12 pt-16" aria-label="Politique cookies">
                <div className="hero-gradient mx-auto max-sm:py-8 py-10 text-center">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">
                        Politique cookies
                    </h1>
                </div>
            </header>

            <article className="max-w-5xl mx-auto px-4 sm:px-6 py-12 md:py-16">
                <p className="text-foreground/75 leading-relaxed mb-12 text-base md:text-lg pl-5 border-l-4 border-primary">
                    Ce site utilise un nombre limité de cookies et mécanismes de stockage
                    local, tous à usage strictement interne. Aucun traceur publicitaire ni
                    outil d&apos;analytics tiers (Google Analytics, Hotjar, Meta Pixel, etc.)
                    n&apos;est présent.
                </p>

                <div className={LEGAL_CONTENT_STYLES}>
                    <section>
                        <SectionHeading>Qu&apos;est-ce qu&apos;un cookie&nbsp;?</SectionHeading>
                        <p>
                            Un cookie est un petit fichier déposé sur votre terminal
                            (ordinateur, téléphone, tablette) par votre navigateur lors de
                            votre visite sur un site web. Il permet au site de mémoriser des
                            informations sur votre visite.
                        </p>
                    </section>

                    <section>
                        <SectionHeading>Cookies et stockage utilisés</SectionHeading>
                        <div className="overflow-x-auto rounded-lg border border-border/50 mt-4">
                            <table className="w-full text-sm border-collapse">
                                <thead>
                                    <tr className="bg-primary/5 border-b border-border">
                                        <th className="text-left px-4 py-3 font-semibold text-foreground">Nom</th>
                                        <th className="text-left px-4 py-3 font-semibold text-foreground">Stockage</th>
                                        <th className="text-left px-4 py-3 font-semibold text-foreground">Finalité</th>
                                        <th className="text-left px-4 py-3 font-semibold text-foreground whitespace-nowrap">Durée</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/50">
                                    <tr className="hover:bg-muted/40 transition-colors">
                                        <td className="px-4 py-3 align-top">
                                            <code className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-xs font-mono">rc_session_id</code>
                                        </td>
                                        <td className="px-4 py-3 align-top text-foreground/70 text-xs">sessionStorage</td>
                                        <td className="px-4 py-3 align-top text-foreground/80 leading-relaxed">
                                            Identifiant de session anonyme pour la mesure d&apos;audience interne.
                                            Généré aléatoirement à chaque visite, jamais envoyé à un tiers.
                                        </td>
                                        <td className="px-4 py-3 align-top text-foreground/70 text-xs whitespace-nowrap">Session (fermeture onglet)</td>
                                    </tr>
                                    <tr className="hover:bg-muted/40 transition-colors">
                                        <td className="px-4 py-3 align-top">
                                            <code className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-xs font-mono">next-theme</code>
                                        </td>
                                        <td className="px-4 py-3 align-top text-foreground/70 text-xs">localStorage</td>
                                        <td className="px-4 py-3 align-top text-foreground/80 leading-relaxed">
                                            Mémorise votre préférence de thème (clair / sombre). Aucune donnée
                                            personnelle, aucun envoi vers nos serveurs.
                                        </td>
                                        <td className="px-4 py-3 align-top text-foreground/70 text-xs whitespace-nowrap">Persistant</td>
                                    </tr>
                                    <tr className="hover:bg-muted/40 transition-colors">
                                        <td className="px-4 py-3 align-top">
                                            <code className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-xs font-mono">rc_cookie_notice_seen</code>
                                        </td>
                                        <td className="px-4 py-3 align-top text-foreground/70 text-xs">localStorage</td>
                                        <td className="px-4 py-3 align-top text-foreground/80 leading-relaxed">
                                            Indique que vous avez pris connaissance du bandeau d&apos;information
                                            cookies. Évite de ré-afficher le bandeau à chaque visite.
                                        </td>
                                        <td className="px-4 py-3 align-top text-foreground/70 text-xs whitespace-nowrap">Persistant</td>
                                    </tr>
                                    <tr className="hover:bg-muted/40 transition-colors">
                                        <td className="px-4 py-3 align-top text-foreground/80 text-xs leading-relaxed">
                                            Cookies d&apos;authentification Supabase
                                        </td>
                                        <td className="px-4 py-3 align-top text-foreground/70 text-xs">Cookie HTTP<br />(httpOnly, Secure)</td>
                                        <td className="px-4 py-3 align-top text-foreground/80 leading-relaxed">
                                            Maintien de la session utilisateur pour les comptes administrateurs
                                            uniquement. Absent pour les visiteurs sans compte.
                                        </td>
                                        <td className="px-4 py-3 align-top text-foreground/70 text-xs whitespace-nowrap">7 jours (auto-renouvelé)</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </section>

                    <hr className="border-border/40" />

                    <section>
                        <SectionHeading>Analytics interne — exemption CNIL</SectionHeading>
                        <p>
                            La mesure d&apos;audience utilisant{" "}
                            <code>rc_session_id</code> bénéficie de l&apos;exemption de
                            consentement prévue par la délibération CNIL{" "}
                            <code>2020-091</code>, sous réserve que :
                        </p>
                        <ul className="mt-4">
                            <li>
                                L&apos;adresse IP est{" "}
                                <strong>anonymisée avant tout stockage</strong> (les deux
                                derniers octets sont supprimés, ex. 192.168.1.23 →
                                192.168.0.0).
                            </li>
                            <li>
                                L&apos;identifiant de session est <strong>volatile</strong>{" "}
                                (sessionStorage — supprimé à la fermeture de l&apos;onglet).
                            </li>
                            <li>
                                Les données ne sont{" "}
                                <strong>
                                    jamais croisées avec des données d&apos;identification
                                </strong>{" "}
                                ni transmises à un tiers.
                            </li>
                            <li>
                                L&apos;usage est <strong>strictement interne</strong>{" "}
                                (amélioration du site uniquement).
                            </li>
                        </ul>
                        <p className="mt-4">
                            Ces conditions étant remplies, votre consentement préalable
                            n&apos;est pas requis pour cette mesure d&apos;audience.
                        </p>
                    </section>

                    <hr className="border-border/40" />

                    <section>
                        <SectionHeading>Comment gérer vos préférences&nbsp;?</SectionHeading>
                        <p>
                            Vous pouvez à tout moment effacer les données de stockage de
                            votre navigateur (cookies, localStorage, sessionStorage) via les
                            paramètres de votre navigateur :
                        </p>
                        <ul className="mt-4">
                            <li>
                                <strong>Chrome / Edge :</strong> Paramètres → Confidentialité
                                et sécurité → Effacer les données de navigation.
                            </li>
                            <li>
                                <strong>Firefox :</strong> Paramètres → Vie privée et sécurité
                                → Cookies et données de sites.
                            </li>
                            <li>
                                <strong>Safari :</strong> Préférences → Confidentialité →
                                Gérer les données du site.
                            </li>
                        </ul>
                        <p className="mt-4">
                            Pour toute question relative aux cookies :{" "}
                            <a href="mailto:privacy@rougecardinalcompany.fr">
                                privacy@rougecardinalcompany.fr
                            </a>
                            .
                        </p>
                    </section>
                </div>

                <p className="text-sm text-muted-foreground mt-12 pt-6 border-t border-border/30">
                    Dernière mise à jour : juin 2026
                </p>
            </article>
        </>
    );
}
