/**
 * Mock PlantNet Service Factory
 */

import { IPlantNetService, PlantIdentificationResult } from '@/features/plants/services/plantnet';

export const createMockPlantNetService = (overrides?: Partial<IPlantNetService>): IPlantNetService => {
  return {
    async identifyPlant(base64Image: string): Promise<PlantIdentificationResult> {
      return {
        commonName: 'Mock Plant Species',
        scientificName: 'Mockus plantus',
        genus: 'Mockus',
        family: 'Mockaceae',
        confidence: 87,
        description: 'A beautiful mock plant species for testing',
        source: 'plantnet',
      };
    },

    ...overrides,
  };
};

export const mockPlantNetService = createMockPlantNetService();
