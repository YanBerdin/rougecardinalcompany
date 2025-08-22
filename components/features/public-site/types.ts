export interface NewsItem {
  id: number;
  title: string;
  excerpt: string;
  date: string;
  image: string;
  category: string;
}

export interface NewsListProps {
  news: NewsItem[];
}

export interface StatItem {
  icon: React.ElementType;
  value: string;
  label: string;
}

export interface AboutProps {
  stats: StatItem[];
}
