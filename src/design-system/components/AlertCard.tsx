/**
 * Alert Card Component
 * Display urgent notifications, watering alerts, health warnings
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {
  AlertCircle,
  CheckCircle,
  Info,
  AlertTriangle,
  X,
} from 'lucide-react-native';
import { COLORS } from '@/design-system/tokens/colors';

type AlertType = 'error' | 'warning' | 'success' | 'info';

interface AlertCardProps {
  type: AlertType;
  title: string;
  message: string;
  onClose?: () => void;
  action?: {
    label: string;
    onPress: () => void;
  };
  dismissible?: boolean;
}

/**
 * AlertCard Component
 * Displays alerts with different severity levels
 */
export const AlertCard: React.FC<AlertCardProps> = ({
  type,
  title,
  message,
  onClose,
  action,
  dismissible = true,
}) => {
  const getColors = () => {
    switch (type) {
      case 'error':
        return {
          bg: COLORS.error[50],
          border: COLORS.error[200],
          icon: COLORS.error[600],
          text: COLORS.error[900],
          button: COLORS.error[600],
        };
      case 'warning':
        return {
          bg: COLORS.warning[50],
          border: COLORS.warning[200],
          icon: COLORS.warning[600],
          text: COLORS.warning[900],
          button: COLORS.warning[600],
        };
      case 'success':
        return {
          bg: COLORS.primary[50],
          border: COLORS.primary[200],
          icon: COLORS.primary[600],
          text: COLORS.primary[900],
          button: COLORS.primary[600],
        };
      case 'info':
      default:
        return {
          bg: COLORS.blue[50],
          border: COLORS.blue[200],
          icon: COLORS.blue[600],
          text: COLORS.blue[900],
          button: COLORS.blue[600],
        };
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'error':
        return <AlertCircle size={20} strokeWidth={2} />;
      case 'warning':
        return <AlertTriangle size={20} strokeWidth={2} />;
      case 'success':
        return <CheckCircle size={20} strokeWidth={2} />;
      case 'info':
      default:
        return <Info size={20} strokeWidth={2} />;
    }
  };

  const colors = getColors();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.bg,
          borderColor: colors.border,
        },
      ]}
    >
      {/* Icon and Content */}
      <View style={styles.contentContainer}>
        {/* Icon */}
        <View
          style={styles.iconContainer}
        >
          {React.cloneElement(getIcon() as React.ReactElement, {
            color: colors.icon,
          } as React.Attributes & { color?: string })}
        </View>

        {/* Text Content */}
        <View style={styles.textContainer}>
          <Text
            style={[
              styles.title,
              { color: colors.text },
            ]}
          >
            {title}
          </Text>
          <Text
            style={[
              styles.message,
              { color: colors.text },
            ]}
            numberOfLines={3}
          >
            {message}
          </Text>
        </View>

        {/* Close Button */}
        {dismissible && (
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeButton}
            hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
          >
            <X size={18} color={colors.icon} strokeWidth={2.5} />
          </TouchableOpacity>
        )}
      </View>

      {/* Action Button */}
      {action && (
        <TouchableOpacity
          onPress={action.onPress}
          style={[
            styles.actionButton,
            { backgroundColor: colors.button },
          ]}
        >
          <Text
            style={[
              styles.actionText,
              { color: COLORS.neutral[50] },
            ]}
          >
            {action.label}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 12,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    marginRight: 12,
    marginTop: 2,
    minWidth: 20,
    minHeight: 20,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  message: {
    fontSize: 13,
    lineHeight: 18,
    opacity: 0.8,
  },
  closeButton: {
    marginLeft: 8,
    padding: 4,
  },
  actionButton: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
