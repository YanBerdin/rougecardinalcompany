import type { Metadata } from "next";
import { requireAdminPageAccess } from "@/lib/auth/roles";
import { FooterConfigContainer } from "@/components/features/admin/footer/FooterConfigContainer";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
    title: "Footer | Admin",
};

export default async function FooterAdminPage() {
    await requireAdminPageAccess();
    return <FooterConfigContainer />;
}
