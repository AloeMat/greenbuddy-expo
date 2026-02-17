/**
 * Mock Camera Service Factory
 */

import { ICameraService, CameraPhoto, CameraPermissionStatus } from '@/features/plants/services/camera';
import { CameraView } from 'expo-camera';

export const createMockCameraService = (overrides?: Partial<ICameraService>): ICameraService => {
  return {
    setRef(ref: CameraView | null): void {
      // Mock - no-op
    },

    setReady(ready: boolean): void {
      // Mock - no-op (always ready)
    },

    async waitForCameraReady(timeoutMs?: number): Promise<void> {
      // Mock - resolves immediately (always ready)
      return undefined;
    },

    async requestPermissions(): Promise<CameraPermissionStatus> {
      return {
        granted: true,
        message: 'Camera permissions granted (mock)',
      };
    },

    async takePicture(): Promise<CameraPhoto> {
      return {
        uri: 'mock://camera/photo.jpg',
        width: 1920,
        height: 1440,
      };
    },

    async compressImage(photo: CameraPhoto, maxSize: number): Promise<CameraPhoto> {
      return {
        ...photo,
        width: Math.min(photo.width, maxSize),
        height: Math.min(photo.height, maxSize),
      };
    },

    async getBase64(photo: CameraPhoto): Promise<string> {
      return 'data:image/jpeg;base64,mockbase64string==';
    },

    ...overrides,
  };
};

export const mockCameraService = createMockCameraService();
