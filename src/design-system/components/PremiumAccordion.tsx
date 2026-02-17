import React, { useState } from 'react';
import { View, TouchableOpacity, Text, LayoutAnimation, Platform, ViewStyle } from 'react-native';
import Animated, {
  FadeInDown,
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { radius } from '@tokens/radius';
import { spacing } from '@tokens/spacing';
import { shadows } from '@tokens/shadows';
import { onboardingColors } from '@design-system/onboarding/colors';
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

export const PremiumAccordion: React.FC<PremiumAccordionProps> = ({
  items,
  allowMultiple = false,
  style,
  enterDelay = 0,
}) => {
  const [expandedIds, setExpandedIds] = useState<string[]>([]);

  const toggleItem = (id: string) => {
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
  };

  return (
    <Animated.View entering={FadeInDown.delay(enterDelay)} style={style}>
      <View
        style={{
          gap: spacing.md,
        }}
      >
        {items.map((item, index) => {
          const isExpanded = expandedIds.includes(item.id);
          const rotateZ = useSharedValue(isExpanded ? 180 : 0);

          React.useEffect(() => {
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
                onPress={() => toggleItem(item.id)}
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
        })}
      </View>
    </Animated.View>
  );
};

export default PremiumAccordion;
