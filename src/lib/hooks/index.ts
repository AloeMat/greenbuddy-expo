/**
 * Global Hooks Barrel Export
 * Hooks réutilisables cross-features
 */

// Theme hooks (native + web variants)
export { useColorScheme } from './use-color-scheme';
export { useThemeColor } from './use-theme-color';

// TTS hook (voice synthesis)
export { useGoogleTTS } from './useGoogleTTS';
export type { UseGoogleTTSOptions } from './useGoogleTTS';
