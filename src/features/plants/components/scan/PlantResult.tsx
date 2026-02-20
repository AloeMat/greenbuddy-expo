/**
 * PlantResult Component
 * Displays plant identification results with details and actions
 */

import React from 'react';
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  StyleSheet
} from 'react-native';
import type { PlantPersonality, AvatarEmotion } from '@/features/gamification/types';
import { PlantAvatar } from '@/features/plants/components/PlantAvatar';

interface PlantResultProps {
  identification: {
    commonName: string;
    scientificName: string;
    family: string;
    genus: string;
    source: string;
    confidence: number;
  };
  analysis: {
    personality?: string;
    healthScore?: number;
    soins?: {
      wateringFrequencyDays?: number;
      lightRequirements?: string;
      temperatureMin?: number;
      temperatureMax?: number;
    };
    dialogue?: {
      presentation?: string;
    };
  };
  personality: {
    emotionState?: string;
  };
  onAddToGarden: () => void;
  onScanAgain: () => void;
}

export const PlantResult: React.FC<PlantResultProps> = ({
  identification,
  analysis,
  personality,
  onAddToGarden,
  onScanAgain
}) => {
  return (
    <View style={styles.resultContainer}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Plant Avatar */}
        <View style={styles.avatarSection}>
          <PlantAvatar
            personality={(analysis.personality || 'succulente') as PlantPersonality}
            emotionState={(personality.emotionState || 'idle') as AvatarEmotion}
            size="large"
            showGlow
            level={1}
          />
        </View>

        {/* Plant Name */}
        <View style={styles.infoSection}>
          <Text style={styles.commonName}>
            {identification.commonName}
          </Text>
          <Text style={styles.scientificName}>
            {identification.scientificName}
          </Text>
        </View>

        {/* Confidence Score */}
        <View style={styles.scoreSection}>
          <View style={styles.scoreBar}>
            <View
              style={[
                styles.scoreBarFill,
                { width: `${identification.confidence}%` }
              ]}
            />
          </View>
          <Text style={styles.scoreText}>
            Confiance: {identification.confidence}%
          </Text>
        </View>

        {/* Plant Info */}
        <View style={styles.detailsSection}>
          <InfoItem
            label="Famille"
            value={identification.family}
          />
          <InfoItem
            label="Genre"
            value={identification.genus}
          />
          <InfoItem
            label="Source d'identification"
            value={identification.source === 'plantnet' ? 'PlantNet API' : 'Gemini AI'}
          />
        </View>

        {/* Care Info */}
        <View style={styles.careSection}>
          <Text style={styles.sectionTitle}>💧 Soins Recommandés</Text>
          <CareItem
            icon="💧"
            label="Arrosage"
            value={`Tous les ${analysis.soins?.wateringFrequencyDays || 7} jours`}
          />
          <CareItem
            icon="☀️"
            label="Lumière"
            value={analysis.soins?.lightRequirements || 'Indirecte'}
          />
          <CareItem
            icon="🌡️"
            label="Température"
            value={`${analysis.soins?.temperatureMin || 15}°C - ${analysis.soins?.temperatureMax || 25}°C`}
          />
          <CareItem
            icon="❤️"
            label="Santé initiale"
            value={`${analysis.healthScore || 50}/100`}
          />
        </View>

        {/* Dialogue */}
        {analysis.dialogue?.presentation && (
          <View style={styles.dialogueSection}>
            <Text style={styles.sectionTitle}>💬 Message</Text>
            <View style={styles.dialogueBox}>
              <Text style={styles.dialogueText}>
                {`"${analysis.dialogue.presentation}"`}
              </Text>
            </View>
          </View>
        )}

        {/* Actions */}
        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={[styles.button, styles.buttonPrimary]}
            onPress={onAddToGarden}
          >
            <Text style={styles.buttonText}>🌱 Ajouter au Jardin</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonSecondary]}
            onPress={onScanAgain}
          >
            <Text style={styles.buttonTextSecondary}>📸 Scanner à Nouveau</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

/**
 * Info Item Component
 */
interface InfoItemProps {
  label: string;
  value: string;
}

const InfoItem: React.FC<InfoItemProps> = ({ label, value }) => (
  <View style={styles.infoItem}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

/**
 * Care Item Component
 */
interface CareItemProps {
  icon: string;
  label: string;
  value: string;
}

const CareItem: React.FC<CareItemProps> = ({ icon, label, value }) => (
  <View style={styles.careItem}>
    <Text style={styles.careIcon}>{icon}</Text>
    <View>
      <Text style={styles.careLabel}>{label}</Text>
      <Text style={styles.careValue}>{value}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  resultContainer: {
    flex: 1,
    backgroundColor: '#FFF'
  },
  scrollContent: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    paddingBottom: 30
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24
  },
  infoSection: {
    alignItems: 'center',
    marginBottom: 20
  },
  commonName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 4
  },
  scientificName: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic'
  },
  scoreSection: {
    marginBottom: 20
  },
  scoreBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8
  },
  scoreBarFill: {
    height: '100%',
    backgroundColor: '#10B981'
  },
  scoreText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right'
  },
  detailsSection: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20
  },
  infoItem: {
    marginBottom: 12
  },
  infoLabel: {
    fontSize: 12,
    color: '#888',
    fontWeight: '600',
    marginBottom: 2
  },
  infoValue: {
    fontSize: 14,
    color: '#111',
    fontWeight: '500'
  },
  careSection: {
    marginBottom: 20
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 12
  },
  careItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB'
  },
  careIcon: {
    fontSize: 20,
    marginRight: 12,
    width: 24
  },
  careLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111',
    marginBottom: 2
  },
  careValue: {
    fontSize: 13,
    color: '#666'
  },
  dialogueSection: {
    marginBottom: 20
  },
  dialogueBox: {
    backgroundColor: '#F0FDF4',
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
    borderRadius: 8,
    padding: 12
  },
  dialogueText: {
    fontSize: 14,
    color: '#111',
    fontStyle: 'italic',
    lineHeight: 20
  },
  actionsSection: {
    gap: 12
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center'
  },
  buttonPrimary: {
    backgroundColor: '#10B981'
  },
  buttonSecondary: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB'
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF'
  },
  buttonTextSecondary: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111'
  }
});
