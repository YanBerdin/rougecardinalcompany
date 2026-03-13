import { HeroSlidesContainer } from "@/components/features/admin/home/HeroSlidesContainer";
import { requireAdminPageAccess } from "@/lib/auth/roles";

export const metadata = {
  title: "Hero Slides Management | Admin",
  description: "Manage homepage hero slides",
};

// Ensure this admin page is always rendered dynamically so mutations appear immediately
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HeroSlidesPage() {
  await requireAdminPageAccess();

  return (
    <div className="container mx-auto py-8">
      <HeroSlidesContainer />
    </div>
  );
}
