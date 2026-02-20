/**
 * GradientOverlay Component
 * Cross-platform gradient rendering: LinearGradient on native, CSS gradient on web
 */

import React, { ReactNode } from 'react';
import { View, Platform } from 'react-native';
import { logger } from '@/lib/services/logger';

interface GradientOverlayProps {
  colors: [string, string];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  style?: import('react-native').ViewStyle;
  children?: ReactNode;
}

// Load LinearGradient only on native platforms (Expo official package)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let LinearGradient: React.ComponentType<Record<string, unknown>> | null = null;
if (Platform.OS !== 'web') {
  try {
    // Using expo-linear-gradient (official Expo package)
    const ExpoLinearGradient = require('expo-linear-gradient');
    LinearGradient = ExpoLinearGradient.LinearGradient;
  } catch (error) {
    logger.warn('[GradientOverlay] LinearGradient module not available', {
      error: error instanceof Error ? error.message : String(error)
    });
  }
}

export const GradientOverlay: React.FC<GradientOverlayProps> = ({
  colors,
  start = { x: 0, y: 0 },
  end = { x: 1, y: 1 },
  style,
  children
}) => {
  if (Platform.OS === 'web') {
    // On web, use CSS gradient
    const gradient = `linear-gradient(135deg, ${colors[0]} 0%, ${colors[1]} 100%)`;

    return (
      <View
        style={[
          style,
          {
            // @ts-ignore - web-only CSS property
            background: gradient,
            position: 'absolute'
          }
        ]}
      >
        {children}
      </View>
    );
  }

  // On native (iOS/Android), use LinearGradient component if available
  if (!LinearGradient) {
    // Fallback: return plain View if LinearGradient unavailable
    return (
      <View style={style}>
        {children}
      </View>
    );
  }

  return (
    <LinearGradient
      colors={colors}
      start={start}
      end={end}
      style={style}
    >
      {children}
    </LinearGradient>
  );
};
