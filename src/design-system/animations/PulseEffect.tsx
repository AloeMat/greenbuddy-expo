/**
 * Pulse Effect Animation
 * Opacity pulsing for emphasis (notifications, alerts, etc.)
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

export interface PulseEffectProps extends ViewProps {
  duration?: number;
  children: React.ReactNode;
}

export const PulseEffect: React.FC<PulseEffectProps> = ({
  duration = 1500,
  children,
  style,
  ...props
}) => {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.3, {
        duration: duration / 2,
        easing: Easing.bezier(0.4, 0.0, 0.2, 1.0)
      }),
      -1,
      true
    );
  }, [opacity, duration]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value
  }));

  return (
    <Animated.View style={[animatedStyle, style]} {...props}>
      {children}
    </Animated.View>
  );
};
