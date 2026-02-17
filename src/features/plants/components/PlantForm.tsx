import { radius } from '@/design-system/tokens/radius';
/**
 * Plant Form Component
 * Add or edit plant details
 * Supports prefilled data from scan results
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  FlatList,
  ViewStyle
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { logger } from '@/lib/services/logger';
import { PlantPersonality, PlantAnalysis } from '@/types';
import { PlantAvatar } from './PlantAvatar';

export interface PlantFormProps {
  prefilledData?: Partial<PlantAnalysis>;
  onSubmit: (data: PlantFormData) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  style?: ViewStyle;
}

export interface PlantFormData {
  commonName: string;
  scientificName?: string;
  personality: PlantPersonality;
  nickname?: string;
  healthScore: number;
  location?: string;
  notes?: string;
  lastWatered?: Date;
  nextWatering?: Date;
  wateringFrequency: number; // days
  wateringFrequencyDays?: number; // alias for compatibility
  lightRequirements?: string;
  temperatureMin?: number;
  temperatureMax?: number;
  humidity?: string;
  fertilizerFrequencyDays?: number;
}

const PERSONALITIES: PlantPersonality[] = [
  'cactus',
  'orchidee',
  'monstera',
  'succulente',
  'fougere',
  'carnivore',
  'pilea',
  'palmier'
];

const LIGHT_REQUIREMENTS = ['Directe', 'Indirecte', 'Ombre partielle', 'Ombre'];

export const PlantForm: React.FC<PlantFormProps> = ({
  prefilledData,
  onSubmit,
  onCancel,
  isLoading = false,
  style
}) => {
  const [formData, setFormData] = useState<PlantFormData>({
    commonName: prefilledData?.commonName || '',
    scientificName: prefilledData?.scientificName || '',
    personality: prefilledData?.personality || 'succulente',
    nickname: '',
    healthScore: prefilledData?.healthScore || 50,
    location: '',
    notes: '',
    lastWatered: new Date(),
    nextWatering: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    wateringFrequency: prefilledData?.soins?.wateringFrequencyDays || 7,
    lightRequirements: prefilledData?.soins?.lightRequirements || 'Indirecte',
    temperatureMin: prefilledData?.soins?.temperatureMin || 15,
    temperatureMax: prefilledData?.soins?.temperatureMax || 25
  });

  const [showPersonalityPicker, setShowPersonalityPicker] = useState(false);
  const [showLightPicker, setShowLightPicker] = useState(false);
  const [showWateringDatePicker, setShowWateringDatePicker] = useState(false);
  const [showNextWateringPicker, setShowNextWateringPicker] = useState(false);

  useEffect(() => {
    if (prefilledData) {
      setFormData(prev => {
        const updated: PlantFormData = {
          ...prev,
          commonName: prefilledData.commonName || prev.commonName,
          scientificName: prefilledData.scientificName || prev.scientificName,
          personality: prefilledData.personality || 'succulente',
          healthScore: prefilledData.healthScore || prev.healthScore,
          lightRequirements: prefilledData.soins?.lightRequirements || 'indirect',
          wateringFrequency: prefilledData.soins?.wateringFrequencyDays || 7,
          temperatureMin: prefilledData.soins?.temperatureMin || 15,
          temperatureMax: prefilledData.soins?.temperatureMax || 25,
          humidity: prefilledData.soins?.humidity
        };
        return updated;
      });
    }
  }, [prefilledData]);

  const handleSubmit = async () => {
    try {
      if (!formData.commonName.trim()) {
        logger.warn('Plant name is required');
        return;
      }

      logger.info('📝 Submitting plant form...');
      await onSubmit(formData);
    } catch (error) {
      logger.error('❌ Form submission failed:', error);
    }
  };

  const handleDateChange = (
    event: any,
    selectedDate: Date | undefined,
    setter: (date: Date) => void
  ) => {
    if (selectedDate) {
      setter(selectedDate);
    }
  };

  return (
    <ScrollView style={[styles.container, style]} showsVerticalScrollIndicator={false}>
      {/* Avatar preview */}
      <View style={styles.previewSection}>
        <PlantAvatar
          personality={formData.personality}
          emotionState="idle"
          size="large"
          showGlow
          level={1}
        />
      </View>

      {/* Basic Info Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ℹ️ Informations de Base</Text>

        <FormField label="Nom commun *">
          <TextInput
            style={styles.input}
            placeholder="Ex: Monstera Deliciosa"
            value={formData.commonName}
            onChangeText={(text) =>
              setFormData(prev => ({ ...prev, commonName: text }))
            }
            editable={!isLoading}
          />
        </FormField>

        <FormField label="Nom scientifique">
          <TextInput
            style={styles.input}
            placeholder="Ex: Monstera deliciosa"
            value={formData.scientificName || ''}
            onChangeText={(text) =>
              setFormData(prev => ({ ...prev, scientificName: text }))
            }
            editable={!isLoading}
          />
        </FormField>

        <FormField label="Surnom">
          <TextInput
            style={styles.input}
            placeholder="Ex: Mon petit monstera 🌿"
            value={formData.nickname || ''}
            onChangeText={(text) =>
              setFormData(prev => ({ ...prev, nickname: text }))
            }
            editable={!isLoading}
          />
        </FormField>

        <FormField label="Personnalité">
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => setShowPersonalityPicker(true)}
            disabled={isLoading}
          >
            <Text style={styles.pickerButtonText}>
              {formData.personality.charAt(0).toUpperCase() + formData.personality.slice(1)}
            </Text>
            <Text style={styles.pickerArrow}>▼</Text>
          </TouchableOpacity>
        </FormField>

        <PersonalityPickerModal
          visible={showPersonalityPicker}
          selected={formData.personality}
          onSelect={(personality) => {
            setFormData(prev => ({ ...prev, personality }));
            setShowPersonalityPicker(false);
          }}
          onCancel={() => setShowPersonalityPicker(false)}
        />
      </View>

      {/* Care Info Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💧 Soins & Localisation</Text>

        <FormField label="Localisation">
          <TextInput
            style={styles.input}
            placeholder="Ex: Salon (fenêtre sud)"
            value={formData.location || ''}
            onChangeText={(text) =>
              setFormData(prev => ({ ...prev, location: text }))
            }
            editable={!isLoading}
          />
        </FormField>

        <FormField label="Fréquence d'arrosage (jours)">
          <TextInput
            style={styles.input}
            placeholder="7"
            keyboardType="number-pad"
            value={String(formData.wateringFrequency)}
            onChangeText={(text) =>
              setFormData(prev => ({ ...prev, wateringFrequency: parseInt(text) || 7 }))
            }
            editable={!isLoading}
          />
        </FormField>

        <FormField label="Lumière">
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => setShowLightPicker(true)}
            disabled={isLoading}
          >
            <Text style={styles.pickerButtonText}>
              {formData.lightRequirements}
            </Text>
            <Text style={styles.pickerArrow}>▼</Text>
          </TouchableOpacity>
        </FormField>

        <LightPickerModal
          visible={showLightPicker}
          selected={formData.lightRequirements || 'Indirecte'}
          onSelect={(light) => {
            setFormData(prev => ({ ...prev, lightRequirements: light }));
            setShowLightPicker(false);
          }}
          onCancel={() => setShowLightPicker(false)}
        />

        <View style={styles.temperatureRow}>
          <FormField label="Température min (°C)" style={{ flex: 1 }}>
            <TextInput
              style={styles.input}
              placeholder="15"
              keyboardType="number-pad"
              value={String(formData.temperatureMin)}
              onChangeText={(text) =>
                setFormData(prev => ({ ...prev, temperatureMin: parseInt(text) || 15 }))
              }
              editable={!isLoading}
            />
          </FormField>

          <FormField label="Température max (°C)" style={{ flex: 1 }}>
            <TextInput
              style={styles.input}
              placeholder="25"
              keyboardType="number-pad"
              value={String(formData.temperatureMax)}
              onChangeText={(text) =>
                setFormData(prev => ({ ...prev, temperatureMax: parseInt(text) || 25 }))
              }
              editable={!isLoading}
            />
          </FormField>
        </View>
      </View>

      {/* Health & Dates Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📊 Santé & Arrosage</Text>

        <FormField label="Santé actuelle">
          <SliderInput
            value={formData.healthScore}
            onChange={(value) =>
              setFormData(prev => ({ ...prev, healthScore: value }))
            }
            disabled={isLoading}
          />
          <Text style={styles.sliderValue}>{formData.healthScore}%</Text>
        </FormField>

        <FormField label="Dernière arrosage">
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowWateringDatePicker(true)}
            disabled={isLoading}
          >
            <Text style={styles.dateButtonText}>
              {formData.lastWatered?.toLocaleDateString('fr-FR')}
            </Text>
            <Text style={styles.dateIcon}>📅</Text>
          </TouchableOpacity>
        </FormField>

        {showWateringDatePicker && (
          <DateTimePicker
            value={formData.lastWatered || new Date()}
            mode="date"
            display="spinner"
            onChange={(event, date) => {
              if (date) setFormData(prev => ({ ...prev, lastWatered: date }));
              setShowWateringDatePicker(false);
            }}
          />
        )}

        <FormField label="Prochain arrosage prévu">
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowNextWateringPicker(true)}
            disabled={isLoading}
          >
            <Text style={styles.dateButtonText}>
              {formData.nextWatering?.toLocaleDateString('fr-FR')}
            </Text>
            <Text style={styles.dateIcon}>📅</Text>
          </TouchableOpacity>
        </FormField>

        {showNextWateringPicker && (
          <DateTimePicker
            value={formData.nextWatering || new Date()}
            mode="date"
            display="spinner"
            onChange={(event, date) => {
              if (date) setFormData(prev => ({ ...prev, nextWatering: date }));
              setShowNextWateringPicker(false);
            }}
          />
        )}
      </View>

      {/* Notes Section */}
      <View style={styles.section}>
        <FormField label="Notes">
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Ajouter des notes personnelles..."
            multiline
            numberOfLines={4}
            value={formData.notes || ''}
            onChangeText={(text) =>
              setFormData(prev => ({ ...prev, notes: text }))
            }
            editable={!isLoading}
            textAlignVertical="top"
          />
        </FormField>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsSection}>
        <TouchableOpacity
          style={[styles.button, styles.buttonPrimary]}
          onPress={handleSubmit}
          disabled={isLoading || !formData.commonName.trim()}
        >
          <Text style={styles.buttonText}>
            {isLoading ? '⏳ Enregistrement...' : '✅ Enregistrer la Plante'}
          </Text>
        </TouchableOpacity>

        {onCancel && (
          <TouchableOpacity
            style={[styles.button, styles.buttonSecondary]}
            onPress={onCancel}
            disabled={isLoading}
          >
            <Text style={styles.buttonTextSecondary}>❌ Annuler</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

/**
 * Form Field Component
 */
interface FormFieldProps {
  label: string;
  children: React.ReactNode;
  style?: ViewStyle;
}

const FormField: React.FC<FormFieldProps> = ({ label, children, style }) => (
  <View style={[styles.field, style]}>
    <Text style={styles.fieldLabel}>{label}</Text>
    {children}
  </View>
);

/**
 * Personality Picker Modal
 */
interface PersonalityPickerModalProps {
  visible: boolean;
  selected: PlantPersonality;
  onSelect: (personality: PlantPersonality) => void;
  onCancel: () => void;
}

const PersonalityPickerModal: React.FC<PersonalityPickerModalProps> = ({
  visible,
  selected,
  onSelect,
  onCancel
}) => (
  <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>Choisir une personnalité</Text>
        <ScrollView style={styles.modalList}>
          {PERSONALITIES.map((personality) => (
            <TouchableOpacity
              key={personality}
              style={[
                styles.modalItem,
                selected === personality && styles.modalItemSelected
              ]}
              onPress={() => onSelect(personality)}
            >
              <View style={styles.modalItemAvatar}>
                <PlantAvatar
                  personality={personality}
                  emotionState="idle"
                  size="small"
                  showGlow={false}
                />
              </View>
              <Text style={styles.modalItemText}>
                {personality.charAt(0).toUpperCase() + personality.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <TouchableOpacity style={styles.modalCloseButton} onPress={onCancel}>
          <Text style={styles.modalCloseText}>Fermer</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

/**
 * Light Picker Modal
 */
interface LightPickerModalProps {
  visible: boolean;
  selected: string;
  onSelect: (light: string) => void;
  onCancel: () => void;
}

const LightPickerModal: React.FC<LightPickerModalProps> = ({
  visible,
  selected,
  onSelect,
  onCancel
}) => (
  <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>Choisir le type de lumière</Text>
        <FlatList
          data={LIGHT_REQUIREMENTS}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.modalItem,
                selected === item && styles.modalItemSelected
              ]}
              onPress={() => onSelect(item)}
            >
              <Text style={styles.modalItemText}>{item}</Text>
            </TouchableOpacity>
          )}
          scrollEnabled={false}
        />
        <TouchableOpacity style={styles.modalCloseButton} onPress={onCancel}>
          <Text style={styles.modalCloseText}>Fermer</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

/**
 * Slider Input Component
 */
interface SliderInputProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

const SliderInput: React.FC<SliderInputProps> = ({ value, onChange, disabled }) => (
  <View style={styles.sliderContainer}>
    <TouchableOpacity
      disabled={disabled || value <= 0}
      onPress={() => onChange(Math.max(0, value - 5))}
    >
      <Text style={styles.sliderButton}>−</Text>
    </TouchableOpacity>

    <View style={[styles.sliderBar, { opacity: disabled ? 0.5 : 1 }]}>
      <View style={[styles.sliderFill, { width: `${value}%` }]} />
    </View>

    <TouchableOpacity
      disabled={disabled || value >= 100}
      onPress={() => onChange(Math.min(100, value + 5))}
    >
      <Text style={styles.sliderButton}>+</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF'
  },
  previewSection: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: '#F9FAFB'
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB'
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 12
  },
  field: {
    marginBottom: 12
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    marginBottom: 6
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111'
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top'
  },
  pickerButton: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  pickerButtonText: {
    fontSize: 14,
    color: '#111',
    fontWeight: '500'
  },
  pickerArrow: {
    fontSize: 10,
    color: '#999'
  },
  temperatureRow: {
    flexDirection: 'row',
    gap: 12
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  sliderButton: {
    fontSize: 20,
    color: '#10B981',
    fontWeight: 'bold',
    paddingHorizontal: 8
  },
  sliderBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden'
  },
  sliderFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4
  },
  sliderValue: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: 'bold',
    marginTop: 4,
    textAlign: 'right'
  },
  dateButton: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  dateButtonText: {
    fontSize: 14,
    color: '#111',
    fontWeight: '500'
  },
  dateIcon: {
    fontSize: 16
  },
  actionsSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: radius.sm,
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
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 20,
    maxHeight: '80%'
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111',
    paddingHorizontal: 16,
    paddingVertical: 12,
    textAlign: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB'
  },
  modalList: {
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 8,
    borderRadius: radius.sm,
    backgroundColor: '#F9FAFB'
  },
  modalItemSelected: {
    backgroundColor: '#F0FDF4',
    borderWidth: 2,
    borderColor: '#10B981'
  },
  modalItemAvatar: {
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalItemText: {
    fontSize: 14,
    color: '#111',
    fontWeight: '500',
    flex: 1
  },
  modalCloseButton: {
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: radius.sm,
    alignItems: 'center'
  },
  modalCloseText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF'
  }
});
