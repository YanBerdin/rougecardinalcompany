export interface Show {
  id: number;
  title: string;
  shortDescription: string;
  image: string;
  slug: string;
  dates?: string[];
}

export interface ShowsViewProps {
  shows: Show[];
  isLoading?: boolean;
}
