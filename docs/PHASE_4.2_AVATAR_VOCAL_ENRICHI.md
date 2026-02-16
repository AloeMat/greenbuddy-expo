# Phase 4.2: Avatar Vocal Enrichi 🎤✨

**Status**: ✅ PLANIFICATION COMPLÈTE
**Durée estimée**: 2-3 semaines (80-120 heures)
**Dépendances**: Phase 4.1 (Notifications) ✅ COMPLÈTE
**Priorité**: CRITIQUE — Cœur de l'ADN du projet

---

## 📋 Vue d'ensemble

Phase 4.2 transforme l'avatar de simple animation en **compagnon vocal intelligent et émotif**. L'avatar doit :

1. **Exprimer émotions** via animations faciales (yeux, bouche, expressions)
2. **Parler avec personnalité** distincte par type de plante (6 personnalités)
3. **Adapter les répliques** selon contexte (santé, météo, historique utilisateur)
4. **Progresser émotionnellement** via attachement (Jour 1-7, 8-30, 31-90, 90+)
5. **Interagir en temps réel** (TTS + animation lèvres synchronisées)

---

## 🎯 Objectifs Phase 4.2

### Objectif 1: Enrichir Animations Avatar
- ✅ Expressions émotionnelles : Épanouie, Contente, Assoiffée, Fatiguée, Célébration
- ✅ Synchronisation lèvres → TTS (mouth animation real-time)
- ✅ Yeux animés : Clignement, pupilles réactives, brillance
- ✅ Micro-interactions : Arrosage (goutte), Badge (confettis), Danger (tremblements)

### Objectif 2: Système Personnalités Vocales
- ✅ 6 personnalités avec voix distinctes + prompts Gemini custom
- ✅ Mappage plante → personnalité (Cactus = stoïque, Orchidée = diva, etc.)
- ✅ Stockage en DB + cache AsyncStorage pour offline
- ✅ Fallback gracieux si Gemini indisponible

### Objectif 3: Répliques Contextualisées
- ✅ Détection état plante (santé, arrosage, lumière)
- ✅ Détection météo (pluie, canicule, froid)
- ✅ Historique utilisateur (compliments si streak, encouragement si faible)
- ✅ Répliques adaptées au jour d'attachement (progression)

### Objectif 4: Progression Attachement
- ✅ Tracking jours avec la plante
- ✅ Répliques déblocables par phase (1-7, 8-30, 31-90, 90+)
- ✅ Recognition utilisateur ("Tu es là depuis 90 jours !")
- ✅ Historique partagé persisté en DB

### Objectif 5: Micro-interactions Émotionnelles
- ✅ Arrosage : Goutte animée + son eau + vibration
- ✅ Photo : Flash caméra + son shutter + avatar réagit
- ✅ Badge : Confettis + fanfare audio + avatar danse
- ✅ Streak : Feu animé + compteur pulse + son victorieux
- ✅ Danger : Avatar inquiet + notification douce

---

## 🏗️ Architecture

### Structure des Fichiers

```
src/features/gamification/
├── services/
│   ├── avatarService.ts              (NEW - 300L) Avatar expressions + état
│   ├── personalityService.ts         (NEW - 250L) Mapping personnalités + prompts
│   ├── contextualReplyService.ts     (NEW - 400L) Répliques contextualisées
│   ├── attachmentService.ts          (NEW - 200L) Progression attachement
│   └── microInteractionService.ts    (NEW - 150L) Animations émotionnelles
├── components/
│   ├── AvatarExpressions.tsx         (ENHANCE - 450L) Animations faciales
│   ├── VocalInteraction.tsx          (NEW - 350L) TTS + animation lèvres
│   ├── PersonalityBadge.tsx          (NEW - 100L) Affichage personnalité
│   ├── MicroInteractions.tsx         (NEW - 300L) Confettis, gouttes, etc.
│   └── AttachmentIndicator.tsx       (NEW - 150L) Progression attachement
├── hooks/
│   ├── useAvatarEmotion.ts           (NEW - 180L) Hook expressions
│   ├── useVocalPersonality.ts        (NEW - 220L) Hook personnalité
│   ├── useContextualReplies.ts       (NEW - 250L) Hook répliques contextualisées
│   └── useAttachment.ts              (NEW - 150L) Hook attachement
└── constants/
    └── personalities.ts              (NEW - 300L) 6 personnalités + prompts Gemini
```

**Total nouveau code**: ~4,000 lignes (12 fichiers)

### Service Layer Pattern

