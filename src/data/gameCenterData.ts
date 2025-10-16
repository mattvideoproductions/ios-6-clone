export type PresenceStatus = 'online' | 'offline' | 'away';

export interface Game {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  playersOnline: number;
  achievementsUnlocked: number;
  totalAchievements: number;
  lastPlayed: string;
}

export interface Friend {
  id: string;
  name: string;
  status: PresenceStatus;
  avatar: string;
  favorite: boolean;
  currentlyPlaying?: string;
  lastPlayed?: string;
}

export interface LeaderboardEntry {
  id: string;
  player: string;
  avatar: string;
  country: string;
  score: number;
  bestStreak: number;
  trend: 'up' | 'down' | 'steady';
}

export interface Achievement {
  id: string;
  title: string;
  gameTitle: string;
  description: string;
  progress: number;
  target: number;
  rarity: 'common' | 'rare' | 'epic';
  icon: string;
}

export interface FriendRequest {
  id: string;
  from: string;
  avatar: string;
  mutualFriends: number;
  mutualGames: number;
  message: string;
}

export const games: Game[] = [
  {
    id: 'neon-knights',
    title: 'Neon Knights',
    subtitle: 'Arcade • Weekly Tournament',
    icon: '🕹️',
    playersOnline: 742,
    achievementsUnlocked: 18,
    totalAchievements: 32,
    lastPlayed: '2h ago'
  },
  {
    id: 'skyward-odyssey',
    title: 'Skyward Odyssey',
    subtitle: 'Adventure • Cloud Save',
    icon: '☁️',
    playersOnline: 193,
    achievementsUnlocked: 27,
    totalAchievements: 45,
    lastPlayed: 'Yesterday'
  },
  {
    id: 'quantum-pocket',
    title: 'Quantum Pocket',
    subtitle: 'Strategy • Turn Based',
    icon: '🃏',
    playersOnline: 508,
    achievementsUnlocked: 12,
    totalAchievements: 20,
    lastPlayed: '5d ago'
  },
  {
    id: 'lunar-rally',
    title: 'Lunar Rally',
    subtitle: 'Racing • Motion Controls',
    icon: '🚀',
    playersOnline: 321,
    achievementsUnlocked: 31,
    totalAchievements: 40,
    lastPlayed: 'Just now'
  }
];

export const friends: Friend[] = [
  {
    id: 'friend-1',
    name: 'Amelia Chen',
    status: 'online',
    avatar: 'AC',
    favorite: true,
    currentlyPlaying: 'Neon Knights'
  },
  {
    id: 'friend-2',
    name: 'Diego Martínez',
    status: 'away',
    avatar: 'DM',
    favorite: false,
    currentlyPlaying: 'Skyward Odyssey'
  },
  {
    id: 'friend-3',
    name: 'Sofia Patel',
    status: 'online',
    avatar: 'SP',
    favorite: false,
    currentlyPlaying: 'Quantum Pocket'
  },
  {
    id: 'friend-4',
    name: 'Noah Williams',
    status: 'offline',
    avatar: 'NW',
    favorite: true,
    lastPlayed: 'Lunar Rally • 2h ago'
  }
];

export const leaderboardEntries: LeaderboardEntry[] = [
  {
    id: 'lb-1',
    player: 'Amelia Chen',
    avatar: 'AC',
    country: '🇸🇬',
    score: 125_842,
    bestStreak: 18,
    trend: 'up'
  },
  {
    id: 'lb-2',
    player: 'Noah Williams',
    avatar: 'NW',
    country: '🇺🇸',
    score: 121_230,
    bestStreak: 12,
    trend: 'steady'
  },
  {
    id: 'lb-3',
    player: 'Sofia Patel',
    avatar: 'SP',
    country: '🇮🇳',
    score: 118_410,
    bestStreak: 27,
    trend: 'up'
  },
  {
    id: 'lb-4',
    player: 'Diego Martínez',
    avatar: 'DM',
    country: '🇪🇸',
    score: 107_920,
    bestStreak: 31,
    trend: 'down'
  }
];

export const achievements: Achievement[] = [
  {
    id: 'ach-1',
    title: 'Emerald Vanguard',
    gameTitle: 'Neon Knights',
    description: 'Complete the arena gauntlet without taking damage.',
    progress: 3,
    target: 5,
    rarity: 'epic',
    icon: '🛡️'
  },
  {
    id: 'ach-2',
    title: 'Cloud Cartographer',
    gameTitle: 'Skyward Odyssey',
    description: 'Discover every floating isle in the Zephyr Sea.',
    progress: 12,
    target: 20,
    rarity: 'rare',
    icon: '🗺️'
  },
  {
    id: 'ach-3',
    title: 'Quantum Gambler',
    gameTitle: 'Quantum Pocket',
    description: 'Win seven ranked matches back-to-back.',
    progress: 7,
    target: 7,
    rarity: 'epic',
    icon: '🎲'
  },
  {
    id: 'ach-4',
    title: 'Stellar Drift',
    gameTitle: 'Lunar Rally',
    description: 'Chain boost through the lunar canyon in record time.',
    progress: 4,
    target: 10,
    rarity: 'common',
    icon: '🌠'
  }
];

export const friendRequests: FriendRequest[] = [
  {
    id: 'req-1',
    from: 'Lina Kovács',
    avatar: 'LK',
    mutualFriends: 4,
    mutualGames: 6,
    message: 'Loved your run in Lunar Rally! Want to squad up this weekend?'
  },
  {
    id: 'req-2',
    from: 'Jonah Patel',
    avatar: 'JP',
    mutualFriends: 2,
    mutualGames: 3,
    message: 'Looking to complete the Skyward Odyssey co-op quests.'
  }
];
