/**
 * Unit tests for formulaEvaluator
 *
 * Run with: npm test
 */

import { describe, it, expect } from 'vitest';
import {
  evaluateFormula,
  validateFormula,
  extractVariables,
  hasVariable,
  getFormulaPreview,
  validateConnectionData,
} from './formulaEvaluator';

describe('evaluateFormula', () => {
  it('evaluates simple formula', () => {
    const result = evaluateFormula('{{Rohrlänge}} * 2', { Rohrlänge: 10 });
    expect(result).toBe(20);
  });

  it('evaluates complex formula', () => {
    const formula = '({{Rohrlänge}} * 2.4) / {{Faktor}}';
    const data = { Rohrlänge: 10, Faktor: 1.4 };
    const result = evaluateFormula(formula, data);
    expect(result).toBeCloseTo(17.14, 2);
  });

  it('evaluates formula with multiple variables', () => {
    const formula = '({{Rohrlänge}} * 2.4 + {{Rohrdimension}} * 0.1) / {{Faktor}}';
    const data = { Rohrlänge: 10, Rohrdimension: 50, Faktor: 1.4 };
    const result = evaluateFormula(formula, data);
    expect(result).toBeCloseTo(20.71, 2);
  });

  it('handles decimal values', () => {
    const result = evaluateFormula('{{Rohrlänge}} * 2.5', { Rohrlänge: 5.5 });
    expect(result).toBe(13.75);
  });

  it('throws error for missing variable', () => {
    expect(() => {
      evaluateFormula('{{Rohrlänge}} * 2', {});
    }).toThrow('Missing required variable: Rohrlänge');
  });

  it('throws error for invalid variable value', () => {
    expect(() => {
      evaluateFormula('{{Rohrlänge}} * 2', { Rohrlänge: 'invalid' });
    }).toThrow('must be a valid number');
  });

  it('throws error for unknown variable', () => {
    expect(() => {
      evaluateFormula('{{Unknown}} * 2', { Rohrlänge: 10 });
    }).toThrow('Missing required variable: Unknown');
  });

  it('throws error for division by zero', () => {
    expect(() => {
      evaluateFormula('{{Rohrlänge}} / {{Faktor}}', { Rohrlänge: 10, Faktor: 0 });
    }).toThrow('infinity');
  });

  it('handles parentheses correctly', () => {
    const result = evaluateFormula('({{Rohrlänge}} + 5) * 2', { Rohrlänge: 10 });
    expect(result).toBe(30);
  });
});

describe('validateFormula', () => {
  it('validates correct formula', () => {
    const result = validateFormula('{{Rohrlänge}} * 2');
    expect(result.valid).toBe(true);
    expect(result.variables).toEqual(['Rohrlänge']);
  });

  it('validates complex formula', () => {
    const result = validateFormula('({{Rohrlänge}} * 2.4) / {{Faktor}}');
    expect(result.valid).toBe(true);
    expect(result.variables).toContain('Rohrlänge');
    expect(result.variables).toContain('Faktor');
  });

  it('rejects invalid formula', () => {
    const result = validateFormula('{{Rohrlänge}} * *');
    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('rejects empty formula', () => {
    const result = validateFormula('');
    expect(result.valid).toBe(false);
  });

  it('extracts unique variables', () => {
    const result = validateFormula('{{Rohrlänge}} + {{Rohrlänge}} * {{Faktor}}');
    expect(result.valid).toBe(true);
    expect(result.variables).toHaveLength(2);
    expect(result.variables).toContain('Rohrlänge');
    expect(result.variables).toContain('Faktor');
  });
});

describe('extractVariables', () => {
  it('extracts single variable', () => {
    const vars = extractVariables('{{Rohrlänge}} * 2');
    expect(vars).toEqual(['Rohrlänge']);
  });

  it('extracts multiple variables', () => {
    const vars = extractVariables('{{Rohrlänge}} * {{Faktor}}');
    expect(vars).toContain('Rohrlänge');
    expect(vars).toContain('Faktor');
  });

  it('handles duplicate variables', () => {
    const vars = extractVariables('{{Rohrlänge}} + {{Rohrlänge}}');
    expect(vars).toEqual(['Rohrlänge']);
  });

  it('returns empty array for formula without variables', () => {
    const vars = extractVariables('10 * 2');
    expect(vars).toEqual([]);
  });
});

describe('hasVariable', () => {
  it('returns true if variable exists', () => {
    expect(hasVariable('{{Rohrlänge}} * 2', 'Rohrlänge')).toBe(true);
  });

  it('returns false if variable does not exist', () => {
    expect(hasVariable('{{Rohrlänge}} * 2', 'Faktor')).toBe(false);
  });
});

describe('getFormulaPreview', () => {
  it('returns expanded expression and result', () => {
    const preview = getFormulaPreview('{{Rohrlänge}} * 2', { Rohrlänge: 10 });
    expect(preview.expression).toBe('10 * 2');
    expect(preview.result).toBe(20);
  });

  it('returns error for invalid formula', () => {
    const preview = getFormulaPreview('{{Rohrlänge}} * 2', {});
    expect(preview.error).toBeDefined();
  });
});

describe('validateConnectionData', () => {
  it('validates correct connection data', () => {
    const data = { Rohrlänge: 10, Faktor: 1.4 };
    const result = validateConnectionData(data, ['Rohrlänge', 'Faktor']);
    expect(result.valid).toBe(true);
  });

  it('detects missing variables', () => {
    const data = { Rohrlänge: 10 };
    const result = validateConnectionData(data, ['Rohrlänge', 'Faktor']);
    expect(result.valid).toBe(false);
    expect(result.missing).toContain('Faktor');
  });

  it('detects invalid variable types', () => {
    const data = { Rohrlänge: 'invalid', Faktor: 1.4 };
    const result = validateConnectionData(data, ['Rohrlänge', 'Faktor']);
    expect(result.valid).toBe(false);
    expect(result.missing).toContain('Rohrlänge');
  });
});
