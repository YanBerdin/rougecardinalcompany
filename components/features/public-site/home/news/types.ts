export interface NewsItem {
  id: number;
  title: string;
  excerpt: string;
  date: string;
  image: string;
  category: string;
}

export interface NewsViewProps {
  news: NewsItem[];
  isLoading?: boolean;
}
