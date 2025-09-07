export interface NewsItem {
  id: number;
  title: string;
  short_description: string;
  date: string;
  image: string;
  category: string;
  premiere?: string;
}

export interface NewsViewProps {
  news: NewsItem[];
  isLoading?: boolean;
}
