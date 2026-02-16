# VocalInteraction & AttachmentIndicator Integration Guide

Phase 4.2: Avatar Vocal Enrichi - Screen Integration Patterns

---

## Overview

Two main components for Avatar Vocal:

1. **VocalInteraction** - Avatar speaking with contextual replies
2. **AttachmentIndicator** - Plant attachment phase & progression

---

## VocalInteraction Component

### Props

```typescript
interface VocalInteractionProps {
  // Plant context (required)
  plantId: string;
  plantName: string;
  personality: PlantPersonality;
  plantHealth: number;

  // Timing (required)
  daysSinceWatered: number;
  daysSinceFertilized: number;
  dayWithUser: number;
  temperature?: number;
  humidity?: number;

  // Callbacks
  onReplyComplete?: () => void;
  onMicroActionTriggered?: (action: MicroActionType) => void;
  onAttachmentPhaseChange?: (phase: AttachmentPhase) => void;

  // Options
  autoPlay?: boolean;           // Auto-generate reply on mount
  showAttachmentIndicator?: boolean;
  enableMicroInteractions?: boolean;
  disableSpeech?: boolean;
}
```

### Usage Examples

#### 1. PlantDetail Screen - Full Integration

```typescript
import { VocalInteraction, useAttachment, type PlantPersonality } from '@/features/gamification';

export function PlantDetailScreen({ plantId }: { plantId: string }) {
  const plant = usePlant(plantId);
  const attachment = useAttachment(plantId);
  const [showReply, setShowReply] = useState(false);

  if (!plant || !attachment.state) return <LoadingSpinner />;

  const handleMicroAction = (action: MicroActionType) => {
    // Trigger confetti, water drop animation, etc.
    console.log('Micro-action triggered:', action);
  };

  const handlePhaseChange = (newPhase: AttachmentPhase) => {
    // New phase reached - show celebration?
    showAlert(`${plantName} is now in ${newPhase} phase!`);
  };

  return (
    <ScrollView>
      {/* Plant image */}
      <PlantImage uri={plant.imageUri} />

      {/* Vocal Interaction */}
      {showReply && (
        <VocalInteraction
          plantId={plantId}
          plantName={plant.name}
          personality={plant.personality}
          plantHealth={plant.health}
          daysSinceWatered={plant.daysSinceWatered}
          daysSinceFertilized={plant.daysSinceFertilized}
          dayWithUser={attachment.state.dayWithUser}
          temperature={plant.temperature}
          humidity={plant.humidity}
          onReplyComplete={() => setShowReply(false)}
          onMicroActionTriggered={handleMicroAction}
          onAttachmentPhaseChange={handlePhaseChange}
          autoPlay={true}
          showAttachmentIndicator={true}
          enableMicroInteractions={true}
        />
      )}

      {/* Plant Info & Actions */}
      <PlantInfo plant={plant} />
      <PlantActionButtons
        onWater={async () => {
          await watePlant(plantId);
          await attachment.recordCareAction('water');
        }}
        onFertilize={async () => {
          await fertilizePlant(plantId);
          await attachment.recordCareAction('fertilize');
        }}
        onTalk={() => setShowReply(true)}
      />

      {/* Attachment Indicator (Full) */}
      <AttachmentIndicator
        attachmentState={attachment.state}
        personality={plant.personality}
        compact={false}
        showFeatures={true}
        showMilestone={true}
      />
    </ScrollView>
  );
}
```

#### 2. Dashboard - Compact Usage

```typescript
import { AttachmentIndicator, useAttachment } from '@/features/gamification';

export function DashboardScreen() {
  const plantIds = usePlantIds();
  const attachments = useAttachmentMulti(plantIds);

  return (
    <ScrollView>
      <Text style={styles.title}>Your Garden</Text>

      {plantIds.map(plantId => {
        const plant = usePlant(plantId);
        const attachment = attachments.states[plantId];

        return (
          <View key={plantId} style={styles.plantCard}>
            <PlantImage uri={plant?.imageUri} size="small" />

            {/* Compact Attachment Indicator */}
            {attachment && (
              <AttachmentIndicator
                attachmentState={attachment}
                personality={plant?.personality}
                compact={true}
                showFeatures={false}
                showMilestone={false}
              />
            )}

            <PlantCardActions plantId={plantId} />
          </View>
        );
      })}
    </ScrollView>
  );
}
```

#### 3. Progress Tab - Full Attachment Progress

