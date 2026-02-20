/**
 * Secure Storage Adapter for Supabase Auth
 *
 * Uses expo-secure-store on native (encrypted keychain/keystore)
 * and falls back to a no-op on web (Supabase uses its own web storage).
 *
 * This prevents auth tokens from being readable on rooted/jailbroken devices,
 * unlike AsyncStorage which stores data in plain text.
 */

import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { logger } from './logger';

/**
 * expo-secure-store has a 2048-byte limit per value.
 * Supabase JWT tokens can exceed this limit.
 * We chunk the value if needed.
 */
const CHUNK_SIZE = 2000;

function getChunkKey(key: string, index: number): string {
  return index === 0 ? key : `${key}__chunk_${index}`;
}

async function secureSetItem(key: string, value: string): Promise<void> {
  if (value.length <= CHUNK_SIZE) {
    await SecureStore.setItemAsync(key, value);
    // Clean up any leftover chunks from a previously longer value
    await SecureStore.deleteItemAsync(`${key}__chunk_1`);
    return;
  }

  // Chunk the value for large JWTs
  const chunks = Math.ceil(value.length / CHUNK_SIZE);
  for (let i = 0; i < chunks; i++) {
    const chunk = value.substring(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
    await SecureStore.setItemAsync(getChunkKey(key, i), chunk);
  }
  // Store chunk count as metadata
  await SecureStore.setItemAsync(`${key}__chunks`, String(chunks));
}

async function secureGetItem(key: string): Promise<string | null> {
  const chunksStr = await SecureStore.getItemAsync(`${key}__chunks`);

  if (!chunksStr) {
    // No chunking — read directly
    return SecureStore.getItemAsync(key);
  }

  const chunks = parseInt(chunksStr, 10);
  let value = '';
  for (let i = 0; i < chunks; i++) {
    const chunk = await SecureStore.getItemAsync(getChunkKey(key, i));
    if (chunk === null) {
      // Corrupted chunks — clean up and return null
      logger.warn('[SecureStorage] Corrupted chunks detected, clearing', { key });
      await secureRemoveItem(key);
      return null;
    }
    value += chunk;
  }
  return value;
}

async function secureRemoveItem(key: string): Promise<void> {
  // Remove main key
  await SecureStore.deleteItemAsync(key);

  // Remove chunk metadata
  const chunksStr = await SecureStore.getItemAsync(`${key}__chunks`);
  if (chunksStr) {
    const chunks = parseInt(chunksStr, 10);
    for (let i = 0; i < chunks; i++) {
      await SecureStore.deleteItemAsync(getChunkKey(key, i));
    }
    await SecureStore.deleteItemAsync(`${key}__chunks`);
  }

  // Also clean up legacy chunk_1 if it exists
  await SecureStore.deleteItemAsync(`${key}__chunk_1`);
}

/**
 * Storage adapter compatible with Supabase's auth.storage interface.
 * Uses SecureStore on native, no-op on web.
 */
export const secureStorageAdapter = Platform.OS === 'web'
  ? undefined // Let Supabase use its default web storage (localStorage)
  : {
      getItem: async (key: string): Promise<string | null> => {
        try {
          return await secureGetItem(key);
        } catch (error) {
          logger.error('[SecureStorage] getItem failed:', error);
          return null;
        }
      },
      setItem: async (key: string, value: string): Promise<void> => {
        try {
          await secureSetItem(key, value);
        } catch (error) {
          logger.error('[SecureStorage] setItem failed:', error);
        }
      },
      removeItem: async (key: string): Promise<void> => {
        try {
          await secureRemoveItem(key);
        } catch (error) {
          logger.error('[SecureStorage] removeItem failed:', error);
        }
      },
    };
