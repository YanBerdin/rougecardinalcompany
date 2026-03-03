export interface NewsItem {
  id: number;
  title: string;
  short_description: string;
  date: string;
  image: string;
  source_url: string;
  source_publication: string;
  category: string;
}

export interface NewsViewProps {
  news: NewsItem[];
}
