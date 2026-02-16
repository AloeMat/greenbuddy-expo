/**
 * useGoogleTTS Hook
 * Manages text-to-speech synthesis and playback
 * Integrates with PlantAvatar mouth animations
 */

import { useState, useCallback, useEffect } from 'react';
import { googleTTSService } from '@lib/services/googleTTS';
import { logger } from '@lib/services/logger';

export interface UseGoogleTTSOptions {
  voiceType?: 'male' | 'female' | 'neutral';
  speed?: number;
  pitch?: number;
}

export const useGoogleTTS = (options: UseGoogleTTSOptions = {}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentText, setCurrentText] = useState('');

  /**
   * Speak text using Google TTS
   * Triggers mouth animation while speaking
   */
  const speak = useCallback(
    async (text: string) => {
      if (!text || text.trim() === '') {
        logger.warn('⚠️ Empty text provided to speak()');
        return;
      }

      setError(null);
      setIsLoading(true);
      setCurrentText(text);
      setIsSpeaking(true);

      try {
        logger.info('🗣️ Starting TTS...', {
          text: text.substring(0, 50),
          voice: options.voiceType
        });

        // Generate speech
        const speechResult = await googleTTSService.generateSpeech({
          text,
          voiceType: options.voiceType || 'neutral',
          speed: options.speed || 1.0,
          pitch: options.pitch || 0
        });

        logger.info('✅ Speech generated, playing...', {
          duration: speechResult.duration
        });

        // Play audio (mouth animation will be triggered by parent component watching isSpeaking)
        await googleTTSService.playAudio(speechResult.audioUri);

        // Wait for playback to complete
        // The googleTTSService handles this internally via callback
        // We'll wait a bit longer to ensure mouth closes smoothly
        setTimeout(() => {
          setIsSpeaking(false);
          logger.info('✅ TTS playback completed');
        }, (speechResult.duration || 0) * 1000 + 500);

      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown TTS error';
        logger.error('❌ TTS failed:', err);
        setError(errorMsg);
        setIsSpeaking(false);
      } finally {
        setIsLoading(false);
      }
    },
    [options.voiceType, options.speed, options.pitch]
  );

  /**
   * Stop current playback immediately
   */
  const stop = useCallback(async () => {
    try {
      logger.info('⏹️ Stopping TTS...');
      await googleTTSService.stop();
      setIsSpeaking(false);
      setCurrentText('');
    } catch (err) {
      logger.error('❌ Failed to stop TTS:', err);
    }
  }, []);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      googleTTSService.cleanup();
    };
  }, []);

  return {
    // State
    isSpeaking,
    isLoading,
    error,
    currentText,

    // Actions
    speak,
    stop,

    // Derived
    isSpokenEmpty: !currentText || currentText.trim() === ''
  };
};

