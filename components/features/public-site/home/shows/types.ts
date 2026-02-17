export interface Show {
  id: number;
  title: string;
  short_description: string;
  image: string;
  slug: string;
  genre?: string | null;
  dates?: string[];
}

export interface ShowsViewProps {
  shows: Show[];
  isLoading?: boolean;
}
