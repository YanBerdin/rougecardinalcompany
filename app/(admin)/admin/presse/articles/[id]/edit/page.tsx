import { notFound } from "next/navigation";
import { fetchArticleById } from "@/lib/dal/admin-press-articles";
import { ArticleEditForm } from "@/components/features/admin/presse/ArticleEditForm";

export const metadata = {
    title: "Modifier article | Admin",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface EditArticlePageProps {
    params: Promise<{ id: string }>;
}

export default async function EditArticlePage({ params }: EditArticlePageProps) {
    const { id } = await params;
    const result = await fetchArticleById(BigInt(id));

    if (!result.success || !result.data) {
        notFound();
    }

    return (
        <div className="container mx-auto py-8 max-w-4xl">
            <h1 className="text-3xl font-bold mb-6">Modifier l'article</h1>
            <ArticleEditForm article={result.data} />
        </div>
    );
}
