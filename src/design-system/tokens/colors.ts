/**
 * GreenBuddy Color System - v2.2 Specification
 * Palette nature/organique avec warm tones
 */

export const colors = {
  // Primary Spectrum (Vert feuille)
  primary: {
    '50': '#F0FDF4',
    '100': '#DCFCE7',
    '200': '#BBF7D0',
    '300': '#86EFAC',
    '400': '#4ADE80',
    '500': '#22C55E',  // Primary main - Vert feuille spec
    '600': '#16A34A',
    '700': '#166534',  // Secondary - Vert mousse spec
    '800': '#14532D',
    '900': '#052E16',
  },

  // Secondary Spectrum (Teal/Turquoise)
  secondary: {
    '50': '#F0FDFA',
    '100': '#CCFBF1',
    '200': '#99F6E4',
    '300': '#5EEAD4',
    '400': '#2DD4BF',
    '500': '#14B8A6',  // Secondary main
    '600': '#0D9488',
    '700': '#0F766E',
    '800': '#115E59',
    '900': '#134E4A',
  },

  // Accent (Jaune soleil)
  accent: {
    '50': '#FEFCE8',
    '100': '#FEF9C3',
    '200': '#FEF08A',
    '300': '#FCD34D',
    '400': '#FACC15',  // Accent main - Jaune soleil spec
    '500': '#EAB308',
    '600': '#CA8A04',
    '700': '#A16207',
    '800': '#854D0E',
    '900': '#713F12',
  },

  // Error Spectrum (Rouge brique)
  error: {
    '50': '#FEF2F2',
    '100': '#FEE2E2',
    '200': '#FECACA',
    '300': '#FCA5A5',
    '400': '#F87171',
    '500': '#EF4444',
    '600': '#DC2626',  // Error main
    '700': '#B91C1C',
    '800': '#991B1B',
    '900': '#7F1D1D',
  },

  // Warning Spectrum (Orange terre)
  warning: {
    '50': '#FFF7ED',
    '100': '#FFEDD5',
    '200': '#FED7AA',
    '300': '#FDBA74',
    '400': '#FB923C',
    '500': '#F97316',  // Warning main
    '600': '#EA580C',
    '700': '#C2410C',
    '800': '#9A3412',
    '900': '#7C2D12',
  },

  // Blue Spectrum (Info)
  blue: {
    '50': '#EFF6FF',
    '100': '#DBEAFE',
    '200': '#BFDBFE',
    '300': '#93C5FD',
    '400': '#60A5FA',
    '500': '#3B82F6',  // Blue main
    '600': '#2563EB',
    '700': '#1D4ED8',
    '800': '#1E40AF',
    '900': '#1E3A8A',
  },

  // Semantic Colors (kept for compatibility)
  semantic: {
    success: '#10B981',
    warning: '#F97316',  // Orange terre spec
    danger: '#DC2626',   // Rouge brique spec
    error: '#DC2626',    // Alias for danger (AlertCard compatibility)
    info: '#3B82F6',
  },

  // Backgrounds & Surfaces (Naturels, organiques)
  background: {
    '50': '#FFFAF0',
    '100': '#FEFCE8',  // Crème naturel spec
    '200': '#FFFBEB', // Blanc cassé spec
    '300': '#FEF3C7',
    '400': '#FECF5C',
    '500': '#FCC34D',
    '600': '#FAB005',
    '700': '#F59F00',
    '800': '#E67700',
    '900': '#B35600',
  },

  // Text Colors (Tons brun/terre)
  text: {
    '50': '#F9FAFB',
    '100': '#F3F4F6',
    '200': '#E5E7EB',
    '300': '#D1D5DB',
    '400': '#9CA3AF',
    '500': '#6B7280',
    '600': '#4B5563',
    '700': '#374151',
    '800': '#1F2937',
    '900': '#111827',
  },

  // Neutral (Gris neutre)
  neutral: {
    '50': '#F9FAFB',
    '100': '#F3F4F6',
    '200': '#E5E7EB',
    '300': '#D1D5DB',
    '400': '#9CA3AF',
    '500': '#6B7280',
    '600': '#4B5563',
    '700': '#374151',
    '800': '#1F2937',
    '900': '#111827',
  },

  // Avatar Emotion Colors
  emotion: {
    idle: {
      primary: '#10B981',
      secondary: '#6EE7B7',
    },
    happy: {
      primary: '#F59E0B',
      secondary: '#FBBF24',
    },
    sad: {
      primary: '#3B82F6',
      secondary: '#93C5FD',
    },
    sleeping: {
      primary: '#8B5CF6',
      secondary: '#D8B4FE',
    },
    thirsty: {
      primary: '#EF4444',
      secondary: '#FCA5A5',
    },
  },

  // Tab Bar specific
  tabBar: {
    background: '#FFFFFF',
    inactive: '#A16207',
    active: '#22C55E',
    fab: '#22C55E',
    fabShadow: 'rgba(34, 197, 94, 0.4)',
  },

  // Plant Personality Colors (8 types)
  personality: {
    cactus: {
      primary: '#EA580C',
      secondary: '#FDBA74',
    },
    orchidee: {
      primary: '#EC4899',
      secondary: '#F472B6',
    },
    monstera: {
      primary: '#10B981',
      secondary: '#6EE7B7',
    },
    succulente: {
      primary: '#8B5CF6',
      secondary: '#D8B4FE',
    },
    fougere: {
      primary: '#14B8A6',
      secondary: '#5EEAD4',
    },
    carnivore: {
      primary: '#6366F1',
      secondary: '#A5B4FC',
    },
    pilea: {
      primary: '#22C55E',
      secondary: '#86EFAC',
    },
    palmier: {
      primary: '#FBBF24',
      secondary: '#FDE047',
    },
  },

  // Gamification
  gamification: {
    xpBar: '#22C55E',
    levelUpBg: 'rgba(34, 197, 94, 0.1)',
    badge: '#EAB308',
    streak: '#EF4444',
  },

  // Brand — GreenBuddy identity color used across the app
  brand: '#2D5A27',
} as const;

// Alias for easier imports
export const COLORS = colors;

// Type helpers
export type ColorKey = keyof typeof colors;
export type Color = typeof colors[ColorKey];
