/**
 * Breathing Container Animation
 * Gentle scale breathing effect for calm, organic feel
 */

import React, { useEffect } from 'react';
import { ViewProps } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing
} from 'react-native-reanimated';

export interface BreathingContainerProps extends ViewProps {
  scale?: number;
  duration?: number;
  children: React.ReactNode;
}

export const BreathingContainer: React.FC<BreathingContainerProps> = ({
  scale = 1.08,
  duration = 3000,
  children,
  style,
  ...props
}) => {
  const scaleValue = useSharedValue(1);

  useEffect(() => {
    scaleValue.value = withRepeat(
      withTiming(scale, {
        duration,
        easing: Easing.bezier(0.4, 0.0, 0.2, 1.0)
      }),
      -1,
      true
    );
  }, [scaleValue, scale, duration]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleValue.value }]
  }));

  return (
    <Animated.View style={[animatedStyle, style]} {...props}>
      {children}
    </Animated.View>
  );
};
