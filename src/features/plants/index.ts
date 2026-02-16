/**
 * Plants Feature Exports
 * Barrel export for all plants-related components, hooks, services, and repositories
 */

// Components
export {
  WaterButton,
  FertilizeButton,
  DeleteButton,
  PlantActionButtonGroup,
} from './components/PlantActionButtons';

// Hooks
export { usePlants } from './hooks';
export type { UsePlantsReturn } from './hooks';

export { useWateringReminders } from './hooks/useWateringReminders';

// Services
export { PlantCareService, createPlantCareService } from './services';
export type { PlantWithRewards } from './services';

// Repositories
export { SupabasePlantRepository, createPlantRepository } from './repositories';
export type { IPlantRepository, Plant, CreatePlantDto, UpdatePlantDto } from './repositories';

// Schemas
export { plantSchema, loginSchema, registerSchema, userPreferencesSchema } from './schemas/plantSchema';
export type {
  PlantFormData,
  LoginFormData,
  RegisterFormData,
  UserPreferencesData,
} from './schemas/plantSchema';