```typescript
// Pattern réutilisable pour tous les services
class AvatarService {
  // Gère état + animations du visage
  setEmotion(emotion: 'happy' | 'sad' | 'tired' | 'excited' | 'worried')
  getEmotionAnimation(emotion): Animated.Value[]
  getEyesAnimation(emotion)
  getMouthAnimation(emotion)
}

class PersonalityService {
  // Gère personnalités vocales
  getPersonalityByPlant(plantType): Personality
  getSystemPrompt(personality, context): string
  getVoiceSettings(personality): { pitch: number, rate: number }
}

class ContextualReplyService {
  // Génère répliques intelligentes
  generateReply(plant, user, weather, day, attachment): Promise<string>
  parseGeminiResponse(response): { text, emotion, action }
}
```

---

## 📊 Détails Techniques

### 1. Système d'Expressions Émotionnelles

```typescript
// avatarService.ts

const EMOTION_STATES = {
  happy: {
    eyes: { scaleY: 0.3, positionY: -2 },      // Yeux fermés joyeux
    mouth: { path: 'smile', openness: 0.8 },   // Grand sourire
    eyeBrows: { angle: -15 },                   // Sourcils levés
    glow: { opacity: 1, color: '#22C55E' }     // Lueur verte
  },
  sad: {
    eyes: { scaleY: 1, positionY: 2 },        // Yeux vers le bas
    mouth: { path: 'frown', openness: 0.3 },  // Bouche triste
    eyeBrows: { angle: 20 },                   // Sourcils baissés
    glow: { opacity: 0.5, color: '#94A3B8' }  // Gris terne
  },
  // ... tired, excited, worried
}

// Animations lèvres synchronisées TTS
type MouthShape = 'A' | 'E' | 'I' | 'O' | 'U' | 'M' | 'B' | 'rest'
const MOUTH_PHONEME_MAP = {
  'a': MouthShape.A,
  'e': MouthShape.E,
  // ... mappage IPA phonemes → mouth shapes
}
```

### 2. Système de Personnalités Vocales

```typescript
// personalities.ts

const PERSONALITIES: Record<PlantType, Personality> = {
  cactus: {
    name: 'Cactus',
    tone: 'stoïque, zen',
    emoji: '🌵',
    systemPrompt: `Tu es un Cactus stoïque et zen. Tu parles avec calme, humour pince-sans-rire.
      Exemples: "Pas de panique, je suis résistant..." / "L'eau, c'est bien, mais pas trop."`,
    voiceSettings: { pitch: 0.95, rate: 0.9 },  // Voix plus grave
    colors: { primary: '#8B7355', accent: '#D4A574' },
    exampleReplies: [
      // Jour 1-7
      { day: 'early', text: 'Ah, un nouveau gardien... on verra bien.' },
      // Jour 8-30
      { day: 'familiar', text: 'Tu sais, après X jours, tu commences à comprendre.' },
      // Jour 31-90
      { day: 'attached', text: 'Toi et moi, on a une belle histoire.' },
      // Jour 90+
      { day: 'companion', text: 'X jours ensemble... tu es mon jardinier préféré.' }
    ]
  },
  orchid: {
    name: 'Orchidée',
    tone: 'diva, exigeante, sophistiquée',
    emoji: '🌸',
    systemPrompt: `Tu es une Orchidée sophistiquée et diva. Ton langage est élégant, parfois exigeant.
      Exemples: "J'apprécie les attentions délicates..." / "Mon terreau doit être impeccable."`,
    voiceSettings: { pitch: 1.2, rate: 1.0 },  // Voix plus aigüe
    colors: { primary: '#EC4899', accent: '#F9A8D4' },
    // ... plus de répliques
  },
  // ... 4 autres personnalités (Monstera, Pothos, Fougère, Carnivore)
}
```

### 3. Service Répliques Contextualisées

