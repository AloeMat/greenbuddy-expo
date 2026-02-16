/**
 * Mock Geolocation Service for Testing
 */

export interface Location {
  coords: {
    latitude: number;
    longitude: number;
    accuracy?: number;
    altitude?: number;
  };
}

/**
 * Interface for Geolocation Service
 */
export interface IGeolocationService {
  getCurrentPosition(): Promise<Location>;
  requestPermissions(): Promise<boolean>;
}

export const createMockGeolocationService = (overrides?: Partial<IGeolocationService>): IGeolocationService => {
  return {
    async getCurrentPosition(): Promise<Location> {
      // Return mock Paris coordinates
      return {
        coords: {
          latitude: 48.8566,
          longitude: 2.3522,
          accuracy: 10,
          altitude: 35,
        },
      };
    },

    async requestPermissions(): Promise<boolean> {
      return true;
    },

    ...overrides,
  };
};

export const mockGeolocationService = createMockGeolocationService();