```typescript
import { AttachmentIndicator, useAttachmentMulti } from '@/features/gamification';

export function ProgressScreen() {
  const plantIds = usePlantIds();
  const attachments = useAttachmentMulti(plantIds);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Plant Progression</Text>

      {/* Attachment Progress for each plant */}
      {plantIds.map(plantId => {
        const plant = usePlant(plantId);
        const attachment = attachments.states[plantId];

        return (
          <View key={plantId} style={styles.section}>
            <Text style={styles.sectionTitle}>{plant?.name}</Text>

            {attachment && (
              <AttachmentIndicator
                attachmentState={attachment}
                personality={plant?.personality}
                compact={false}
                showFeatures={true}
                showMilestone={true}
              />
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}
```

---

## AttachmentIndicator Component

### Props

```typescript
interface AttachmentIndicatorProps {
  attachmentState: AttachmentState;
  personality: PlantPersonality;
  compact?: boolean;           // false = full view
  showFeatures?: boolean;      // Show unlocked features
  showMilestone?: boolean;     // Show next milestone
}
```

### Two Modes

#### Compact Mode (Dashboard)
- Single line with emoji + name + days + score ring
- Progress bar below
- Perfect for cards and summaries

```typescript
<AttachmentIndicator
  attachmentState={state}
  personality="monstera"
  compact={true}
/>
```

#### Full Mode (Detail Pages)
- Phase header with emoji + label + description
- Stats grid (days, care days, interactions)
- Phase progress bar
- Next milestone with countdown
- Unlocked features grid
- Emotional depth indicator

```typescript
<AttachmentIndicator
  attachmentState={state}
  personality="monstera"
  compact={false}
  showFeatures={true}
  showMilestone={true}
/>
```

---

## useAttachment Hook

### Single Plant

```typescript
import { useAttachment } from '@/features/gamification';

function PlantDetailScreen({ plantId }: { plantId: string }) {
  const attachment = useAttachment(plantId);

  if (attachment.isLoading) return <Loading />;
  if (attachment.error) return <Error message={attachment.error.message} />;

  // Record care action
  const handleWater = async () => {
    await attachment.recordCareAction('water');
    // State automatically updates
  };

  // Check if feature is unlocked
  const canViewMemoryAlbum = attachment.isFeatureUnlocked('memory_album');

  // Get attachment status
  const status = {
    phase: attachment.phase,               // 'discovery' | 'familiarity' | 'attachment' | 'companion'
    dayWithUser: attachment.dayWithUser,   // 0-365+
    score: attachment.attachmentScore,     // 0-100
    progress: attachment.phaseProgress,    // 0-100% to next phase
    nextMilestone: attachment.nextMilestone,
  };

  return (
    <>
      <Text>{status.phase} - {status.score}% attachment</Text>
      <Button onPress={handleWater} title="Water" />
    </>
  );
}
```

### Multiple Plants

```typescript
import { useAttachmentMulti } from '@/features/gamification';

function GardenView({ plantIds }: { plantIds: string[] }) {
  const multi = useAttachmentMulti(plantIds);

  // Record action on specific plant
  const handleWaterPlant = async (plantId: string) => {
    await multi.recordCareAction(plantId, 'water');
  };

  // Update all plants daily (call once per app launch)
  useEffect(() => {
    multi.updateAllDaily();
  }, []);

  return (
    <View>
      {Object.entries(multi.states).map(([plantId, state]) => (
        <PlantCard
          key={plantId}
          plant={state}
          onWater={() => handleWaterPlant(plantId)}
        />
      ))}
    </View>
  );
}
```

---

## Integration Checklist

### Per Plant Detail Screen

- [ ] Add `useAttachment(plantId)` hook
- [ ] Render `VocalInteraction` component with plant data
- [ ] Pass `onMicroActionTriggered` callback
- [ ] Pass `onAttachmentPhaseChange` callback
- [ ] Call `attachment.recordCareAction()` on water/fertilize actions
- [ ] Display `AttachmentIndicator` in full mode
- [ ] Handle attachment-gated features based on `isFeatureUnlocked()`

### Per Dashboard/Garden View

- [ ] Add `useAttachmentMulti(plantIds)` hook
- [ ] Render `AttachmentIndicator` in compact mode for each plant
- [ ] Call `multi.updateAllDaily()` on app launch
- [ ] Show attachment score on plant cards
- [ ] Link to detailed view for more info

### Per Progress/Stats Tab

- [ ] Add `useAttachmentMulti(plantIds)` hook
- [ ] Render full `AttachmentIndicator` for each plant
- [ ] Show phase progression visualization
- [ ] List unlocked features by phase
- [ ] Display milestone rewards and next targets

---

## Callback Integration Patterns

### Micro-Action Callback

