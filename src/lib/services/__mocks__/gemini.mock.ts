/**
 * Mock Gemini Service Factory
 * For testing components and hooks without API calls
 */

import type { IGeminiService } from '@/lib/services/gemini';
import { PlantAnalysis, PlantPersonality, AvatarEmotion } from '@/types';

export const createMockGeminiService = (overrides?: Partial<IGeminiService>): IGeminiService => {
  return {
    async analyzeImage(imageBase64: string): Promise<Partial<PlantAnalysis>> {
      return {
        commonName: 'Mock Plant',
        scientificName: 'Mockus plantus',
        personality: 'succulente',
        healthScore: 75,
        soins: {
          wateringFrequencyDays: 7,
          lightRequirements: 'indirect',
          temperatureMin: 15,
          temperatureMax: 25,
          humidity: 'medium',
          fertilizerFrequencyDays: 30,
        },
        dialogue: {
          presentation: 'Hello! I am a mock plant!',
          diagnosis: 'I\'m doing well!',
          needs: 'Regular care',
        },
      };
    },

    async generatePersonality(analysis: Partial<PlantAnalysis>) {
      return {
        personality: (analysis.personality || 'succulente') as PlantPersonality,
        emotionState: 'happy' as AvatarEmotion,
        dialogue: 'Hello there! Nice to meet you!',
      };
    },

    async chatWithPlant(
      message: string,
      plantAnalysis: Partial<PlantAnalysis>,
      onChunk?: (chunk: string) => void
    ): Promise<string> {
      const response = `Mock response to: ${message}`;
      if (onChunk) {
        onChunk(response);
      }
      return response;
    },

    async generateCareAdvice(analysis: Partial<PlantAnalysis>): Promise<string> {
      return 'Water regularly and provide indirect light. Mock advice!';
    },

    async diagnoseHealthIssue(analysis: Partial<PlantAnalysis>): Promise<any> {
      return {
        issue: 'Mock diagnosis: Plant is doing well!',
        treatment: 'Keep watering regularly',
        urgency: 'low',
      };
    },

    ...overrides,
  };
};

export const mockGeminiService = createMockGeminiService();
