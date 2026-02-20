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

import { logger } from '@/lib/services/logger';

export interface ActionContext {
  option?: Record<string, unknown>;  // Selected option (page3, page4)
  inputs?: Record<string, unknown>;  // Form inputs (page8)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Store is accessed dynamically via action scripts
  store: Record<string, any>;       // Zustand store (useOnboardingStore.getState())
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
function parseArguments(argsString: string, context: ActionContext): unknown[] {
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
      return Number.parseInt(trimmed, 10);
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

/** Handler type for action execution */
type ActionHandler = (args: unknown[], context: ActionContext) => void;

/** Validate first arg is a string and call store method */
function expectString(
  methodName: string,
  actionName: string,
  args: unknown[],
  context: ActionContext,
): void {
  const value = args[0];
  if (typeof value === 'string') {
    (context.store[methodName] as (v: string) => void)(value);
  } else {
    logger.warn(`[ActionExecutor] ${actionName}: Expected string, got ${typeof value}`);
  }
}

/** Debug-only placeholder for actions handled by renderers */
function debugPlaceholder(label: string, args: unknown[]): void {
  if (__DEV__) {
    logger.debug(`[ActionExecutor] ${label}: ${args.map(String).join(', ')}`);
  }
}

/**
 * Registry of all supported action handlers.
 * Add new actions here instead of expanding a switch.
 */
const ACTION_HANDLERS: Record<string, ActionHandler> = {
  addXP: (args, context) => {
    const xpAmount = args[0];
    if (typeof xpAmount === 'number') {
      (context.store.addXP as (n: number) => void)(xpAmount);
    } else {
      logger.warn(`[ActionExecutor] addXP: Expected number, got ${typeof xpAmount}`);
    }
  },

  storeProfile: (args, context) => expectString('setUserProfile', 'storeProfile', args, context),
  storePainPoint: (args, context) => expectString('setPainPoint', 'storePainPoint', args, context),
  setPlantName: (args, context) => expectString('setPlantName', 'setPlantName', args, context),
  setPlantPersonality: (args, context) => expectString('setPlantPersonality', 'setPlantPersonality', args, context),

  showFeedback: (args) => debugPlaceholder('showFeedback', args),
  animatePlant: (args) => debugPlaceholder('animatePlant', args),
  animateSuccess: (args) => debugPlaceholder('animateSuccess', args),
  animateAvatar: (args) => debugPlaceholder('animateAvatar', args),
  selectVariant: (args) => debugPlaceholder('selectVariant', args),
  startPlantIdentification: () => debugPlaceholder('startPlantIdentification (image-based)', []),

  identifyPlantByName: (args, context) => {
    const plantName = args[0];
    if (typeof plantName === 'string') {
      (context.store.setPlantName as (v: string) => void)(plantName);
      if (__DEV__) {
        logger.debug(`[ActionExecutor] identifyPlantByName: "${plantName}"`);
      }
    } else {
      logger.warn(`[ActionExecutor] identifyPlantByName: Expected string, got ${typeof plantName}`);
    }
  },
};

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
  if (!actionScript?.trim()) {
    return;
  }

  // Parse function call: functionName(args)
  const match = /^(\w+)\(([^)]*)\)$/.exec(actionScript);

  if (!match) {
    logger.warn(`[ActionExecutor] Invalid action script: ${actionScript}`);
    return;
  }

  const [, functionName, argsString] = match;
  const args = parseArguments(argsString, context);

  // Log action execution in development
  if (__DEV__) {
    logger.debug(`[ActionExecutor] Executing: ${functionName}(${args.map(String).join(', ')})`);
  }

  const handler = ACTION_HANDLERS[functionName];
  if (handler) {
    handler(args, context);
  } else {
    logger.warn(`[ActionExecutor] Unknown action: ${functionName}`);
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
      logger.error(`[ActionExecutor] Error executing action at index ${index}:`, error);
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
  if (!actionScript?.trim()) {
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
