/**
 * Google Text-to-Speech Service for Expo
 * Converts plant personality dialogue to natural speech
 * Uses Google Cloud TTS API via Supabase Edge Function proxy
 */

import { Audio } from 'expo-av';
import { supabase } from './supabase';
import { logger } from './logger';

export interface TTSOptions {
  text: string;
  voiceType?: 'male' | 'female' | 'neutral';
  speed?: number; // 0.5 - 2.0
  pitch?: number; // -20 to 20
}

export interface TTSResult {
  audioUri: string;
  duration: number;
}

/**
 * Interface for Google TTS Service - enables DI and mocking
 */
export interface IGoogleTTSService {
  generateSpeech(options: TTSOptions): Promise<TTSResult>;
  speakText(text: string, voiceType?: 'male' | 'female' | 'neutral'): Promise<void>;
  playAudio(audioUri: string): Promise<void>;
  stop(): Promise<void>;
  cleanup(): Promise<void>;
  isSpeaking(): boolean;
}

class GoogleTTSService implements IGoogleTTSService {
  private currentSound: Audio.Sound | null = null;
  private _isSpeaking = false;

  /**
   * Generate speech from text using Google TTS
   */
  async generateSpeech(options: TTSOptions): Promise<TTSResult> {
    try {
      logger.info('🗣️ Generating speech via Google TTS...', {
        text: options.text.substring(0, 50) + '...',
        voice: options.voiceType
      });

      // Call Supabase Edge Function to generate TTS
      const { data, error } = await supabase.functions.invoke('voice-operations', {
        body: {
          action: 'tts_generate',
          text: options.text,
          voiceType: options.voiceType || 'neutral',
          speed: options.speed || 1.0,
          pitch: options.pitch || 0
        }
      });

      if (error) {
        logger.error('❌ TTS generation failed:', error);
        throw error;
      }

      if (!data || !data.audioBase64) {
        throw new Error('No audio data returned from TTS service');
      }

      // Convert base64 to URI and load into Sound object
      const audioUri = await this.base64ToUri(data.audioBase64);

      logger.info('✅ Speech generated successfully', {
        duration: data.duration || 'unknown'
      });

      return {
        audioUri,
        duration: data.duration || 0
      };

    } catch (error) {
      logger.error('❌ Speech generation failed:', error);
      throw error;
    }
  }

  /**
   * Play audio using Expo Audio
   */
  async playAudio(audioUri: string): Promise<void> {
    try {
      if (this._isSpeaking && this.currentSound) {
        logger.info('⏹️ Stopping current audio...');
        await this.currentSound.stopAsync();
        await this.currentSound.unloadAsync();
      }

      logger.info('🔊 Playing audio...');

      // Load audio from URI
      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUri },
        { shouldPlay: true }
      );

      this.currentSound = sound;
      this._isSpeaking = true;

      // Wait for playback to complete
      sound.setOnPlaybackStatusUpdate((status) => {
        if ('didJustFinish' in status && status.didJustFinish) {
          this._isSpeaking = false;
          logger.info('✅ Audio playback completed');
        }
      });

    } catch (error) {
      logger.error('❌ Audio playback failed:', error);
      throw error;
    }
  }

  /**
   * Stop current playback
   */
  async stop(): Promise<void> {
    try {
      if (this.currentSound) {
        await this.currentSound.stopAsync();
        await this.currentSound.unloadAsync();
        this.currentSound = null;
        this._isSpeaking = false;
        logger.info('⏹️ Audio stopped');
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.warn('⚠️ Failed to stop audio', { message: err.message });
    }
  }

  /**
   * Check if currently speaking
   */
  isSpeaking(): boolean {
    return this._isSpeaking;
  }

  /**
   * Convert base64 audio to file URI
   */
  private async base64ToUri(base64Audio: string): Promise<string> {
    try {
      // Return data URI directly (most reliable for Expo)
      // This avoids filesystem issues across different platforms
      return `data:audio/wav;base64,${base64Audio}`;

    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error('❌ Failed to convert base64 to URI', { message: err.message });
      throw err;
    }
  }

  /**
   * Synthesize and play in one call
   */
  async speak(options: TTSOptions): Promise<void> {
    try {
      const speechResult = await this.generateSpeech(options);
      await this.playAudio(speechResult.audioUri);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error('❌ Speak operation failed', { message: err.message });
      throw err;
    }
  }

  /**
   * Speak text (alias for speak, matching interface)
   */
  async speakText(text: string, voiceType?: 'male' | 'female' | 'neutral'): Promise<void> {
    return this.speak({ text, voiceType });
  }

  /**
   * Cleanup (call on component unmount)
   */
  async cleanup(): Promise<void> {
    try {
      await this.stop();
      if (this.currentSound) {
        await this.currentSound.unloadAsync();
        this.currentSound = null;
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.warn('⚠️ Cleanup failed', { message: err.message });
    }
  }
}

/**
 * Factory function for creating Google TTS service instances
 */
export const createGoogleTTSService = (): IGoogleTTSService => {
  return new GoogleTTSService();
};

/**
 * Default singleton instance
 */
export const googleTTSService = createGoogleTTSService();
