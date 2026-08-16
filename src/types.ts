export type TierId = 'S' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'unranked';

export interface TierCategory {
  id: TierId;
  label: string;
  gradient: string;
  glowColor: string;
  textColor: string;
  badgeBg: string;
  description?: string;
}

export interface TierItem {
  id: string;
  title: string;
  subtitle?: string; // Text under the image!
  imageUrl: string;
  tierId: TierId;
  fit?: 'cover' | 'contain';
  customBorderColor?: string;
  tag?: string;
  order: number;
  description?: string;
}

export interface GitHubConfig {
  owner: string;
  repo: string;
  branch: string;
  filePath: string;
  token: string;
  lastSynced?: string;
}

export interface TierListData {
  title: string;
  subtitle: string;
  updatedAt: string;
  adminPin: string;
  isPublished: boolean;
  categories: TierCategory[];
  items: TierItem[];
  githubConfig?: GitHubConfig;
}
