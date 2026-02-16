/**
 * ConfettiAnimation.tsx
 * Celebratory confetti burst animations using Reanimated 2
 */

import React, { useEffect } from 'react';
import { View, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  Easing,
  runOnJS,
} from 'react-native-reanimated';

interface ConfettiParticle {
  id: number;
  left: number;
  delay: number;
}

interface ConfettiProps {
  visible?: boolean;
  onComplete?: () => void;
}

const COLORS = ['#FF6B6B', '#FFE66D', '#95E1D3', '#FFA07A', '#FF69B4', '#87CEEB'];

/**
 * Single confetti particle component
 */
function Particle({ id, left, delay }: ConfettiParticle) {
  const { height } = Dimensions.get('window');
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);
  const rotate = useSharedValue(0);

  useEffect(() => {
    translateY.value = withSequence(
      withTiming(0, { duration: 0 }),
      withTiming(height + 100, {
        duration: 2500,
        easing: Easing.linear,
      })
    );

    opacity.value = withSequence(
      withTiming(1, { duration: 0 }),
      withTiming(0, {
        duration: 500,
        easing: Easing.in(Easing.ease),
      })
    );

    rotate.value = withTiming(360 * (Math.random() > 0.5 ? 1 : -1), {
      duration: 2500,
      easing: Easing.linear,
    });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left,
          top: 0,
          width: 12,
          height: 12,
          borderRadius: 6,
          backgroundColor: COLORS[id % COLORS.length],
          marginLeft: delay * 100,
        },
        animatedStyle,
      ]}
    />
  );
}

/**
 * Light confetti burst (15 particles)
 */
export function ConfettiBurst({ visible = true, onComplete }: ConfettiProps) {
  if (!visible) return null;

  return (
    <View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        zIndex: 9999,
      }}
    >
      {Array.from({ length: 15 }).map((_, i) => (
        <Particle
          key={i}
          id={i}
          left={Dimensions.get('window').width / 2 - 6 + (Math.random() - 0.5) * 100}
          delay={Math.random() * 0.1}
        />
      ))}
    </View>
  );
}

/**
 * Heavy confetti explosion (50 particles)
 */
export function ConfettiExplosion({ visible = true, onComplete }: ConfettiProps) {
  if (!visible) return null;

  return (
    <View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        zIndex: 9999,
      }}
    >
      {Array.from({ length: 50 }).map((_, i) => (
        <Particle
          key={i}
          id={i}
          left={Dimensions.get('window').width / 2 - 6 + (Math.random() - 0.5) * 200}
          delay={Math.random() * 0.2}
        />
      ))}
    </View>
  );
}
