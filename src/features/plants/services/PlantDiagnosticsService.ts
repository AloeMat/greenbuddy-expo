/**
 * Plant Diagnostics Service
 * 
 * Uses Gemini Vision API to analyze plant health:
 * - Overall health score (0-100%)
 * - Diseases detected
 * - Nutrient deficiencies
 * - Environmental stress
 * - Treatment recommendations
 * 
 * Called after PlantNet identification to provide complete diagnosis
 */

import { logger } from '@/lib/services/logger';
import { supabase } from '@/lib/services/supabase';
import * as FileSystem from 'expo-file-system';

export interface PlantDiagnosis {
  healthScore: number; // 0-100%
  healthStatus: 'thriving' | 'good' | 'fair' | 'poor' | 'critical';
  diseases: Disease[];
  deficiencies: Deficiency[];
  environmentalStress: string[];
  treatmentPlan: Treatment[];
  urgency: 'critical' | 'high' | 'medium' | 'low';
  summary: string;
  emotionState: 'happy' | 'worried' | 'sad' | 'idle'; // Mapped from AvatarEmotion type
}

export interface Disease {
  name: string;
  confidence: number; // 0-100%
  symptoms: string[];
  treatment: string;
}

export interface Deficiency {
  nutrient: string;
  severity: 'mild' | 'moderate' | 'severe';
  signs: string[];
  treatment: string;
}

export interface Treatment {
  action: string;
  priority: number; // 1-5 (1 = highest priority)
  frequency?: string;
  materials?: string[];
}

