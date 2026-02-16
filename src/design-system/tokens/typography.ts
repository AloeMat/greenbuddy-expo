/**
 * GreenBuddy Typography System - v2.2
 * Nunito (titles), Poppins (subtitles), Inter (body)
 */

export const typography = {
  // Font families
  fonts: {
    nunito: 'Nunito',
    poppins: 'Poppins',
    inter: 'Inter',
  },

  // Font weights
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semiBold: '600' as const,
    bold: '700' as const,
  },

  // Heading styles
  heading: {
    h1: {
      fontFamily: 'Nunito-Bold',
      fontSize: 32,
      lineHeight: 40,
      fontWeight: '700' as const,
    },
    h2: {
      fontFamily: 'Nunito-Bold',
      fontSize: 28,
      lineHeight: 36,
      fontWeight: '700' as const,
    },
    h3: {
      fontFamily: 'Nunito-SemiBold',
      fontSize: 24,
      lineHeight: 32,
      fontWeight: '600' as const,
    },
    h4: {
      fontFamily: 'Nunito-SemiBold',
      fontSize: 20,
      lineHeight: 28,
      fontWeight: '600' as const,
    },
  },

  // Subtitle styles (Poppins)
  subtitle: {
    lg: {
      fontFamily: 'Poppins-SemiBold',
      fontSize: 18,
      lineHeight: 24,
      fontWeight: '600' as const,
    },
    md: {
      fontFamily: 'Poppins-SemiBold',
      fontSize: 16,
      lineHeight: 22,
      fontWeight: '600' as const,
    },
    sm: {
      fontFamily: 'Poppins-Medium',
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '500' as const,
    },
  },

  // Body text (Inter)
  body: {
    lg: {
      fontFamily: 'Inter-Regular',
      fontSize: 16,
      lineHeight: 24,
      fontWeight: '400' as const,
    },
    md: {
      fontFamily: 'Inter-Regular',
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '400' as const,
    },
    sm: {
      fontFamily: 'Inter-Regular',
      fontSize: 12,
      lineHeight: 18,
      fontWeight: '400' as const,
    },
    xs: {
      fontFamily: 'Inter-Regular',
      fontSize: 11,
      lineHeight: 16,
      fontWeight: '400' as const,
    },
  },

  // Label/Caption styles
  label: {
    lg: {
      fontFamily: 'Inter-Medium',
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '500' as const,
    },
    md: {
      fontFamily: 'Inter-Medium',
      fontSize: 12,
      lineHeight: 18,
      fontWeight: '500' as const,
    },
    sm: {
      fontFamily: 'Inter-Medium',
      fontSize: 11,
      lineHeight: 16,
      fontWeight: '500' as const,
    },
  },

  // Avatar speech (Nunito italic)
  avatar: {
    speech: {
      fontFamily: 'Nunito-Regular',
      fontSize: 16,
      lineHeight: 22,
      fontWeight: '400' as const,
      fontStyle: 'italic' as const,
    },
    personality: {
      fontFamily: 'Nunito-SemiBold',
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '600' as const,
    },
  },
} as const;

// Type helpers
export type FontFamily = typeof typography.fonts[keyof typeof typography.fonts];
export type FontWeight = typeof typography.weights[keyof typeof typography.weights];
