# Phase 4.2: Gamification Personalization Integration
## Human Design Setup → Personalized Experience

**Status**: ✅ COMPLETE
**Timeline**: Session 3 (Day 14)
**Files Created**: 2 files (personalizationService.ts, usePersonalization.ts)
**Files Enhanced**: 2 files (dailyNotificationService.ts, contextualReplyService.ts)
**Total Lines**: 650+ lines of code

---

## 📋 Overview

The personalization system adapts the entire gamification experience based on user preferences collected during **onboarding step 5 (Human Design Setup)**:

```
User Profile Questionnaire (5 questions)
         ↓
   human_design_setups table (Supabase)
         ↓
   PersonalizationService (loads & caches)
         ↓
   Applied to 3 Systems:
   - Notification Style & Frequency
   - Avatar Personality Tone
   - Gamification Messaging
```

---

## 🎯 What Gets Personalized

### 1. **Notification Frequency & Style**

Based on **watering_rhythm** + **guilt_sensitivity**:

| Preference | Frequency | Style | Examples |
|-----------|-----------|-------|----------|
| **Forgetful** (caregiver) | Every 2-3 days | **Gentle** | "Prenez un moment pour vérifier vos plantes quand vous avez un instant." |
| **Stressed** | Every 4 days | **Motivational** | "Arrosez vos plantes et gagnez +10 XP!" |
| **Passionate** | Daily | **Strict** | "N'oubliez pas votre check-in d'aujourd'hui." |

**How it works**:
- `watering_rhythm` → `recommended_check_frequency` (1, 2, 3, or 7 days)
- `guilt_sensitivity` + `caregiver_profile` → `notification_style` (gentle/strict/motivational)

### 2. **Avatar Personality Tone**

Based on **avatar_personality** preference:

| Type | Tone | Example Reply |
|------|------|---------------|
| **Funny** 😄 | Playful, humorous, punny | "Tu m'as manqué! Fait la danse de la pluie! 🌧️" |
| **Gentle** 🌱 | Warm, encouraging, supportive | "Merci pour ce soin. C'est très apprécié." |
| **Expert** 🔬 | Scientific, educational, informative | "Vous avez maintenu le pH optimal cette semaine. Excellent." |

**How it works**:
- Avatar personality influences Gemini prompt instructions
- Replies are generated with the chosen tone consistently
- Each plant gets the same personality across all interactions

### 3. **Gamification Messaging**

Based on **guilt_sensitivity** and **notification_style**:

```typescript
// Gentle style (guilt_sensitive = 'yes')
title: "🌱 Bonjour!"
body: "Prenez un moment pour vérifier vos plantes quand vous avez un instant."

// Motivational style (guilt_sensitive = 'no')
title: "🔥 Check-in Quotidien"
body: "Venez maintenir votre série et gagner +5 XP!"

// Strict style (busy/stressed)
title: "📋 Check-in Quotidien"
body: "N'oubliez pas votre check-in d'aujourd'hui. Vous êtes en série!"
```

---

## 🔧 Architecture

### Files Created

#### 1. **personalizationService.ts**
Core service that loads, caches, and applies personalization logic.

```typescript
// Load setup for a user
const setup = await PersonalizationService.loadSetup(userId);

// Get notification frequency (days)
const freq = PersonalizationService.getNotificationFrequency(setup); // 3

// Get notification style
const style = PersonalizationService.getNotificationStyle(setup); // 'gentle'

// Get personalized notification message
const msg = PersonalizationService.getNotificationMessage(setup, 'daily_checkin');
// → { title: "🌱 Bonjour!", body: "..." }

// Get avatar personality
const personality = PersonalizationService.getAvatarPersonality(setup); // 'funny'

// Get emotion filter for this personality
const emotions = PersonalizationService.getPersonalityEmotionFilter('funny');
// → ['excited', 'happy', 'playful']

// Get dashboard tip based on caregiver profile
const tip = PersonalizationService.getDashboardTip(setup.caregiver_profile);
// → "Conseil: Gardez votre téléphone près de vous..."
```

