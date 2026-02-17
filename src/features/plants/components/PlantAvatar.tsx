/**
 * Plant Avatar Component
 * Interactive animated plant avatar with emotions, mouth sync, and glow effects
 * Uses Reanimated 2 for 60 FPS animations
 */

import React, { useEffect, useMemo } from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  interpolate,
  Extrapolate
} from 'react-native-reanimated';
import { GradientOverlay } from '@/design-system/components/GradientOverlay';
import { logger } from '@/lib/services/logger';
import { PlantPersonality, AvatarEmotion } from '@/types';
import { avatarImages } from '@/lib/assets';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface PlantAvatarProps {
  personality: PlantPersonality;
  emotionState: AvatarEmotion;
  isSpeaking?: boolean;
  size?: 'small' | 'medium' | 'large';
  showGlow?: boolean;
  level?: number;
}

// Avatar images mapping (PNG sprites)
// Imported from @lib/assets via alias (no more relative paths!)
const AVATAR_IMAGES: Record<PlantPersonality, any> = {
  cactus: avatarImages.cactus,
  orchidee: avatarImages.orchidee,
  monstera: avatarImages.monstera,
  succulente: avatarImages.succulente,
  fougere: avatarImages.fougere,
  carnivore: avatarImages.carnivore,
  pilea: avatarImages.pilea,
  palmier: avatarImages.palmier,
  pothos: avatarImages.pilea  // Pothos/Devil's Ivy (fallback to pilea)
};

// Emotion colors for glow effect
const EMOTION_COLORS: Record<AvatarEmotion, { primary: string; secondary: string }> = {
  idle: { primary: '#10B981', secondary: '#6EE7B7' },
  happy: { primary: '#F59E0B', secondary: '#FBBF24' },
  sad: { primary: '#3B82F6', secondary: '#93C5FD' },
  sleeping: { primary: '#8B5CF6', secondary: '#D8B4FE' },
  thirsty: { primary: '#EF4444', secondary: '#FCA5A5' },
  tired: { primary: '#8B5CF6', secondary: '#D8B4FE' },
  excited: { primary: '#F97316', secondary: '#FBBF24' },
  worried: { primary: '#F97316', secondary: '#FDBF8C' },
  neutral: { primary: '#10B981', secondary: '#6EE7B7' }
};

// Size configurations
const SIZE_CONFIG = {
  small: {
    avatar: 100,
    mouth: 15,
    eyes: 6,
    glow: 120
  },
  medium: {
    avatar: 180,
    mouth: 24,
    eyes: 10,
    glow: 220
  },
  large: {
    avatar: 280,
    mouth: 36,
    eyes: 15,
    glow: 320
  }
};

