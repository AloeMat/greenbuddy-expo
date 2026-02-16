/**
 * Centralized API Exports
 * Point d'entrée unique pour repositories et services
 */

// Auth Repository
export type { IAuthRepository } from '@auth/repositories';
export { createAuthRepository } from '@auth/repositories';

// Plants Repository & Services
export type { IPlantRepository, Plant, CreatePlantDto, UpdatePlantDto } from '@plants/repositories';
export { createPlantRepository } from '@plants/repositories';

export type { IPlantCareService, IGardenService } from '@plants/services';
export { createPlantCareService, createGardenService } from '@plants/services';
