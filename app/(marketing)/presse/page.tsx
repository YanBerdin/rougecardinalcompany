import PresseContainer from "@/components/features/public-site/presse/PresseContainer";

// ✅ ISR: Cache pour 60 secondes avec revalidation automatique
export const revalidate = 60;

export default function PressePage() {
  return <PresseContainer />;
}
