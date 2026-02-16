/**
 * Achievement Definitions
 * 25+ badges organized in 5 categories
 */

import { Sprout, Heart, Users, Map, Leaf } from 'lucide-react-native';
import React from 'react';

export type AchievementCategory = 'botaniste' | 'soigneur' | 'social' | 'explorateur' | 'collectionneur';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: AchievementCategory;
  requiredXp?: number;
  requiredCondition?: string;
  reward?: number; // XP bonus
  hidden?: boolean; // Show only when unlocked
}

/**
 * 🌿 BOTANISTE - Plant Identification & Knowledge
 */
export const BOTANISTE_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_plant',
    name: 'Première Plante',
    description: 'Identifier votre première plante',
    icon: React.createElement(Sprout),
    category: 'botaniste',
    reward: 25,
  },
  {
    id: 'species_5',
    name: 'Collecteur de 5',
    description: 'Identifier 5 espèces différentes',
    icon: React.createElement(Sprout),
    category: 'botaniste',
    reward: 50,
  },
  {
    id: 'species_10',
    name: 'Collecteur de 10',
    description: 'Identifier 10 espèces différentes',
    icon: React.createElement(Sprout),
    category: 'botaniste',
    reward: 75,
  },
  {
    id: 'species_25',
    name: 'Expert Botaniste',
    description: 'Identifier 25 espèces différentes',
    icon: React.createElement(Sprout),
    category: 'botaniste',
    reward: 150,
  },
  {
    id: 'rare_plant',
    name: 'Découvreur Rare',
    description: 'Identifier une plante rare',
    icon: React.createElement(Sprout),
    category: 'botaniste',
    reward: 75,
  },
];

/**
 * 💚 SOIGNEUR - Plant Care & Health
 */
export const SOIGNEUR_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_watering',
    name: 'Arroseur Débutant',
    description: 'Arroser votre première plante',
    icon: React.createElement(Heart),
    category: 'soigneur',
    reward: 10,
  },
  {
    id: 'water_10',
    name: 'Hydratant',
    description: 'Arroser 10 fois',
    icon: React.createElement(Heart),
    category: 'soigneur',
    reward: 40,
  },
  {
    id: 'water_50',
    name: 'Garde-Arroseur',
    description: 'Arroser 50 fois',
    icon: React.createElement(Heart),
    category: 'soigneur',
    reward: 100,
  },
  {
    id: 'perfect_health',
    name: 'Santé Parfaite',
    description: 'Atteindre 100% de santé sur une plante',
    icon: React.createElement(Heart),
    category: 'soigneur',
    reward: 30,
  },
  {
    id: 'multi_healthy',
    name: 'Soigneur Expert',
    description: 'Avoir 3 plantes à 100% de santé',
    icon: React.createElement(Heart),
    category: 'soigneur',
    reward: 75,
  },
  {
    id: 'fertilize_10',
    name: 'Nutritionniste',
    description: 'Fertiliser 10 fois',
    icon: React.createElement(Heart),
    category: 'soigneur',
    reward: 50,
  },
];

/**
 * 👥 SOCIAL - Community & Sharing
 */
export const SOCIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_share',
    name: 'Partageur',
    description: 'Partager votre première plante',
    icon: React.createElement(Users),
    category: 'social',
    reward: 25,
    hidden: true,
  },
  {
    id: 'share_5',
    name: 'Ambassadeur Vert',
    description: 'Partager 5 plantes',
    icon: React.createElement(Users),
    category: 'social',
    reward: 60,
    hidden: true,
  },
  {
    id: 'friend_add',
    name: 'Connecté',
    description: 'Ajouter votre premier ami',
    icon: React.createElement(Users),
    category: 'social',
    reward: 30,
    hidden: true,
  },
  {
    id: 'friends_5',
    name: 'Réseau Vert',
    description: 'Avoir 5 amis',
    icon: React.createElement(Users),
    category: 'social',
    reward: 75,
    hidden: true,
  },
  {
    id: 'leaderboard_top10',
    name: 'Top 10',
    description: 'Être dans le Top 10 du leaderboard',
    icon: React.createElement(Users),
    category: 'social',
    reward: 100,
    hidden: true,
  },
];

/**
 * 🔍 EXPLORATEUR - Discovery & Streaks
 */
