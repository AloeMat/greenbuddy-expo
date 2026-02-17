/**
 * Asset Imports with Alias Support
 * Centralizes all asset imports (images, etc.) to allow alias usage
 * instead of relative paths (../../../../assets/)
 *
 * Why this file exists:
 * - Metro bundler cannot resolve TypeScript aliases in require() calls
 * - Solution: Use relative paths here (3 levels up from src/lib/assets/), export via alias
 * - All files can now use: import { avatarImages, uiImages, appIcons } from '@lib/assets'
 *
 * Benefits:
 * - Eliminates ../../../../ relative paths completely
 * - Single source of truth for asset imports
 * - Easier to refactor/move assets
 */

// Avatar Images - Flyweight Pattern (3 levels up to root, then into assets)
export const avatarImages = {
  succulente: require('../../../assets/avatars/succulente.png'),
  orchidee: require('../../../assets/avatars/orchidee.png'),
  monstera: require('../../../assets/avatars/monstera.png'),
  fougere: require('../../../assets/avatars/fougere.png'),
  carnivore: require('../../../assets/avatars/carnivore.png'),
  cactus: require('../../../assets/avatars/cactus.png'),
  pilea: require('../../../assets/avatars/pilea.png'),
  palmier: require('../../../assets/avatars/palmier.png'),
  pothos: require('../../../assets/avatars/pilea.png'), // Fallback to pilea
};

// UI Images - All general purpose images
// Note: React Native auto-selects @2x/@3x variants based on device DPI
export const uiImages = {
  reactLogo: require('../../../assets/images/react-logo.png'),
  partialReactLogo: require('../../../assets/images/partial-react-logo.png'),
  splashIcon: require('../../../assets/images/splash-icon.png'),
  favicon: require('../../../assets/images/favicon.png'),
  androidIconBackground: require('../../../assets/images/android-icon-background.png'),
  androidIconMonochrome: require('../../../assets/images/android-icon-monochrome.png'),
  androidIconForeground: require('../../../assets/images/android-icon-foreground.png'),
};

// App Icons & Splash Screen
export const appIcons = {
  icon: require('../../../assets/icon.png'),
  adaptiveIcon: require('../../../assets/adaptive-icon.png'),
  androidIconForeground: require('../../../assets/android-icon-foreground.png'),
  splash: require('../../../assets/splash.png'),
};

// Alternative individual exports for convenience (avatars only)
export const {
  succulente,
  orchidee,
  monstera,
  fougere,
  carnivore,
  cactus,
  pilea,
  palmier,
  pothos,
} = avatarImages;

// Type definitions for asset usage
export type AvatarImageKey = keyof typeof avatarImages;
export type UIImageKey = keyof typeof uiImages;
export type AppIconKey = keyof typeof appIcons;
