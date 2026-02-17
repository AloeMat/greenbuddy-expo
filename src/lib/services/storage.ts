/**
 * Storage Service for React Native
 * Wrapper around AsyncStorage for consistent API
 * Replaces web localStorage
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from '@/lib/services/logger';

/**
 * Storage service with async/await pattern
 * All operations are async due to React Native AsyncStorage
 */
export const storage = {
  /**
   * Get item from storage
   * @param key - Storage key
   * @returns Value or null if not found
   */
  async getItem(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      logger.error(`Error getting item ${key}:`, error);
      throw error;
    }
  },

  /**
   * Set item in storage
   * @param key - Storage key
   * @param value - Value to store (must be string)
   */
  async setItem(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      logger.error(`Error setting item ${key}:`, error);
      throw error;
    }
  },

  /**
   * Remove item from storage
   * @param key - Storage key
   */
  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      logger.error(`Error removing item ${key}:`, error);
      throw error;
    }
  },

  /**
   * Clear all storage
   * WARNING: This removes all items!
   */
  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      logger.error('Error clearing storage:', error);
      throw error;
    }
  },

  /**
   * Get all keys in storage
   */
  async getAllKeys(): Promise<string[]> {
    try {
      return [...(await AsyncStorage.getAllKeys())];
    } catch (error) {
      logger.error('Error getting all keys:', error);
      throw error;
    }
  },

  /**
   * Get multiple items at once
   * @param keys - Array of keys to retrieve
   */
  async multiGet(keys: string[]): Promise<[string, string | null][]> {
    try {
      return [...(await AsyncStorage.multiGet(keys))];
    } catch (error) {
      logger.error('Error getting multiple items:', error);
      throw error;
    }
  },

  /**
   * Set multiple items at once
   * @param items - Array of [key, value] pairs
   */
  async multiSet(items: [string, string][]): Promise<void> {
    try {
      await AsyncStorage.multiSet(items);
    } catch (error) {
      logger.error('Error setting multiple items:', error);
      throw error;
    }
  },

  /**
   * Remove multiple items at once
   * @param keys - Array of keys to remove
   */
  async multiRemove(keys: string[]): Promise<void> {
    try {
      await AsyncStorage.multiRemove(keys);
    } catch (error) {
      logger.error('Error removing multiple items:', error);
      throw error;
    }
  },

  /**
   * Helper for JSON data
   * Gets and parses JSON
   */
  async getJSON<T>(key: string): Promise<T | null> {
    try {
      const value = await this.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error(`Error getting JSON item ${key}:`, error);
      throw error;
    }
  },

  /**
   * Helper for JSON data
   * Stringifies and sets JSON
   */
  async setJSON<T>(key: string, value: T): Promise<void> {
    try {
      await this.setItem(key, JSON.stringify(value));
    } catch (error) {
      logger.error(`Error setting JSON item ${key}:`, error);
      throw error;
    }
  },
};

export default storage;
