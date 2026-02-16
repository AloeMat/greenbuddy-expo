/**
 * Typing Indicator Animation
 * Three bouncing dots animation for chat messages being typed
 */

import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  withDelay
} from 'react-native-reanimated';

export interface TypingIndicatorProps {
  color?: string;
  size?: number;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  color = '#10B981',
  size = 8
}) => {
  const dot1Y = useSharedValue(0);
  const dot2Y = useSharedValue(0);
  const dot3Y = useSharedValue(0);

  useEffect(() => {
    // Stagger animation for each dot
    [dot1Y, dot2Y, dot3Y].forEach((dot, index) => {
      dot.value = withDelay(
        index * 100,
        withRepeat(
          withTiming(-size * 1.5, {
            duration: 600,
            easing: Easing.bezier(0.4, 0.0, 0.2, 1.0)
          }),
          -1,
          true
        )
      );
    });
  }, [dot1Y, dot2Y, dot3Y, size]);

  const dot1Style = useAnimatedStyle(() => ({
    transform: [{ translateY: dot1Y.value }]
  }));

  const dot2Style = useAnimatedStyle(() => ({
    transform: [{ translateY: dot2Y.value }]
  }));

  const dot3Style = useAnimatedStyle(() => ({
    transform: [{ translateY: dot3Y.value }]
  }));

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.dot,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: color
          },
          dot1Style
        ]}
      />
      <Animated.View
        style={[
          styles.dot,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: color
          },
          dot2Style
        ]}
      />
      <Animated.View
        style={[
          styles.dot,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: color
          },
          dot3Style
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4
  },
  dot: {
    marginHorizontal: 2
  }
});
