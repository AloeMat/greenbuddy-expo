/**
 * GreenBuddy Spacing System - Consistent scale for all layouts
 */

export const spacing = {
  // Base spacing units (4px scale)
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
  '6xl': 56,
  '7xl': 64,

  // Component-specific padding
  button: {
    padding: {
      sm: { x: 12, y: 8 },
      md: { x: 16, y: 12 },
      lg: { x: 20, y: 16 },
    },
  },

  // Card/Container padding
  card: {
    padding: { default: 16, compact: 12, loose: 20 },
    radius: { sm: 8, md: 12, lg: 16, xl: 20 },
    gap: { default: 12, tight: 8, loose: 16 },
  },

  // Input fields
  input: {
    padding: { x: 12, y: 12 },
    height: 48,
    radius: 8,
  },

  // List/Grid gaps
  list: {
    gap: { default: 12, compact: 8, loose: 16 },
    divider: { x: 0, y: 8 },
  },

  // Safe area padding (for notch/home indicator)
  safeArea: {
    horizontal: 16,
    vertical: 12,
  },

  // Modal/Dialog
  modal: {
    padding: 20,
    radius: 16,
    gap: 16,
  },
} as const;

export type Spacing = typeof spacing;
