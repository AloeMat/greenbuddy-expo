import type {
  Plant,
  AuthUser,
  GamificationState,
  PlantPersonality,
  AvatarEmotion,
  WeatherData,
  AppState,
  ApiResponse,
  HumanDesignProfile,
} from '@appTypes';

const plant: Plant = {
  id: '1',
  userId: 'user1',
  commonName: 'Monstera',
  healthScore: 100,
  healthStatus: 'excellent',
  wateringFrequency: 7,
  xp: 0,
  level: 1,
  createdAt: Date.now(),
};

const user: AuthUser = {
  id: 'id1',
  email: 'test@example.com',
  createdAt: new Date().toISOString(),
};

console.log('✅ All types imported successfully!');
