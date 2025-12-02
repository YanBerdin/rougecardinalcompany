import { AboutContentContainer } from "@/components/features/admin/home/AboutContentContainer";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
    title: "About Section Management | Admin",
    description: "Manage about section content",
};

export default function AboutContentPage() {
    return (
        <div className="container mx-auto py-8">
            <AboutContentContainer />
        </div>
    );
}
