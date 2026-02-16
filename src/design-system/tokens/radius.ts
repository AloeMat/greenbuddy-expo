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
  /** Extra Small - Progress bars, badges (8 → 14) */
  xs: 14,

  /** Small - Buttons, inputs (12 → 18) */
  sm: 18,

  /** Medium - Cards, modals (16 → 28) */
  md: 28,

  /** Large - Large sections (24 → 36) */
  lg: 36,

  /** Extra Large - Hero elements (32 → 48) */
  xl: 48,

  /** Full - Cercles parfaits (9999, inchangé) */
  full: 9999,
} as const;

export type RadiusToken = keyof typeof radius;

/**
 * Helper function to get radius value
 * @param token - RadiusToken to retrieve
 * @returns The pixel value for the token
 */
export const getBorderRadius = (token: RadiusToken): number => radius[token];