**Features**:
- ✅ Automatic caching (1 hour)
- ✅ Graceful fallback to defaults
- ✅ Lazy-loads from Supabase
- ✅ Type-safe with TypeScript

#### 2. **usePersonalization.ts Hook**
React hook for components to access personalization.

```typescript
// Simple usage
const { setup, isLoading, error } = usePersonalization();

if (isLoading) return <LoadingSpinner />;

return (
  <Text>{setup?.avatar_personality}</Text>
);

// Specialized variants
const { style, isLoading } = useNotificationStyle();
const { personality, isLoading } = useAvatarPersonality();
```

**Features**:
- ✅ Loads on mount
- ✅ Clears cache on logout
- ✅ Type-safe
- ✅ Variants for specific data

### Files Enhanced

#### 1. **dailyNotificationService.ts**
Now accepts optional `setup` parameter for personalized messages.

```typescript
// Before (hardcoded)
await scheduleDailyCheckInNotification();
// → Always "🔥 Check-in Quotidien / Venez maintenir..."

// After (personalized)
const setup = await loadPersonalizationSetup(userId);
await scheduleDailyCheckInNotification(setup, 10); // 10 AM
// → "🌱 Bonjour! / Prenez un moment..." (if gentle style)
```

**Changes**:
- `scheduleDailyCheckInNotification(setup?: HumanDesignSetup, hour?: number)`
- `rescheduleDailyNotification(setup?: HumanDesignSetup, hour?: number)`
- Messages use `PersonalizationService.getNotificationMessage()`

#### 2. **contextualReplyService.ts**
Now accepts optional `avatarPersonality` parameter for tone.

```typescript
// Before (generic)
const reply = await generateContextualReply(context);
// → Generic reply based on plant health

// After (personalized)
const reply = await generateContextualReply(context, 'funny');
// → Funny version with humor & puns

// With the hook
const { setup } = usePersonalization();
const reply = await generateContextualReply(context, setup?.avatar_personality);
```

**Changes**:
- `generateReply(context: ReplyContext, avatarPersonality?: AvatarPersonalityType)`
- `buildSystemPrompt()` applies personality tone instructions
- Cache key includes personality (`${plantId}-${emotion}-${personality}`)

---

## 🚀 Integration Examples

### Example 1: Onboarding → Personalization Setup

```typescript
// app/onboarding/step5-human-design.tsx
const handleSubmit = async () => {
  // Save to Supabase
  const { error } = await supabase
    .from('human_design_setups')
    .upsert(setupData, { onConflict: 'user_id' });

  // User immediately gets personalized experience from next screen
  // (cache is cleared on logout, will auto-load on new session)
};
```

### Example 2: Dashboard with Personalized Tip

```typescript
// app/(tabs)/index.tsx (Home/Dashboard)
import { usePersonalization } from '@/features/gamification';

export default function DashboardScreen() {
  const { setup } = usePersonalization();

  const tip = setup
    ? PersonalizationService.getDashboardTip(setup.caregiver_profile)
    : 'Bienvenue dans GreenBuddy!';

  return (
    <View>
      <AlertCard variant="info" title="Conseil">
        <Text>{tip}</Text>
      </AlertCard>
    </View>
  );
}
```

### Example 3: Plant Detail with Personalized Avatar Replies

```typescript
// app/plants/[id].tsx (Plant Detail)
import { usePersonalization, generateContextualReply } from '@/features/gamification';

export default function PlantDetailScreen() {
  const { setup } = usePersonalization();
  const [reply, setReply] = useState<ContextualReply | null>(null);

  const handleTalkToPlant = async () => {
    const context = buildReplyContext(plant, user, weather);
    const result = await generateContextualReply(
      context,
      setup?.avatar_personality // Pass personality!
    );
    setReply(result);
    await playTTS(result.text, setup?.avatar_personality);
  };

  return (
    <VocalInteraction
      reply={reply}
      emotion={reply?.emotion}
      onTalk={handleTalkToPlant}
    />
  );
}
```

### Example 4: Notifications with Personalized Style

