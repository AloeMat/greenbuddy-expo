import React from 'react';
import {
  isSimplePage,
  isOptionsPage,
  isInputsPage,
  isFeedbackPage,
  isActionsPage,
  isVariantPage,
  OnboardingPage,
} from '@/features/onboarding/types/onboardingSchema';
import { SimplePageRenderer } from './SimplePageRenderer';
import { OptionsRenderer } from './OptionsRenderer';
import { InputsRenderer } from './InputsRenderer';
import { FeedbackRenderer } from './FeedbackRenderer';
import { ActionsRenderer } from './ActionsRenderer';
import { VariantRenderer } from './VariantRenderer';

interface PageRendererProps {
  page: OnboardingPage;
  onNavigate: (nextPageId: string) => void;
}

/**
 * PageRenderer
 *
 * Main router component that detects the type of page and renders the appropriate renderer
 * Uses TypeScript discriminated unions and type guards to ensure type safety
 *
 * Routing logic:
 * 1. Check for 'options' property → OptionsRenderer (page3, page4)
 * 2. Check for 'inputs' property → InputsRenderer (page8)
 * 3. Check for 'auto_advance' property → FeedbackRenderer (page3_feedback, page4_reassurance)
 * 4. Check for 'variants' property → VariantRenderer (page6_dynamic)
 * 5. Check for 'actions' property → ActionsRenderer (page5)
 * 6. Default → SimplePageRenderer (page1, page2)
 *
 * Features:
 * - Type-safe routing using discriminated unions
 * - Exhaustive type checking with TypeScript compiler
 * - Clear error handling for unknown page types
 */
export function PageRenderer({ page, onNavigate }: PageRendererProps) {
  // Options page: Multiple choice selection (page3, page4)
  if (isOptionsPage(page)) {
    return <OptionsRenderer page={page} onNavigate={onNavigate} />;
  }

  // Inputs page: Form with text/select fields (page8)
  if (isInputsPage(page)) {
    return <InputsRenderer page={page} onNavigate={onNavigate} />;
  }

  // Feedback page: Auto-advance after delay (page3_feedback, page4_reassurance)
  if (isFeedbackPage(page)) {
    return <FeedbackRenderer page={page} onNavigate={onNavigate} />;
  }

  // Variant page: Profile-specific text (page6_dynamic)
  if (isVariantPage(page)) {
    return <VariantRenderer page={page} onNavigate={onNavigate} />;
  }

  // Actions page: Multiple action buttons (page5)
  if (isActionsPage(page)) {
    return <ActionsRenderer page={page} onNavigate={onNavigate} />;
  }

  // Simple page: Title + text + buttons (page1, page2)
  if (isSimplePage(page)) {
    return <SimplePageRenderer page={page} onNavigate={onNavigate} />;
  }

  // Fallback: Unknown page type
  const unknownPage = page as unknown as { id: string };
  console.error(`[PageRenderer] Unknown page type for ${unknownPage.id}: ${JSON.stringify(page)}`);
  return null;
}
