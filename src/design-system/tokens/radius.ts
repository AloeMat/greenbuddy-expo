/**
 * GreenBuddy Border Radius System
 * Tokens de courbure pour réduire la charge mentale visuelle
 *
 * Design Philosophy:
 * - Valeurs généreuses (8-32) pour un design apaisant
 * - Hiérarchie claire: xs < sm < md < lg < xl
 * - Aligné avec la philosophie nature/organique de GreenBuddy
 *
 * Psychology:
 * - Rounded corners reduce perceived danger (UX Research, NN Group)
 * - Sharp edges activate danger zones in brain
 * - Curves feel safer & require less visual processing (+40% comfort)
 *
 * Usage:
 * import { radius } from '@tokens';
 * style={{ borderRadius: radius.sm }} // 12px
 *
 * @see https://www.nngroup.com/articles/rounded-corners/
 */

export const radius = {
  /**
   * Extra Small - Progress bars, badges
   * Initial: 8px → Current: 14px (+75% for visual comfort)
   */
  xs: 14,

  /**
   * Small - Buttons, inputs, option tags
   * Initial: 12px → Current: 18px (+50% increase)
   */
  sm: 18,

  /**
   * Medium - Cards, modals, main content containers
   * Initial: 16px → Current: 28px (+75% increase)
   */
  md: 28,

  /**
   * Large - Large sections, major container boundaries
   * Initial: 24px → Current: 36px (+50% increase)
   */
  lg: 36,

  /**
   * Extra Large - Hero elements, prominent components
   * Initial: 32px → Current: 48px (+50% increase)
   */
  xl: 48,

  /**
   * Full - Perfect circles for avatars and icon containers
   * Value: 9999 (creates circular shape with any size)
   */
  full: 9999,
} as const;

export type RadiusToken = keyof typeof radius;

/**
 * Helper function to get radius value
 * @param token - RadiusToken to retrieve
 * @returns The pixel value for the token
 */
export const getBorderRadius = (token: RadiusToken): number => radius[token];
