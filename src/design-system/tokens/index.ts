/**
 * Design System Token Exports
 * Centralized theme system for GreenBuddy v2.2
 */

export { colors } from './colors';
export type { ColorKey, Color } from './colors';

export { typography } from './typography';
export type { FontFamily, FontWeight } from './typography';

export { spacing } from './spacing';
export type { Spacing } from './spacing';

/**
 * Consolidated theme object for easy access
 * Usage: import { theme } from '@tokens'
 *        theme.colors.primary[500]
 *        theme.typography.heading.h1
 *        theme.spacing.md
 */
export const theme = {
  colors: require('./colors').colors,
  typography: require('./typography').typography,
  spacing: require('./spacing').spacing,
} as const;
