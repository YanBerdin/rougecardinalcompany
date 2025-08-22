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

export interface Show {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  location: string;
  image: string;
  status: string;
  genre: string;
}

export interface ShowsListProps {
  shows: Show[];
}
