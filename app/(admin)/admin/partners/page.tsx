import { PartnersContainer } from "@/components/features/admin/partners/PartnersContainer";

export const metadata = {
    title: "Partners Management | Admin",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function PartnersPage() {
    return <PartnersContainer />;
}
