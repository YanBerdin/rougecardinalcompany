import { ArticleNewForm } from "@/components/features/admin/presse/ArticleNewForm";

export const metadata = {
    title: "Nouvel article presse | Admin",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function NewArticlePage() {
    return (
        <div className="container mx-auto py-8 max-w-4xl">
            <h1 className="text-3xl font-bold mb-6">Nouvel article presse</h1>
            <ArticleNewForm />
        </div>
    );
}
