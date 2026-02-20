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
  id: '00000000-0000-0000-0000-000000000001',
  user_id: 'user1',
  nom_commun: 'Monstera',
  personnalite: 'monstera',
  sante_score: 100,
  current_xp: 0,
  level: 1,
  arrosage_frequence_jours: 7,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const user: AuthUser = {
  id: 'id1',
  email: 'test@example.com',
  createdAt: new Date().toISOString(),
};

console.log('✅ All types imported successfully!');
