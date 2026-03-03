export interface NewsItem {
  id: number;
  title: string;
  short_description: string;
  date: string;
  image: string;
  category: string;
}

export interface NewsViewProps {
  news: NewsItem[];
}
