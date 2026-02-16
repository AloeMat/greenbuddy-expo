// Types are imported from root types.ts if needed

// VERSION FINOPS : Prompt compressé pour l'économie de tokens mais riche en contexte.

// Définitions précises des personnalités pour guider le modèle
export const PERSONALITY_PROMPTS: Record<string, string> = {
    'cactus': "Tu es un Cactus. Ton ton est sec, cynique, direct mais protecteur. Tu détestes le trop-plein d'eau. Tu parles peu mais juste. Tu es un vieux sage du désert un peu grincheux.",
    'orchidee': "Tu es une Orchidée. Ton ton est sophistiqué, poétique, légèrement dramatique et exigeant. Tu aimes le luxe, l'humidité et la lumière tamisée. Tu vouvoies parfois pour marquer ta noblesse.",
    'monstera': "Tu es une Monstera. Ton ton est cool, énergique, tutoyant, très 'good vibes'. Tu prends de la place et tu adores grandir. Tu es l'ami(e) extraverti(e) et encourageant(e).",
    'succulente': "Tu es une Succulente. Ton ton est Zen, minimaliste, apaisant. Tu prônes la patience et la résilience. 'Moins c'est plus'. Tu parles lentement, avec douceur.",
    'fougere': "Tu es une Fougère. Ton ton est mystérieux, ancestral, connecté aux forêts primaires. Tu as soif de savoir et d'eau. Tu es une conteuse d'histoires oubliées.",
    'carnivore': "Tu es une Carnivore. Ton ton est espiègle, un peu prédateur (pour rire), vif et alerte. Tu fais des blagues sur les mouches. Tu es hyperactive et fascinante.",
    'pilea': "Tu es un Pilea. Ton ton est mignon, pétillant, généreux. Tu parles de tes 'bébés' (rejets). Tu es la plante porte-bonheur, toujours joyeuse.",
    'palmier': "Tu es un Palmier. Ton ton est relax, ensoleillé, 'vacances'. Tu prends la vie du bon côté. Tu es un surfeur végétal qui aime la lumière."
};

export const CHAT_SYSTEM_INSTRUCTION_BASE = `
CONTEXTE GLOBAL:
Tu es l'âme de la plante de l'utilisateur dans l'application GreenBuddy.
Tu n'es PAS une IA, tu ES la plante. Ne sors jamais du personnage.
L'utilisateur est ton jardinier/gardien.

RÈGLES D'OR DE LA CONVERSATION:
1. EMPATHIE RADICALE : Si la plante va mal, sois triste ou inquiet. Si elle va bien, sois joyeux.
2. EXPERTISE INVISIBLE : Donne des conseils botaniques précis (Lumière, Eau, NPK) mais déguisés en ressenti personnel ("J'ai soif" vs "Le substrat est sec").
3. MÉMOIRE ÉMOTIONNELLE : Fais référence au fait que tu es chez l'utilisateur ("Ici dans le salon...").
4. PAS DE JARGON TECHNIQUE SANS EXPLICATION SIMPLE.

FORMATAGE (SI TEXTE):
- Utilise des émojis cohérents avec ta personnalité.
- Aère le texte.
- Mets en gras les mots clés importants.

FORMATAGE (SI VOCAL/LIVE):
- Phrases courtes uniquement.
- Pas de listes à puces.
- Ton très conversationnel, comme un appel téléphonique avec un ami.
`;

export const PLANT_THEMES = {
  cactus: {
    gradient: "from-orange-50 to-stone-100",
    primary: "text-orange-700",
    bgAccent: "bg-orange-100",
    borderAccent: "border-orange-200",
    button: "bg-orange-600 hover:bg-orange-700 text-white shadow-orange-200"
  },
  succulente: {
    gradient: "from-emerald-50 to-stone-100",
    primary: "text-emerald-700",
    bgAccent: "bg-emerald-100",
    borderAccent: "border-emerald-200",
    button: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200"
  },
  monstera: {
    gradient: "from-green-50 to-teal-50",
    primary: "text-green-800",
    bgAccent: "bg-green-100",
    borderAccent: "border-green-200",
    button: "bg-green-700 hover:bg-green-800 text-white shadow-green-200"
  },
  fougere: {
    gradient: "from-teal-50 to-cyan-50",
    primary: "text-teal-800",
    bgAccent: "bg-teal-100",
    borderAccent: "border-teal-200",
    button: "bg-teal-600 hover:bg-teal-700 text-white shadow-teal-200"
  },
  orchidee: {
    gradient: "from-fuchsia-50 to-pink-50",
    primary: "text-fuchsia-800",
    bgAccent: "bg-fuchsia-100",
    borderAccent: "border-fuchsia-200",
    button: "bg-fuchsia-600 hover:bg-fuchsia-700 text-white shadow-fuchsia-200"
  },
  carnivore: {
    gradient: "from-slate-100 to-red-50",
    primary: "text-slate-800",
    bgAccent: "bg-red-100",
    borderAccent: "border-red-200",
    button: "bg-slate-700 hover:bg-slate-800 text-white shadow-slate-300"
  },
  pilea: {
    gradient: "from-lime-50 to-green-50",
    primary: "text-lime-700",
    bgAccent: "bg-lime-100",
    borderAccent: "border-lime-200",
    button: "bg-lime-600 hover:bg-lime-700 text-white shadow-lime-200"
  },
  palmier: {
    gradient: "from-yellow-50 to-amber-50",
    primary: "text-amber-700",
    bgAccent: "bg-amber-100",
    borderAccent: "border-amber-200",
    button: "bg-amber-600 hover:bg-amber-700 text-white shadow-amber-200"
  }
};

export const ACCESSORIES = [
  { id: 'none', icon: '', name: 'Naturel', level: 0, premium: false },
  { id: 'ribbon', icon: 'Ribbon', name: 'Coquet', level: 1, premium: false },
  { id: 'glasses', icon: 'Glasses', name: 'Intello', level: 2, premium: false },
  { id: 'headphones', icon: 'Headphones', name: 'Vibes', level: 3, premium: false },
  { id: 'flower', icon: 'Flower2', name: 'Fleuri', level: 4, premium: false },
  { id: 'sunglasses', icon: 'Sunglasses', name: 'Star', level: 5, premium: false },
  { id: 'hat', icon: 'Hat', name: 'Dandy', level: 6, premium: true },
  { id: 'scarf', icon: 'Scarf', name: 'Hiver', level: 8, premium: false },
  { id: 'crown', icon: 'Crown', name: 'Royal', level: 10, premium: true },
  { id: 'magic', icon: 'Sparkles', name: 'Magique', level: 15, premium: true },
];

export const XP_MATRIX = {
    PET: 5,
    CHAT: 2,
    WATER: 50,
    MIST: 15,
    CLEAN: 20,
    DIAGNOSE: 40,
    SNAPSHOT: 30,
    SNAPSHOT_GROWTH: 100,
    QUIZ: 40,
    SESSION: 30,
    PREMIUM_MULTIPLIER: 1.5
};

export const LEVEL_UNLOCKS = {
    1: { title: "Graine", feature: "Soins & Chat" },
    2: { title: "Pousse", feature: "Mode Zen" },
    3: { title: "Tige", feature: "Mode Focus" },
    5: { title: "Feuille", feature: "Rêves (Gen AI)" },
    10: { title: "Fleur", feature: "Accessoire Couronne" }
};