/**
 * gamificationStore Unit Tests
 * Tests Zustand gamification state: XP, tiers, achievements, streaks
 *
 * Uses getState() directly — no React rendering needed
 */

// Mock AsyncStorage (persist middleware)
// Must export both default AND named — zustand's createJSONStorage reads .getItem/.setItem
const mockStorage: Record<string, string> = {};
const mockAsyncStorage = {
  getItem: jest.fn((key: string) => Promise.resolve(mockStorage[key] ?? null)),
  setItem: jest.fn((key: string, value: string) => {
    mockStorage[key] = value;
    return Promise.resolve();
  }),
  removeItem: jest.fn((key: string) => {
    delete mockStorage[key];
    return Promise.resolve();
  }),
  clear: jest.fn(() => {
    Object.keys(mockStorage).forEach((k) => delete mockStorage[k]);
    return Promise.resolve();
  }),
  getAllKeys: jest.fn(() => Promise.resolve(Object.keys(mockStorage))),
  multiGet: jest.fn(),
  multiSet: jest.fn(),
  multiRemove: jest.fn(),
  multiMerge: jest.fn(),
  mergeItem: jest.fn(),
};
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: mockAsyncStorage,
}));

// Mock logger
jest.mock('@/lib/services/logger', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

import { useGamificationStore } from '@/features/gamification/store/gamificationStore';

/** Helper: get current store state */
const getStore = () => useGamificationStore.getState();

/** Helper: reset store to initial state */
function resetStore() {
  useGamificationStore.setState({
    totalXp: 0,
    currentTier: 1,
    tierProgress: 0,
    isLevelUp: false,
    achievements: [
      {
        id: 'first_plant',
        title: 'Main Verte',
        description: 'Added your first plant',
        category: 'botaniste',
        tier: 1,
        xpReward: 25,
        iconName: 'Sprout',
      },
      {
        id: 'streak_7',
        title: 'Jardinier Dévoué',
        description: 'Maintained a 7-day streak',
        category: 'soigneur',
        tier: 2,
        xpReward: 50,
        iconName: 'Flame',
      },
      {
        id: 'collection_10',
        title: 'Jungle Urbaine',
        description: 'Collected 10 plants',
        category: 'collectionneur',
        tier: 3,
        xpReward: 75,
        iconName: 'Leaf',
      },
    ],
    unlockedAchievements: [],
    currentStreak: 0,
    longestStreak: 0,
    lastActiveDate: null,
  });
}

describe('gamificationStore (Zustand)', () => {
  beforeEach(() => {
    resetStore();
    jest.clearAllMocks();
  });

  // ─────────────────────────────────────────
  // Initial state
  // ─────────────────────────────────────────
  describe('Initial state', () => {
    it('should start at tier 1 with 0 XP', () => {
      expect(getStore().totalXp).toBe(0);
      expect(getStore().currentTier).toBe(1);
    });

    it('should have no unlocked achievements', () => {
      expect(getStore().unlockedAchievements).toEqual([]);
    });

    it('should have 3 default achievements', () => {
      expect(getStore().achievements).toHaveLength(3);
      expect(getStore().achievements.map((a) => a.id)).toEqual([
        'first_plant',
        'streak_7',
        'collection_10',
      ]);
    });

    it('should have streak at 0', () => {
      expect(getStore().currentStreak).toBe(0);
      expect(getStore().longestStreak).toBe(0);
    });

    it('should not have level up flag', () => {
      expect(getStore().isLevelUp).toBe(false);
    });
  });

  // ─────────────────────────────────────────
  // addXp (reward-based)
  // ─────────────────────────────────────────
  describe('addXp', () => {
    it('should add XP for watering reward', () => {
      getStore().addXp(10, 'watering');
      expect(getStore().totalXp).toBe(10);
    });

    it('should add XP for add_plant reward', () => {
      getStore().addXp(50, 'add_plant');
      expect(getStore().totalXp).toBe(50);
    });

    it('should not add XP for unknown reward type', () => {
      getStore().addXp(100, 'nonexistent_type' as any);
      expect(getStore().totalXp).toBe(0);
    });

    it('should unlock achievement when reward has achievementId', () => {
      getStore().addXp(25, 'first_plant');
      expect(getStore().unlockedAchievements).toContain('first_plant');
    });

    it('should not unlock achievement for rewards without achievementId', () => {
      getStore().addXp(10, 'watering');
      expect(getStore().unlockedAchievements).toEqual([]);
    });
  });

  // ─────────────────────────────────────────
  // addXpCustom
  // ─────────────────────────────────────────
  describe('addXpCustom', () => {
    it('should add custom XP amount', () => {
      getStore().addXpCustom(42, 'bonus');
      expect(getStore().totalXp).toBe(42);
    });

    it('should accumulate XP across multiple calls', () => {
      getStore().addXpCustom(30, 'first');
      getStore().addXpCustom(70, 'second');
      expect(getStore().totalXp).toBe(100);
    });

    it('should not go below 0 XP', () => {
      getStore().addXpCustom(-50, 'penalty');
      expect(getStore().totalXp).toBe(0);
    });

    it('should trigger level up when crossing tier threshold', () => {
      // Tier 2 requires totalXp >= 100
      getStore().addXpCustom(100, 'big bonus');
      expect(getStore().currentTier).toBe(2);
      expect(getStore().isLevelUp).toBe(true);
    });

    it('should not trigger level up within same tier', () => {
      getStore().addXpCustom(50, 'small bonus');
      expect(getStore().currentTier).toBe(1);
      expect(getStore().isLevelUp).toBe(false);
    });

    it('should calculate tier progress correctly', () => {
      // Tier 1: 0-100, Tier 2: 100-300
      getStore().addXpCustom(50, 'half way');
      expect(getStore().tierProgress).toBe(50); // 50/100 = 50%
    });
  });

  // ─────────────────────────────────────────
  // unlockAchievement
  // ─────────────────────────────────────────
  describe('unlockAchievement', () => {
    it('should add achievement to unlockedAchievements', () => {
      getStore().unlockAchievement('first_plant');
      expect(getStore().unlockedAchievements).toContain('first_plant');
    });

    it('should set unlockedAt on the achievement', () => {
      getStore().unlockAchievement('first_plant');
      const ach = getStore().achievements.find((a) => a.id === 'first_plant');
      expect(ach?.unlockedAt).toBeDefined();
    });

    it('should not duplicate if already unlocked', () => {
      getStore().unlockAchievement('first_plant');
      getStore().unlockAchievement('first_plant');
      expect(
        getStore().unlockedAchievements.filter((id) => id === 'first_plant')
      ).toHaveLength(1);
    });
  });

  // ─────────────────────────────────────────
  // getAchievementsByCategory
  // ─────────────────────────────────────────
  describe('getAchievementsByCategory', () => {
    it('should return achievements for botaniste category', () => {
      const results = getStore().getAchievementsByCategory('botaniste');
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('first_plant');
    });

    it('should return empty array for unknown category', () => {
      expect(getStore().getAchievementsByCategory('unknown')).toEqual([]);
    });
  });

  // ─────────────────────────────────────────
  // Streaks
  // ─────────────────────────────────────────
  describe('updateStreak', () => {
    it('should set lastActiveDate to today on first call', () => {
      getStore().updateStreak();
      const today = new Date().toISOString().split('T')[0];
      expect(getStore().lastActiveDate).toBe(today);
    });

    it('should increment streak for consecutive day', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      useGamificationStore.setState({
        lastActiveDate: yesterdayStr,
        currentStreak: 3,
      });

      getStore().updateStreak();

      expect(getStore().currentStreak).toBe(4);
    });

    it('should update longestStreak when current exceeds it', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      useGamificationStore.setState({
        lastActiveDate: yesterday.toISOString().split('T')[0],
        currentStreak: 5,
        longestStreak: 5,
      });

      getStore().updateStreak();

      expect(getStore().currentStreak).toBe(6);
      expect(getStore().longestStreak).toBe(6);
    });

    it('should reset streak when gap > 1 day', () => {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      useGamificationStore.setState({
        lastActiveDate: threeDaysAgo.toISOString().split('T')[0],
        currentStreak: 10,
        longestStreak: 10,
      });

      getStore().updateStreak();

      expect(getStore().currentStreak).toBe(1);
      // longestStreak should NOT be reset
      expect(getStore().longestStreak).toBe(10);
    });

    it('should not increment streak if called twice same day', () => {
      const today = new Date().toISOString().split('T')[0];
      useGamificationStore.setState({
        lastActiveDate: today,
        currentStreak: 5,
      });

      getStore().updateStreak();

      // Should remain 5, not increment
      expect(getStore().currentStreak).toBe(5);
      expect(getStore().lastActiveDate).toBe(today);
    });
  });

  describe('resetStreak', () => {
    it('should reset streak to 0', () => {
      useGamificationStore.setState({ currentStreak: 7, lastActiveDate: '2025-01-01' });
      getStore().resetStreak();
      expect(getStore().currentStreak).toBe(0);
      expect(getStore().lastActiveDate).toBeNull();
    });
  });

  // ─────────────────────────────────────────
  // Tier queries
  // ─────────────────────────────────────────
  describe('Tier queries', () => {
    it('getLifeTreeTier should return tier data', () => {
      const tier = getStore().getLifeTreeTier(1);
      expect(tier).toBeDefined();
      expect(tier?.name).toBe('Seed');
    });

    it('getAllLifeTreeTiers should return 9 tiers', () => {
      const tiers = getStore().getAllLifeTreeTiers();
      expect(tiers).toHaveLength(9);
    });

    it('getTierProgressPercentage should return current progress', () => {
      useGamificationStore.setState({ tierProgress: 42 });
      expect(getStore().getTierProgressPercentage()).toBe(42);
    });

    it('getNextTierXpNeeded should return XP deficit', () => {
      // At 0 XP, tier 1 → tier 2 needs 100
      expect(getStore().getNextTierXpNeeded()).toBe(100);
    });

    it('getNextTierXpNeeded should return 0 at max tier', () => {
      // Tier 9 requires 3900 total XP
      useGamificationStore.setState({ totalXp: 4000, currentTier: 9 });
      expect(getStore().getNextTierXpNeeded()).toBe(0);
    });
  });

  // ─────────────────────────────────────────
  // clearGamification / reset
  // ─────────────────────────────────────────
  describe('clearGamification', () => {
    it('should reset all gamification state to defaults', () => {
      // Set up complex state
      useGamificationStore.setState({
        totalXp: 500,
        currentTier: 4,
        tierProgress: 60,
        isLevelUp: true,
        unlockedAchievements: ['first_plant', 'streak_7'],
        currentStreak: 15,
        longestStreak: 30,
        lastActiveDate: '2025-06-01',
      });

      getStore().clearGamification();

      expect(getStore().totalXp).toBe(0);
      expect(getStore().currentTier).toBe(1);
      expect(getStore().tierProgress).toBe(0);
      expect(getStore().isLevelUp).toBe(false);
      expect(getStore().unlockedAchievements).toEqual([]);
      expect(getStore().currentStreak).toBe(0);
      expect(getStore().longestStreak).toBe(0);
      expect(getStore().lastActiveDate).toBeNull();
    });
  });

  describe('dismissLevelUp', () => {
    it('should set isLevelUp to false', () => {
      useGamificationStore.setState({ isLevelUp: true });
      getStore().dismissLevelUp();
      expect(getStore().isLevelUp).toBe(false);
    });
  });

  // ─────────────────────────────────────────
  // Composition (all methods exist)
  // ─────────────────────────────────────────
  describe('Composition', () => {
    it('should have all expected methods', () => {
      const store = getStore();
      const expectedMethods = [
        'addXp',
        'addXpCustom',
        'unlockAchievement',
        'getAchievementsByCategory',
        'updateStreak',
        'resetStreak',
        'initialize',
        'getLifeTreeTier',
        'getAllLifeTreeTiers',
        'getTierProgressPercentage',
        'getNextTierXpNeeded',
        'clearGamification',
        'dismissLevelUp',
        'reset',
      ];
      for (const method of expectedMethods) {
        expect(typeof (store as any)[method]).toBe('function');
      }
    });
  });
});
