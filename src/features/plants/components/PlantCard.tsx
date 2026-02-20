import { radius } from '@/design-system/tokens/radius';
/**
 * Plant Card Component
 * Displays plant summary with avatar, name, health status
 * Compact view for lists and gardens
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle
} from 'react-native';
import { GradientOverlay } from '@/design-system/components/GradientOverlay';
import { PlantAvatar } from './PlantAvatar';
import { PlantPersonality, AvatarEmotion } from '@/types';
import { logger } from '@/lib/services/logger';

export interface PlantCardProps {
  id: string;
  commonName: string;
  personality: PlantPersonality;
  healthScore: number;
  level: number;
  lastWatered?: Date;
  nextWatering?: Date;
  emotionState?: AvatarEmotion;
  onPress?: (plantId: string) => void;
  style?: ViewStyle;
}

// P2.3 PERFORMANCE FIX: Memoize PlantCard to prevent unnecessary re-renders
// during list scrolling and parent updates
const PlantCardComponent: React.FC<PlantCardProps> = ({
  id,
  commonName,
  personality,
  healthScore,
  level,
  lastWatered,
  nextWatering,
  emotionState = 'idle',
  onPress,
  style
}) => {
  // Determine health color
  const getHealthColor = (score: number) => {
    if (score >= 80) return { color: '#10B981', label: 'Excellent' };
    if (score >= 60) return { color: '#F59E0B', label: 'Bon' };
    if (score >= 40) return { color: '#EF4444', label: 'Moyen' };
    return { color: '#DC2626', label: 'Faible' };
  };

  const healthInfo = getHealthColor(healthScore);

  // Format dates
  const formatDate = (date?: Date) => {
    if (!date) return 'N/A';
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Aujourd\'hui';
    if (date.toDateString() === yesterday.toDateString()) return 'Hier';

    return date.toLocaleDateString('fr-FR', {
      month: 'short',
      day: 'numeric'
    });
  };

  logger.debug('PlantCard rendered', { id, commonName, healthScore });

  return (
    <TouchableOpacity
      style={[styles.card, style]}
      onPress={() => onPress?.(id)}
      activeOpacity={0.8}
    >
      <GradientOverlay
        colors={['#FFFFFF', '#F9FAFB']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* Top section: Avatar + Name */}
        <View style={styles.topSection}>
          <View style={styles.avatar}>
            <PlantAvatar
              personality={personality}
              emotionState={emotionState}
              size="small"
              showGlow={false}
              level={level}
            />
          </View>

          <View style={styles.nameSection}>
            <Text style={styles.commonName} numberOfLines={2}>
              {commonName}
            </Text>
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>LV {level}</Text>
            </View>
          </View>
        </View>

        {/* Health bar */}
        <View style={styles.healthSection}>
          <View style={styles.healthLabel}>
            <Text style={styles.healthLabelText}>Santé</Text>
            <Text style={[styles.healthValue, { color: healthInfo.color }]}>
              {healthScore}%
            </Text>
          </View>
          <View style={styles.healthBar}>
            <View
              style={[
                styles.healthBarFill,
                {
                  width: `${Math.min(healthScore, 100)}%`,
                  backgroundColor: healthInfo.color
                }
              ]}
            />
          </View>
        </View>

        {/* Watering info */}
        <View style={styles.wateringSection}>
          <WateringInfo
            label="🚿 Arrosée"
            date={lastWatered}
            value={formatDate(lastWatered)}
          />
          <WateringInfo
            label="💧 Prochain arrosage"
            date={nextWatering}
            value={formatDate(nextWatering)}
          />
        </View>

        {/* Action indicator */}
        <View style={styles.actionIndicator}>
          <Text style={styles.actionArrow}>→</Text>
        </View>
      </GradientOverlay>
    </TouchableOpacity>
  );
};

// Export memoized version to prevent re-renders on parent updates
export const PlantCard = React.memo(PlantCardComponent, (prevProps, nextProps) => {
  // Custom comparison: only re-render if essential props change
  return (
    prevProps.id === nextProps.id &&
    prevProps.commonName === nextProps.commonName &&
    prevProps.healthScore === nextProps.healthScore &&
    prevProps.level === nextProps.level &&
    prevProps.emotionState === nextProps.emotionState &&
    prevProps.lastWatered?.getTime() === nextProps.lastWatered?.getTime() &&
    prevProps.nextWatering?.getTime() === nextProps.nextWatering?.getTime()
  );
});

/**
 * Watering Info Sub-component
 */
interface WateringInfoProps {
  label: string;
  date?: Date;
  value: string;
}

const WateringInfo: React.FC<WateringInfoProps> = ({ label, date, value }) => {
  // Determine urgency
  const getUrgency = (date?: Date) => {
    if (!date) return null;
    const today = new Date();
    const daysUntil = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntil < 0) return { color: '#DC2626', label: 'URGENT' };
    if (daysUntil === 0) return { color: '#F59E0B', label: 'AUJOURD\'HUI' };
    if (daysUntil <= 2) return { color: '#EF4444', label: `DANS ${daysUntil}J` };
    return null;
  };

  const urgency = getUrgency(date);

  return (
    <View style={styles.wateringInfo}>
      <View style={styles.wateringLabel}>
        <Text style={styles.wateringIcon}>{label.split(' ')[0]}</Text>
        <View>
          <Text style={styles.wateringLabelText}>{label.substring(2)}</Text>
          <Text style={styles.wateringValue}>{value}</Text>
        </View>
      </View>
      {urgency && (
        <View
          style={[
            styles.urgencyBadge,
            { backgroundColor: urgency.color + '20' }
          ]}
        >
          <Text style={[styles.urgencyText, { color: urgency.color }]}>
            {urgency.label}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    borderRadius: radius.sm,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
    backgroundColor: '#FFF'
  },
  gradient: {
    padding: 12
  },
  topSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12
  },
  avatar: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  nameSection: {
    flex: 1,
    justifyContent: 'center'
  },
  commonName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 4
  },
  levelBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4
  },
  levelText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981'
  },
  healthSection: {
    marginBottom: 12
  },
  healthLabel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4
  },
  healthLabelText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666'
  },
  healthValue: {
    fontSize: 13,
    fontWeight: 'bold'
  },
  healthBar: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden'
  },
  healthBarFill: {
    height: '100%',
    borderRadius: 3
  },
  wateringSection: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 8
  },
  wateringInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  wateringLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8
  },
  wateringIcon: {
    fontSize: 16
  },
  wateringLabelText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500'
  },
  wateringValue: {
    fontSize: 13,
    color: '#111',
    fontWeight: '600'
  },
  urgencyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4
  },
  urgencyText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase'
  },
  actionIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
    opacity: 0.3
  },
  actionArrow: {
    fontSize: 20,
    color: '#10B981'
  }
});
