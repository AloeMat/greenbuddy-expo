/**
 * Plants Services Barrel Export
 */

export { PlantCareService, createPlantCareService } from './PlantCareService';
export type { PlantWithRewards, IPlantCareService } from './PlantCareService';

export { createMockPlantCareService, mockPlantCareService } from './PlantCareService.mock';

export { GardenServiceImpl, createGardenService, gardenService } from './GardenService';
export type { IGardenService } from './GardenService';

export { createMockGardenService, mockGardenService } from './GardenService.mock';

// Camera and PlantNet services exist in root services/ (legacy - will migrate in future PR)
// These are used by camera screen for plant identification
