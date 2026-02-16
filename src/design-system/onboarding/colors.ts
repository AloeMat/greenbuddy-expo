/**
 * Onboarding Color Palette
 * Centralized colors for all onboarding pages
 */

export const onboardingColors = {
  // Primary colors
  green: {
    50: '#F0FDF4',
    100: '#DCFCE7',
    500: '#10B981',
    600: '#059669',
    700: '#047857',
    900: '#065F46',
  },

  // Neutral colors
  gray: {
    200: '#E5E7EB',
    500: '#6B7280',
    700: '#374151',
    900: '#111827',
  },

  text: {
    primary: '#065F46',     // Dark green
    secondary: '#4B5563',   // Gray-blue
    muted: '#9CA3AF',       // Light gray
    white: '#FFFFFF',
  },

  // Semantic colors
  success: '#10B981',
  error: '#DC2626',
  warning: '#F97316',
} as const;

export type OnboardingColor = typeof onboardingColors;
