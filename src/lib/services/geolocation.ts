/**
 * Geolocation Service
 * Manages location access using expo-location
 */

import * as Location from 'expo-location';
import { logger } from './logger';

export interface LocationCoords {
  latitude: number;
  longitude: number;
  accuracy?: number | null;
  altitude?: number | null;
  heading?: number | null;
  speed?: number | null;
}

export const geolocationService = {
  /**
   * Request foreground location permissions
   */
  async requestPermission(): Promise<boolean> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        logger.warn('⚠️ Location permission denied');
        return false;
      }
      logger.info('✅ Location permission granted');
      return true;
    } catch (error) {
      logger.error('Failed to request location permission', error instanceof Error ? error : new Error(String(error)));
      return false;
    }
  },

  /**
   * Get current device location
   */
  async getCurrentPosition(): Promise<LocationCoords | null> {
    try {
      const hasPermission = await this.requestPermission();
      if (!hasPermission) {
        return null;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced
      });

      const coords: LocationCoords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
        altitude: location.coords.altitude,
        heading: location.coords.heading,
        speed: location.coords.speed
      };

      logger.info('✅ Location retrieved', { latitude: coords.latitude, longitude: coords.longitude });
      return coords;
    } catch (error) {
      logger.error('Failed to get current position', error instanceof Error ? error : new Error(String(error)));
      return null;
    }
  },

  /**
   * Get city name from coordinates (reverse geocoding)
   */
  async getCity(latitude: number, longitude: number): Promise<string | null> {
    try {
      const reverseGeocoded = await Location.reverseGeocodeAsync({
        latitude,
        longitude
      });

      if (reverseGeocoded.length > 0) {
        const { city, region } = reverseGeocoded[0];
        const cityName = city || region || 'Unknown Location';
        logger.info(`✅ City detected: ${cityName}`);
        return cityName;
      }

      return null;
    } catch (error) {
      logger.error('Failed to reverse geocode', error instanceof Error ? error : new Error(String(error)));
      return null;
    }
  }
};
