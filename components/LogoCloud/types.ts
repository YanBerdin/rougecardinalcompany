export interface Partner {
  id?: number;
  name: string;
  logo: string;
  website?: string;
  width?: number;
  height?: number;
}

export interface LogoCloudProps {
  partners: Partner[];
  title?: string;
  subtitle?: string;
  speed?: "slow" | "normal" | "fast";
  pauseOnHover?: boolean;
  linkable?: boolean;
  twoRows?: boolean;
  className?: string;
}
