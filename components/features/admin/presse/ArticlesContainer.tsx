import { fetchAllArticlesAdmin } from "@/lib/dal/admin-press-articles";
import { ArticlesView } from "./ArticlesView";

export async function ArticlesContainer() {
    const result = await fetchAllArticlesAdmin();

    if (!result.success) {
        return (
            <div className="text-red-600">
                Erreur lors du chargement : {result.error}
            </div>
        );
    }

    // Convert bigint to string for client components
    const articlesForClient = result.data.map((article) => ({
        ...article,
        id: String(article.id),
    }));

    return <ArticlesView initialArticles={articlesForClient} />;
}