// P2.3 PERFORMANCE FIX: Memoize PlantAvatar to prevent animation restarts
// on parent re-renders while maintaining smooth animation state
const PlantAvatarComponent: React.FC<PlantAvatarProps> = ({
  personality,
  emotionState,
  isSpeaking = false,
  size = 'medium',
  showGlow = true,
  level = 1
}) => {
  const sizeConfig = SIZE_CONFIG[size];
  const emotionColor = EMOTION_COLORS[emotionState];

  // Animations
  const breatheScale = useSharedValue(1);
  const mouthScale = useSharedValue(0);
  const eyeScale = useSharedValue(1);
  const eyeBlinkProgress = useSharedValue(0);
  const glowOpacity = useSharedValue(0.6);
  const glowScale = useSharedValue(1);

  // Breathing animation (continuous)
  useEffect(() => {
    breatheScale.value = withRepeat(
      withTiming(1.08, {
        duration: 3000,
        easing: Easing.bezier(0.4, 0.0, 0.2, 1.0)
      }),
      -1,
      true
    );
  }, [breatheScale]);

  // Mouth animation (sync with speaking)
  useEffect(() => {
    if (isSpeaking) {
      mouthScale.value = withRepeat(
        withTiming(1.0, {
          duration: 150,
          easing: Easing.bezier(0.4, 0.0, 0.2, 1.0)
        }),
        -1,
        true
      );
    } else {
      mouthScale.value = withTiming(0, {
        duration: 300,
        easing: Easing.out(Easing.cubic)
      });
    }
  }, [isSpeaking, mouthScale]);

  // Eye blinking animation (every 3 seconds)
  useEffect(() => {
    eyeBlinkProgress.value = withRepeat(
      withTiming(1, {
        duration: 100,
        easing: Easing.bezier(0.4, 0.0, 0.2, 1.0)
      }),
      -1,
      true
    );

    // Set timing to blink every 3 seconds
    const blinkInterval = setInterval(() => {
      eyeBlinkProgress.value = withTiming(1, { duration: 100 });
    }, 3000);

    return () => clearInterval(blinkInterval);
  }, [eyeBlinkProgress]);

  // Glow pulse animation
  useEffect(() => {
    if (showGlow) {
      glowOpacity.value = withRepeat(
        withTiming(0.3, {
          duration: 2000,
          easing: Easing.sin
        }),
        -1,
        true
      );

      glowScale.value = withRepeat(
        withTiming(1.2, {
          duration: 2000,
          easing: Easing.sin
        }),
        -1,
        true
      );
    }
  }, [showGlow, glowOpacity, glowScale]);

  // Emotion effects
  useEffect(() => {
    if (emotionState === 'happy') {
      // Happy: eyes widen
      eyeScale.value = withTiming(1.3, {
        duration: 500,
        easing: Easing.bounce
      });
    } else if (emotionState === 'sad') {
      // Sad: eyes droop
      eyeScale.value = withTiming(0.7, { duration: 500 });
    } else if (emotionState === 'sleeping') {
      // Sleeping: eyes closed
      eyeScale.value = withTiming(0, { duration: 800 });
    } else {
      // Idle/thirsty: normal
      eyeScale.value = withTiming(1, { duration: 300 });
    }
  }, [emotionState, eyeScale]);

  // Animated styles
  const avatarAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: breatheScale.value }]
  }));

  const mouthAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scaleY: mouthScale.value }],
    opacity: interpolate(mouthScale.value, [0, 1], [0, 1], Extrapolate.CLAMP)
  }));

  const eyeAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scaleY: interpolate(eyeBlinkProgress.value, [0, 1], [1, 0.1], Extrapolate.CLAMP) }
    ]
  }));

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    transform: [{ scale: glowScale.value }]
  }));

  const avatarImage = AVATAR_IMAGES[personality] || AVATAR_IMAGES.succulente;

  logger.debug('PlantAvatar rendered', {
    personality,
    emotionState,
    isSpeaking,
    size
  });

  return (
    <View style={[styles.container, { width: sizeConfig.avatar + 100 }]}>
      {/* Glow effect background */}
      {showGlow && (
        <Animated.View
          style={[
            styles.glow,
            {
              width: sizeConfig.glow,
              height: sizeConfig.glow,
              borderRadius: sizeConfig.glow / 2,
              backgroundColor: emotionColor.primary
            },
            glowAnimatedStyle
          ]}
        />
      )}

      {/* Avatar main container */}
      <Animated.View
        style={[
          styles.avatarContainer,
          {
            width: sizeConfig.avatar,
            height: sizeConfig.avatar
          },
          avatarAnimatedStyle
        ]}
      >
        {/* Gradient overlay for depth */}
        <GradientOverlay
          colors={[emotionColor.secondary, emotionColor.primary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.gradientOverlay,
            {
              width: sizeConfig.avatar,
              height: sizeConfig.avatar,
              borderRadius: sizeConfig.avatar / 2
            }
          ]}
        />

        {/* Avatar image */}
        <Image
          source={avatarImage}
          style={[
            styles.avatarImage,
            {
              width: sizeConfig.avatar,
              height: sizeConfig.avatar
            }
          ]}
        />

        {/* Left eye */}
        <Animated.View
          style={[
            styles.eye,
            styles.eyeLeft,
            {
              width: sizeConfig.eyes,
              height: sizeConfig.eyes,
              backgroundColor: emotionColor.primary
            },
            eyeAnimatedStyle
          ]}
        />

        {/* Right eye */}
        <Animated.View
          style={[
            styles.eye,
            styles.eyeRight,
            {
              width: sizeConfig.eyes,
              height: sizeConfig.eyes,
              backgroundColor: emotionColor.primary
            },
            eyeAnimatedStyle
          ]}
        />

        {/* Mouth */}
        <Animated.View
          style={[
            styles.mouth,
            {
              width: sizeConfig.mouth,
              height: sizeConfig.mouth / 2,
              backgroundColor: emotionColor.primary,
              borderRadius: sizeConfig.mouth / 4
            },
            mouthAnimatedStyle
          ]}
        />
      </Animated.View>

      {/* Level badge */}
      {level > 1 && (
        <View
          style={[
            styles.levelBadge,
            {
              backgroundColor: emotionColor.primary,
              borderRadius: 18
            }
          ]}
        >
          <View style={styles.levelText}>
            <Animated.Text
              style={{
                fontSize: 12,
                fontWeight: 'bold',
                color: '#FFFFFF'
              }}
            >
              LV {level}
            </Animated.Text>
          </View>
        </View>
      )}

      {/* Emotion indicator (optional) */}
      <View style={styles.emotionIndicator}>
        <View
          style={[
            styles.emotionDot,
            { backgroundColor: emotionColor.primary }
          ]}
        />
      </View>
    </View>
  );
};

// Export memoized version to prevent animation restarts on parent re-renders
export const PlantAvatar = React.memo(PlantAvatarComponent, (prevProps, nextProps) => {
  return (
    prevProps.personality === nextProps.personality &&
    prevProps.emotionState === nextProps.emotionState &&
    prevProps.isSpeaking === nextProps.isSpeaking &&
    prevProps.size === nextProps.size &&
    prevProps.showGlow === nextProps.showGlow &&
    prevProps.level === nextProps.level
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'
  },
  glow: {
    position: 'absolute',
    opacity: 0.6,
    zIndex: -1
  },
  avatarContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: 150 // Will be overridden by size
  },
  gradientOverlay: {
    position: 'absolute',
    opacity: 0.15,
    zIndex: 0
  },
  avatarImage: {
    resizeMode: 'contain',
    zIndex: 1
  },
  eye: {
    position: 'absolute',
    borderRadius: 50,
    zIndex: 5
  },
  eyeLeft: {
    top: '35%',
    left: '30%'
  },
  eyeRight: {
    top: '35%',
    right: '30%'
  },
  mouth: {
    position: 'absolute',
    bottom: '20%',
    zIndex: 5
  },
  levelBadge: {
    position: 'absolute',
    bottom: -15,
    right: -15,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },
  levelText: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  emotionIndicator: {
    marginTop: 12,
    justifyContent: 'center',
    alignItems: 'center'
  },
  emotionDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.84,
    elevation: 2
  }
});
