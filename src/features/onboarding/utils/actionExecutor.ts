/**
 * OnboardingWizard Action Executor
 *
 * Parses and executes scripted actions from JSON configuration
 * Examples:
 * - "addXP(5)" → calls store.addXP(5)
 * - "storeProfile(option.profile)" → calls store.setUserProfile(option.profile)
 * - "setPlantName(inputs.plantName)" → calls store.setPlantName(inputs.plantName)
 *
 * Supports:
 * - Number literals: 5, 2000
 * - String literals: 'actif', 'zen'
 * - Variable resolution: option.xp, inputs.plantName
 */

export interface ActionContext {
  option?: any;                  // Selected option (page3, page4)
  inputs?: Record<string, any>;  // Form inputs (page8)
  store: any;                    // Zustand store (useOnboardingStore.getState())
}

/**
 * Parse function arguments with context variable resolution
 *
 * Examples:
 * - "5" → 5
 * - "'actif'" → "actif"
 * - "option.xp" → 5 (from context.option.xp)
 * - "inputs.plantName" → "Buddy" (from context.inputs.plantName)
 *
 * @param argsString - Raw argument string from action script
 * @param context - Action execution context
 * @returns Array of parsed argument values
 */
function parseArguments(argsString: string, context: ActionContext): any[] {
  if (!argsString.trim()) {
    return [];
  }

  return argsString.split(',').map(arg => {
    const trimmed = arg.trim();

    // String literal: 'value' or "value"
    if (trimmed.startsWith("'") && trimmed.endsWith("'")) {
      return trimmed.slice(1, -1);
    }
    if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
      return trimmed.slice(1, -1);
    }

    // Number literal: 5, 2000, etc.
    if (/^\d+$/.test(trimmed)) {
      return parseInt(trimmed, 10);
    }

    // Context variable: option.xp, inputs.plantName
    if (trimmed.includes('.')) {
      const [obj, ...keyParts] = trimmed.split('.');
      const key = keyParts.join('.');

      if (obj === 'option' && context.option) {
        return context.option[key];
      }

      if (obj === 'inputs' && context.inputs) {
        return context.inputs[key];
      }

      // If not found, return undefined
      return undefined;
    }

    // Fallback: return as-is
    return trimmed;
  });
}

/**
 * Execute a single action script
 *
 * Parses the action string, resolves variables, and calls the appropriate
 * store method. Logs warnings for unknown actions.
 *
 * @param actionScript - Action string to execute
 * @param context - Action execution context
 *
 * @example
 * executeAction("addXP(5)", { store });
 * executeAction("storeProfile(option.profile)", { option: { profile: "actif" }, store });
 */
export function executeAction(
  actionScript: string,
  context: ActionContext
): void {
  if (!actionScript || !actionScript.trim()) {
    return;
  }

  // Parse function call: functionName(args)
  const match = actionScript.match(/^(\w+)\(([^)]*)\)$/);

  if (!match) {
    console.warn(`[ActionExecutor] Invalid action script: ${actionScript}`);
    return;
  }

  const [, functionName, argsString] = match;
  const args = parseArguments(argsString, context);

  // Log action execution in development
  if (__DEV__) {
    console.log(`[ActionExecutor] Executing: ${functionName}(${args.join(', ')})`);
  }

  // Execute action based on function name
  switch (functionName) {
    case 'addXP': {
      const xpAmount = args[0];
      if (typeof xpAmount === 'number') {
        context.store.addXP(xpAmount);
      } else {
        console.warn(`[ActionExecutor] addXP: Expected number, got ${typeof xpAmount}`);
      }
      break;
    }

    case 'storeProfile': {
      const profile = args[0];
      if (typeof profile === 'string') {
        context.store.setUserProfile(profile);
      } else {
        console.warn(`[ActionExecutor] storeProfile: Expected string, got ${typeof profile}`);
      }
      break;
    }

    case 'storePainPoint': {
      const painPoint = args[0];
      if (typeof painPoint === 'string') {
        context.store.setPainPoint(painPoint);
      } else {
        console.warn(`[ActionExecutor] storePainPoint: Expected string, got ${typeof painPoint}`);
      }
      break;
    }

    case 'setPlantName': {
      const plantName = args[0];
      if (typeof plantName === 'string') {
        context.store.setPlantName(plantName);
      } else {
        console.warn(`[ActionExecutor] setPlantName: Expected string, got ${typeof plantName}`);
      }
      break;
    }

    case 'setPlantPersonality': {
      const personality = args[0];
      if (typeof personality === 'string') {
        context.store.setPlantPersonality(personality);
      } else {
        console.warn(`[ActionExecutor] setPlantPersonality: Expected string, got ${typeof personality}`);
      }
      break;
    }

    case 'showFeedback': {
      // Placeholder for now - actual implementation handled by renderer
      const feedback = args[0];
      const delay = args[1];
      if (__DEV__) {
        console.log(`[ActionExecutor] showFeedback: "${feedback}" (delay: ${delay}ms)`);
      }
      break;
    }

    case 'animatePlant':
    case 'animateSuccess':
    case 'animateAvatar': {
      // Placeholder for animation triggers
      // Actual animation handled by renderer/component
      const animationType = args[0];
      if (__DEV__) {
        console.log(`[ActionExecutor] ${functionName}: ${animationType}`);
      }
      break;
    }

    case 'selectVariant': {
      // Placeholder - handled by VariantRenderer
      const profile = args[0];
      if (__DEV__) {
        console.log(`[ActionExecutor] selectVariant: ${profile}`);
      }
      break;
    }

    case 'startPlantIdentification': {
      // Placeholder - handled by ActionsRenderer
      if (__DEV__) {
        console.log(`[ActionExecutor] startPlantIdentification`);
      }
      break;
    }

    default: {
      console.warn(`[ActionExecutor] Unknown action: ${functionName}`);
    }
  }
}

/**
 * Execute multiple action scripts in sequence
 *
 * Useful for on_enter, on_select, and on_complete hooks that contain
 * multiple action scripts.
 *
 * @param actionScripts - Array of action scripts
 * @param context - Action execution context
 *
 * @example
 * executeActions(
 *   ["addXP(option.xp)", "storeProfile(option.profile)", "showFeedback(option.feedback)"],
 *   { option: selectedOption, store }
 * );
 */
export function executeActions(
  actionScripts: string[],
  context: ActionContext
): void {
  if (!actionScripts || !Array.isArray(actionScripts)) {
    return;
  }

  actionScripts.forEach((script, index) => {
    try {
      executeAction(script, context);
    } catch (error) {
      console.error(`[ActionExecutor] Error executing action at index ${index}:`, error);
    }
  });
}

/**
 * Validate an action script syntax
 *
 * Useful for configuration validation
 *
 * @param actionScript - Action string to validate
 * @returns true if valid, false otherwise
 */
export function validateActionScript(actionScript: string): boolean {
  if (!actionScript || !actionScript.trim()) {
    return false;
  }

  const isValidFunctionCall = /^(\w+)\(([^)]*)\)$/.test(actionScript);
  return isValidFunctionCall;
}

/**
 * Validate all action scripts in the configuration
 *
 * @param actionScripts - Array of action scripts to validate
 * @returns Object with validation results
 */
export function validateActionScripts(
  actionScripts: string[]
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!Array.isArray(actionScripts)) {
    return { valid: false, errors: ['Action scripts must be an array'] };
  }

  actionScripts.forEach((script, index) => {
    if (!validateActionScript(script)) {
      errors.push(`Invalid action script at index ${index}: ${script}`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}
