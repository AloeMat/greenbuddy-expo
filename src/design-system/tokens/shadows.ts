/**
 * GreenBuddy Shadow System
 * Elevation-based shadow tokens for depth & hierarchy
 * 
 * Psychology:
 * - Shadows create visual hierarchy and depth perception
 * - Elevation system helps users understand interactivity
 * - Subtle shadows feel premium and polished
 */

export const shadows = {
  /** Subtle shadow for cards - minimal elevation (1dp) */
  xs: {
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 1,
  },

  /** Small shadow for containers - moderate elevation (4dp) */
  sm: {
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },

  /** Medium shadow for floating elements (8dp) */
  md: {
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },

  /** Large shadow for modals - high elevation (16dp) */
  lg: {
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 16,
  },

  /** Extra large shadow for overlays (24dp) */
  xl: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 24,
  },
} as const;

export type ShadowToken = keyof typeof shadows;
