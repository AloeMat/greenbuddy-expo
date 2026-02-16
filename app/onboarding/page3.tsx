import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { useOnboardingStore } from '@onboarding/store/onboardingStore';
import { ProfileChoice } from '@onboarding/components';
import { trackPageView } from '@onboarding/utils/analytics';
import { PROFILES, PAGE_PROGRESS } from '@onboarding/constants/onboardingFlow';

const options = [
  {
    label: PROFILES.actif.label,
    profile: 'actif',
    xp: 5,
    feedback: PROFILES.actif.feedback,
  },
  {
    label: PROFILES.comprehension.label,
    profile: 'comprehension',
    xp: 5,
    feedback: PROFILES.comprehension.feedback,
  },
  {
    label: PROFILES.sensible.label,
    profile: 'sensible',
    xp: 5,
    feedback: PROFILES.sensible.feedback,
  },
  {
    label: PROFILES.libre.label,
    profile: 'libre',
    xp: 5,
    feedback: PROFILES.libre.feedback,
  },
];

export default function Page3() {
  const { setCurrentPage } = useOnboardingStore();

  useEffect(() => {
    trackPageView('page3');
    setCurrentPage('page3');
  }, [setCurrentPage]);

  return (
    <ProfileChoice
      title="Profil énergétique"
      text="Quand vous prenez soin de vos plantes… vous êtes plutôt :"
      options={options}
      progress={PAGE_PROGRESS.page3}
      nextRoute="/onboarding/page3_feedback"
      currentPage="page3"
    />
  );
}
