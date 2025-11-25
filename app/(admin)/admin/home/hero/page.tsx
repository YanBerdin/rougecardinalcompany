import { HeroSlidesContainer } from "@/components/features/admin/home/HeroSlidesContainer";

export const metadata = {
  title: "Hero Slides Management | Admin",
  description: "Manage homepage hero slides",
};

export default function HeroSlidesPage() {
  return (
    <div className="container mx-auto py-8">
      <HeroSlidesContainer />
    </div>
  );
}
