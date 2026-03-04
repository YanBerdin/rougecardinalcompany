import PresseContainer from "@/components/features/public-site/presse/PresseContainer";

// ✅ SSR: données fraîches à chaque requête (cookies Supabase)
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Espace Média | Rouge-Cardinal",
  description:
    "Ressources presse, revue de médias, communiqués officiels et kit média de la compagnie Rouge-Cardinal.",
};

export default function PressePage() {
  return <PresseContainer />;
}
