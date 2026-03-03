import type { HomeStatDTO } from "@/lib/schemas/home-content";

type HomeStatItem = Omit<HomeStatDTO, "id"> & { id: string };

export interface HomeStatsViewProps {
    initialStats: HomeStatItem[];
}

export interface HomeStatFormProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    item?: HomeStatItem | null;
}
