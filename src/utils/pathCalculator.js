/**
 * Path Calculator Utility
 *
 * Calculates hydraulic pressure loss paths from pump modules to endpoints.
 * Uses BFS to find all reachable endpoints from each pump.
 */

import { evaluateFormula } from './formulaEvaluator';

/**
 * Find all modules that have pumps (outputs with pump.enabled = true)
 *
 * @param {Object} configuration - Configuration object with modules
 * @returns {Array} - Array of { moduleId, outputId, pump } objects
 */
export function findPumps(configuration) {
  const pumps = [];
  const modules = configuration?.modules || [];

  modules.forEach(module => {
    if (module.outputs) {
      module.outputs.forEach(output => {
        if (output.pump?.enabled && output.pump?.förderhoehe_m > 0) {
          pumps.push({
            moduleId: module.id,
            moduleName: module.name,
            outputId: output.id,
            outputLabel: output.label,
            pump: output.pump,
          });
        }
      });
    }
  });

  return pumps;
}

/**
 * Find all paths from a specific pump output to endpoints using BFS
 *
 * @param {string} startModuleId - Starting module ID (pump module)
 * @param {string} startOutputId - Starting output ID (pump output)
 * @param {Object} configuration - Configuration object
 * @returns {Array} - Array of path objects
 */
export function findPathsFromPump(startModuleId, startOutputId, configuration) {
  const modules = configuration?.modules || [];
  const junctions = configuration?.junctions || [];
  const connections = configuration?.connections || [];
  const building = configuration?.building;

  // Build adjacency list for graph traversal
  const graph = new Map();

  connections.forEach(conn => {
    if (!graph.has(conn.source)) {
      graph.set(conn.source, []);
    }
    graph.get(conn.source).push(conn);
  });

  // Find all paths using BFS
  const paths = [];
  const queue = [{
    currentModuleId: startModuleId,
    currentOutputId: startOutputId,
    path: [], // Array of connection objects
    visited: new Set([startModuleId]),
  }];

  while (queue.length > 0) {
    const { currentModuleId, currentOutputId, path, visited } = queue.shift();

    // Get outgoing connections from current output
    const outgoingConnections = (graph.get(currentModuleId) || [])
      .filter(conn => conn.sourceHandle === currentOutputId);

    if (outgoingConnections.length === 0) {
      // This is an endpoint (no outgoing connections)
      if (path.length > 0) {
        paths.push({
          connections: path,
          endpointModuleId: currentModuleId,
          length: path.length,
        });
      }
      continue;
    }

    // Explore each outgoing connection
    outgoingConnections.forEach(conn => {
      const nextModuleId = conn.target;

      // Prevent cycles
      if (visited.has(nextModuleId)) {
        return;
      }

      const nextModule = modules.find(m => m.id === nextModuleId) ||
                        junctions.find(j => j.id === nextModuleId) ||
                        (building?.id === nextModuleId ? building : null);

      if (!nextModule) return;

      // Add this connection to the path
      const newPath = [...path, conn];

      // For junctions, continue from all outputs
      if (nextModule.type === 'junction') {
        const junctionOutputs = nextModule.outputs || [];
        junctionOutputs.forEach(output => {
          queue.push({
            currentModuleId: nextModuleId,
            currentOutputId: output.id,
            path: newPath,
            visited: new Set([...visited, nextModuleId]),
          });
        });
      } else {
        // For modules, check if they have outputs to continue
        const moduleOutputs = nextModule.outputs || [];

        if (moduleOutputs.length === 0) {
          // This is an endpoint (module with no outputs)
          paths.push({
            connections: newPath,
            endpointModuleId: nextModuleId,
            endpointModuleName: nextModule.name,
            length: newPath.length,
          });
        } else {
          // Continue from all outputs
          moduleOutputs.forEach(output => {
            queue.push({
              currentModuleId: nextModuleId,
              currentOutputId: output.id,
              path: newPath,
              visited: new Set([...visited, nextModuleId]),
            });
          });
        }
      }
    });
  }

  return paths;
}

/**
 * Calculate pressure loss for a single connection
 *
 * @param {Object} connection - Connection object with rohrlänge_m, rohrdimension, faktor
 * @param {Object} activeFormula - Active formula from catalog
 * @returns {Object} - { loss: number, error?: string }
 */
export function calculateConnectionLoss(connection, activeFormula) {
  if (!activeFormula || !activeFormula.formula) {
    return { loss: 0, error: 'Keine aktive Formel' };
  }

  // Check if connection has required data
  if (!connection.rohrlänge_m || connection.rohrlänge_m <= 0) {
    return { loss: 0, error: 'Rohrlänge fehlt' };
  }

  try {
    // Extract DN value from dimension string (e.g., "DN50" -> 50)
    let dimensionValue = 0;
    if (connection.rohrdimension || connection.dimension) {
      const dimStr = connection.rohrdimension || connection.dimension;
      const match = dimStr.match(/\d+/);
      dimensionValue = match ? parseFloat(match[0]) : 0;
    }

    // Prepare data for formula evaluation
    const data = {
      Rohrlänge: parseFloat(connection.rohrlänge_m || connection.laenge_meter) || 0,
      Rohrdimension: dimensionValue,
      Faktor: parseFloat(connection.faktor) || 1.4,
    };

    const loss = evaluateFormula(activeFormula.formula, data);
    return { loss };
  } catch (error) {
    return { loss: 0, error: error.message };
  }
}

/**
 * Calculate total pressure loss for a path
 *
 * @param {Array} connections - Array of connection objects in the path
 * @param {Object} activeFormula - Active formula from catalog
 * @param {boolean} includeBrineCircuit - Multiply by 2 for brine circuit (default true)
 * @returns {Object} - { total: number, details: Array, errors: Array }
 */
