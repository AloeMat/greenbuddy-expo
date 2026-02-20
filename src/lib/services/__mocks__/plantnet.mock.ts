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

    async identifyPlantByName(plantName: string): Promise<PlantIdentificationResult> {
      return {
        commonName: plantName,
        scientificName: `${plantName} sp.`,
        genus: plantName.split(/\s+/)[0],
        family: 'Mockaceae',
        confidence: 75,
        description: `Mock identification for: ${plantName}`,
        source: 'gemini',
      };
    },

    ...overrides,
  };
};

export const mockPlantNetService = createMockPlantNetService();
