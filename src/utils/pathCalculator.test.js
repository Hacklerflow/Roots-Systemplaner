/**
 * Unit tests for pathCalculator
 *
 * Run with: npm test
 */

import { describe, it, expect } from 'vitest';
import {
  findPumps,
  findPathsFromPump,
  calculateConnectionLoss,
  calculatePathLoss,
  calculatePumpUtilization,
  calculateAllPumpPaths,
} from './pathCalculator';

describe('findPumps', () => {
  it('finds modules with enabled pumps', () => {
    const config = {
      modules: [
        {
          id: 'module-1',
          name: 'Wärmepumpe 1',
          outputs: [
            {
              id: 'out-1',
              label: 'DN50',
              pump: { enabled: true, förderhoehe_m: 10 },
            },
          ],
        },
        {
          id: 'module-2',
          name: 'Speicher',
          outputs: [
            {
              id: 'out-2',
              label: 'DN40',
              pump: { enabled: false, förderhoehe_m: 0 },
            },
          ],
        },
      ],
    };

    const pumps = findPumps(config);
    expect(pumps).toHaveLength(1);
    expect(pumps[0].moduleId).toBe('module-1');
    expect(pumps[0].outputId).toBe('out-1');
    expect(pumps[0].pump.förderhoehe_m).toBe(10);
  });

  it('returns empty array if no pumps', () => {
    const config = { modules: [] };
    const pumps = findPumps(config);
    expect(pumps).toEqual([]);
  });

  it('ignores pumps with zero capacity', () => {
    const config = {
      modules: [
        {
          id: 'module-1',
          name: 'Module',
          outputs: [
            {
              id: 'out-1',
              pump: { enabled: true, förderhoehe_m: 0 },
            },
          ],
        },
      ],
    };

    const pumps = findPumps(config);
    expect(pumps).toHaveLength(0);
  });
});

describe('findPathsFromPump', () => {
  it('finds simple linear path', () => {
    const config = {
      modules: [
        {
          id: 'pump',
          name: 'Pump Module',
          outputs: [{ id: 'pump-out' }],
        },
        {
          id: 'endpoint',
          name: 'Endpoint',
          outputs: [], // No outputs = endpoint
        },
      ],
      connections: [
        {
          id: 'conn-1',
          source: 'pump',
          sourceHandle: 'pump-out',
          target: 'endpoint',
          targetHandle: 'endpoint-in',
        },
      ],
    };

    const paths = findPathsFromPump('pump', 'pump-out', config);
    expect(paths).toHaveLength(1);
    expect(paths[0].endpointModuleId).toBe('endpoint');
    expect(paths[0].connections).toHaveLength(1);
  });

  it('finds multiple paths from pump', () => {
    const config = {
      modules: [
        {
          id: 'pump',
          outputs: [{ id: 'pump-out' }],
        },
        {
          id: 'junction',
          type: 'junction',
          outputs: [
            { id: 'junction-out-1' },
            { id: 'junction-out-2' },
          ],
        },
        {
          id: 'endpoint-1',
          outputs: [],
        },
        {
          id: 'endpoint-2',
          outputs: [],
        },
      ],
      junctions: [
        {
          id: 'junction',
          type: 'junction',
          outputs: [
            { id: 'junction-out-1' },
            { id: 'junction-out-2' },
          ],
        },
      ],
      connections: [
        {
          id: 'conn-1',
          source: 'pump',
          sourceHandle: 'pump-out',
          target: 'junction',
          targetHandle: 'junction-in',
        },
        {
          id: 'conn-2',
          source: 'junction',
          sourceHandle: 'junction-out-1',
          target: 'endpoint-1',
          targetHandle: 'ep1-in',
        },
        {
          id: 'conn-3',
          source: 'junction',
          sourceHandle: 'junction-out-2',
          target: 'endpoint-2',
          targetHandle: 'ep2-in',
        },
      ],
    };

    const paths = findPathsFromPump('pump', 'pump-out', config);
    expect(paths).toHaveLength(2);
  });

  it('handles pump with no outgoing connections', () => {
    const config = {
      modules: [
        {
          id: 'pump',
          outputs: [{ id: 'pump-out' }],
        },
      ],
      connections: [],
    };

    const paths = findPathsFromPump('pump', 'pump-out', config);
    expect(paths).toHaveLength(0);
  });

  it('prevents cycles', () => {
    const config = {
      modules: [
        {
          id: 'module-1',
          outputs: [{ id: 'out-1' }],
        },
        {
          id: 'module-2',
          outputs: [{ id: 'out-2' }],
        },
      ],
      connections: [
        {
          id: 'conn-1',
          source: 'module-1',
          sourceHandle: 'out-1',
          target: 'module-2',
          targetHandle: 'in-2',
        },
        {
          id: 'conn-2',
          source: 'module-2',
          sourceHandle: 'out-2',
          target: 'module-1',
          targetHandle: 'in-1',
        },
      ],
    };

    // Should not infinite loop
    const paths = findPathsFromPump('module-1', 'out-1', config);
    expect(Array.isArray(paths)).toBe(true);
  });
});

