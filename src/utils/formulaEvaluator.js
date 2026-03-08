/**
 * Formula Evaluator Utility
 *
 * Safely evaluates mathematical formulas with template variables.
 * Uses Function constructor (safer than eval) with variable pre-replacement.
 *
 * Supported variables:
 * - {{Rohrlänge}} - Pipe length in meters
 * - {{Rohrdimension}} - Pipe dimension (DN value)
 * - {{Faktor}} - Correction factor (default 1.4)
 * - {{Sole Name}} - Any sole factor from the sole catalog (e.g. "Wasser", "Glykol 30%")
 *
 * Variable names can contain letters, numbers, spaces, and special characters.
 *
 * Example usage:
 * ```javascript
 * const formula = "({{Rohrlänge}} * 2.4) / {{Glykol 30%}}";
 * const data = { Rohrlänge: 10, "Glykol 30%": 1.10 };
 * const result = evaluateFormula(formula, data); // Returns 21.82...
 * ```
 */

/**
 * Evaluates a formula with given variable values
 *
 * @param {string} formula - Formula string with {{variable}} placeholders
 * @param {Object} values - Object with variable values
 * @returns {number} - Calculated result
 * @throws {Error} - If formula is invalid or variables are missing
 */
export function evaluateFormula(formula, values) {
  if (!formula || typeof formula !== 'string') {
    throw new Error('Formula must be a non-empty string');
  }

  if (!values || typeof values !== 'object') {
    throw new Error('Values must be an object');
  }

  // Replace variables with actual values
  let expression = formula;
  // Pattern allows alphanumeric, spaces, underscores, and common punctuation for sole names
  const variablePattern = /{{([^}]+)}}/g;
  const matches = [...formula.matchAll(variablePattern)];

  // Replace each variable
  matches.forEach(([placeholder, varName]) => {
    // Trim whitespace from variable name
    const trimmedVarName = varName.trim();
    const value = values[trimmedVarName];

    if (value === undefined || value === null) {
      throw new Error(`Missing required variable: ${trimmedVarName}`);
    }

    if (typeof value !== 'number' || isNaN(value)) {
      throw new Error(`Variable ${trimmedVarName} must be a valid number, got: ${value}`);
    }

    // Escape special regex characters in variable name for safe replacement
    const escapedVarName = varName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Replace all occurrences of this variable
    expression = expression.replace(new RegExp(`{{${escapedVarName}}}`, 'g'), value);
  });

  // Check if any unreplaced variables remain
  if (expression.match(/{{.*?}}/)) {
    const remaining = expression.match(/{{(.*?)}}/g);
    throw new Error(`Unknown variables in formula: ${remaining.join(', ')}`);
  }

  // Evaluate the expression safely
  try {
    // Use Function constructor with strict mode
    // This is safer than eval() but still allows math expressions
    const func = new Function(`'use strict'; return (${expression});`);
    const result = func();

    if (typeof result !== 'number' || isNaN(result)) {
      throw new Error(`Formula evaluation resulted in invalid number: ${result}`);
    }

    if (!isFinite(result)) {
      throw new Error('Formula evaluation resulted in infinity');
    }

    return result;
  } catch (error) {
    if (error.message.includes('Formula evaluation resulted in')) {
      throw error; // Re-throw our custom errors
    }
    throw new Error(`Formula evaluation failed: ${error.message}`);
  }
}

/**
 * Validates a formula without evaluating it
 *
 * @param {string} formula - Formula string to validate
 * @returns {Object} - { valid: boolean, error?: string, variables?: string[] }
 */
export function validateFormula(formula) {
  if (!formula || typeof formula !== 'string') {
    return {
      valid: false,
      error: 'Formula must be a non-empty string',
    };
  }

  try {
    // Extract variables from formula
    const variablePattern = /{{([^}]+)}}/g;
    const matches = [...formula.matchAll(variablePattern)];
    const variables = [...new Set(matches.map(m => m[1].trim()))];

    // Test with dummy values
    const testData = {};
    variables.forEach(varName => {
      testData[varName] = 10; // Use 10 as test value for all variables
    });

    // Try to evaluate
    evaluateFormula(formula, testData);

    return {
      valid: true,
      variables,
    };
  } catch (error) {
    return {
      valid: false,
      error: error.message,
    };
  }
}

/**
 * Extracts variable names from a formula
 *
 * @param {string} formula - Formula string
 * @returns {string[]} - Array of unique variable names
 */
export function extractVariables(formula) {
  if (!formula || typeof formula !== 'string') {
    return [];
  }

  const variablePattern = /{{([^}]+)}}/g;
  const matches = [...formula.matchAll(variablePattern)];
  return [...new Set(matches.map(m => m[1].trim()))];
}

/**
 * Checks if a formula contains a specific variable
 *
 * @param {string} formula - Formula string
 * @param {string} variableName - Variable name to check
 * @returns {boolean}
 */
export function hasVariable(formula, variableName) {
  const variables = extractVariables(formula);
  return variables.includes(variableName);
}

/**
 * Get safe evaluation context (for displaying formula preview)
 *
 * @param {string} formula - Formula string
 * @param {Object} values - Variable values
 * @returns {Object} - { expression: string, result?: number, error?: string }
 */
export function getFormulaPreview(formula, values) {
  try {
    // Replace variables with values to show expanded formula
    let expression = formula;
    const variablePattern = /{{([^}]+)}}/g;
    const matches = [...formula.matchAll(variablePattern)];

    matches.forEach(([placeholder, varName]) => {
      const trimmedVarName = varName.trim();
      const value = values[trimmedVarName];
      if (value !== undefined && value !== null) {
        // Escape special regex characters in variable name for safe replacement
        const escapedVarName = varName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        expression = expression.replace(new RegExp(`{{${escapedVarName}}}`, 'g'), value);
      }
    });

    const result = evaluateFormula(formula, values);

    return {
      expression,
      result,
    };
  } catch (error) {
    return {
      expression: formula,
      error: error.message,
    };
  }
}

/**
 * Common formulas for pressure loss calculation
 */
export const COMMON_FORMULAS = {
  STANDARD: {
    name: 'Standard Druckverlust',
    formula: '({{Rohrlänge}} * 2.4) / {{Faktor}}',
    description: 'Standard pressure loss calculation for hydraulic pipes',
    variables: ['Rohrlänge', 'Faktor'],
  },
  EXTENDED: {
    name: 'Erweiterte Berechnung',
    formula: '({{Rohrlänge}} * 2.4 + {{Rohrdimension}} * 0.1) / {{Faktor}}',
    description: 'Extended calculation including pipe dimension factor',
    variables: ['Rohrlänge', 'Rohrdimension', 'Faktor'],
  },
  SIMPLE_LENGTH: {
    name: 'Einfache Längenberechnung',
    formula: '{{Rohrlänge}} * 2',
    description: 'Simple length-based calculation',
    variables: ['Rohrlänge'],
  },
};

/**
 * Validate connection data has required fields for formula evaluation
 *
 * @param {Object} connectionData - Connection data object
 * @param {string[]} requiredVariables - Required variable names
 * @returns {Object} - { valid: boolean, missing?: string[] }
 */
export function validateConnectionData(connectionData, requiredVariables) {
  if (!connectionData || typeof connectionData !== 'object') {
    return {
      valid: false,
      error: 'Connection data must be an object',
    };
  }

  const missing = requiredVariables.filter(varName => {
    const value = connectionData[varName];
    return value === undefined || value === null || typeof value !== 'number' || isNaN(value);
  });

  if (missing.length > 0) {
    return {
      valid: false,
      missing,
    };
  }

  return { valid: true };
}