export const PlantDiagnosticsService = {
  /**
   * Analyze plant image using Gemini Vision
   * Returns comprehensive health diagnosis
   */
  async diagnosePlantHealth(
    imageUri: string,
    plantName: string,
    scientificName?: string
  ): Promise<PlantDiagnosis> {
    try {
      logger.info('[PlantDiagnosticsService] Starting diagnosis', {
        plantName,
        scientificName,
      });

      // Convert image to base64
      const imageBase64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: 'base64',
      });

      // Determine MIME type from file extension
      const mimeType = this.getMimeType(imageUri);

      // Call Gemini Vision API via secure Supabase Edge Function proxy
      // SECURITY: API key is stored server-side only, never exposed to the client
      const { data: proxyData, error: proxyError } = await supabase.functions.invoke('gemini-proxy', {
        body: {
          model: 'gemini-2.0-flash',
          isPublic: true, // Diagnosis can happen during onboarding (guest)
          prompt: this.buildDiagnosisPrompt(plantName, scientificName),
          images: [
            {
              mimeType,
              data: imageBase64,
            },
          ],
        },
      });

      if (proxyError) {
        throw new Error(`Gemini proxy error: ${proxyError.message}`);
      }

      const diagnosisJson = this.parseGeminiResponse(proxyData);

      logger.info('[PlantDiagnosticsService] Diagnosis complete', {
        healthScore: diagnosisJson.healthScore,
        urgency: diagnosisJson.urgency,
      });

      return diagnosisJson;
    } catch (error) {
      logger.error('[PlantDiagnosticsService] Diagnosis failed:', error);
      // Return default diagnosis on error
      return this.getDefaultDiagnosis();
    }
  },

  /**
   * Build detailed diagnosis prompt for Gemini Vision
   */
  buildDiagnosisPrompt(plantName: string, scientificName?: string): string {
    return `You are an expert plant pathologist. Analyze this photo of a "${plantName}"${scientificName ? ` (${scientificName})` : ''} and provide a comprehensive health diagnosis.

Return ONLY a valid JSON object (no markdown, no code blocks, pure JSON) with this exact structure:

{
  "healthScore": <0-100 integer>,
  "healthStatus": "<thriving|good|fair|poor|critical>",
  "diseases": [
    {
      "name": "<disease name>",
      "confidence": <0-100>,
      "symptoms": ["<symptom1>", "<symptom2>"],
      "treatment": "<treatment method>"
    }
  ],
  "deficiencies": [
    {
      "nutrient": "<N|P|K|Mg|Fe|etc>",
      "severity": "<mild|moderate|severe>",
      "signs": ["<sign1>", "<sign2>"],
      "treatment": "<treatment>"
    }
  ],
  "environmentalStress": ["<stress1>", "<stress2>"],
  "treatmentPlan": [
    {
      "action": "<action>",
      "priority": <1-5>,
      "frequency": "<optional>",
      "materials": ["<material1>"]
    }
  ],
  "urgency": "<critical|high|medium|low>",
  "summary": "<1-2 sentence assessment>"
}

Be precise with health scores. Consider:
- Leaf color and texture
- Signs of disease/pests
- Overall plant vigor
- Environmental factors visible
- Growth stage

Scale: 80-100 thriving | 60-79 good | 40-59 fair | 20-39 poor | 0-19 critical`;
  },

  /**
   * Parse Gemini Vision response
   */
  parseGeminiResponse(apiResponse: unknown): PlantDiagnosis {
    try {
      const response = apiResponse as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
      const contentPart = response?.candidates?.[0]?.content?.parts?.[0];
      if (!contentPart?.text) {
        throw new Error('Invalid API response structure');
      }

      // Extract JSON from response (sometimes wrapped in markdown)
      let jsonText = contentPart.text;
      
      // Remove markdown code blocks if present
      if (jsonText.includes('```json')) {
        jsonText = jsonText.split('```json')[1].split('```')[0];
      } else if (jsonText.includes('```')) {
        jsonText = jsonText.split('```')[1].split('```')[0];
      }

      const parsed = JSON.parse(jsonText.trim());

      // Validate and normalize
      const diagnosis: PlantDiagnosis = {
        healthScore: Math.min(100, Math.max(0, parsed.healthScore || 50)),
        healthStatus: parsed.healthStatus || 'fair',
        diseases: Array.isArray(parsed.diseases) ? parsed.diseases : [],
        deficiencies: Array.isArray(parsed.deficiencies) ? parsed.deficiencies : [],
        environmentalStress: Array.isArray(parsed.environmentalStress) ? parsed.environmentalStress : [],
        treatmentPlan: Array.isArray(parsed.treatmentPlan) ? parsed.treatmentPlan.sort((a: Treatment, b: Treatment) => a.priority - b.priority) : [],
        urgency: parsed.urgency || 'low',
        summary: parsed.summary || 'Plant health assessment complete.',
        emotionState: this.mapHealthToEmotion(parsed.healthScore || 50),
      };

      return diagnosis;
    } catch (error) {
      logger.error('[PlantDiagnosticsService] Parse error:', error);
      return this.getDefaultDiagnosis();
    }
  },

  /**
   * Map health score to avatar emotion (using standard AvatarEmotion type)
   */
  mapHealthToEmotion(healthScore: number): 'happy' | 'worried' | 'sad' | 'idle' {
    if (healthScore >= 80) return 'happy';      // Thriving
    if (healthScore >= 60) return 'happy';      // Good health
    if (healthScore >= 40) return 'idle';       // Fair health
    if (healthScore >= 20) return 'worried';    // Poor health
    return 'sad';                               // Critical health
  },

  /**
   * Get MIME type from file URI
   */
  getMimeType(uri: string): string {
    if (uri.includes('.png')) return 'image/png';
    if (uri.includes('.gif')) return 'image/gif';
    if (uri.includes('.webp')) return 'image/webp';
    return 'image/jpeg'; // Default
  },

  /**
   * Default diagnosis for error fallback
   */
  getDefaultDiagnosis(): PlantDiagnosis {
    return {
      healthScore: 50,
      healthStatus: 'fair',
      diseases: [],
      deficiencies: [],
      environmentalStress: [],
      treatmentPlan: [
        {
          action: 'Monitor plant regularly',
          priority: 1,
          frequency: 'Daily',
        },
      ],
      urgency: 'low',
      summary: 'Unable to diagnose. Please ensure good lighting and water the plant appropriately.',
      emotionState: 'idle',
    };
  },

  /**
   * Format diagnosis for display
   */
  formatDiagnosisForDisplay(diagnosis: PlantDiagnosis): string {
    const lines: string[] = [];

    lines.push(`🏥 Health: ${diagnosis.healthScore}%`);
    lines.push(`Status: ${diagnosis.healthStatus}`);
    
    if (diagnosis.diseases.length > 0) {
      lines.push(`\n🦠 Diseases:`);
      diagnosis.diseases.forEach((d) => {
        lines.push(`  • ${d.name} (${d.confidence}%)`);
      });
    }

    if (diagnosis.deficiencies.length > 0) {
      lines.push(`\n🌱 Deficiencies:`);
      diagnosis.deficiencies.forEach((d) => {
        lines.push(`  • ${d.nutrient} (${d.severity})`);
      });
    }

    if (diagnosis.treatmentPlan.length > 0) {
      lines.push(`\n💊 Actions:`);
      diagnosis.treatmentPlan.slice(0, 3).forEach((t) => {
        lines.push(`  ${t.priority}. ${t.action}`);
      });
    }

    return lines.join('\n');
  },
};
