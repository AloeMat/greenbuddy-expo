import { radius } from '@tokens/radius';
/**
 * Plant Action Buttons
 * Water, Fertilize, Delete plant actions with haptics and animations
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  Animated,
} from 'react-native';
import { Droplets, Leaf, Trash2 } from 'lucide-react-native';
import { COLORS } from '@tokens/colors';

interface ActionButtonProps {
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Water Button
 */
export const WaterButton: React.FC<ActionButtonProps> = ({
  onPress,
  loading,
  disabled,
  variant = 'primary',
  size = 'md',
}) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
    onPress();
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return { padding: 8, borderRadius: 8 };
      case 'lg':
        return { padding: 16, borderRadius: 12 };
      case 'md':
      default:
        return { padding: 12, borderRadius: 10 };
    }
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        style={[
          styles.button,
          styles.primaryButton,
          getSizeStyles(),
          (disabled || loading) && styles.disabledButton,
        ]}
        activeOpacity={0.7}
      >
        <Droplets
          size={20}
          color={COLORS.neutral[50]}
          strokeWidth={2}
        />
        <Text style={[styles.buttonText, styles.primaryText]}>
          {loading ? 'Arrosage...' : 'Arroser'}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

/**
 * Fertilize Button
 */
export const FertilizeButton: React.FC<ActionButtonProps> = ({
  onPress,
  loading,
  disabled,
  variant = 'secondary',
  size = 'md',
}) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
    onPress();
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return { padding: 8, borderRadius: 8 };
      case 'lg':
        return { padding: 16, borderRadius: 12 };
      case 'md':
      default:
        return { padding: 12, borderRadius: 10 };
    }
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        style={[
          styles.button,
          styles.secondaryButton,
          getSizeStyles(),
          (disabled || loading) && styles.disabledButton,
        ]}
        activeOpacity={0.7}
      >
        <Leaf
          size={20}
          color={COLORS.secondary[600]}
          strokeWidth={2}
        />
        <Text style={[styles.buttonText, styles.secondaryText]}>
          {loading ? 'Fertilisation...' : 'Fertiliser'}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

/**
 * Delete Button
 */
export const DeleteButton: React.FC<ActionButtonProps> = ({
  onPress,
  loading,
  disabled,
  size = 'md',
}) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
    onPress();
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return { padding: 8, borderRadius: 8 };
      case 'lg':
        return { padding: 16, borderRadius: 12 };
      case 'md':
      default:
        return { padding: 12, borderRadius: 10 };
    }
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        style={[
          styles.button,
          styles.dangerButton,
          getSizeStyles(),
          (disabled || loading) && styles.disabledButton,
        ]}
        activeOpacity={0.7}
      >
        <Trash2
          size={20}
          color={COLORS.neutral[50]}
          strokeWidth={2}
        />
        <Text style={[styles.buttonText, styles.dangerText]}>
          {loading ? 'Suppression...' : 'Supprimer'}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

/**
 * Action Buttons Group
 */
export const PlantActionButtonGroup: React.FC<{
  onWater: () => void;
  onFertilize: () => void;
  onDelete: () => void;
  loading?: boolean;
  disabled?: boolean;
}> = ({ onWater, onFertilize, onDelete, loading, disabled }) => {
  return (
    <View style={styles.buttonGroup}>
      <View style={styles.buttonRow}>
        <View style={styles.buttonWrapper}>
          <WaterButton
            onPress={onWater}
            loading={loading}
            disabled={disabled}
            size="md"
          />
        </View>
        <View style={styles.buttonWrapper}>
          <FertilizeButton
            onPress={onFertilize}
            loading={loading}
            disabled={disabled}
            size="md"
          />
        </View>
      </View>
      <View style={styles.deleteButtonWrapper}>
        <DeleteButton
          onPress={onDelete}
          loading={loading}
          disabled={disabled}
          size="md"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryButton: {
    backgroundColor: COLORS.primary[600],
  },
  secondaryButton: {
    backgroundColor: COLORS.secondary[100],
    borderWidth: 2,
    borderColor: COLORS.secondary[600],
  },
  dangerButton: {
    backgroundColor: COLORS.error[600],
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  primaryText: {
    color: COLORS.neutral[50],
  },
  secondaryText: {
    color: COLORS.secondary[600],
  },
  dangerText: {
    color: COLORS.neutral[50],
  },
  buttonGroup: {
    gap: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  buttonWrapper: {
    flex: 1,
  },
  deleteButtonWrapper: {
    width: '100%',
  },
});