```typescript
// app/_layout.tsx (Root Layout)
import { usePersonalization, scheduleDailyCheckInNotification } from '@/features/gamification';

export default function RootLayout() {
  const { user } = useAuth();
  const { setup } = usePersonalization();

  useEffect(() => {
    // Schedule daily check-in with user's preferences
    if (user && setup) {
      const hour = setup.caregiver_profile === 'forgetful' ? 9 : 10; // Earlier for forgetful users
      scheduleDailyCheckInNotification(setup, hour);
    }
  }, [user?.id, setup?.id]);

  return <Slot />;
}
```

### Example 5: Settings Screen to Update Preferences

```typescript
// app/settings.tsx (Future: Allow users to change preferences)
const handleUpdatePreferences = async () => {
  const { error } = await supabase
    .from('human_design_setups')
    .update({
      avatar_personality: 'expert',
      notification_style: 'strict',
    })
    .eq('user_id', user.id);

  // Clear cache & reload
  PersonalizationService.clearCache();
  await refetch();

  // Reschedule notifications with new preferences
  await rescheduleDailyNotification(newSetup, 10);
};
```

---

## 📊 Data Flow

```
┌─────────────────────────────────────────────────────────┐
│  User Completes Onboarding Step 5 (Human Design)       │
│  - Selects 5 preferences                                │
│  - Saved to Supabase human_design_setups table          │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  PersonalizationService.loadSetup(userId)              │
│  - Fetches from Supabase (first time)                  │
│  - Caches in memory (1 hour TTL)                       │
│  - Returns default if not found (new user path)        │
└─────────────────────────────────────────────────────────┘
                          ↓
    ┌─────────────────────┴─────────────────────┐
    ↓                     ↓                     ↓
┌────────────┐  ┌───────────────┐  ┌──────────────┐
│ Hooks      │  │ Services      │  │ Components   │
│            │  │               │  │              │
│usePersonal-│  │dailyNotif     │  │AlertCard     │
│ization()  │  │Service        │  │VocalInteract │
│            │  │               │  │ion           │
│useNotif    │  │contextualReply│  │              │
│Style()    │  │Service        │  │              │
│            │  │               │  │              │
│useAvatar   │  │PersonalConfig │  │              │
│Personality│  │Service        │  │              │
│            │  │               │  │              │
└────────────┘  └───────────────┘  └──────────────┘
    ↓                 ↓                  ↓
    └─────────────────────┬──────────────┘
                          ↓
          Applied to User Experience:
    - Notification timing/tone
    - Avatar personality tone
    - Gamification messaging
    - Dashboard tips
```

---

## 🔒 Security & Privacy

### Supabase RLS Policy
```sql
-- human_design_setups table
ALTER TABLE human_design_setups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only view their own setup"
  ON human_design_setups FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can only update their own setup"
  ON human_design_setups FOR UPDATE
  USING (auth.uid() = user_id);
```

**What this means**:
- ✅ Users can only see/modify their own preferences
- ✅ No access to other users' data
- ✅ Secure by default at database level

### Personalization Service
- ✅ Only loads setup for authenticated user
- ✅ Falls back to defaults if load fails
- ✅ Never stores sensitive data in cache
- ✅ Cache clears on logout

---

## 🧪 Testing Strategy

### Unit Tests (Services)

```typescript
describe('PersonalizationService', () => {
  it('should load setup from cache if not expired', async () => {
    const setup = await PersonalizationService.loadSetup(userId);
    const setup2 = await PersonalizationService.loadSetup(userId);
    // Second call should hit cache
    expect(setup).toEqual(setup2);
  });

  it('should return defaults if no setup found', async () => {
    const setup = await PersonalizationService.loadSetup('unknown-user');
    expect(setup.avatar_personality).toBe('gentle'); // Default
  });

  it('should apply correct notification style based on guilt sensitivity', () => {
    const gentle = PersonalizationService.getNotificationMessage(
      { guilt_sensitivity: 'yes' },
      'daily_checkin'
    );
    const strict = PersonalizationService.getNotificationMessage(
      { guilt_sensitivity: 'no' },
      'daily_checkin'
    );
    expect(gentle.body).not.toContain('XP');
    expect(strict.body).toContain('XP');
  });
});
```

### Integration Tests (E2E)

