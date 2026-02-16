/**
 * Shake Animation
 * Horizontal shake effect for error states or warnings
 */

import React, { useEffect, useCallback } from 'react';
import { ViewProps } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing
} from 'react-native-reanimated';

export interface ShakeAnimationProps extends ViewProps {
  trigger?: boolean;
  duration?: number;
  intensity?: number;
  children: React.ReactNode;
}

export const ShakeAnimation: React.FC<ShakeAnimationProps> = ({
  trigger = false,
  duration = 300,
  intensity = 8,
  children,
  style,
  ...props
}) => {
  const translateX = useSharedValue(0);

  const shake = useCallback(() => {
    // Shake sequence: right -> left -> right -> center
    const sequence = [
      { target: intensity, duration: duration / 4 },
      { target: -intensity, duration: duration / 4 },
      { target: intensity, duration: duration / 4 },
      { target: 0, duration: duration / 4 }
    ];

    sequence.forEach((step, index) => {
      setTimeout(() => {
        translateX.value = withTiming(step.target, {
          duration: step.duration,
          easing: Easing.linear
        });
      }, index * (duration / 4));
    });
  }, [translateX, duration, intensity]);

  useEffect(() => {
    if (trigger) {
      shake();
    }
  }, [trigger, shake]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }]
  }));

  return (
    <Animated.View style={[animatedStyle, style]} {...props}>
      {children}
    </Animated.View>
  );
};
