import type { Achievement, LeaderboardEntry } from '../data/gameCenterData';

export type LeaderboardSortKey = 'score' | 'streak' | 'name';

const sorters: Record<LeaderboardSortKey, (a: LeaderboardEntry, b: LeaderboardEntry) => number> = {
  score: (a, b) => b.score - a.score,
  streak: (a, b) => b.bestStreak - a.bestStreak,
  name: (a, b) => a.player.localeCompare(b.player)
};

export const sortLeaderboardEntries = (
  entries: LeaderboardEntry[],
  sortKey: LeaderboardSortKey
): LeaderboardEntry[] => {
  const sorter = sorters[sortKey];
  return [...entries].sort(sorter);
};

export const formatScore = (score: number): string =>
  new Intl.NumberFormat('en-US', {
    notation: 'standard'
  }).format(score);

export const formatPlayersOnline = (count: number): string =>
  `${new Intl.NumberFormat('en-US').format(count)} online`;

export const getAchievementProgress = (achievement: Achievement): number => {
  if (!achievement.target) {
    return 0;
  }

  const ratio = achievement.progress / achievement.target;
  return Math.min(100, Math.max(0, Math.round(ratio * 100)));
};

export const getRarityLabel = (rarity: Achievement['rarity']): string => {
  switch (rarity) {
    case 'epic':
      return 'Epic';
    case 'rare':
      return 'Rare';
    default:
      return 'Common';
  }
};
