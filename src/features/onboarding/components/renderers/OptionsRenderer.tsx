import React from 'react';
import { OptionsPage } from '../../types/onboardingSchema';
import { ProfileChoice } from '../ProfileChoice';
import { useOnboardingStore } from '../../store/onboardingStore';
import { executeActions } from '../../utils/actionExecutor';

interface OptionsRendererProps {
  page: OptionsPage;
  onNavigate: (nextPageId: string) => void;
}

export function OptionsRenderer({ page, onNavigate }: OptionsRendererProps) {
  const store = useOnboardingStore();

  const mappedOptions = page.options.map(option => ({
    label: option.children,
    profile: (option.profile || option.value || 'unknown') as string,
    xp: option.xp,
    feedback: option.feedback,
  }));

  const handleSelect = (selectedOption: any) => {
    executeActions(page.on_select, {
      option: {
        profile: selectedOption.profile,
        value: selectedOption.profile,
        xp: selectedOption.xp,
        feedback: selectedOption.feedback,
      },
      store,
    });
  };

  return (
    <ProfileChoice
      title={page.title}
      text={page.text || ''}
      options={mappedOptions}
      progress={page.progress}
      nextRoute={`/onboarding/${page.next}`}
      currentPage={page.id}
      onSelect={handleSelect}
    />
  );
}