export function calculatePathLoss(connections, activeFormula, includeBrineCircuit = true) {
  const details = [];
  const errors = [];
  let total = 0;

  connections.forEach((conn, index) => {
    const result = calculateConnectionLoss(conn, activeFormula);

    if (result.error) {
      errors.push({
        connectionId: conn.id,
        error: result.error,
      });
    } else {
      total += result.loss;
    }

    details.push({
      connectionId: conn.id,
      loss: result.loss,
      error: result.error,
      rohrlänge_m: conn.rohrlänge_m || conn.laenge_meter,
      rohrdimension: conn.rohrdimension || conn.dimension,
      faktor: conn.faktor,
    });
  });

  // Multiply by 2 for brine circuit (supply + return)
  if (includeBrineCircuit) {
    total *= 2;
  }

  return {
    total,
    totalBeforeMultiplier: total / (includeBrineCircuit ? 2 : 1),
    details,
    errors,
    multiplier: includeBrineCircuit ? 2 : 1,
  };
}

/**
 * Calculate pump utilization percentage
 *
 * @param {number} totalLoss - Total pressure loss in meters
 * @param {number} pumpCapacity - Pump lift capacity (Förderhöhe) in meters
 * @returns {Object} - { percentage: number, status: string }
 */
export function calculatePumpUtilization(totalLoss, pumpCapacity) {
  if (!pumpCapacity || pumpCapacity <= 0) {
    return { percentage: 0, status: 'unknown' };
  }

  const percentage = (totalLoss / pumpCapacity) * 100;

  let status = 'ok';
  if (percentage > 100) {
    status = 'overload'; // Pump is overloaded
  } else if (percentage > 90) {
    status = 'warning'; // Near capacity
  } else if (percentage < 30) {
    status = 'underutilized'; // Pump is underutilized
  }

  return {
    percentage: Math.round(percentage * 10) / 10, // Round to 1 decimal
    status,
  };
}

/**
 * Calculate all pump paths and utilizations in a configuration
 *
 * @param {Object} configuration - Configuration object
 * @param {Object} activeFormula - Active formula from catalog
 * @returns {Array} - Array of pump analysis objects
 */
export function calculateAllPumpPaths(configuration, activeFormula) {
  const pumps = findPumps(configuration);
  const results = [];

  pumps.forEach(pump => {
    const paths = findPathsFromPump(pump.moduleId, pump.outputId, configuration);

    const pathResults = paths.map(path => {
      const lossCalculation = calculatePathLoss(path.connections, activeFormula, true);
      const utilization = calculatePumpUtilization(
        lossCalculation.total,
        pump.pump.förderhoehe_m
      );

      return {
        endpointModuleId: path.endpointModuleId,
        endpointModuleName: path.endpointModuleName,
        connectionCount: path.connections.length,
        totalLoss: lossCalculation.total,
        totalBeforeMultiplier: lossCalculation.totalBeforeMultiplier,
        details: lossCalculation.details,
        errors: lossCalculation.errors,
        utilization: utilization.percentage,
        utilizationStatus: utilization.status,
      };
    });

    results.push({
      pump,
      paths: pathResults,
      maxUtilization: pathResults.length > 0
        ? Math.max(...pathResults.map(p => p.utilization))
        : 0,
    });
  });

  return results;
}

/**
 * Get a summary of pressure loss issues in the configuration
 *
 * @param {Object} configuration - Configuration object
 * @param {Object} activeFormula - Active formula from catalog
 * @returns {Object} - Summary with warnings and recommendations
 */
export function getPressureLossSummary(configuration, activeFormula) {
  const pumpAnalysis = calculateAllPumpPaths(configuration, activeFormula);

  const warnings = [];
  const recommendations = [];
  let totalPumps = pumpAnalysis.length;
  let overloadedPumps = 0;
  let underutilizedPumps = 0;

  pumpAnalysis.forEach(analysis => {
    const maxUtil = analysis.maxUtilization;

    if (maxUtil > 100) {
      overloadedPumps++;
      warnings.push({
        type: 'overload',
        pump: analysis.pump,
        message: `Pumpe "${analysis.pump.moduleName}" ist überlastet (${maxUtil.toFixed(1)}%)`,
        severity: 'error',
      });
      recommendations.push({
        pump: analysis.pump,
        message: 'Größere Pumpe wählen oder Druckverlust reduzieren',
      });
    } else if (maxUtil > 90) {
      warnings.push({
        type: 'warning',
        pump: analysis.pump,
        message: `Pumpe "${analysis.pump.moduleName}" nahe der Kapazitätsgrenze (${maxUtil.toFixed(1)}%)`,
        severity: 'warning',
      });
    } else if (maxUtil < 30) {
      underutilizedPumps++;
      warnings.push({
        type: 'underutilized',
        pump: analysis.pump,
        message: `Pumpe "${analysis.pump.moduleName}" ist unterdimensioniert genutzt (${maxUtil.toFixed(1)}%)`,
        severity: 'info',
      });
    }

    // Check for missing connection data
    analysis.paths.forEach(path => {
      if (path.errors.length > 0) {
        warnings.push({
          type: 'missing_data',
          pump: analysis.pump,
          message: `${path.errors.length} Verbindung(en) im Pfad haben fehlende Daten`,
          severity: 'warning',
        });
      }
    });
  });

  return {
    totalPumps,
    overloadedPumps,
    underutilizedPumps,
    warnings,
    recommendations,
    pumpAnalysis,
  };
}