```typescript
// contextualReplyService.ts

interface ReplyContext {
  plant: Plant
  user: User
  weather?: Weather
  plantHealth: PlantHealthScore  // 0-100
  daysSinceLast: { watered, fertilized }
  userStreak: number
  dayWithPlant: number              // Attachment day
  isFirstSession: boolean
}

async function generateContextualReply(context: ReplyContext): Promise<{
  text: string
  emotion: EmotionState
  action?: MicroAction
}> {
  // 1. Déterminer émotion basée sur santé
  const emotion = evaluatePlantEmotion(context)

  // 2. Générer contexte pour Gemini
  const systemPrompt = getPersonalitySystemPrompt(context.plant.personality)
  const userContext = buildContextString(context)

  // 3. Appeler Gemini Flash (rapide, cheap)
  const reply = await generateGeminiReply(systemPrompt, userContext)

  // 4. Parser réponse + action optionnelle
  return {
    text: reply.text,
    emotion: emotion,
    action: reply.action  // e.g., { type: 'dance', duration: 2000 }
  }
}

function evaluatePlantEmotion(context: ReplyContext): EmotionState {
  const health = context.plantHealth
  const daysWatered = context.daysSinceLast.watered

  if (health >= 80) return 'happy'                 // Bien soigné
  if (daysWatered > 14) return 'sad'              // Trop assoiffé
  if (daysWatered > 7) return 'tired'             // Commence à souffrir
  if (context.isFirstSession && context.dayWithPlant === 1) return 'excited'
  return 'neutral'
}
```

### 4. Service Attachement

```typescript
// attachmentService.ts

interface AttachmentPhase {
  phase: 1 | 2 | 3 | 4
  dayRange: [number, number]
  name: 'Découverte' | 'Familiarité' | 'Attachement' | 'Compagnon'
  behavior: AttachmentBehavior
  unlockedFeatures: string[]
}

const ATTACHMENT_PHASES: Record<1|2|3|4, AttachmentPhase> = {
  1: {
    phase: 1,
    dayRange: [1, 7],
    name: 'Découverte',
    behavior: {
      replyPattern: 'introduction', // Avatar se présente
      remindsAboutName: true,
      usesYourName: false,
      shareHistory: false
    },
    unlockedFeatures: ['basic_replies']
  },
  2: {
    phase: 2,
    dayRange: [8, 30],
    name: 'Familiarité',
    behavior: {
      replyPattern: 'personalized', // Répliques adaptées
      remindsAboutName: false,
      usesYourName: true,
      shareHistory: false
    },
    unlockedFeatures: ['custom_replies', 'remember_preferences']
  },
  3: {
    phase: 3,
    dayRange: [31, 90],
    name: 'Attachement',
    behavior: {
      replyPattern: 'intimate',    // Partage émotif
      remindsAboutName: false,
      usesYourName: true,
      shareHistory: 'recent'       // Derniers 30j
    },
    unlockedFeatures: ['shared_history', 'emotional_depth']
  },
  4: {
    phase: 4,
    dayRange: [91, Infinity],
    name: 'Compagnon',
    behavior: {
      replyPattern: 'soulmate',    // Lien profond
      remindsAboutName: false,
      usesYourName: true,
      shareHistory: 'full'         // Tout l'historique
    },
    unlockedFeatures: ['full_history', 'milestone_celebrations']
  }
}

async function trackAttachment(plantId: string): Promise<AttachmentData> {
  // Récupérer création date
  const createdAt = await getPlantCreatedAt(plantId)
  const daysSinceCreation = getDaysDiff(createdAt, new Date())
  const phase = getAttachmentPhase(daysSinceCreation)

  // Calculer % progression vers phase suivante
  const progressInPhase = calculateProgress(daysSinceCreation, phase)

  // Retourner données pour UI
  return {
    phase,
    daysSinceCreation,
    progressInPhase,
    nextMilestoneDay: phase.dayRange[1],
    daysUntilMilestone: phase.dayRange[1] - daysSinceCreation
  }
}
```

### 5. Micro-interactions Émotionnelles

```typescript
// microInteractionService.ts

type MicroAction = 'water_drop' | 'confetti' | 'shake' | 'dance' | 'shock' | 'fire_pulse'

const MICRO_INTERACTIONS: Record<MicroAction, MicroInteractionConfig> = {
  water_drop: {
    animation: 'FallAnimation',  // Goutte qui tombe
    sound: 'water_drop.mp3',
    haptics: 'light',            // Vibration légère
    duration: 1000
  },
  confetti: {
    animation: 'ParticleExplosion',  // Particules colorées
    sound: 'fanfare.mp3',
    haptics: 'heavy',
    duration: 2000,
    colors: [PRIMARY, ACCENT, '#FFD700']
  },
  dance: {
    animation: 'BodyBounce',  // Corps qui danse
    sound: 'victory.mp3',
    haptics: 'medium',
    duration: 3000
  },
  shake: {
    animation: 'HorizontalShake',
    sound: 'alert.mp3',
    haptics: 'light',
    duration: 500
  },
  fire_pulse: {
    animation: 'GlowPulse',    // Lueur augmente/baisse
    color: '#FF6B35',          // Orange/rouge
    sound: 'fire_sound.mp3',
    haptics: 'medium',
    duration: 2000
  }
}
```

