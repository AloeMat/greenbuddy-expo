/**
 * Confetti Animation Component
 * Celebration effect for achievement unlocks and level ups
 * Uses Reanimated 2 for smooth 60 FPS animation
 */

import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
  Easing,
} from 'react-native';
import { COLORS } from '@tokens/colors';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface ConfettiPieceProps {
  delay: number;
  duration: number;
  randomLeft: number;
  randomRotation: number;
}

interface ConfettiAnimationProps {
  visible: boolean;
  onComplete?: () => void;
  intensity?: 'light' | 'medium' | 'heavy';
}

/**
 * Single confetti piece
 */
const ConfettiPiece: React.FC<ConfettiPieceProps> = ({
  delay,
  duration,
  randomLeft,
  randomRotation,
}) => {
  const translateY = new Animated.Value(0);
  const opacity = new Animated.Value(1);
  const rotation = new Animated.Value(0);

  useEffect(() => {
    // Start animation after delay
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: screenHeight,
          duration,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: duration * 0.9,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(rotation, {
          toValue: randomRotation,
          duration,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ]).start();
    }, delay);
  }, [delay, duration, randomRotation]);

  return (
    <Animated.View
      style={[
        styles.confettiPiece,
        {
          left: randomLeft,
          transform: [
            { translateY },
            {
              rotate: rotation.interpolate({
                inputRange: [0, randomRotation],
                outputRange: ['0deg', `${randomRotation}deg`],
              }),
            },
          ],
          opacity,
        },
      ]}
    />
  );
};

/**
 * Confetti Animation Component
 * Displays celebration confetti burst
 */
export const ConfettiAnimation: React.FC<ConfettiAnimationProps> = ({
  visible,
  onComplete,
  intensity = 'medium',
}) => {
  const countMap = {
    light: 15,
    medium: 30,
    heavy: 50,
  };

  const durationMap = {
    light: 1500,
    medium: 2000,
    heavy: 2500,
  };

  const confettiCount = countMap[intensity];
  const duration = durationMap[intensity];

  useEffect(() => {
    if (visible && onComplete) {
      const timer = setTimeout(onComplete, duration + 500);
      return () => clearTimeout(timer);
    }
  }, [visible, duration, onComplete]);

  if (!visible) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      {Array.from({ length: confettiCount }).map((_, index) => (
        <ConfettiPiece
          key={index}
          delay={Math.random() * 200}
          duration={duration}
          randomLeft={Math.random() * screenWidth}
          randomRotation={Math.random() * 720 - 360}
        />
      ))}
    </View>
  );
};

/**
 * Lightweight confetti burst - optimized for single uses
 */
export const ConfettiBurst: React.FC<{
  visible: boolean;
  onComplete?: () => void;
}> = ({ visible, onComplete }) => (
  <ConfettiAnimation
    visible={visible}
    onComplete={onComplete}
    intensity="light"
  />
);

/**
 * Heavy confetti burst - for major achievements
 */
export const ConfettiExplosion: React.FC<{
  visible: boolean;
  onComplete?: () => void;
}> = ({ visible, onComplete }) => (
  <ConfettiAnimation
    visible={visible}
    onComplete={onComplete}
    intensity="heavy"
  />
);

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: 'none',
    zIndex: 1000,
    overflow: 'hidden',
  },
  confettiPiece: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary[500],
  },
});