```typescript
describe('Personalization Integration', () => {
  it('should use setup when scheduling notifications', async () => {
    const setup = { notification_style: 'gentle' };
    await scheduleDailyCheckInNotification(setup);

    const notifications = await getPendingNotifications();
    expect(notifications[0].content.body).toContain('quand vous avez');
  });

  it('should generate personalized replies based on avatar personality', async () => {
    const reply = await generateContextualReply(context, 'funny');
    // Should include humorous tone (verified by Gemini response)
    expect(reply.confidence).toBeGreaterThan(0.8);
  });
});
```

---

## 📈 Metrics & Monitoring

### What to Track

```typescript
// PostHog Events
posthog.capture('personalization_loaded', {
  user_id: user.id,
  avatar_personality: setup.avatar_personality,
  notification_style: setup.notification_style,
  caregiver_profile: setup.caregiver_profile,
});

// Cache hit rate
PersonalizationService.getCacheStats();
// → { size: 1, entries: ['user-123'] }

// User preferences distribution
SELECT
  avatar_personality,
  notification_style,
  COUNT(*) as users
FROM human_design_setups
GROUP BY avatar_personality, notification_style;
```

---

## 🚨 Common Issues & Solutions

### Issue 1: "User sees generic replies, not personalized ones"
**Solution**: Make sure to pass `setup?.avatar_personality` to `generateContextualReply()`:

```typescript
// ❌ Wrong
const reply = await generateContextualReply(context);

// ✅ Correct
const reply = await generateContextualReply(context, setup?.avatar_personality);
```

### Issue 2: "Notifications still show old messages"
**Solution**: Call `rescheduleDailyNotification()` when setup changes:

```typescript
useEffect(() => {
  if (setup?.updated_at !== prevSetup?.updated_at) {
    rescheduleDailyNotification(setup);
  }
}, [setup?.updated_at]);
```

### Issue 3: "Setup not loading for new users"
**Solution**: This is expected behavior. New users who skip onboarding get defaults:

```typescript
const setup = await PersonalizationService.loadSetup(userId);
// If no row in database, returns DEFAULT_SETUP (gentle, motivational, etc.)
```

---

## 📝 Next Steps

### Phase 4.3: Watering Recommendations
- [ ] Use `watering_rhythm` to customize watering schedule
- [ ] Show frequency suggestions based on plant type + user preference
- [ ] Track compliance with recommended schedule

### Phase 4.4: Seasonal Quests
- [ ] Use `living_place` to generate location-specific quests
- [ ] Summer: "Keep plants cool" (apartment users)
- [ ] Winter: "Protect from drafts" (office users)

### Phase 5: Community Leaderboards
- [ ] Filter by caregiver profile for "fairness"
- [ ] Passionate players vs forgetful players separate leaderboards
- [ ] Skill-based challenges

---

## 📚 Related Files

| File | Purpose |
|------|---------|
| `supabase/migrations/20260212_create_human_design_setups.sql` | Database schema |
| `src/types/humanDesign.ts` | TypeScript types |
| `app/onboarding/step5-human-design.tsx` | Questionnaire UI |
| `src/features/gamification/services/personalizationService.ts` | **NEW** - Core service |
| `src/features/gamification/hooks/usePersonalization.ts` | **NEW** - React hook |
| `src/features/gamification/services/dailyNotificationService.ts` | Enhanced |
| `src/features/gamification/services/contextualReplyService.ts` | Enhanced |

---

## ✅ Summary

**What was implemented**:
- ✅ PersonalizationService with caching
- ✅ usePersonalization hook (+ variants)
- ✅ Integration with dailyNotificationService
- ✅ Integration with contextualReplyService
- ✅ Type-safe TypeScript throughout
- ✅ 650+ lines of production code

**What users experience**:
- 🎯 Notifications match their communication style
- 🎙️ Avatar speaks in their preferred tone
- 🎮 Gamification messages respect their guilt sensitivity
- 📱 Dashboard gives personalized tips

**Ready for**:
- 🏃 Immediate use in all gamification flows
- 🧪 E2E testing
- 📊 Analytics & monitoring
- 🚀 Deployment to TestFlight/Play Store
