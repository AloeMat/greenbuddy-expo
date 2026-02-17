/**
 * OnboardingWizard Type Definitions
 *
 * Complete TypeScript schema for greenbuddy_onboarding_optimized_v2.json
 * Provides type safety for the dynamic onboarding JSON configuration
 */

/**
 * Base interface for all onboarding pages
 * Common properties shared across all page types
 */
export interface OnboardingPageBase {
  id: string;                    // "page1", "page3", "page8", etc.
  title: string;                 // Page title/heading
  text?: string;                 // Page description/body text
  progress: number;              // Progress percentage (5, 10, 20... 100)
  xp?: number;                   // XP reward for completing this page
  badges?: string[];             // Badge IDs unlocked on this page
  next: string;                  // Next page ID or special value ("dashboard")
  note?: string;                 // Additional note/hint for the user
  on_enter?: string[];           // Action scripts to execute when page mounts
}

/**
 * Simple page with title, text, and primary/secondary buttons
 * Examples: page1 (Welcome), page2 (Projection)
 */
export interface SimplePage extends OnboardingPageBase {
  cta_primary: {
    children: string;            // Button text ("Commencer", "Continuer")
    action: string;              // Action type ("go_next", "show_info")
  };
  cta_secondary?: {
    children: string;
    action: string;
  };
  animation?: string;            // Animation type ("plante_respire", "plante_fremit")
}

/**
 * Options page with multiple choice selections
 * User selects one option, triggering actions and feedback
 * Examples: page3 (Profile selection), page4 (Pain point)
 */
export interface OptionsPage extends OnboardingPageBase {
  options: Array<{
    children: string;            // Option label ("🌿 J'agis immédiatement")
    profile?: string;            // Profile value for page3 ("actif", "comprehension", etc.)
    value?: string;              // Generic value for page4 ("oui_une", "plusieurs", "jamais")
    xp: number;                  // XP earned for selecting this option
    feedback: string;            // Feedback message shown in modal
  }>;
  on_select: string[];           // Action scripts executed on selection
                                // Example: ["addXP(option.xp)", "storeProfile(option.profile)"]
}

/**
 * Feedback page that auto-advances after delay
 * Shows confirmation message and animates before moving to next page
 * Examples: page3_feedback (Profile confirmation), page4_reassurance (Reassurance)
 */
export interface FeedbackPage extends OnboardingPageBase {
  animation?: string;            // Animation type ("checkmark_success", "avatar_reassure")
  visual?: string;               // Visual element ("avatar_hand_on_heart")
  auto_advance: number | string; // Auto-advance delay in ms, or event name
                                // Example: 2000 (auto-advance after 2s)
                                // Or: "on_identification_complete"
}

/**
 * Action page with multiple action buttons
 * User can choose between different actions
 * Examples: page5 (Take photo, import gallery, or manual select)
 */
export interface ActionsPage extends OnboardingPageBase {
  actions: Array<{
    type: 'upload_photo' | 'import_gallery' | 'manual_select';
    children: string;            // Button text ("Prendre une photo")
    icon: string;                // Icon name ("camera", "gallery", "search")
  }>;
  on_action_complete: string;    // Action script on completion ("go_next")
}

/**
 * Dynamic page with profile-specific variants
 * Content changes based on user's selected profile
 * Examples: page6_dynamic (First plant greeting adapts to profile)
 */
export interface VariantPage extends OnboardingPageBase {
  variants: {
    default: {
      text: string;              // Default text if no profile matched
      tone: string;              // Tone description ("neutre", "énergique")
    };
    actif?: { text: string; tone: string };
    comprehension?: { text: string; tone: string };
    sensible?: { text: string; tone: string };
    libre?: { text: string; tone: string };
  };
  cta_primary: {
    children: string;
    action: string;
  };
}

/**
 * Input page with dynamic form fields
 * Renders text inputs and select dropdowns dynamically
 * Examples: page8 (Plant name and personality selection)
 */
export interface InputsPage extends OnboardingPageBase {
  inputs: Array<{
    type: 'text' | 'select';
    name: string;                // Input field name ("plantName", "plantPersonality")
    placeholder?: string;        // Placeholder text or label
    required?: boolean;          // Is this field required?
    options?: string[];          // For select type: available options
    default?: string;            // Default value if not provided
  }>;
  on_complete: string[];         // Action scripts on form submission
                                // Example: ["setPlantName(inputs.plantName)", "addXP(5)"]
  cta_primary: {
    children: string;            // Submit button text ("Valider")
    action: string;
  };
}

/**
 * Union type of all possible page types
 * Used for type guards and routing in PageRenderer
 */
export type OnboardingPage =
  | SimplePage
  | OptionsPage
  | InputsPage
  | FeedbackPage
  | ActionsPage
  | VariantPage;

/**
 * Root configuration object
 * Contains metadata and complete onboarding flow
 */
export interface OnboardingConfig {
  meta: {
    version: string;             // "2.0_optimized"
    date: string;                // "2026-02-15"
    changes: string[];           // List of changes from previous version
  };
  onboarding: OnboardingPage[];  // Array of all pages in order
}

/**
 * Type guard functions for discriminated unions
 */
export function isSimplePage(page: OnboardingPage): page is SimplePage {
  return 'cta_primary' in page && !('options' in page) && !('inputs' in page) && !('auto_advance' in page) && !('variants' in page) && !('actions' in page);
}

export function isOptionsPage(page: OnboardingPage): page is OptionsPage {
  return 'options' in page;
}

export function isInputsPage(page: OnboardingPage): page is InputsPage {
  return 'inputs' in page;
}

export function isFeedbackPage(page: OnboardingPage): page is FeedbackPage {
  return 'auto_advance' in page;
}

export function isActionsPage(page: OnboardingPage): page is ActionsPage {
  return 'actions' in page;
}

export function isVariantPage(page: OnboardingPage): page is VariantPage {
  return 'variants' in page;
}

/**
 * Context passed to action executors
 * Contains data needed to resolve variables in action scripts
 */
export interface ActionContext {
  option?: any;                  // Selected option (for page3, page4)
  inputs?: Record<string, any>;  // Form inputs (for page8)
  store: any;                    // Zustand store state
}
