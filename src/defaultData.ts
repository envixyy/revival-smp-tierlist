import { TierCategory, TierItem, TierListData } from './types';

export const DEFAULT_CATEGORIES: TierCategory[] = [
  {
    id: 'S',
    label: 'S',
    gradient: 'rgba(255,78,80,0.13)',
    glowColor: 'rgba(255, 78, 80, 0.25)',
    textColor: '#ff4e50',
    badgeBg: 'rgba(255,78,80,0.13)',
    description: 'Supreme'
  },
  {
    id: 'A',
    label: 'A',
    gradient: 'rgba(255,140,66,0.13)',
    glowColor: 'rgba(255, 140, 66, 0.25)',
    textColor: '#ff8c42',
    badgeBg: 'rgba(255,140,66,0.13)',
    description: 'Top Tier'
  },
  {
    id: 'B',
    label: 'B',
    gradient: 'rgba(255,209,102,0.13)',
    glowColor: 'rgba(255, 209, 102, 0.25)',
    textColor: '#ffd166',
    badgeBg: 'rgba(255,209,102,0.13)',
    description: 'Great'
  },
  {
    id: 'C',
    label: 'C',
    gradient: 'rgba(6,214,160,0.13)',
    glowColor: 'rgba(6, 214, 160, 0.25)',
    textColor: '#06d6a0',
    badgeBg: 'rgba(6,214,160,0.13)',
    description: 'Average'
  },
  {
    id: 'D',
    label: 'D',
    gradient: 'rgba(78,184,247,0.13)',
    glowColor: 'rgba(78, 184, 247, 0.25)',
    textColor: '#4eb8f7',
    badgeBg: 'rgba(78,184,247,0.13)',
    description: 'Below Average'
  },
  {
    id: 'E',
    label: 'E',
    gradient: 'rgba(183,143,247,0.13)',
    glowColor: 'rgba(183, 143, 247, 0.25)',
    textColor: '#b78ff7',
    badgeBg: 'rgba(183,143,247,0.13)',
    description: 'Low'
  },
  {
    id: 'F',
    label: 'F',
    gradient: 'rgba(102,102,102,0.1)',
    glowColor: 'rgba(102, 102, 102, 0.25)',
    textColor: '#666666',
    badgeBg: 'rgba(102,102,102,0.1)',
    description: 'Bottom Tier'
  }
];

export const INITIAL_ITEMS: TierItem[] = [
  {
    id: 'item-1',
    title: 'Vamep',
    subtitle: 'Vamep',
    imageUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&auto=format&fit=crop&q=80',
    tierId: 'S',
    order: 0,
    fit: 'cover',
  }
];

export const INITIAL_TIERLIST_DATA: TierListData = {
  title: 'Revival SMP Tierlist',
  subtitle: 'Community-ranked. Brutally honest.',
  updatedAt: new Date().toISOString(),
  adminPin: 'revivaltieradmin',
  isPublished: false,
  categories: DEFAULT_CATEGORIES,
  items: INITIAL_ITEMS,
  githubConfig: {
    owner: 'envixyy',
    repo: 'revival-smp-tierlist',
    branch: 'main',
    filePath: 'revival-tiers-data.json',
    token: ''
  }
};