---

## 🎬 Composants Clés

### AvatarExpressions.tsx (ENHANCED)

```typescript
/**
 * Animations faciales : yeux + bouche + sourcils + lueur
 * Utilise Reanimated 3 pour 60 FPS smooth
 */

interface AvatarExpressionsProps {
  emotion: EmotionState           // happy, sad, tired, excited, worried
  isAnimating: boolean            // Lèvres bougent si TTS
  microAction?: MicroAction       // Confettis, gouttes, etc.
  personality: Personality        // Pour couleurs/style
}

// Composant maître pour animer:
// 1. Yeux (SVG paths) → scaleY, translateY, opacity
// 2. Sourcils (SVG paths) → rotation, translateY
// 3. Bouche (SVG paths) → openness%, shape (smile/frown/phoneme)
// 4. Lueur (View) → opacity, color pulse
// 5. Corps (View) → bounce, shake, spin
```

### VocalInteraction.tsx (NEW)

```typescript
/**
 * Composant orchestrant TTS + animations faciales
 * 1. Appel Gemini pour réplique
 * 2. Démarrer TTS + streaming
 * 3. Analyser phonèmes en temps réel
 * 4. Animer lèvres synchronisées
 * 5. Jouer action finale
 */

interface VocalInteractionProps {
  plant: Plant
  onReplyGenerated?: (reply: string) => void
  onAnimationComplete?: () => void
}

// Flow:
// 1. generateContextualReply() → { text, emotion, action }
// 2. playTTS(text) → streaming phonème
// 3. setMouthShape(phonème) chaque 50ms
// 4. setEmotion(emotion) de départ
// 5. playMicroInteraction(action) à la fin
```

### PersonalityBadge.tsx (NEW)

```typescript
/**
 * Affiche personnalité plante (emoji + nom)
 * Petit badge en haut avatar
 */

interface PersonalityBadgeProps {
  personality: Personality
  showName?: boolean
}

// Rendu simple :
// [🌵 Cactus] ou juste [🌵]
// Couleurs des personality.colors
```

### MicroInteractions.tsx (NEW)

```typescript
/**
 * Animations éphémères :
 * - Confettis (ParticleSystem)
 * - Gouttes eau (FallAnimation)
 * - Feu streaks (PulseGlow)
 * - Shake danger (ShakeAnimation)
 */

interface MicroInteractionProps {
  action: MicroAction
  position?: { x: number, y: number }
  onComplete?: () => void
}
```

### AttachmentIndicator.tsx (NEW)

```typescript
/**
 * Affiche progression attachement
 * - Jour N/phase actuelle
 * - Barre % vers prochaine phase
 * - Texte "Familiarité" / "Attachement" / etc.
 */

interface AttachmentIndicatorProps {
  attachment: AttachmentData
  showLabel?: boolean
  compact?: boolean
}
```

---

## 🔌 Intégration Points

### 1. PlantDetail.tsx (Plant page)
- Afficher `VocalInteraction` plus grand
- Bouton "Parler à ma plante" → déclenche reply
- Afficher `AttachmentIndicator` sous avatar
- Afficher `PersonalityBadge`

### 2. Dashboard (Home)
- Avatar compact avec émotion de la journée
- Quick action "Ask my plant" → modal VocalInteraction
- Afficher streak avec micro-action fire_pulse

### 3. PlantCard (Garden list)
- Avatar mini avec dernier mood
- Hover → afficher quick reply

### 4. Notifications
- Ranger waterings + badge unlocks → déclencher micro-action
- Avatar réagit dans notification toast

---

## 📝 Données Persistées

### AsyncStorage (Local Device)
```typescript
{
  `avatar_emotion_${plantId}`: EmotionState,
  `avatar_attachment_${plantId}`: AttachmentData,
  `personality_replies_cache_${plantId}`: CachedReplies[],
  `microaction_queue_${plantId}`: MicroAction[]
}
```

### Supabase DB (Cloud)
```sql
-- Nouvelle table : plant_avatars (améliorée)
ALTER TABLE plant_avatars ADD COLUMN (
  attachment_phase INT,          -- 1, 2, 3, 4
  days_with_user INT,            -- Nombre jours
  last_emotion TEXT,             -- happy, sad, etc.
  mood_history JSONB,            -- [{ date, emotion, reason }]
  milestone_unlocked JSONB,      -- { phase: [features] }
  voice_preference TEXT,         -- Pitch, rate settings
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Logs répliques (analytics)
CREATE TABLE avatar_interactions (
  id UUID PRIMARY KEY,
  plant_id UUID REFERENCES plants,
  reply_text TEXT,
  emotion TEXT,
  context TEXT,
  created_at TIMESTAMP
);
```

