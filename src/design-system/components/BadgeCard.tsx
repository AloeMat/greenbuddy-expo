/**
 * Badge Card Component
 * Displays achievement/badge with locked/unlocked state
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Check, Lock } from 'lucide-react-native';
import { COLORS } from '@tokens/colors';
import { radius } from '@tokens/radius';

interface BadgeCardProps {
  icon: React.ReactNode; // Lucide icon component
  label: string;
  description?: string;
  unlocked: boolean;
  onPress?: () => void;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'achievement' | 'milestone';
}

/**
 * BadgeCard Component
 * Displays a single badge/achievement card
 */
export const BadgeCard: React.FC<BadgeCardProps> = ({
  icon,
  label,
  description,
  unlocked,
  onPress,
  size = 'md',
  variant = 'default',
}) => {
  const sizeMap = {
    sm: 60,
    md: 80,
    lg: 100,
  };

  const badgeSize = sizeMap[size];
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (!onPress) return;
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    if (!onPress) return;
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();

    onPress?.();
  };

  const getBgColor = () => {
    if (!unlocked) return COLORS.neutral[100];
    if (variant === 'milestone') return COLORS.primary[100];
    if (variant === 'achievement') return COLORS.secondary[50];
    return COLORS.primary[50];
  };

  const getBorderColor = () => {
    if (!unlocked) return COLORS.neutral[300];
    if (variant === 'milestone') return COLORS.primary[300];
    if (variant === 'achievement') return COLORS.secondary[200];
    return COLORS.primary[200];
  };

  const content = (
    <View style={[styles.container, { opacity: unlocked ? 1 : 0.6 }]}>
      {/* Badge Icon */}
      <Animated.View
        style={[
          styles.badgeIcon,
          {
            width: badgeSize,
            height: badgeSize,
            borderRadius: badgeSize / 2,
            backgroundColor: getBgColor(),
            borderColor: getBorderColor(),
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View style={styles.iconWrapper}>
          {React.cloneElement(icon as React.ReactElement, {
            size: badgeSize * 0.5,
            color: unlocked ? COLORS.primary[600] : COLORS.neutral[500],
            strokeWidth: 2,
          } as any)}
        </View>

        {/* Lock or Check overlay */}
        {!unlocked ? (
          <View style={styles.lockOverlay}>
            <Lock size={16} color={COLORS.neutral[600]} strokeWidth={2.5} />
          </View>
        ) : (
          <View style={styles.checkOverlay}>
            <Check size={16} color={COLORS.primary[600]} strokeWidth={3} />
          </View>
        )}
      </Animated.View>

      {/* Label */}
      <Text
        style={[
          styles.label,
          { color: unlocked ? COLORS.text[900] : COLORS.text[500] },
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>

      {/* Description */}
      {description && (
        <Text
          style={[
            styles.description,
            { color: unlocked ? COLORS.text[600] : COLORS.text[400] },
          ]}
          numberOfLines={2}
        >
          {description}
        </Text>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.7}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  badgeIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 2,
    position: 'relative',
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockOverlay: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: radius.sm, // Phase 5.5: 12 → 12
    backgroundColor: COLORS.neutral[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkOverlay: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: radius.sm, // Phase 5.5: 12 → 12
    backgroundColor: COLORS.primary[100],
    borderWidth: 2,
    borderColor: COLORS.primary[600],
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  description: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 14,
  },
});
