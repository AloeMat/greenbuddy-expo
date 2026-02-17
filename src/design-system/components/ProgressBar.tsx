import React from 'react';
import { View, ViewStyle } from 'react-native';
import Animated, { FadeInDown, useSharedValue, withTiming } from 'react-native-reanimated';
import { shadows } from '@tokens/shadows';
import { onboardingColors } from '@design-system/onboarding/colors';

export interface ProgressBarProps {
  progress: number; // 0-100
  height?: number;
  color?: string;
  backgroundColor?: string;
  showLabel?: boolean;
  animated?: boolean;
  style?: ViewStyle;
  enterDelay?: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  height = 8,
  color = onboardingColors.green[500],
  backgroundColor = onboardingColors.gray[200],
  showLabel = false,
  animated = true,
  style,
  enterDelay = 0,
}) => {
  const animatedProgress = useSharedValue(0);

  React.useEffect(() => {
    if (animated) {
      animatedProgress.value = withTiming(Math.min(Math.max(progress, 0), 100), {
        duration: 600,
      });
    } else {
      animatedProgress.value = progress;
    }
  }, [progress, animated, animatedProgress]);

  return (
    <Animated.View entering={FadeInDown.delay(enterDelay)} style={style}>
      <View
        style={{
          width: '100%',
          height,
          backgroundColor,
          borderRadius: height / 2,
          overflow: 'hidden',
          ...shadows.xs,
        }}
      >
        <Animated.View
          style={[
            {
              height: '100%',
              backgroundColor: color,
              borderRadius: height / 2,
              width: `${animatedProgress.value}%`,
            },
            showLabel && shadows.sm,
          ]}
        />
      </View>
      {showLabel && (
        <View
          style={{
            marginTop: 8,
            alignSelf: 'flex-end',
          }}
        >
          <View
            style={{
              backgroundColor: color,
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 4,
              ...shadows.xs,
            }}
          >
            <Animated.Text
              style={{
                fontSize: 11,
                fontWeight: '600',
                color: 'white',
                letterSpacing: 0.2,
              }}
            >
              {Math.round(animatedProgress.value)}%
            </Animated.Text>
          </View>
        </View>
      )}
    </Animated.View>
  );
};

export default ProgressBar;