```typescript
const handleMicroAction = (action: MicroActionType) => {
  // 'water_drop' | 'confetti' | 'shake' | 'dance' | 'shock' | 'fire_pulse' | 'none'

  switch (action) {
    case 'confetti':
      // Trigger confetti animation
      confettiRef.current?.trigger();
      break;
    case 'water_drop':
      // Play water drop animation
      playWaterDropAnimation();
      break;
    case 'fire_pulse':
      // Streak animation
      playFirePulseAnimation();
      break;
    // ... etc
  }
};
```

### Phase Change Callback

```typescript
const handlePhaseChange = (newPhase: AttachmentPhase) => {
  // 'discovery' | 'familiarity' | 'attachment' | 'companion'

  // Show celebration
  showAlert(`🎉 ${plantName} has entered the ${newPhase} phase!`);

  // Award XP/achievement
  unlockPhaseAchievement(newPhase);

  // Refresh UI to show new features
  refresh();
};
```

---

## Feature Unlock Gates

### Check Before Rendering

```typescript
function PlantDetailScreen() {
  const attachment = useAttachment(plantId);

  return (
    <>
      {/* Always visible */}
      <BasicInfo plant={plant} />

      {/* Unlocked after day 8 (familiarity) */}
      {attachment.isFeatureUnlocked('health_insights') && (
        <HealthInsightsPanel />
      )}

      {/* Unlocked after day 31 (attachment) */}
      {attachment.isFeatureUnlocked('growth_tracking') && (
        <GrowthTimeline plant={plant} />
      )}

      {/* Unlocked after day 91 (companion) */}
      {attachment.isFeatureUnlocked('memory_album') && (
        <MemoryAlbum plantId={plantId} />
      )}
    </>
  );
}
```

---

## TTS Integration (Ready for useGoogleTTS)

VocalInteraction component has placeholder for TTS. To integrate with actual TTS:

```typescript
// In VocalInteraction.tsx, update playTTS:

import { useGoogleTTS } from '@/hooks/useGoogleTTS';

export const VocalInteraction: React.FC<VocalInteractionProps> = ({
  ...props
}) => {
  const { speak, isSpeaking } = useGoogleTTS();

  const playTTS = useCallback(async (text: string) => {
    setIsSpeaking(true);
    await speak(text, {
      pitch: profile.voiceSettings.pitch,
      rate: profile.voiceSettings.rate,
    });
    setIsSpeaking(false);
    onReplyComplete?.();
  }, [profile, onReplyComplete]);

  // ... rest of component
};
```

---

## Testing the Integration

### Manual Testing Checklist

- [ ] VocalInteraction generates reply on first open
- [ ] Avatar emotion matches plant health
- [ ] Attachment indicator shows correct phase
- [ ] Water/fertilize updates attachment score
- [ ] Phase transitions trigger callback
- [ ] Feature unlock gates work correctly
- [ ] Attachment persists across app restarts
- [ ] Multi-plant tracking in dashboard
- [ ] Compact vs. full AttachmentIndicator layouts

### E2E Testing

```typescript
// e2e/tests/vocal-interaction.e2e.js

describe('VocalInteraction Integration', () => {
  it('should generate and display plant reply', async () => {
    await element(by.text('Talk to Plant')).multiTap();
    await waitFor(element(by.text(/L'eau/)))
      .toBeVisible()
      .withTimeout(5000);
  });

  it('should update attachment on care action', async () => {
    const initialScore = await getAttachmentScore();
    await element(by.text('Water')).tap();
    const newScore = await getAttachmentScore();
    expect(newScore).toBeGreaterThan(initialScore);
  });

  it('should show phase transition', async () => {
    // Simulate 8 days
    await setDaysWithUser(8);
    await element(by.text('Refresh')).tap();
    await waitFor(element(by.text('Familiarité')))
      .toBeVisible()
      .withTimeout(3000);
  });
});
```

---

## Performance Notes

- **VocalInteraction**: ~100ms render time (Reanimated optimized)
- **AttachmentIndicator**: ~50ms compact, ~150ms full (SVG icons are heavy)
- **useAttachment**: AsyncStorage read ~20ms, write ~15ms
- **useAttachmentMulti**: O(n) where n = plant count

For 10+ plants, consider:
- Virtualizing the list
- Memoizing components with React.memo
- Lazy-loading AttachmentIndicator full view

---

## Next Steps

1. ✅ Components created (Jour 8-10 Part 1)
2. 🔄 Screen integration (Jour 8-10 Part 2) - You are here
3. 📝 Update this guide with real examples from your screens
4. 🧪 E2E testing (Jour 11-12)
5. 📚 Documentation (Jour 13-14)
