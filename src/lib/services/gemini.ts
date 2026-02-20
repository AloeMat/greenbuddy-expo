/**
 * Gemini Service for Expo
 * Plant analysis, personality generation, and chat
 * All requests go through Supabase Edge Function proxy (secure, no API key exposure)
 */

import { supabase } from './supabase';
import { logger } from './logger';
import { rateLimiter } from './rateLimiter';
import { PlantPersonality, PlantAnalysis, AvatarEmotion, HealthDiagnosisResult } from '@/types';
import { PERSONALITY_PROMPTS, CHAT_SYSTEM_INSTRUCTION_BASE } from '@/lib/constants/app';

interface GeminiAnalysisRequest {
  image?: string; // base64
  plantName?: string;
  currentCondition?: string;
  userQuestion?: string;
}

interface GeminiResponse {
  success: boolean;
  data?: Record<string, unknown>;
  error?: string;
}

/**
 * Interface for Gemini Service - enables dependency injection and mocking
 */
export interface IGeminiService {
  analyzeImage(imageBase64: string): Promise<Partial<PlantAnalysis>>;
  generatePersonality(analysis: Partial<PlantAnalysis>): Promise<{
    personality: PlantPersonality;
    emotionState: AvatarEmotion;
    dialogue: string;
  }>;
  chatWithPlant(
    message: string,
    plantAnalysis: Partial<PlantAnalysis>,
    onChunk?: (chunk: string) => void
  ): Promise<string>;
  generateCareAdvice(analysis: Partial<PlantAnalysis>): Promise<string>;
  diagnoseHealthIssue(analysis: Partial<PlantAnalysis>): Promise<HealthDiagnosisResult>;
}

class GeminiService implements IGeminiService {
  private readonly BRAIN_MODEL = 'gemini-2.0-flash';
  private readonly VISION_MODEL = 'gemini-2.5-flash-image';

  /**
   * Analyze plant image and generate detailed analysis
   */
  async analyzeImage(imageBase64: string): Promise<Partial<PlantAnalysis>> {
    try {
      if (!rateLimiter.tryAcquire('gemini-scan')) {
        throw new Error('Rate limit exceeded — please wait before scanning again.');
      }
      logger.info('🤖 Analyzing plant image with Gemini...');

      const { data, error } = await supabase.functions.invoke('gemini-proxy', {
        body: {
          action: 'analyze_image',
          image: imageBase64,
          model: this.VISION_MODEL,
          prompt: `Analyze this plant image and provide detailed information in JSON format:
          {
            "commonName": "...",
            "scientificName": "...",
            "personality": "cactus|orchidee|monstera|succulente|fougere|carnivore|pilea|palmier",
            "healthScore": 0-100,
            "careAdvice": "...",
            "wateringFrequencyDays": 7,
            "lightRequirements": "direct|indirect|shade|partial-shade",
            "temperatureMin": 15,
            "temperatureMax": 25,
            "immediateActions": ["action1", "action2"]
          }`
        }
      });

      if (error) {
        logger.error('❌ Image analysis failed:', error);
        throw error;
      }

      const analysisData = typeof data === 'string' ? JSON.parse(data) : data;

      const analysis: Partial<PlantAnalysis> = {
        commonName: analysisData.commonName || 'Unknown Plant',
        personality: analysisData.personality || 'succulente',
        healthScore: analysisData.healthScore || 50,
        soins: {
          wateringFrequencyDays: analysisData.wateringFrequencyDays || 7,
          lightRequirements: analysisData.lightRequirements || 'indirect',
          temperatureMin: analysisData.temperatureMin || 15,
          temperatureMax: analysisData.temperatureMax || 25,
          humidity: 'medium',
          fertilizerFrequencyDays: 30
        },
        dialogue: {
          presentation: `Hello! I'm a beautiful ${analysisData.commonName || 'plant'}!`,
          diagnosis: analysisData.careAdvice || 'I need care and attention.',
          needs: 'Water, light, and love!'
        }
      };

      logger.info('✅ Image analysis completed', {
        plant: analysis.commonName,
        personality: analysis.personality
      });

      return analysis;

    } catch (error) {
      logger.error('❌ Plant analysis failed:', error);
      return {
        commonName: 'Unknown Plant',
        personality: 'succulente',
        healthScore: 0,
        dialogue: {
          presentation: 'Hello!',
          diagnosis: 'I could not be identified. Please try a clearer photo.',
          needs: 'Help!'
        }
      };
    }
  }

  /**
   * Generate plant personality and initial dialogue
   */
  async generatePersonality(analysis: Partial<PlantAnalysis>): Promise<{
    personality: PlantPersonality;
    emotionState: AvatarEmotion;
    dialogue: string;
  }> {
    try {
      logger.info('🎭 Generating plant personality...');

      const personality = (analysis.personality || 'succulente') as PlantPersonality;
      const personalityPrompt = PERSONALITY_PROMPTS[personality] || PERSONALITY_PROMPTS['succulente'];

      const { data, error } = await supabase.functions.invoke('gemini-proxy', {
        body: {
          action: 'generate_personality',
          model: this.BRAIN_MODEL,
          prompt: `${personalityPrompt}

          The plant is: ${analysis.commonName}
          Health score: ${analysis.healthScore}/100

          Generate a short, friendly greeting (max 2 sentences) that this plant would say to its owner.
          Stay in character!`,
          maxTokens: 100
        }
      });

      if (error) {
        throw error;
      }

      const dialogue = typeof data === 'string' ? data : data.text || 'Hello! Nice to meet you!';

      // Determine emotion based on health
      let emotionState: AvatarEmotion = 'idle';
      if (analysis.healthScore! >= 80) {
        emotionState = 'happy';
      } else if (analysis.healthScore! >= 50) {
        emotionState = 'idle';
      } else if (analysis.healthScore! >= 30) {
        emotionState = 'sad';
      } else {
        emotionState = 'sad';
      }

      logger.info('✅ Personality generated', {
        personality,
        emotion: emotionState
      });

      return {
        personality,
        emotionState,
        dialogue: dialogue.substring(0, 200) // Limit length
      };

    } catch (error) {
      logger.error('❌ Personality generation failed:', error);
      return {
        personality: 'succulente',
        emotionState: 'idle',
        dialogue: 'Hello there!'
      };
    }
  }

