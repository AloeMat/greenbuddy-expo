import React from 'react';
import { View, Text, ViewStyle } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { radius } from '@tokens/radius';
import { spacing } from '@tokens/spacing';
import { shadows } from '@tokens/shadows';
import { onboardingColors } from '../onboarding/colors';

export interface StatItem {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color?: string;
  trend?: 'up' | 'down' | 'neutral';
}

interface PremiumStatsProps {
  items: StatItem[];
  layout?: 'row' | 'column';
  style?: ViewStyle;
  enterDelay?: number;
}

export const PremiumStats: React.FC<PremiumStatsProps> = ({
  items,
  layout = 'row',
  style,
  enterDelay = 0,
}) => {
  return (
    <Animated.View entering={FadeInDown.delay(enterDelay)} style={style}>
      <View
        style={{
          flexDirection: layout === 'row' ? 'row' : 'column',
          gap: spacing.md,
        }}
      >
        {items.map((item, index) => (
          <View
            key={index}
            style={[
              layout === 'row' && { flex: 1 },
              {
                backgroundColor: onboardingColors.gray[50],
                borderRadius: radius.md,
                padding: spacing.md,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: onboardingColors.gray[200],
                ...shadows.xs,
              },
            ]}
          >
            {/* Icon */}
            <View
              style={{
                marginBottom: spacing.sm,
              }}
            >
              {item.icon}
            </View>

            {/* Label */}
            <Text
              style={{
                fontSize: 12,
                color: onboardingColors.text.secondary,
                marginBottom: spacing.xs,
                fontWeight: '500',
                letterSpacing: 0.2,
              }}
            >
              {item.label}
            </Text>

            {/* Value */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.xs,
              }}
            >
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: '700',
                  color: item.color || onboardingColors.green[600],
                }}
              >
                {item.value}
              </Text>

              {/* Trend indicator */}
              {item.trend && (
                <View
                  style={{
                    paddingHorizontal: spacing.xs,
                    paddingVertical: 2,
                    backgroundColor:
                      item.trend === 'up'
                        ? '#DCFCE7'
                        : item.trend === 'down'
                        ? '#FEE2E2'
                        : onboardingColors.gray[100],
                    borderRadius: radius.sm,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: '600',
                      color:
                        item.trend === 'up'
                          ? onboardingColors.green[700]
                          : item.trend === 'down'
                          ? onboardingColors.error
                          : onboardingColors.text.secondary,
                    }}
                  >
                    {item.trend === 'up' ? '↑' : item.trend === 'down' ? '↓' : '−'}
                  </Text>
                </View>
              )}
            </View>
          </View>
        ))}
      </View>
    </Animated.View>
  );
};

export default PremiumStats;
