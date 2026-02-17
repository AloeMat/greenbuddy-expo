/**
 * Notification Settings Component
 * Allows users to enable/disable daily check-in reminders
 * and customize notification time
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Bell, Clock } from 'lucide-react-native';
import { useDailyNotification } from '@/features/gamification/hooks/useDailyNotification';
import { colors } from '@/design-system/tokens/colors';

interface NotificationSettingsProps {
  onClose?: () => void;
}

/**
 * Notification Settings Component
 */
export const NotificationSettings: React.FC<NotificationSettingsProps> = ({ onClose }) => {
  const {
    isScheduled,
    isLoading,
    notificationTime,
    toggleNotifications,
    changeNotificationTime,
  } = useDailyNotification();

  const [selectedHour, setSelectedHour] = useState(parseInt(notificationTime.split(':')[0]));

  const hours = Array.from({ length: 24 }, (_, i) => i);

  const handleTimeChange = async (hour: number) => {
    try {
      setSelectedHour(hour);
      await changeNotificationTime(hour);
      Alert.alert('✅ Horaire mis à jour', `Rappel défini pour ${hour}h`);
    } catch (error) {
      Alert.alert('❌ Erreur', 'Impossible de changer l\'horaire');
    }
  };

  const handleToggle = async () => {
    try {
      await toggleNotifications();
      if (isScheduled) {
        Alert.alert('✅ Notifications désactivées', 'Vous ne recevrez plus de rappels quotidiens');
      } else {
        Alert.alert('✅ Notifications activées', `Rappel défini pour ${selectedHour}h`);
      }
    } catch (error) {
      Alert.alert('❌ Erreur', 'Impossible de modifier les notifications');
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Bell size={24} color={colors.primary[500]} strokeWidth={2} />
        <Text style={styles.title}>Rappels Quotidiens</Text>
      </View>

      {/* Toggle */}
      <View style={styles.toggleSection}>
        <View style={styles.toggleLeft}>
          <Text style={styles.toggleLabel}>Check-in quotidien</Text>
          <Text style={styles.toggleDescription}>
            Recevez un rappel pour maintenir votre série
          </Text>
        </View>
        {isLoading ? (
          <ActivityIndicator size="large" color={colors.primary[500]} />
        ) : (
          <Switch
            value={isScheduled}
            onValueChange={handleToggle}
            trackColor={{ false: colors.neutral[300], true: colors.primary[300] }}
            thumbColor={isScheduled ? colors.primary[500] : colors.neutral[400]}
          />
        )}
      </View>

      {/* Time Selector */}
      {isScheduled && (
        <View style={styles.timeSection}>
          <View style={styles.timeHeader}>
            <Clock size={18} color={colors.primary[500]} strokeWidth={2} />
            <Text style={styles.timeLabel}>Heure du rappel</Text>
          </View>

          <Text style={styles.currentTime}>
            Actuellement: <Text style={styles.currentTimeValue}>{selectedHour}h00</Text>
          </Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.timeGrid}>
              {hours.map((hour) => (
                <TouchableOpacity
                  key={hour}
                  onPress={() => handleTimeChange(hour)}
                  style={[
                    styles.timeButton,
                    selectedHour === hour && styles.timeButtonActive,
                  ]}
                  disabled={isLoading}
                >
                  <Text
                    style={[
                      styles.timeButtonText,
                      selectedHour === hour && styles.timeButtonTextActive,
                    ]}
                  >
                    {hour}h
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <View style={styles.timeInfo}>
            <Text style={styles.timeInfoText}>
              Vous recevrez un rappel chaque jour à {selectedHour}h
            </Text>
          </View>
        </View>
      )}

      {/* Info */}
      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>À propos des rappels</Text>
        <View style={styles.infoBullet}>
          <Text style={styles.infoBulletPoint}>🔥</Text>
          <Text style={styles.infoText}>Gagnez +5 XP à chaque check-in quotidien</Text>
        </View>
        <View style={styles.infoBullet}>
          <Text style={styles.infoBulletPoint}>📈</Text>
          <Text style={styles.infoText}>Maintenez votre série et atteignez les jalons</Text>
        </View>
        <View style={styles.infoBullet}>
          <Text style={styles.infoBulletPoint}>⏰</Text>
          <Text style={styles.infoText}>Les rappels fonctionnent même si l\'app est fermée</Text>
        </View>
      </View>

      {/* Close Button */}
      {onClose && (
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>Fermer</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    padding: 16,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text[900],
  },

  // Toggle Section
  toggleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: colors.primary[50],
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.primary[200],
  },
  toggleLeft: {
    flex: 1,
    marginRight: 16,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text[900],
    marginBottom: 4,
  },
  toggleDescription: {
    fontSize: 12,
    color: colors.text[600],
    lineHeight: 16,
  },

  // Time Section
  timeSection: {
    backgroundColor: colors.neutral[50],
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  timeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  timeLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text[900],
  },
  currentTime: {
    fontSize: 12,
    color: colors.text[600],
    marginBottom: 12,
  },
  currentTimeValue: {
    fontWeight: '700',
    color: colors.primary[500],
    fontSize: 14,
  },
  timeGrid: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 4,
    marginBottom: 12,
  },
  timeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.neutral[100],
    borderWidth: 1,
    borderColor: colors.neutral[300],
    minWidth: 50,
    alignItems: 'center',
  },
  timeButtonActive: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[600],
  },
  timeButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text[700],
  },
  timeButtonTextActive: {
    color: '#FFF',
  },
  timeInfo: {
    backgroundColor: colors.primary[50],
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary[500],
  },
  timeInfoText: {
    fontSize: 12,
    color: colors.primary[700],
    fontWeight: '500',
  },

  // Info Section
  infoSection: {
    marginBottom: 24,
    paddingHorizontal: 12,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text[900],
    marginBottom: 12,
  },
  infoBullet: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  infoBulletPoint: {
    fontSize: 16,
    minWidth: 24,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: colors.text[600],
    lineHeight: 16,
  },

  // Close Button
  closeButton: {
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
    marginBottom: 16,
  },
  closeButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