describe('calculateConnectionLoss', () => {
  const activeFormula = {
    formula: '({{Rohrlänge}} * 2.4) / {{Faktor}}',
  };

  it('calculates loss for valid connection', () => {
    const connection = {
      rohrlänge_m: 10,
      rohrdimension: 'DN50',
      faktor: 1.4,
    };

    const result = calculateConnectionLoss(connection, activeFormula);
    expect(result.loss).toBeCloseTo(17.14, 2);
    expect(result.error).toBeUndefined();
  });

  it('returns error if no formula', () => {
    const connection = {
      rohrlänge_m: 10,
      rohrdimension: 'DN50',
      faktor: 1.4,
    };

    const result = calculateConnectionLoss(connection, null);
    expect(result.loss).toBe(0);
    expect(result.error).toBe('Keine aktive Formel');
  });

  it('returns error if no length', () => {
    const connection = {
      rohrdimension: 'DN50',
      faktor: 1.4,
    };

    const result = calculateConnectionLoss(connection, activeFormula);
    expect(result.loss).toBe(0);
    expect(result.error).toBe('Rohrlänge fehlt');
  });

  it('extracts DN value from dimension string', () => {
    const connection = {
      rohrlänge_m: 10,
      rohrdimension: 'DN50',
      faktor: 1.4,
    };

    const result = calculateConnectionLoss(connection, activeFormula);
    expect(result.error).toBeUndefined();
  });
});

describe('calculatePathLoss', () => {
  const activeFormula = {
    formula: '{{Rohrlänge}} * 2',
  };

  it('calculates total loss for path', () => {
    const connections = [
      { rohrlänge_m: 5, faktor: 1.4 },
      { rohrlänge_m: 3, faktor: 1.4 },
    ];

    const result = calculatePathLoss(connections, activeFormula, true);
    expect(result.total).toBe(16); // (5*2 + 3*2) * 2
    expect(result.totalBeforeMultiplier).toBe(8);
    expect(result.multiplier).toBe(2);
  });

  it('calculates without brine circuit multiplier', () => {
    const connections = [
      { rohrlänge_m: 5, faktor: 1.4 },
    ];

    const result = calculatePathLoss(connections, activeFormula, false);
    expect(result.total).toBe(10); // 5*2, no multiplier
    expect(result.multiplier).toBe(1);
  });

  it('includes error details', () => {
    const connections = [
      { rohrlänge_m: 5, faktor: 1.4 },
      { faktor: 1.4 }, // Missing length
    ];

    const result = calculatePathLoss(connections, activeFormula, false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].error).toBe('Rohrlänge fehlt');
  });

  it('provides detailed breakdown', () => {
    const connections = [
      { id: 'conn-1', rohrlänge_m: 5, faktor: 1.4 },
      { id: 'conn-2', rohrlänge_m: 3, faktor: 1.4 },
    ];

    const result = calculatePathLoss(connections, activeFormula, false);
    expect(result.details).toHaveLength(2);
    expect(result.details[0].loss).toBe(10);
    expect(result.details[1].loss).toBe(6);
  });
});

describe('calculatePumpUtilization', () => {
  it('calculates percentage correctly', () => {
    const result = calculatePumpUtilization(5, 10);
    expect(result.percentage).toBe(50);
    expect(result.status).toBe('ok');
  });

  it('detects overload', () => {
    const result = calculatePumpUtilization(12, 10);
    expect(result.percentage).toBe(120);
    expect(result.status).toBe('overload');
  });

  it('detects warning threshold', () => {
    const result = calculatePumpUtilization(9.5, 10);
    expect(result.percentage).toBe(95);
    expect(result.status).toBe('warning');
  });

  it('detects underutilization', () => {
    const result = calculatePumpUtilization(2, 10);
    expect(result.percentage).toBe(20);
    expect(result.status).toBe('underutilized');
  });

  it('handles zero capacity', () => {
    const result = calculatePumpUtilization(5, 0);
    expect(result.percentage).toBe(0);
    expect(result.status).toBe('unknown');
  });

  it('rounds to 1 decimal place', () => {
    const result = calculatePumpUtilization(1.234, 10);
    expect(result.percentage).toBe(12.3);
  });
});

describe('calculateAllPumpPaths', () => {
  it('calculates paths for all pumps', () => {
    const config = {
      modules: [
        {
          id: 'pump-1',
          name: 'Pump 1',
          outputs: [
            {
              id: 'pump-1-out',
              pump: { enabled: true, förderhoehe_m: 10 },
            },
          ],
        },
        {
          id: 'endpoint',
          name: 'Endpoint',
          outputs: [],
        },
      ],
      connections: [
        {
          id: 'conn-1',
          source: 'pump-1',
          sourceHandle: 'pump-1-out',
          target: 'endpoint',
          targetHandle: 'endpoint-in',
          rohrlänge_m: 5,
          faktor: 1.4,
        },
      ],
    };

    const activeFormula = {
      formula: '{{Rohrlänge}} * 2',
    };

    const results = calculateAllPumpPaths(config, activeFormula);
    expect(results).toHaveLength(1);
    expect(results[0].paths).toHaveLength(1);
    expect(results[0].maxUtilization).toBeGreaterThan(0);
  });

  it('returns empty array if no pumps', () => {
    const config = { modules: [] };
    const activeFormula = { formula: '{{Rohrlänge}} * 2' };

    const results = calculateAllPumpPaths(config, activeFormula);
    expect(results).toEqual([]);
  });
});
