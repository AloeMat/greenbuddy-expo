import React, { useState, useCallback, useEffect } from 'react';
import { View, TouchableOpacity, Text, LayoutAnimation, Platform, ViewStyle } from 'react-native';
import Animated, {
  FadeInDown,
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { radius } from '@/design-system/tokens/radius';
import { spacing } from '@/design-system/tokens/spacing';
import { shadows } from '@/design-system/tokens/shadows';
import { onboardingColors } from '@/design-system/onboarding/colors';
import { Feather } from '@expo/vector-icons';

interface AccordionItem {
  id: string;
  title: string;
  description?: string;
  content: React.ReactNode;
  icon?: React.ReactNode;
}

interface PremiumAccordionProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
  style?: ViewStyle;
  enterDelay?: number;
}

// Separate component to handle each accordion item with its own hooks
interface AccordionItemProps {
  item: AccordionItem;
  isExpanded: boolean;
  onToggle: (id: string) => void;
}

const AccordionItemComponent: React.FC<AccordionItemProps> = ({ item, isExpanded, onToggle }) => {
  // ✅ Hooks at component top level
  const rotateZ = useSharedValue(isExpanded ? 180 : 0);

  useEffect(() => {
    rotateZ.value = withTiming(isExpanded ? 180 : 0, {
      duration: 300,
    });
  }, [isExpanded, rotateZ]);

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [
      {
        rotate: `${interpolate(
          rotateZ.value,
          [0, 180],
          [0, 180],
          Extrapolate.CLAMP
        )}deg`,
      },
    ],
  }));

  return (
    <View key={item.id}>
      {/* Header */}
      <TouchableOpacity
        onPress={() => onToggle(item.id)}
        activeOpacity={0.7}
        style={{
          backgroundColor: 'white',
          borderRadius: radius.md,
          padding: spacing.md,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderWidth: 1,
          borderColor: isExpanded
            ? onboardingColors.green[200]
            : onboardingColors.gray[200],
          ...shadows.xs,
        }}
      >
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.sm,
          }}
        >
          {item.icon && <View>{item.icon}</View>}

          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: '600',
                color: isExpanded
                  ? onboardingColors.green[700]
                  : onboardingColors.text.primary,
                letterSpacing: 0.2,
                marginBottom: item.description ? spacing.xs : 0,
              }}
            >
              {item.title}
            </Text>

            {item.description && (
              <Text
                style={{
                  fontSize: 12,
                  color: onboardingColors.text.secondary,
                  lineHeight: 18,
                }}
              >
                {item.description}
              </Text>
            )}
          </View>
        </View>

        <Animated.View style={animatedIconStyle}>
          <Feather
            name="chevron-down"
            size={20}
            color={
              isExpanded
                ? onboardingColors.green[500]
                : onboardingColors.text.secondary
            }
          />
        </Animated.View>
      </TouchableOpacity>

      {/* Content */}
      {isExpanded && (
        <View
          style={{
            backgroundColor: onboardingColors.gray[50],
            borderRadius: radius.md,
            padding: spacing.md,
            marginTop: -spacing.sm,
            marginHorizontal: 6,
            borderWidth: 1,
            borderTopWidth: 0,
            borderColor: onboardingColors.green[200],
            ...shadows.sm,
          }}
        >
          {item.content}
        </View>
      )}
    </View>
  );
};

export const PremiumAccordion: React.FC<PremiumAccordionProps> = ({
  items,
  allowMultiple = false,
  style,
  enterDelay = 0,
}) => {
  const [expandedIds, setExpandedIds] = useState<string[]>([]);

  const toggleItem = useCallback((id: string) => {
    if (Platform.OS !== 'web') {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }

    setExpandedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      } else {
        if (allowMultiple) {
          return [...prev, id];
        } else {
          return [id];
        }
      }
    });
  }, [allowMultiple]);

  return (
    <Animated.View entering={FadeInDown.delay(enterDelay)} style={style}>
      <View
        style={{
          gap: spacing.md,
        }}
      >
        {items.map((item) => {
          const isExpanded = expandedIds.includes(item.id);
          return (
            <AccordionItemComponent
              key={item.id}
              item={item}
              isExpanded={isExpanded}
              onToggle={toggleItem}
            />
          );
        })}
      </View>
    </Animated.View>
  );
};

export default PremiumAccordion;
