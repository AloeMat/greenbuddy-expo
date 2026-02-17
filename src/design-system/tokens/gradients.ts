/**
 * GreenBuddy Gradient System
 * Linear & radial gradients for visual richness
 * 
 * Palette:
 * - Primary: Green (#10B981 → lighter green)
 * - Secondary: Light greens with transparency
 * - Neutral: Grey gradients for subtle effects
 */

export const gradients = {
  // Primary green gradient (used for buttons, CTAs)
  primaryButton: ['#10B981', '#059669'],

  // Subtle green gradient (for cards, backgrounds)
  subtleGreen: ['#F0FDF4', '#DCFCE7'],

  // Success gradient (for confirmations)
  success: ['#10B981', '#34D399'],

  // Neutral grey (for disabled states)
  disabled: ['#D1D5DB', '#9CA3AF'],

  // Warm gradient (for highlights)
  warm: ['#FEF3C7', '#FCD34D'],

  // Blue accent (for secondary actions)
  secondary: ['#3B82F6', '#1D4ED8'],

  // Premium gradient (for hero sections)
  premium: ['#10B981', '#065F46', '#047857'],

  // Neutral background
  background: ['#FFFFFF', '#F9FAFB'],

  // Glass morphism effect
  glass: ['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.90)'],
} as const;

export type GradientToken = keyof typeof gradients;

/**
 * Helper to create linear gradient for React Native
 * Note: React Native doesn't have built-in gradient support
 * Use react-native-linear-gradient library when needed
 */
export const getGradient = (token: GradientToken) => gradients[token];
