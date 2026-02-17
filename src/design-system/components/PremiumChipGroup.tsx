import React from 'react';
import { View, TouchableOpacity, Text, ViewStyle, FlatList } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { radius } from '@tokens/radius';
import { spacing } from '@tokens/spacing';
import { shadows } from '@tokens/shadows';
import { onboardingColors } from '../onboarding/colors';
import { Feather } from '@expo/vector-icons';

export interface ChipItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface PremiumChipGroupProps {
  items: ChipItem[];
  selected?: string[];
  onSelect?: (id: string) => void;
  onRemove?: (id: string) => void;
  multiSelect?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  enterDelay?: number;
}

export const PremiumChipGroup: React.FC<PremiumChipGroupProps> = ({
  items,
  selected = [],
  onSelect,
  onRemove,
  multiSelect = false,
  disabled = false,
  style,
  enterDelay = 0,
}) => {
  const handlePress = (id: string) => {
    if (disabled) return;

    if (multiSelect) {
      if (selected.includes(id)) {
        onRemove?.(id);
      } else {
        onSelect?.(id);
      }
    } else {
      if (selected.includes(id)) {
        onRemove?.(id);
      } else {
        onSelect?.(id);
      }
    }
  };

  return (
    <Animated.View entering={FadeInDown.delay(enterDelay)} style={[style]}>
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: spacing.sm,
        }}
      >
        {items.map((item) => {
          const isSelected = selected.includes(item.id);

          return (
            <TouchableOpacity
              key={item.id}
              onPress={() => handlePress(item.id)}
              disabled={disabled}
              activeOpacity={0.7}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.sm,
                borderRadius: radius.md,
                backgroundColor: isSelected
                  ? onboardingColors.green[500]
                  : onboardingColors.gray[100],
                borderWidth: 1,
                borderColor: isSelected
                  ? onboardingColors.green[500]
                  : onboardingColors.gray[300],
                ...(!isSelected && shadows.xs),
                opacity: disabled ? 0.5 : 1,
              }}
            >
              {item.icon && (
                <View
                  style={{
                    marginRight: spacing.xs,
                  }}
                >
                  {item.icon}
                </View>
              )}
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: '600',
                  color: isSelected ? 'white' : onboardingColors.text.primary,
                  letterSpacing: 0.2,
                }}
              >
                {item.label}
              </Text>
              {isSelected && (
                <Feather
                  name="check"
                  size={14}
                  color="white"
                  style={{ marginLeft: spacing.xs }}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </Animated.View>
  );
};

export default PremiumChipGroup;
