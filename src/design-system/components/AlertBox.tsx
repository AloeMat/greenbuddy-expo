import React, { ComponentProps } from 'react';
import { View, Text, ViewStyle, TouchableOpacity } from 'react-native';
import Animated, { SlideInRight } from 'react-native-reanimated';
import { radius } from '@/design-system/tokens/radius';
import { spacing } from '@/design-system/tokens/spacing';
import { shadows } from '@/design-system/tokens/shadows';
import { onboardingColors } from '@/design-system/onboarding/colors';
import { Feather } from '@expo/vector-icons';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

export interface AlertBoxProps {
  type: AlertType;
  title?: string;
  message: string;
  onDismiss?: () => void;
  dismissible?: boolean;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
  enterDelay?: number;
}

const alertConfig: Record<
  AlertType,
  { bg: string; border: string; icon: ComponentProps<typeof Feather>['name']; color: string }
> = {
  success: {
    bg: onboardingColors.green[50],
    border: onboardingColors.green[100],
    icon: 'check-circle',
    color: onboardingColors.green[700],
  },
  error: {
    bg: '#FEE2E2',
    border: '#FCA5A5',
    icon: 'alert-circle',
    color: '#991B1B',
  },
  warning: {
    bg: '#FEF3C7',
    border: '#FCD34D',
    icon: 'alert-triangle',
    color: '#92400E',
  },
  info: {
    bg: '#EFF6FF',
    border: '#BFDBFE',
    icon: 'info',
    color: '#0C2340',
  },
};

export const AlertBox: React.FC<AlertBoxProps> = ({
  type,
  title,
  message,
  onDismiss,
  dismissible = true,
  icon,
  actionLabel,
  onAction,
  style,
  enterDelay = 0,
}) => {
  const config = alertConfig[type];

  return (
    <Animated.View
      entering={SlideInRight.delay(enterDelay).springify()}
      style={style}
    >
      <View
        style={{
          backgroundColor: config.bg,
          borderLeftWidth: 4,
          borderLeftColor: config.color,
          borderRadius: radius.md,
          padding: spacing.md,
          flexDirection: 'row',
          alignItems: 'flex-start',
          ...shadows.sm,
        }}
      >
        <View style={{ marginRight: spacing.md, marginTop: 2 }}>
          {icon || <Feather name={config.icon} size={20} color={config.color} />}
        </View>

        <View style={{ flex: 1 }}>
          {Boolean(title) && (
            <Text
              style={{
                fontSize: 14,
                fontWeight: '600',
                color: config.color,
                marginBottom: spacing.xs,
                letterSpacing: 0.2,
              }}
            >
              {title}
            </Text>
          )}
          <Text
            style={{
              fontSize: 13,
              color: config.color,
              lineHeight: 20,
              opacity: 0.85,
            }}
          >
            {message}
          </Text>

          {Boolean(actionLabel) && (
            <TouchableOpacity
              onPress={onAction}
              style={{
                marginTop: spacing.sm,
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: '600',
                  color: config.color,
                  textDecorationLine: 'underline',
                }}
              >
                {actionLabel}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {dismissible && onDismiss && (
          <TouchableOpacity
            onPress={onDismiss}
            style={{
              padding: spacing.xs,
              marginLeft: spacing.sm,
            }}
          >
            <Feather name="x" size={18} color={config.color} />
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
};

export default AlertBox;
