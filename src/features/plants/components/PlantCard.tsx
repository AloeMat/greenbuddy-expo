import { radius } from '@/design-system/tokens/radius';
import { COLORS } from '@/design-system/tokens/colors';
import { typography } from '@/design-system/tokens/typography';
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
    if (score >= 80) return { color: COLORS.semantic.success, label: 'Excellent' };
    if (score >= 60) return { color: COLORS.accent['500'], label: 'Bon' };
    if (score >= 40) return { color: COLORS.error['500'], label: 'Moyen' };
    return { color: COLORS.error['600'], label: 'Faible' };
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

    if (daysUntil < 0) return { color: COLORS.error['600'], label: 'URGENT' };
    if (daysUntil === 0) return { color: COLORS.accent['500'], label: 'AUJOURD\'HUI' };
    if (daysUntil <= 2) return { color: COLORS.error['500'], label: `DANS ${daysUntil}J` };
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
    shadowColor: COLORS.text['900'],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
    backgroundColor: COLORS.neutral['50']
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
    ...typography.subtitle.md,
    color: COLORS.text['900'],
    marginBottom: 4
  },
  levelBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primary['50'],
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.xs
  },
  levelText: {
    ...typography.body.sm,
    fontWeight: '600',
    color: COLORS.semantic.success
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
    ...typography.body.sm,
    fontWeight: '600',
    color: COLORS.text['500']
  },
  healthValue: {
    ...typography.body.md,
    fontWeight: 'bold'
  },
  healthBar: {
    height: 6,
    backgroundColor: COLORS.neutral['200'],
    borderRadius: 3,
    overflow: 'hidden'
  },
  healthBarFill: {
    height: '100%',
    borderRadius: 3
  },
  wateringSection: {
    borderTopWidth: 1,
    borderTopColor: COLORS.neutral['200'],
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
    ...typography.body.sm,
    color: COLORS.text['500'],
    fontWeight: '500'
  },
  wateringValue: {
    ...typography.body.md,
    color: COLORS.text['900'],
    fontWeight: '600'
  },
  urgencyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.xs
  },
  urgencyText: {
    ...typography.body.xs,
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
    color: COLORS.semantic.success
  }
});