  /**
   * Chat with plant (streaming response)
   */
  async chatWithPlant(
    message: string,
    plantAnalysis: Partial<PlantAnalysis>,
    onChunk?: (chunk: string) => void
  ): Promise<string> {
    try {
      if (!rateLimiter.tryAcquire('gemini-chat')) {
        throw new Error('Rate limit exceeded — please wait before sending another message.');
      }
      logger.info('💬 Chatting with plant...', {
        plant: plantAnalysis.commonName,
        message: message.substring(0, 50)
      });

      const personality = plantAnalysis.personality || 'succulente';
      const personalityPrompt = PERSONALITY_PROMPTS[personality as PlantPersonality];

      const systemPrompt = `${CHAT_SYSTEM_INSTRUCTION_BASE}

      ${personalityPrompt}

      Plant Information:
      - Name: ${plantAnalysis.commonName}
      - Health: ${plantAnalysis.healthScore}/100
      - Care: Water every ${plantAnalysis.soins?.wateringFrequencyDays || 7} days`;

      const { data, error } = await supabase.functions.invoke('gemini-proxy', {
        body: {
          action: 'chat',
          model: this.BRAIN_MODEL,
          systemPrompt,
          message,
          maxTokens: 500
        }
      });

      if (error) {
        throw error;
      }

      const response = typeof data === 'string' ? data : data.text || 'I appreciate your care!';

      if (onChunk) {
        onChunk(response);
      }

      logger.info('✅ Chat response received', {
        length: response.length
      });

      return response;

    } catch (error) {
      logger.error('❌ Chat failed:', error);
      return "I'm feeling a bit under the weather, please help me recover!";
    }
  }

  /**
   * Generate care advice from Gemini
   */
  async generateCareAdvice(analysis: Partial<PlantAnalysis>): Promise<string> {
    try {
      logger.info('📚 Generating care advice...');

      const { data, error } = await supabase.functions.invoke('gemini-proxy', {
        body: {
          action: 'generate_care_advice',
          model: this.BRAIN_MODEL,
          prompt: `Provide specific care advice for this plant:
          - Species: ${analysis.commonName}
          - Current Health: ${analysis.healthScore}/100
          - Light: ${analysis.soins?.lightRequirements}
          - Watering: Every ${analysis.soins?.wateringFrequencyDays} days

          Give 3-5 practical tips in a friendly tone.`,
          maxTokens: 300
        }
      });

      if (error) {
        throw error;
      }

      const advice = typeof data === 'string' ? data : data.text || 'Keep me healthy!';
      logger.info('✅ Care advice generated');
      return advice;

    } catch (error) {
      logger.error('❌ Care advice generation failed:', error);
      return 'Water regularly, provide light, and show love!';
    }
  }

  /**
   * Diagnose health issues from plant analysis
   */
  async diagnoseHealthIssue(analysis: Partial<PlantAnalysis>): Promise<HealthDiagnosisResult> {
    try {
      logger.info('🔍 Diagnosing plant health issue...');

      const { data, error } = await supabase.functions.invoke('gemini-proxy', {
        body: {
          action: 'diagnose',
          model: this.BRAIN_MODEL,
          prompt: `Analyze this plant's health:
          - Name: ${analysis.commonName}
          - Health Score: ${analysis.healthScore}/100
          - Care Requirements: Every ${analysis.soins?.wateringFrequencyDays} days
          - Light: ${analysis.soins?.lightRequirements}

          Provide diagnosis in JSON format:
          {
            "issue": "...",
            "treatment": "...",
            "urgency": "low|medium|high"
          }`
        }
      });

      if (error) {
        throw error;
      }

      const diagnosis = typeof data === 'string' ? JSON.parse(data) : data;

      return {
        issue: diagnosis.issue || 'Plant is healthy',
        treatment: diagnosis.treatment || 'Continue current care routine',
        urgency: diagnosis.urgency || 'low',
        analysis
      };

    } catch (error) {
      logger.error('❌ Health diagnosis failed:', error);
      return {
        issue: 'Unable to diagnose',
        treatment: 'Please consult a plant expert',
        urgency: 'low',
        analysis
      };
    }
  }
}

/**
 * Factory function for creating Gemini service instances
 * @param useCache - Enable caching (default: true)
 * Returns either cached proxy or raw service
 */
export const createGeminiService = (useCache: boolean = true): IGeminiService => {
  const rawService = new GeminiService();

  if (useCache) {
    // Import here to avoid circular dependencies
    const { createCachedGeminiProxy } = require('./proxies');
    return createCachedGeminiProxy(rawService);
  }

  return rawService;
};

/**
 * Default singleton instance for convenience
 * Uses caching by default to reduce API costs
 * Can be replaced with factory in tests: createGeminiService(false)
 */
export const geminiService = createGeminiService(true);
