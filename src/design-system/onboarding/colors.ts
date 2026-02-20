/**
 * Onboarding Color Palette
 * Centralized colors for all onboarding pages
 */

export const onboardingColors = {
  // Primary colors
  green: {
    50: '#F0FDF4',
    100: '#DCFCE7',
    200: '#BBFBEE',
    300: '#99F6E0',
    500: '#10B981',
    600: '#059669',
    700: '#047857',
    900: '#065F46',
  },

  // Neutral colors
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    900: '#111827',
  },

  text: {
    primary: '#065F46',     // Dark green
    secondary: '#374151',   // Darker gray for better contrast
    muted: '#9CA3AF',       // Light gray
    white: '#FFFFFF',
  },

  // Semantic colors
  success: '#10B981',
  error: '#DC2626',
  warning: '#F97316',
} as const;

export type OnboardingColor = typeof onboardingColors;
