/**
 * Progress Ring Component
 * Circular progress indicator with animated stroke
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  ViewStyle,
} from 'react-native';
import Svg, { Circle, SvgProps } from 'react-native-svg';
import { COLORS } from '@/design-system/tokens/colors';

interface ProgressRingProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  label?: string;
  sublabel?: string;
  showPercentage?: boolean;
  animated?: boolean;
}

/**
 * ProgressRing Component
 * Circular progress indicator with SVG
 */
export const ProgressRing: React.FC<ProgressRingProps> = ({
  progress,
  size = 120,
  strokeWidth = 8,
  color = COLORS.primary[500],
  backgroundColor = COLORS.neutral[200],
  label,
  sublabel,
  showPercentage = true,
  animated = true,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  const animatedOffset = React.useRef(new Animated.Value(circumference)).current;

  useEffect(() => {
    if (animated) {
      Animated.timing(animatedOffset, {
        toValue: offset,
        duration: 800,
        useNativeDriver: true,
      }).start();
    } else {
      animatedOffset.setValue(offset);
    }
  }, [progress, offset, animated, animatedOffset]);

  const animatedStyle = {
    strokeDashoffset: animatedOffset,
  };

  const containerStyle: ViewStyle = {
    width: size,
    height: size,
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {/* SVG Circle */}
      <Svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={StyleSheet.absoluteFillObject}
      >
        {/* Background circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Progress circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>

      {/* Center Content */}
      <View style={[styles.center, { width: size, height: size }]}>
        {showPercentage && (
          <Text style={styles.percentage}>{Math.round(progress)}%</Text>
        )}
        {label && <Text style={styles.label}>{label}</Text>}
        {sublabel && <Text style={styles.sublabel}>{sublabel}</Text>}
      </View>
    </View>
  );
};

/**
 * XP Ring - specialized progress ring for XP progression
 */
export const XPRing: React.FC<{
  xp: number;
  maxXp: number;
  level: number;
  size?: number;
}> = ({ xp, maxXp, level, size = 120 }) => {
  const progress = (xp / maxXp) * 100;

  return (
    <ProgressRing
      progress={progress}
      size={size}
      color={COLORS.primary[500]}
      label={`Lvl ${level}`}
      sublabel={`${xp}/${maxXp} XP`}
      showPercentage={false}
    />
  );
};

/**
 * Health Ring - specialized progress ring for plant health
 */
export const HealthRing: React.FC<{
  health: number;
  size?: number;
}> = ({ health, size = 100 }) => {
  const getHealthColor = () => {
    if (health >= 80) return COLORS.primary[500];
    if (health >= 50) return COLORS.warning[500];
    return COLORS.error[500];
  };

  return (
    <ProgressRing
      progress={health}
      size={size}
      color={getHealthColor()}
      label="Santé"
      showPercentage={true}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentage: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text[900],
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text[700],
    marginTop: 4,
  },
  sublabel: {
    fontSize: 11,
    color: COLORS.text[500],
    marginTop: 2,
  },
});
