import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import type { TopPagesTableProps } from "./types";

/**
 * Top Pages Table Component
 *
 * Displays top 10 pages by view count
 */
export function TopPagesTable({ pages, isLoading }: TopPagesTableProps) {
    if (isLoading) {
        return (
            <div className="h-96 flex items-center justify-center">
                <p className="text-muted-foreground">Chargement...</p>
            </div>
        );
    }

    if (pages.length === 0) {
        return (
            <div className="h-96 flex items-center justify-center">
                <p className="text-muted-foreground">Aucune page visitée</p>
            </div>
        );
    }

    return (
        <div className="relative overflow-auto max-h-96">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[50px]">#</TableHead>
                        <TableHead>Page</TableHead>
                        <TableHead className="text-right">Vues</TableHead>
                        <TableHead className="text-right">Visiteurs</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {pages.map((page, index) => (
                        <TableRow key={page.pathname}>
                            <TableCell className="font-medium">{index + 1}</TableCell>
                            <TableCell className="font-mono text-sm">{page.pathname}</TableCell>
                            <TableCell className="text-right">{page.views.toLocaleString()}</TableCell>
                            <TableCell className="text-right">{page.uniqueVisitors.toLocaleString()}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
