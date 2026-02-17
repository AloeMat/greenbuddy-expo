/**
 * Mock Google TTS Service Factory
 * For testing without actual audio generation
 */

import type { IGoogleTTSService, TTSOptions, TTSResult } from '@/lib/services/googleTTS';

export const createMockGoogleTTSService = (overrides?: Partial<IGoogleTTSService>): IGoogleTTSService => {
  let mockIsSpeaking = false;

  return {
    async generateSpeech(options: TTSOptions): Promise<TTSResult> {
      // Simulate speech generation
      return {
        audioUri: 'mock://audio/generated.mp3',
        duration: options.text.length * 0.1, // Rough estimate: 0.1 sec per char
      };
    },

    async speakText(text: string, voiceType?: 'male' | 'female' | 'neutral'): Promise<void> {
      mockIsSpeaking = true;
      // Simulate speaking delay
      await new Promise(resolve => setTimeout(resolve, text.length * 100));
      mockIsSpeaking = false;
    },

    async playAudio(audioUri: string): Promise<void> {
      mockIsSpeaking = true;
      // Simulate playback delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      mockIsSpeaking = false;
    },

    async stop(): Promise<void> {
      mockIsSpeaking = false;
    },

    async cleanup(): Promise<void> {
      mockIsSpeaking = false;
    },

    isSpeaking(): boolean {
      return mockIsSpeaking;
    },

    ...overrides,
  };
};

export const mockGoogleTTSService = createMockGoogleTTSService();