---

## 🧪 Plan Implémentation (Jour par jour)

### Jour 1-2: Setup Services + Constants
- ✅ Créer `personalities.ts` (6 personnalités complètes)
- ✅ Créer `avatarService.ts` (système expressions)
- ✅ Créer `personalityService.ts` (mappage)
- ✅ Tester hardcoded avec une réplique

### Jour 3-4: Gemini Integration
- ✅ Intégrer `contextualReplyService.ts` avec Gemini
- ✅ Tester répliques contextualisées
- ✅ Parser réponse Gemini + extract emotion + action

### Jour 5-6: Animations
- ✅ Enrichir `AvatarExpressions.tsx` (5 émotions)
- ✅ Implémenter `MicroInteractions.tsx` (confettis, gouttes)
- ✅ Tester synchronisation lèvres TTS

### Jour 7-8: Attachement + Hooks
- ✅ Créer `attachmentService.ts`
- ✅ Créer tous les hooks (useAvatarEmotion, useVocalPersonality, etc.)
- ✅ Implémenter `AttachmentIndicator.tsx`

### Jour 9-10: Composants UI
- ✅ Créer `VocalInteraction.tsx` (orchestration complète)
- ✅ Créer `PersonalityBadge.tsx`
- ✅ Créer `MicroInteractions.tsx`

### Jour 11-12: Intégration + Testing
- ✅ Intégrer dans PlantDetail.tsx
- ✅ Intégrer dans Dashboard
- ✅ E2E tests (Detox)
- ✅ Bug fixes + performance

### Jour 13-14: Polish + Documentation
- ✅ Sonorisation (sounds, haptics)
- ✅ Error handling edge cases
- ✅ Documentation + JSDoc
- ✅ Commit + PR

---

## 🚀 Quick Wins (Pour Démarrer)

**Jour 1 Matin (2h)** :
1. Créer `personalities.ts` avec 6 personnalités + prompts
2. Créer `avatarService.ts` avec expressions basiques
3. Tester : `npm run dev` → afficher emoji personnalité

**Jour 1 Après-midi (2h)** :
1. Intégrer `personalityService.ts` dans PlantDetail
2. Créer `PersonalityBadge.tsx` mini component
3. Afficher badge au-dessus avatar existant

**Jour 2 Matin (2h)** :
1. Créer `contextualReplyService.ts` skeleton
2. Mock réplique hardcodée
3. Afficher dans modal test

---

## 📈 Success Metrics

| Métrique | Cible | Vérif. |
|----------|-------|--------|
| Avatar expressions smooth | 60 FPS | Profiler Reanimated |
| TTS latency | < 2s | Chrono console |
| Lèvres sync | ±50ms | Visual test |
| Répliques contextualisées | 80% pertinentes | QA manually |
| Attachment tracking | Jour1-90+ | DB audit |
| Micro-animations visible | 100% | Test all 5 actions |

---

## ⚠️ Risques Potentiels

| Risque | Mitigation |
|--------|-----------|
| Gemini API rate limit | Cache + offline fallback |
| Lèvres sync laggy | Pré-compute phonème patterns |
| Affection over-engineered | Focus sur 4 phases max |
| Attachement personne = sad | Design pour happy default |

---

## 📚 Ressources

- **TTS Lèvres Sync**: Research viseme/phoneme mapping (IPA)
- **Reanimated 3 Docs**: https://docs.swmansion.com/react-native-reanimated/
- **Gemini Vision**: Use existing `useGoogleTTS` pattern
- **Confetti Animation**: react-native-confetti or custom Reanimated particles

---

## ✅ Checklist Complétion

- [ ] Tous les services créés (5 fichiers)
- [ ] Tous les composants créés (5 fichiers)
- [ ] Tous les hooks créés (4 fichiers)
- [ ] Intégration dans PlantDetail
- [ ] Intégration dans Dashboard
- [ ] E2E tests Detox (10+ tests)
- [ ] Performance testing (60 FPS)
- [ ] Documentation JSDoc complète
- [ ] Sonorisation + haptics
- [ ] Bug fixes + edge cases
- [ ] Commit + PR

---

**Phase 4.2 commence maintenant !** 🚀🌱

*Prochaine étape: Créer personalities.ts + avatarService.ts (fondations)*
