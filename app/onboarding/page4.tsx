import React, { useEffect } from 'react';
import { View } from 'react-native';
import { useOnboardingStore } from '@onboarding/store/onboardingStore';
import { OptionCard } from '@onboarding/components';
import { trackPageView } from '@onboarding/utils/analytics';
import { PAIN_POINTS, PAGE_PROGRESS } from '@onboarding/constants/onboardingFlow';

interface Option {
  label: string;
  value: string;
  xp: number;
  feedback: string;
}

const options: Option[] = [
  {
    label: PAIN_POINTS.oui_une.label,
    value: 'oui_une',
    xp: 5,
    feedback: PAIN_POINTS.oui_une.feedback,
  },
  {
    label: PAIN_POINTS.plusieurs.label,
    value: 'plusieurs',
    xp: 5,
    feedback: PAIN_POINTS.plusieurs.feedback,
  },
  {
    label: PAIN_POINTS.jamais.label,
    value: 'jamais',
    xp: 5,
    feedback: PAIN_POINTS.jamais.feedback,
  },
];

export default function Page4() {
  const { setCurrentPage, setPainPoint, addXP, markPageComplete } = useOnboardingStore();

  useEffect(() => {
    trackPageView('page4');
    setCurrentPage('page4');
  }, [setCurrentPage]);

  const handleSelect = (option: Option) => {
    setPainPoint(option.value);
    addXP(option.xp);
    markPageComplete('page4');
  };

  return (
    <OptionCard
      title="Douleur personnelle"
      text="Soyons honnêtes… avez-vous déjà perdu une plante ?"
      options={options}
      progress={PAGE_PROGRESS.page4}
      nextRoute="/onboarding/page4_reassurance"
      currentPage="page4"
      onSelect={handleSelect}
    />
  );
}
