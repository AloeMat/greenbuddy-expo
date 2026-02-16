# GreenBuddy v2.2 - Modern Architecture

## 📁 Directory Structure

```
src/
├── features/                    # Feature-first organization
│   ├── plants/
│   │   ├── components/         # Plant-related UI components
│   │   ├── hooks/              # Plant-specific hooks
│   │   ├── queries/            # TanStack Query hooks
│   │   ├── schemas/            # Zod validation schemas
│   │   ├── services/           # API services (plantnet, etc)
│   │   ├── store/              # Zustand state (if needed)
│   │   ├── types/              # Plant-specific types
│   │   ├── constants/          # Constants
│   │   └── index.ts            # Exports
│   │
│   ├── gamification/           # Gamification (XP, Achievements, Streaks)
│   │   ├── components/         # Achievement UI, Streak counter, Life Tree
│   │   ├── constants/          # LIFE_TREE_TIERS, XP_REWARDS
│   │   ├── store/              # Zustand gamification store
│   │   ├── types/              # Types
│   │   └── index.ts            # Exports
│   │
│   ├── auth/                   # Authentication
│   │   ├── hooks/              # useAuthHook for compatibility
│   │   ├── store/              # Zustand auth store
│   │   ├── types/              # AuthUser, AuthState
│   │   └── index.ts            # Exports (includes useAuth alias)
│   │
│   ├── community/              # Friends, Sharing, Leaderboard
│   ├── sustainability/         # Dashboard Durabilité (CO₂, Solar)
│   ├── wellness/               # Bien-être, Thérapie Verte
│   └── navigation/             # Tab bar, routing (Phase 2)
│
├── design-system/              # Design tokens & components
│   ├── tokens/
│   │   ├── colors.ts           # v2.2 palette + emotions + personalities
│   │   ├── typography.ts       # Font styles (Nunito, Poppins, Inter)
│   │   ├── spacing.ts          # Scale 4px + component-specific
│   │   └── index.ts            # theme object export
│   │
│   └── components/             # Reusable UI components
│       ├── BadgeCard.tsx
│       ├── AlertCard.tsx
│       ├── ProgressRing.tsx
│       └── ...
│
├── lib/                        # Shared utilities
│   ├── queryClient.ts          # TanStack Query setup
│   ├── posthog.ts              # Analytics (Phase 4)
│   ├── performance.ts          # Performance monitoring
│   ├── hooks/                  # ✅ Global hooks (theme, TTS)
│   │   ├── index.ts            # Barrel export
│   │   ├── useGoogleTTS.ts
│   │   ├── use-color-scheme.ts
│   │   └── use-theme-color.ts
│   └── services/               # ✅ Shared services (supabase, logger)
│       ├── supabase.ts
│       ├── logger.ts
│       └── __mocks__/          # DI mock factories (Phase 3.5)
│
├── i18n/                       # Internationalization (Phase 6)
│   ├── index.ts                # i18next setup
│   └── locales/
│       ├── fr.json
│       └── en.json
│
├── store/                      # 🆕 Points d'entrée centralisés
│   └── index.ts                # Re-exports tous stores Zustand
│
├── api/                        # 🆕 Points d'entrée centralisés
│   └── index.ts                # Re-exports repositories/services
│
└── README.md                   # This file
```

---

## 🎯 Import Patterns

### Using Feature Exports (Preferred)
```typescript
// AuthStore
import { useAuthStore, useAuth } from '@auth';
const { user, login } = useAuthStore();

// Gamification
import { useGamificationStore, LIFE_TREE_TIERS } from '@gamification';
const { addXp, currentTier } = useGamificationStore();

// Design Tokens
import { colors, typography, spacing } from '@tokens';
import { theme } from '@design-system/tokens';
```

### Using Path Aliases
```typescript
// Available aliases (in tsconfig.json)
import type { AuthState } from '@auth';           // auth types
import { plantSchema } from '@plants';            // plant schemas
import { queryClient } from '@lib/queryClient';   // query setup

// Old style (gradually remove)
import { useAuth } from '../../../context/AuthContext';
```

---

## 📦 Points d'Entrée Standards

### Stores (Zustand)
```typescript
// Recommandé : Import depuis feature
import { useAuthStore } from '@auth/store';
import { usePlantsStore } from '@plants/store';
import { useGamificationStore } from '@gamification/store';

// Alternative : Import depuis point central
import { useAuthStore, usePlantsStore } from '@/store';
```

### Hooks
```typescript
// Auth
import { useAuthHook } from '@auth/hooks';

// Gamification
import { useAttachment, useStreak } from '@gamification/hooks';

// Plants
import { usePlants, useWateringReminders } from '@plants/hooks';

// Global (theme, TTS)
import { useGoogleTTS, useThemeColor } from '@lib/hooks';
```

### Repositories & Services
```typescript
// Recommandé : Import depuis feature
import { createPlantRepository } from '@plants/repositories';
import { createPlantCareService } from '@plants/services';

// Alternative : Import depuis point central (utile pour tests)
import { createPlantRepository, createAuthRepository } from '@/api';
```

---

## 📦 State Management (Zustand)

All stores follow this pattern:

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useMyStore = create<MyState>()(
  persist(
    (set, get) => ({
      // State
      data: null,

      // Actions
      loadData: async () => {
        set({ data: await fetchData() });
      },
    }),
    {
      name: 'greenbuddy-mystore',  // Key for AsyncStorage
      storage: AsyncStorage,
    }
  )
);
```

---

## ✅ Validation with Zod + React Hook Form

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { plantSchema, type PlantFormData } from '@plants';

export function PlantForm() {
  const { control, formState: { errors }, handleSubmit } = useForm<PlantFormData>({
    resolver: zodResolver(plantSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  );
}
```

