/**
 * Centralized API Exports
 * Point d'entrée unique pour repositories et services
 */

// Auth Repository
export type { IAuthRepository } from '@/features/auth/repositories';
export { createAuthRepository } from '@/features/auth/repositories';

// Plants Repository & Services
export type { IPlantRepository, Plant, CreatePlantDto, UpdatePlantDto } from '@/features/plants/repositories';
export { createPlantRepository } from '@/features/plants/repositories';

export type { IPlantCareService, IGardenService } from '@/features/plants/services';
export { createPlantCareService, createGardenService } from '@/features/plants/services';
