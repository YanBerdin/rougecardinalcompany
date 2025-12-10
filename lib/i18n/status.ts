export function translateStatus(rawStatus: string | null | undefined): string {
    if (!rawStatus) return "—";

    const s = String(rawStatus)
        .trim()
        .toLowerCase()
        .replace(/_/g, " ")
        .replace(/\s+/g, " ");

    switch (s) {
        case "draft":
        case "brouillon":
        case "projet":
            return "Brouillon";

        case "published":
        case "actuellement":
        case "en cours":
        case "a l'affiche":
        case "a l affiche":
        case "en tournee":
        case "en tournée":
            return "Actuellement";

        case "archived":
        case "archive":
        case "archivé":
        case "terminé":
        case "termine":
        case "annulé":
        case "annule":
            return "Archivé";

        case "en preparation":
        case "en préparation":
            return "En préparation";

        default:
            // Capitalize each word for unknown tokens
            return s
                .split(" ")
                .map((w) => (w.length ? w[0].toUpperCase() + w.slice(1) : w))
                .join(" ");
    }
}

export default translateStatus;
