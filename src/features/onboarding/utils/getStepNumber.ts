/**
 * Get step number from page ID
 *
 * Maps page IDs to sequential step numbers for progress display
 * Examples:
 * - "page1" → 1
 * - "page3_feedback" → 3
 * - "page10" → 14 (total steps)
 */

const PAGE_TO_STEP: Record<string, number> = {
  // Simple pages
  page1: 1,
  page2: 2,
  // Profile selection
  page3: 3,
  page3_feedback: 3, // Same step, auto-advance
  // Pain point
  page4: 4,
  page4_reassurance: 4, // Same step, auto-advance
  // Camera
  page5: 5,
  page5_identification: 5, // Same step, identification
  // Dynamic greeting
  page6_dynamic: 6,
  // Care plan
  page7: 7,
  // Plant naming
  page8: 8,
  page8_confirmation: 8, // Same step, auto-advance
  // Account
  page9_account_prompt: 9,
  // Welcome
  page10_welcome: 10,
};

const TOTAL_STEPS = 10;

/**
 * Get step number for a given page ID
 * Returns step 1-10 for progress display
 *
 * @param pageId - Page ID from config
 * @returns Step number (1-10), defaults to 1 if not found
 */
export function getStepNumber(pageId: string): number {
  return PAGE_TO_STEP[pageId] || 1;
}

/**
 * Get total number of steps
 */
export function getTotalSteps(): number {
  return TOTAL_STEPS;
}
