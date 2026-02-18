/**
 * Daily Tips - Conseils saisonniers et généraux pour le soin des plantes
 * Rotation quotidienne basée sur la date
 */

const TIPS = [
  // Arrosage
  ' 💧 Arrosez vos plantes le matin pour laisser le temps au sol de drainer durant la journée.',
  '💧 Les plantes préfèrent l\'eau à température ambiante. Évitez l\'eau froide du robinet.',
  '💧 Vérifiez le sol avant d\'arroser : si le doigt y rentre sur 2 cm, c\'est humide.',

  // Lumière
  '☀️ La plupart des plantes d\'intérieur aiment la lumière indirecte. Éloignez-les du soleil direct.',
  '☀️ Tournez vos plantes chaque semaine pour une croissance uniforme.',
  '☀️ Plus la plante est proche d\'une fenêtre, plus elle reçoit de lumière.',

  // Nutrition
  '🌱 Fertilisez vos plantes une fois par mois durant la période de croissance (printemps/été).',
  '🌱 Les plantes en hiver ont besoin de moins d\'engrais. Réduisez la fréquence.',
  '🌱 Un engrais équilibré (NPK 10-10-10) fonctionne bien pour la plupart des plantes.',

  // Humidité
  '💨 L\'humidité idéale pour la plupart des plantes est entre 50-60%.',
  '💨 Vaporisez le feuillage avec de l\'eau distillée pour augmenter l\'humidité.',
  '💨 Les plantes tropicales aiment l\'humidité. Groupez-les pour créer un micro-climat.',

  // Santé
  '🏥 Inspectez régulièrement vos plantes pour détecter les parasites ou maladies.',
  '🏥 Les feuilles jaunes peuvent indiquer un excès d\'eau ou une carence en azote.',
  '🏥 Rempotez vos plantes chaque 1-2 ans pour renouveler le sol.',

  // Saisons
  '🌸 Le printemps est la meilleure saison pour rempoter et fertiliser.',
  '☀️ L\'été : augmentez les arrosages mais réduisez la lumière directe si possible.',
  '🍂 L\'automne : préparez vos plantes pour l\'hiver en réduisant progressivement les arrosages.',
  '❄️ L\'hiver : beaucoup de plantes dorment. Arrosez moins et ne fertilisez pas.',

  // Conseils généraux
  '🎯 Notez l\'arrosage de vos plantes. L\'observation est la meilleure méthode.',
  '🌿 Chaque plante est unique. Apprenez les préférences spécifiques de la vôtre.',
  '✨ Les plantes saines ont des feuilles brillantes. C\'est un bon indicateur.',
  '🌺 Récompensez votre engagement avec une nouvelle plante chaque mois !',
  '💪 Vous faites du bon travail en prenant soin de vos plantes !',
];

/**
 * Get daily tip based on current date
 * Returns the same tip for all users on the same day
 */
export const getDailyTip = (): string => {
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) /
      (1000 * 60 * 60 * 24)
  );
  const tipsIndex = dayOfYear % TIPS.length;
  return TIPS[tipsIndex];
};

/**
 * Get random tip
 */
export const getRandomTip = (): string => {
  return TIPS[Math.floor(Math.random() * TIPS.length)];
};
