import type { Metadata } from "next";
import type { ReactNode } from "react";
import {
    LEGAL_CONTENT_STYLES,
    SectionHeading,
} from "@/components/features/public-site/legal/legal-components";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Politique de confidentialité",
    description:
        "Politique de confidentialité de Rouge Cardinal Company — comment nous collectons et protégeons vos données personnelles.",
    robots: { index: true, follow: false },
};

interface SubsectionCardProps {
    title: string;
    children: ReactNode;
}

function SubsectionCard({ title, children }: SubsectionCardProps) {
    return (
        <div className="pl-4 border-l border-border/50 space-y-3">
            <h3 className="text-base font-semibold text-foreground">{title}</h3>
            {children}
        </div>
    );
}

export default function PolitiqueConfidentialitePage() {
    return (
        <>
            <header
                className="max-sm:pt-12 pt-16"
                aria-label="Politique de confidentialité"
            >
                <div className="hero-gradient mx-auto max-sm:py-8 py-10 text-center">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">
                        Politique de confidentialité
                    </h1>
                </div>
            </header>

            <article className="max-w-5xl mx-auto px-4 sm:px-6 py-12 md:py-16">
                <p className="text-foreground/75 leading-relaxed mb-12 text-base md:text-lg pl-5 border-l-4 border-primary">
                    Rouge Cardinal s&apos;engage à protéger vos données personnelles
                    conformément au Règlement Général sur la Protection des Données (RGPD —
                    Règlement UE 2016/679) et à la loi Informatique et Libertés.
                </p>

                <div className={LEGAL_CONTENT_STYLES}>
                    <section>
                        <SectionHeading>1. Responsable du traitement</SectionHeading>
                        <p>
                            <strong>Rouge Cardinal</strong>
                            <br />
                            Université Sorbonne-Nouvelle, 04 avenue Saint Mandé, 75012, Paris
                            <br />
                            Contact RGPD :{" "}
                            <Link href="mailto:cie.rougecardinal@gmail.com" className="!text-gold-text hover:!text-gold-light transition-colors">
                                cie.rougecardinal@gmail.com
                            </Link>
                        </p>
                    </section>

                    <section className="space-y-6">
                        <SectionHeading>2. Données collectées et finalités</SectionHeading>

                        <SubsectionCard title="Mesure d'audience interne (analytics)">
                            <p>
                                Lors de votre navigation, nous enregistrons un identifiant de
                                session anonyme (stocké dans votre navigateur le temps de la
                                visite uniquement), l&apos;URL visitée, le type de navigateur
                                (user-agent) et une adresse IP{" "}
                                <strong>anonymisée</strong> (les deux derniers octets sont
                                supprimés avant toute sauvegarde, ex. 192.168.1.23 →
                                192.168.0.0).
                            </p>
                            <p>
                                <strong>Base légale :</strong> intérêt légitime (
                                <code className="!text-gold px-1.5 py-0.5 rounded text-xs font-mono">art. 6.1.f RGPD</code>) - exemption CNIL délibération{" "}
                                <code className="!text-gold px-1.5 py-0.5 rounded text-xs font-mono">2020-091</code> (mesure d&apos;audience strictement
                                interne avec IP anonymisée et aucun croisement avec un tiers).
                            </p>
                            <p>
                                <strong>Durée de conservation :</strong> 90 jours, puis
                                suppression automatique.
                            </p>
                        </SubsectionCard>

                        <SubsectionCard title="Formulaire de contact">
                            <p>
                                Lorsque vous nous contactez via le formulaire, nous collectons
                                votre nom, votre adresse e-mail et le contenu de votre message.
                                Ces informations sont utilisées uniquement pour répondre à votre
                                demande et ne sont jamais transmises à des tiers.
                            </p>
                            <p>
                                <strong>Base légale :</strong> exécution d&apos;un contrat ou
                                mesures précontractuelles (<code className="!text-gold px-1.5 py-0.5 rounded text-xs font-mono">art. 6.1.b RGPD</code>).
                            </p>
                            <p>
                                <strong>Durée de conservation :</strong> 1 an à compter de la
                                dernière interaction.
                            </p>
                        </SubsectionCard>

                        <SubsectionCard title="Newsletter">
                            <p>
                                Si vous vous inscrivez à notre newsletter, nous conservons votre
                                adresse e-mail et la date de votre inscription. En cas de
                                désabonnement, votre adresse est conservée 90 jours dans notre
                                liste d&apos;exclusion pour éviter des envois non désirés, puis
                                définitivement supprimée.
                            </p>
                            <p>
                                <strong>Base légale :</strong> consentement (
                                <code className="!text-gold px-1.5 py-0.5 rounded text-xs font-mono">art. 6.1.a RGPD</code>).
                            </p>
                            <p>
                                <strong>Durée de conservation :</strong> jusqu&apos;au retrait
                                du consentement, puis 90 jours (liste d&apos;exclusion).
                            </p>
                        </SubsectionCard>

                        <SubsectionCard title="Logs d'audit de sécurité">
                            <p>
                                Les actions réalisées sur notre plateforme (connexion,
                                modifications de contenu) sont journalisées à des fins de
                                sécurité.
                            </p>
                            <p>
                                <strong>Base légale :</strong> intérêt légitime (
                                <code className="!text-gold px-1.5 py-0.5 rounded text-xs font-mono">art. 6.1.f RGPD</code>) - exemption CNIL délibération 2019-002.
                            </p>
                            <p>
                                <strong>Durée de conservation :</strong> 90 jours.
                            </p>
                        </SubsectionCard>
                    </section>

                    <section>
                        <SectionHeading>3. Destinataires des données</SectionHeading>
                        <p>
                            Vos données sont traitées par <strong>Rouge Cardinal</strong> et son
                            hébergeur : <strong>Vercel Inc.</strong>. Aucune donnée n&apos;est
                            transmise à des prestataires d&apos;analytics tiers (pas de Google
                            Analytics, Hotjar, Meta Pixel ni outil similaire).
                        </p>
                    </section>

                    <section>
                        <SectionHeading>4. Transferts hors Union Européenne</SectionHeading>
                        <p>
                            Les données sont hébergées au sein de l&apos;Union Européenne. Si
                            un prestataire venait à traiter des données hors UE, des garanties
                            appropriées (clauses contractuelles types de la Commission
                            Européenne) seraient mises en place.
                        </p>
                    </section>

                    <hr className="border-border/40" />

                    <section>
                        <SectionHeading>5. Vos droits</SectionHeading>
                        <p>
                            Conformément au <code className="!text-gold px-1.5 py-0.5 rounded text-xs font-mono">RGPD</code>, vous disposez des droits
                            suivants sur vos données personnelles :
                        </p>
                        <ul className="mt-4">
                            <li>
                                <strong>Droit d&apos;accès</strong> - obtenir une copie des
                                données vous concernant.
                            </li>
                            <li>
                                <strong>Droit de rectification</strong> - corriger des données
                                inexactes.
                            </li>
                            <li>
                                <strong>Droit à l&apos;effacement</strong> - demander la
                                suppression de vos données.
                            </li>
                            <li>
                                <strong>Droit à la limitation</strong> - restreindre certains
                                traitements.
                            </li>
                            <li>
                                <strong>Droit d&apos;opposition</strong> - vous opposer aux
                                traitements fondés sur notre intérêt légitime.
                            </li>
                            <li>
                                <strong>Droit à la portabilité</strong> - recevoir vos données
                                dans un format structuré.
                            </li>
                        </ul>
                        <p className="mt-4">
                            Pour exercer ces droits, contactez-nous à{" "}
                            <Link href="mailto:cie.rougecardinal@gmail.com" className="!text-gold-text hover:!text-gold-light transition-colors">
                                cie.rougecardinal@gmail.com
                            </Link>
                            . Vous pouvez également introduire une réclamation auprès de la
                            CNIL :{" "}
                            <Link
                                href="https://www.cnil.fr"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="!text-chart-2 hover:!text-primary transition-colors"
                            >
                                www.cnil.fr
                            </Link>
                            .
                        </p>
                    </section>

                    <section>
                        <SectionHeading>6. Cookies</SectionHeading>
                        <p>
                            Pour plus d&apos;informations sur les cookies utilisés par ce
                            site, consultez notre{" "}
                            <Link href="/cookies" className="!text-chart-2 hover:!text-primary transition-colors">politique cookies</Link>.
                        </p>
                    </section>

                    <hr className="border-border/40" />

                    <section>
                        <SectionHeading>7. Mises à jour</SectionHeading>
                        <p>
                            Cette politique peut être mise à jour pour refléter les évolutions
                            légales ou de nos pratiques. La date de dernière mise à jour est
                            indiquée ci-dessous.
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
