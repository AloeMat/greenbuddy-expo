/**
 * Camera Service for Expo
 * Handles camera permissions and photo capture with proper initialization
 *
 * Key improvements:
 * 1. Real permissions API - actually requests camera access
 * 2. Camera ready state - waits for onCameraReady event
 * 3. Better error handling - specific error messages
 * 4. Type safety - validates photo object structure
 */

import { CameraView, Camera } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';
import { logger } from '@lib/services/logger';

export interface CameraPhoto {
  uri: string;
  width: number;
  height: number;
  base64?: string;
}

export interface CameraPermissionStatus {
  granted: boolean;
  message: string;
}

/**
 * Interface for Camera Service - enables DI and mocking
 */
export interface ICameraService {
  setRef(ref: CameraView | null): void;
  setReady(ready: boolean): void;
  requestPermissions(): Promise<CameraPermissionStatus>;
  waitForCameraReady(timeoutMs?: number): Promise<void>;
  takePicture(): Promise<CameraPhoto>;
  compressImage(photo: CameraPhoto, maxSize: number): Promise<CameraPhoto>;
  getBase64(photo: CameraPhoto): Promise<string>;
}

class CameraService implements ICameraService {
  private cameraRef: CameraView | null = null;
  private cameraReady: boolean = false;
  private readyPromise: Promise<void> | null = null;
  private readyResolve: (() => void) | null = null;

  constructor() {
    this.resetReadyPromise();
  }

  private resetReadyPromise() {
    this.readyPromise = new Promise(resolve => {
      this.readyResolve = resolve;
    });
  }

  /**
   * Set camera reference - called when CameraView mounts
   */
  setRef(ref: CameraView | null) {
    this.cameraRef = ref;
    if (!ref) {
      this.cameraReady = false;
      this.resetReadyPromise();
      logger.info('📸 Camera reference cleared');
    } else {
      logger.info('📸 Camera reference set');
    }
  }

  /**
   * Called when CameraView fires onCameraReady event
   * This is the signal that native camera is fully initialized
   */
  setReady(ready: boolean) {
    this.cameraReady = ready;
    if (ready && this.readyResolve) {
      logger.info('✅ Camera is now READY (native initialization complete)');
      this.readyResolve();
    } else if (!ready) {
      this.resetReadyPromise();
      logger.info('📸 Camera reset to not ready');
    }
  }

  /**
   * Wait for camera to be ready with timeout
   * This waits for the onCameraReady event from native code
   */
  async waitForCameraReady(timeoutMs: number = 5000): Promise<void> {
    if (this.cameraReady) {
      logger.info('✅ Camera already ready');
      return;
    }

    logger.info(`⏳ Waiting for camera to be ready (${timeoutMs}ms timeout)...`);

    return Promise.race([
      this.readyPromise!,
      new Promise<void>((_, reject) =>
        setTimeout(
          () => reject(new Error(`Camera initialization timeout after ${timeoutMs}ms`)),
          timeoutMs
        )
      )
    ]);
  }

  /**
   * Request camera permissions using real expo-camera API
   */
  async requestPermissions(): Promise<CameraPermissionStatus> {
    try {
      logger.info('📸 Requesting camera permissions...');

      // Use the real expo-camera permission API
      const permission = await Camera.requestCameraPermissionsAsync();

      if (permission.granted) {
        logger.info('✅ Camera permissions granted');
        return {
          granted: true,
          message: 'Camera permissions granted'
        };
      } else {
        logger.warn('⚠️ Camera permissions denied by user');
        return {
          granted: false,
          message: permission.canAskAgain
            ? 'Camera permission denied. You can enable it in settings.'
            : 'Camera permission denied permanently. Enable in app settings.'
        };
      }
    } catch (error) {
      logger.error('❌ Camera permission request error:', error);
      return {
        granted: false,
        message: 'Camera permission request failed'
      };
    }
  }

  /**
   * Take a picture using the camera with proper initialization checks
   */
  async takePicture(): Promise<CameraPhoto> {
    if (!this.cameraRef) {
      throw new Error('Camera reference not set. Call setRef() first.');
    }

    try {
      logger.info('📸 Taking picture...');

      // CRITICAL: Wait for camera to be ready before capture
      // This prevents "takePictureAsync called on uninitialized camera" errors
      await this.waitForCameraReady(5000);

      const photo = await this.cameraRef.takePictureAsync({
        quality: 0.8,
        base64: true,
        exif: false
      });

      if (!photo) {
        throw new Error('takePictureAsync returned null');
      }

      if (!photo.uri) {
        throw new Error('Photo object missing uri property');
      }

      logger.info('✅ Picture taken successfully', {
        width: photo.width || 'unknown',
        height: photo.height || 'unknown',
        hasUri: !!photo.uri,
        hasBase64: !!photo.base64
      });

      return {
        uri: photo.uri,
        width: photo.width || 0,
        height: photo.height || 0,
        base64: photo.base64
      };
    } catch (error) {
      logger.error('❌ Failed to take picture:', error);
      throw error;
    }
  }

  /**
   * Compress image for upload
   */
  async compressImage(photo: CameraPhoto, maxWidth: number = 2048): Promise<CameraPhoto> {
    try {
      logger.info('🗜️ Compressing image...', { maxWidth });

      const manipulatedImage = await ImageManipulator.manipulateAsync(
        photo.uri,
        [{ resize: { width: maxWidth } }],
        {
          compress: 0.7,
          format: ImageManipulator.SaveFormat.JPEG,
          base64: true
        }
      );

      logger.info('✅ Image compressed', {
        originalSize: photo.width,
        compressedSize: manipulatedImage.width
      });

      return {
        uri: manipulatedImage.uri,
        width: manipulatedImage.width,
        height: manipulatedImage.height,
        base64: manipulatedImage.base64
      };
    } catch (error) {
      logger.error('❌ Failed to compress image:', error);
      throw error;
    }
  }

  /**
   * Convert image to base64 (if not already)
   */
  async getBase64(photo: CameraPhoto): Promise<string> {
    if (photo.base64) {
      return photo.base64;
    }

    try {
      logger.info('📸 Converting image to base64...');

      const manipulatedImage = await ImageManipulator.manipulateAsync(
        photo.uri,
        [],
        {
          format: ImageManipulator.SaveFormat.JPEG,
          base64: true
        }
      );

      if (!manipulatedImage.base64) {
        throw new Error('Failed to get base64 from image');
      }

      return manipulatedImage.base64;
    } catch (error) {
      logger.error('❌ Failed to convert to base64:', error);
      throw error;
    }
  }
}

/**
 * Factory function for creating Camera service instances
 */
export const createCameraService = (): ICameraService => {
  return new CameraService();
};

/**
 * Default singleton instance
 */
export const cameraService = createCameraService();
