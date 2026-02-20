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
import { TabbedIdentificationRenderer } from './TabbedIdentificationRenderer';
import { VariantRenderer } from './VariantRenderer';
import { IdentificationRenderer } from './IdentificationRenderer';
import { logger } from '@/lib/services/logger';

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
 * 1. Check for page5 ID → TabbedIdentificationRenderer (unified identification: camera, gallery, search)
 * 2. Check for page5_manual_identifying ID → IdentificationRenderer (async plant lookup)
 * 3. Check for 'options' property → OptionsRenderer (page3, page4)
 * 4. Check for 'inputs' property → InputsRenderer (page8)
 * 5. Check for 'auto_advance' property → FeedbackRenderer (page3_feedback, page4_reassurance)
 * 6. Check for 'variants' property → VariantRenderer (page6_dynamic)
 * 7. Check for 'actions' property → ActionsRenderer (fallback for other action pages)
 * 8. Default → SimplePageRenderer (page1, page2)
 *
 * Features:
 * - Type-safe routing using discriminated unions
 * - Exhaustive type checking with TypeScript compiler
 * - Clear error handling for unknown page types
 */
export function PageRenderer({ page, onNavigate }: Readonly<PageRendererProps>) {
  // Tabbed identification page: Unified plant identification (page5)
  const unknownPage = page as unknown as { id: string };
  if (unknownPage.id === 'page5') {
    return <TabbedIdentificationRenderer page={page} onNavigate={onNavigate} />;
  }

  // Identification page: Async plant identification (page5_manual_identifying)
  if (unknownPage.id === 'page5_manual_identifying') {
    return <IdentificationRenderer page={page} onNavigate={onNavigate} />;
  }

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
  logger.error(`[PageRenderer] Unknown page type for ${unknownPage.id}: ${JSON.stringify(page)}`);
  return null;
}
