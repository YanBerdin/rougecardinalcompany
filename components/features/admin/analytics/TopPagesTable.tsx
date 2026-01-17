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
                        <TableHead className="hidden text-right sm:table-cell">Visiteurs</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {pages.map((page, index) => (
                        <TableRow key={page.pathname}>
                            <TableCell className="font-medium">{index + 1}</TableCell>
                            <TableCell className="max-w-[200px] truncate font-mono text-sm sm:max-w-none">{page.pathname}</TableCell>
                            <TableCell className="text-right">{page.views.toLocaleString()}</TableCell>
                            <TableCell className="hidden text-right sm:table-cell">{page.uniqueVisitors.toLocaleString()}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
