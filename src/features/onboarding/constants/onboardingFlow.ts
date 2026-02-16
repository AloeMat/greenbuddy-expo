/**
 * Onboarding Flow Configuration
 * Maps the JSON spec to app structure
 */

// Page progress mapping (for progress bar)
export const PAGE_PROGRESS = {
  page1: 5,
  page2: 10,
  page3: 20,
  page3_feedback: 25,
  page4: 30,
  page4_reassurance: 35,
  page5: 50,
  page5_identification: 55,
  page6_dynamic: 60,
  page8: 70,
  page8_confirmation: 75,
  page7: 85,
  page9: 90,
  page10: 100,
} as const;

// XP rewards per page
export const XP_REWARDS = {
  page3: 5, // Profile selection
  page4: 5, // Pain point selection
  page5: 5, // Photo selection (before identification)
  page5_identification: 5, // After successful identification
  page6_dynamic: 5, // First words heard
  page8: 5, // Plant naming + personality
  page9: 10, // Account creation
  page10: 5, // Final celebration
  COMPLETION_BONUS: 100, // Total bonus for completing onboarding
} as const;

// Calculate total possible XP
export const TOTAL_POSSIBLE_XP = Object.values(XP_REWARDS).reduce((a, b) => a + b, 0);

// Profile energetics configuration
export const PROFILES = {
  actif: {
    label: '🌿 J\'agis immédiatement',
    feedback:
      'Parfait ! On adapte les alertes à votre style réactif : notifications immédiates quand vos plantes ont besoin de vous.',
    tone: 'énergique',
    voiceSpeed: 1.1,
  },
  comprehension: {
    label: '🌱 J\'aime comprendre avant d\'agir',
    feedback:
      'Super ! On vous donnera des explications détaillées pour chaque action recommandée.',
    tone: 'pédagogique',
    voiceSpeed: 0.9,
  },
  sensible: {
    label: '🌸 J\'observe et je ressens',
    feedback:
      'Génial ! On utilisera un ton doux et bienveillant pour vous accompagner.',
    tone: 'doux',
    voiceSpeed: 1.0,
  },
  libre: {
    label: '🌳 J\'aime décider du moment',
    feedback:
      'Entendu ! On vous suggèrera des actions, mais vous gardez le contrôle du timing.',
    tone: 'neutre',
    voiceSpeed: 1.0,
  },
} as const;

// Pain point configuration
export const PAIN_POINTS = {
  oui_une: {
    label: 'Oui 😔',
    feedback:
      'On comprend cette douleur. Cette fois, on va faire en sorte que ça ne se reproduise plus.',
  },
  plusieurs: {
    label: 'Plusieurs…',
    feedback:
      'On va vous aider à briser ce cycle. Cette fois, vous aurez un guide pour chaque étape.',
  },
  jamais: {
    label: 'Pas encore',
    feedback:
      'Excellent ! On va vous aider à continuer sur cette lancée.',
  },
} as const;

// Page routes mapping
export const PAGE_ROUTES = {
  page1: '/onboarding/page1',
  page2: '/onboarding/page2',
  page3: '/onboarding/page3',
  page3_feedback: '/onboarding/page3_feedback',
  page4: '/onboarding/page4',
  page4_reassurance: '/onboarding/page4_reassurance',
  page5: '/onboarding/page5',
  page5_identification: '/onboarding/page5_identification',
  page6_dynamic: '/onboarding/page6_dynamic',
  page7: '/onboarding/page7',
  page8: '/onboarding/page8',
  page8_confirmation: '/onboarding/page8_confirmation',
  page9: '/onboarding/page9',
  page10: '/onboarding/page10',
  dashboard: '/(tabs)',
} as const;

// Flow sequence
export const FLOW_SEQUENCE = [
  'page1',
  'page2',
  'page3',
  'page3_feedback',
  'page4',
  'page4_reassurance',
  'page5',
  'page5_identification',
  'page6_dynamic',
  'page8',
  'page8_confirmation',
  'page7',
  'page9',
  'page10',
] as const;

export const TOTAL_STEPS = FLOW_SEQUENCE.length;

// Page 6 dynamic variants based on user profile
export const PAGE6_VARIANTS = {
  actif: {
    text: 'Hey ! Je suis ta plante 🌿. On s\'occupe de moi maintenant ?',
    tone: 'énergique',
    emotionState: 'happy' as const,
  },
  comprehension: {
    text: 'Bonjour. Je suis [NOM_ESPÈCE]. Laisse-moi te montrer quelques détails sur mes besoins.',
    tone: 'pédagogique',
    emotionState: 'neutral' as const,
  },
  sensible: {
    text: 'Je suis heureuse que tu sois là. On va prendre soin l\'un de l\'autre. 💚',
    tone: 'doux',
    emotionState: 'happy' as const,
  },
  libre: {
    text: 'Voici mon état actuel. Tu décides du moment idéal pour agir.',
    tone: 'neutre',
    emotionState: 'neutral' as const,
  },
} as const;