---

## 🎮 Using Gamification

```typescript
import { useGamificationStore, XP_REWARDS } from '@gamification';

export function PlantDetail() {
  const { addXp, currentTier, getTierProgressPercentage } = useGamificationStore();

  const handleWater = async () => {
    // Do water action
    addXp(XP_REWARDS.WATER_PLANT.amount, 'WATER_PLANT');
    // This automatically:
    // - Updates totalXp
    // - Recalculates tier (if needed)
    // - Updates tier progress %
    // - Unlocks achievements (if applicable)
    // - Persists to AsyncStorage
  };

  return (
    <View>
      <Text>Tier {currentTier} ({getTierProgressPercentage()}%)</Text>
      <Button onPress={handleWater}>Water Plant (+10 XP)</Button>
    </View>
  );
}
```

---

## 🔐 Authentication

```typescript
import { useAuthStore } from '@auth';

export function LoginScreen() {
  const { login, isLoading, user, isAuthenticated } = useAuthStore();

  const handleLogin = async (email, password) => {
    try {
      await login(email, password);
      // user and isAuthenticated auto-updated
      // Tokens stored in memory
    } catch (error) {
      console.error(error);
    }
  };

  // Or use alias
  const { useAuth } = useAuthStore();
  // Same interface, different name
}
```

---

## 🎨 Using Design Tokens

```typescript
import { colors, typography, spacing } from '@tokens';

export function MyComponent() {
  return (
    <View style={{
      backgroundColor: colors.primary[500],
      padding: spacing.lg,
      borderRadius: spacing.card.radius.md,
    }}>
      <Text style={typography.heading.h3}>
        Title
      </Text>
      <Text style={typography.body.md}>
        Body text
      </Text>
    </View>
  );
}
```

Or with Tailwind:
```tsx
export function MyComponentTW() {
  return (
    <View className="bg-primary-500 p-4 rounded-lg">
      <Text className="font-nunito font-bold text-2xl">Title</Text>
      <Text className="font-inter text-base text-text-primary">Body</Text>
    </View>
  );
}
```

---

## 🚀 Adding a New Feature

### 1. Create the folder structure
```bash
mkdir -p src/features/myfeature/{components,hooks,queries,store,types,constants,schemas}
```

### 2. Define types
```typescript
// src/features/myfeature/types/index.ts
export interface MyFeatureState {
  data: any;
  actions...
}
```

### 3. Create the store (if needed)
```typescript
// src/features/myfeature/store/myfeatureStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useMyFeatureStore = create<MyFeatureState>()(persist(...));
```

### 4. Export everything
```typescript
// src/features/myfeature/index.ts
export { useMyFeatureStore } from './store/myfeatureStore';
export type { MyFeatureState } from './types';
// ... other exports
```

### 5. Add path alias (if significant)
In `tsconfig.json`:
```json
"@myfeature/*": ["./src/features/myfeature/*"]
```

### 6. Use in components
```typescript
import { useMyFeatureStore } from '@myfeature';
```

---

## 📋 File Naming Conventions

- **Stores**: `featureStore.ts` (Zustand)
- **Hooks**: `useFeatureName.ts` (Custom hooks)
- **Queries**: `useFeatureQuery.ts` (TanStack Query)
- **Schemas**: `featureSchema.ts` (Zod)
- **Components**: `FeatureName.tsx` (PascalCase)
- **Constants**: `constants.ts` or `feature.ts`
- **Types**: `index.ts` in `/types` folder
- **Services**: `feature.ts` (lowercase)

---

## ✨ Best Practices

### 1. Always use TypeScript types
```typescript
// ✅ Good
import type { AuthUser } from '@auth';
const user: AuthUser = ...

// ❌ Avoid
const user: any = ...
```

### 2. Colocate related code
```
features/plants/
├── components/PlantCard.tsx
├── hooks/usePlants.ts
├── schemas/plantSchema.ts  # Validation lives with feature
├── queries/usePlantsQuery.ts
└── services/plantnet.ts
```

### 3. Prefer feature imports
```typescript
// ✅ Good
import { useGamificationStore } from '@gamification';

// ⚠️ Legacy
import { useGamification } from '../../../hooks/useGamification';
```

### 4. Create test files alongside
```typescript
// For every FeatureName.tsx, create FeatureName.test.tsx
FeatureName.tsx
FeatureName.test.tsx
```

---

## 🔍 Debugging Tips

### View store state
```typescript
import { useAuthStore } from '@auth';

// In browser console (with DevTools)
useAuthStore.getState()  // Get current state
useAuthStore.subscribe(state => console.log('Updated:', state))
```

### Check persistence
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

// In AsyncStorage
const data = await AsyncStorage.getItem('greenbuddy-auth');
console.log(JSON.parse(data));
```

### Validate schemas
```typescript
import { plantSchema } from '@plants';

const result = plantSchema.safeParse(userData);
if (!result.success) {
  console.error('Validation errors:', result.error);
}
```

---

## 📚 Documentation

- [PHASE_0_PROGRESS.md](../PHASE_0_PROGRESS.md) - Design system & architecture
- [PHASE_1_PROGRESS.md](../PHASE_1_PROGRESS.md) - State management & validation
- [MIGRATION_SUMMARY.md](../MIGRATION_SUMMARY.md) - Overall progress & decisions

---

## 🎯 Next Steps

See [MIGRATION_SUMMARY.md](../MIGRATION_SUMMARY.md) for Phase 2+ roadmap.

---

**v2.2 Architecture**: Feature-first, type-safe, modern state management 🚀
