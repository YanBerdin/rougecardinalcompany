import type { Database as DB } from "@/lib/database.types";

declare global {
  type Database = DB;

  // Tables principales - Spectacles et événements
  type Spectacle = Database["public"]["Tables"]["spectacles"]["Row"];
  type SpectacleInsert = Database["public"]["Tables"]["spectacles"]["Insert"];
  type SpectacleUpdate = Database["public"]["Tables"]["spectacles"]["Update"];

  type Evenement = Database["public"]["Tables"]["evenements"]["Row"];
  type EvenementInsert = Database["public"]["Tables"]["evenements"]["Insert"];
  type EvenementUpdate = Database["public"]["Tables"]["evenements"]["Update"];

  type Lieu = Database["public"]["Tables"]["lieux"]["Row"];
  type LieuInsert = Database["public"]["Tables"]["lieux"]["Insert"];
  type LieuUpdate = Database["public"]["Tables"]["lieux"]["Update"];

  // Tables presse
  type ArticlePresse = Database["public"]["Tables"]["articles_presse"]["Row"];
  type ArticlePresseInsert = Database["public"]["Tables"]["articles_presse"]["Insert"];
  type ArticlePresseUpdate = Database["public"]["Tables"]["articles_presse"]["Update"];

  type CommuniquePresse = Database["public"]["Tables"]["communiques_presse"]["Row"];
  type CommuniquePresseInsert = Database["public"]["Tables"]["communiques_presse"]["Insert"];
  type CommuniquePresseUpdate = Database["public"]["Tables"]["communiques_presse"]["Update"];

  type ContactPresse = Database["public"]["Tables"]["contacts_presse"]["Row"];
  type ContactPresseInsert = Database["public"]["Tables"]["contacts_presse"]["Insert"];
  type ContactPresseUpdate = Database["public"]["Tables"]["contacts_presse"]["Update"];

  // Tables équipe et médias
  type MembreEquipe = Database["public"]["Tables"]["membres_equipe"]["Row"];
  type MembreEquipeInsert = Database["public"]["Tables"]["membres_equipe"]["Insert"];
  type MembreEquipeUpdate = Database["public"]["Tables"]["membres_equipe"]["Update"];

  type Media = Database["public"]["Tables"]["medias"]["Row"];
  type MediaInsert = Database["public"]["Tables"]["medias"]["Insert"];
  type MediaUpdate = Database["public"]["Tables"]["medias"]["Update"];

  // Tables compagnie
  type CompagnieValue = Database["public"]["Tables"]["compagnie_values"]["Row"];
  type CompagnieValueInsert = Database["public"]["Tables"]["compagnie_values"]["Insert"];
  type CompagnieValueUpdate = Database["public"]["Tables"]["compagnie_values"]["Update"];

  type CompagnieStat = Database["public"]["Tables"]["compagnie_stats"]["Row"];
  type CompagnieStatInsert = Database["public"]["Tables"]["compagnie_stats"]["Insert"];
  type CompagnieStatUpdate = Database["public"]["Tables"]["compagnie_stats"]["Update"];

  type CompagniePresentationSection = Database["public"]["Tables"]["compagnie_presentation_sections"]["Row"];
  type CompagniePresentationSectionInsert = Database["public"]["Tables"]["compagnie_presentation_sections"]["Insert"];
  type CompagniePresentationSectionUpdate = Database["public"]["Tables"]["compagnie_presentation_sections"]["Update"];

  // Tables home
  type HomeHeroSlide = Database["public"]["Tables"]["home_hero_slides"]["Row"];
  type HomeHeroSlideInsert = Database["public"]["Tables"]["home_hero_slides"]["Insert"];
  type HomeHeroSlideUpdate = Database["public"]["Tables"]["home_hero_slides"]["Update"];

  type HomeAboutContent = Database["public"]["Tables"]["home_about_content"]["Row"];
  type HomeAboutContentInsert = Database["public"]["Tables"]["home_about_content"]["Insert"];
  type HomeAboutContentUpdate = Database["public"]["Tables"]["home_about_content"]["Update"];

  // Tables partenaires et catégories
  type Partner = Database["public"]["Tables"]["partners"]["Row"];
  type PartnerInsert = Database["public"]["Tables"]["partners"]["Insert"];
  type PartnerUpdate = Database["public"]["Tables"]["partners"]["Update"];

  type Category = Database["public"]["Tables"]["categories"]["Row"];
  type CategoryInsert = Database["public"]["Tables"]["categories"]["Insert"];
  type CategoryUpdate = Database["public"]["Tables"]["categories"]["Update"];

  type Tag = Database["public"]["Tables"]["tags"]["Row"];
  type TagInsert = Database["public"]["Tables"]["tags"]["Insert"];
  type TagUpdate = Database["public"]["Tables"]["tags"]["Update"];

  // Tables newsletter et contact
  type AbonneNewsletter = Database["public"]["Tables"]["abonnes_newsletter"]["Row"];
  type AbonneNewsletterInsert = Database["public"]["Tables"]["abonnes_newsletter"]["Insert"];
  type AbonneNewsletterUpdate = Database["public"]["Tables"]["abonnes_newsletter"]["Update"];

  type MessageContact = Database["public"]["Tables"]["messages_contact"]["Row"];
  type MessageContactInsert = Database["public"]["Tables"]["messages_contact"]["Insert"];
  type MessageContactUpdate = Database["public"]["Tables"]["messages_contact"]["Update"];

  // Tables système
  type Profile = Database["public"]["Tables"]["profiles"]["Row"];
  type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];
  type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

  type ContentVersion = Database["public"]["Tables"]["content_versions"]["Row"];
  type ContentVersionInsert = Database["public"]["Tables"]["content_versions"]["Insert"];
  type ContentVersionUpdate = Database["public"]["Tables"]["content_versions"]["Update"];

  type ConfigurationSite = Database["public"]["Tables"]["configurations_site"]["Row"];
  type ConfigurationSiteInsert = Database["public"]["Tables"]["configurations_site"]["Insert"];
  type ConfigurationSiteUpdate = Database["public"]["Tables"]["configurations_site"]["Update"];
}

export {};