export const EXPLORATEUR_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'streak_7',
    name: 'Semaine Verte',
    description: 'Maintenir une série de 7 jours',
    icon: React.createElement(Map),
    category: 'explorateur',
    reward: 50,
  },
  {
    id: 'streak_30',
    name: 'Mois Passionné',
    description: 'Maintenir une série de 30 jours',
    icon: React.createElement(Map),
    category: 'explorateur',
    reward: 200,
  },
  {
    id: 'streak_90',
    name: 'Trimestre Légendaire',
    description: 'Maintenir une série de 90 jours',
    icon: React.createElement(Map),
    category: 'explorateur',
    reward: 500,
  },
  {
    id: 'daily_check',
    name: 'Quotidien',
    description: 'Check-in chaque jour pendant une semaine',
    icon: React.createElement(Map),
    category: 'explorateur',
    reward: 35,
  },
  {
    id: 'level_5',
    name: 'Feuille Atteinte',
    description: 'Atteindre le Tier Feuille (Lvl 5)',
    icon: React.createElement(Map),
    category: 'explorateur',
    reward: 50,
  },
  {
    id: 'level_9',
    name: 'Légendaire Atteint',
    description: 'Atteindre le Tier Forêt (Lvl 9)',
    icon: React.createElement(Map),
    category: 'explorateur',
    reward: 500,
  },
];

/**
 * 📚 COLLECTIONNEUR - Collection Milestones
 */
export const COLLECTIONNEUR_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'collection_1',
    name: 'Début de Collection',
    description: 'Posséder 1 plante',
    icon: React.createElement(Leaf),
    category: 'collectionneur',
    reward: 15,
  },
  {
    id: 'collection_5',
    name: 'Petite Collection',
    description: 'Posséder 5 plantes',
    icon: React.createElement(Leaf),
    category: 'collectionneur',
    reward: 40,
  },
  {
    id: 'collection_10',
    name: 'Collection Moyenne',
    description: 'Posséder 10 plantes',
    icon: React.createElement(Leaf),
    category: 'collectionneur',
    reward: 75,
  },
  {
    id: 'collection_25',
    name: 'Collection Grande',
    description: 'Posséder 25 plantes',
    icon: React.createElement(Leaf),
    category: 'collectionneur',
    reward: 150,
  },
  {
    id: 'collection_50',
    name: 'Jungle Personnelle',
    description: 'Posséder 50 plantes',
    icon: React.createElement(Leaf),
    category: 'collectionneur',
    reward: 250,
  },
  {
    id: 'diversity_5',
    name: 'Diversité 5',
    description: 'Avoir plantes de 5 personnalités différentes',
    icon: React.createElement(Leaf),
    category: 'collectionneur',
    reward: 60,
  },
  {
    id: 'diversity_8',
    name: 'Diversité Totale',
    description: 'Avoir plantes de toutes les 8 personnalités',
    icon: React.createElement(Leaf),
    category: 'collectionneur',
    reward: 150,
  },
];

/**
 * Combine all achievements
 */
export const ALL_ACHIEVEMENTS: Achievement[] = [
  ...BOTANISTE_ACHIEVEMENTS,
  ...SOIGNEUR_ACHIEVEMENTS,
  ...SOCIAL_ACHIEVEMENTS,
  ...EXPLORATEUR_ACHIEVEMENTS,
  ...COLLECTIONNEUR_ACHIEVEMENTS,
];

/**
 * Get achievements by category
 */
export const getAchievementsByCategory = (
  category: AchievementCategory
): Achievement[] => {
  switch (category) {
    case 'botaniste':
      return BOTANISTE_ACHIEVEMENTS;
    case 'soigneur':
      return SOIGNEUR_ACHIEVEMENTS;
    case 'social':
      return SOCIAL_ACHIEVEMENTS;
    case 'explorateur':
      return EXPLORATEUR_ACHIEVEMENTS;
    case 'collectionneur':
      return COLLECTIONNEUR_ACHIEVEMENTS;
    default:
      return [];
  }
};

/**
 * Get achievement by ID
 */
export const getAchievementById = (id: string): Achievement | undefined => {
  return ALL_ACHIEVEMENTS.find((a) => a.id === id);
};

/**
 * Get total XP reward sum for all achievements
 */
export const getTotalAchievementReward = (): number => {
  return ALL_ACHIEVEMENTS.reduce((sum, a) => sum + (a.reward || 0), 0);
};

/**
 * Category metadata
 */
export const CATEGORY_METADATA: Record<
  AchievementCategory,
  { label: string; description: string }
> = {
  botaniste: {
    label: '🌿 Botaniste',
    description: 'Identifier et découvrir des plantes',
  },
  soigneur: {
    label: '💚 Soigneur',
    description: 'Soigner vos plantes avec amour',
  },
  social: {
    label: '👥 Social',
    description: 'Partager et connecter',
  },
  explorateur: {
    label: '🔍 Explorateur',
    description: 'Découvrir et progresser',
  },
  collectionneur: {
    label: '📚 Collectionneur',
    description: 'Collectionner et diversifier',
  },
};
