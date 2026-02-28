// Kompatibilitätsprüfung für Ein-/Ausgangs-System

import { CONNECTION_TYPES, isJunction } from './types';

/**
 * Prüft ob eine Verbindung zwischen Output und Input erlaubt/empfohlen ist
 *
 * @param {Object} sourceModule - Das Quell-Modul
 * @param {string} sourceOutputId - ID des Ausgangs
 * @param {Object} targetModule - Das Ziel-Modul
 * @param {string} targetInputId - ID des Eingangs
 * @returns {Object} { valid: boolean, warning: boolean, reason: string }
 */
export function checkConnection(sourceModule, sourceOutputId, targetModule, targetInputId) {
  // Junctions erlauben alle Verbindungen
  if (isJunction(sourceModule) || isJunction(targetModule)) {
    return { valid: true, warning: false, reason: '' };
  }

  const output = sourceModule.outputs?.find(o => o.id === sourceOutputId);
  const input = targetModule.inputs?.find(i => i.id === targetInputId);

  if (!output || !input) {
    return {
      valid: false,
      warning: true,
      reason: 'Konnektor nicht gefunden'
    };
  }

  // ConnectionType muss übereinstimmen
  if (output.connectionType !== input.connectionType) {
    return {
      valid: true,  // Trotzdem erlauben
      warning: true,
      reason: `Verbindungstyp passt nicht (${formatConnectionType(output.connectionType)} → ${formatConnectionType(input.connectionType)})`
    };
  }

  // Prüfe ob Ziel-Modul-Typ in erlaubten Typen des Outputs ist
  const outputAllowed = output.allowedModuleTypes.length === 0 ||
                        output.allowedModuleTypes.includes(targetModule.moduleType);

  // Prüfe ob Quell-Modul-Typ in erlaubten Typen des Inputs ist
  const inputAllowed = input.allowedModuleTypes.length === 0 ||
                       input.allowedModuleTypes.includes(sourceModule.moduleType);

  if (!outputAllowed || !inputAllowed) {
    return {
      valid: true,  // Trotzdem erlauben
      warning: true,
      reason: `Modultyp nicht in erlaubten Verbindungen (${sourceModule.moduleType} → ${targetModule.moduleType})`
    };
  }

  return { valid: true, warning: false, reason: '' };
}

/**
 * Gibt Linienstil basierend auf ConnectionType zurück
 *
 * @param {string} connectionType - Der Verbindungstyp
 * @returns {Object} Style-Objekt für React Flow Edge
 */
export function getEdgeStyle(connectionType) {
  const baseStyle = {
    stroke: 'var(--accent)',
    strokeWidth: 2,
  };

  switch (connectionType) {
    case CONNECTION_TYPES.HYDRAULIC:
      return { ...baseStyle, strokeDasharray: '0' };  // Durchgezogen
    case CONNECTION_TYPES.ELECTRIC:
      return { ...baseStyle, strokeDasharray: '8,4' };   // Gestrichelt
    case CONNECTION_TYPES.CONTROL:
      return { ...baseStyle, strokeDasharray: '2,3' };   // Gepunktet
    default:
      return { ...baseStyle, strokeDasharray: '0' };
  }
}

/**
 * Gibt Farbe basierend auf ConnectionType zurück
 *
 * @param {string} connectionType - Der Verbindungstyp
 * @returns {string} CSS-Farbe
 */
export function getConnectionTypeColor(connectionType) {
  switch (connectionType) {
    case CONNECTION_TYPES.HYDRAULIC:
      return '#00d9ff';  // Cyan (Accent)
    case CONNECTION_TYPES.ELECTRIC:
      return '#ffaa00';  // Orange
    case CONNECTION_TYPES.CONTROL:
      return '#aa00ff';  // Lila
    default:
      return '#00d9ff';
  }
}

/**
 * Formatiert ConnectionType für Anzeige
 */
function formatConnectionType(type) {
  switch (type) {
    case CONNECTION_TYPES.HYDRAULIC:
      return 'Hydraulisch';
    case CONNECTION_TYPES.ELECTRIC:
      return 'Elektrisch';
    case CONNECTION_TYPES.CONTROL:
      return 'Steuerung';
    default:
      return type;
  }
}

/**
 * Prüft ob ein Input bereits verbunden ist
 *
 * @param {Array} connections - Alle Verbindungen
 * @param {string} nodeId - Node ID
 * @param {string} inputId - Input ID (Handle ID)
 * @returns {boolean}
 */
export function isInputConnected(connections, nodeId, inputId) {
  return connections.some(conn => conn.target === nodeId && conn.targetHandle === inputId);
}

/**
 * Gibt die Verbindung zu einem Input zurück
 *
 * @param {Array} connections - Alle Verbindungen
 * @param {string} nodeId - Node ID
 * @param {string} inputId - Input ID (Handle ID)
 * @returns {Object|null} Connection oder null
 */
export function getInputConnection(connections, nodeId, inputId) {
  return connections.find(conn => conn.target === nodeId && conn.targetHandle === inputId) || null;
}

/**
 * Gibt alle Verbindungen eines Outputs zurück
 *
 * @param {Array} connections - Alle Verbindungen
 * @param {string} nodeId - Node ID
 * @param {string} outputId - Output ID (Handle ID)
 * @returns {Array} Array von Connections
 */
export function getOutputConnections(connections, nodeId, outputId) {
  return connections.filter(conn => conn.source === nodeId && conn.sourceHandle === outputId);
}

/**
 * Validiert alle Verbindungen in der Konfiguration
 *
 * @param {Array} modules - Alle Module (inkl. Gebäude)
 * @param {Array} connections - Alle Verbindungen
 * @returns {Array} Array von Validierungsergebnissen
 */
export function validateAllConnections(modules, connections) {
  const results = [];

  connections.forEach(conn => {
    const sourceModule = modules.find(m => m.id === conn.source);
    const targetModule = modules.find(m => m.id === conn.target);

    if (!sourceModule || !targetModule) {
      results.push({
        connection: conn,
        valid: false,
        warning: true,
        reason: 'Modul nicht gefunden'
      });
      return;
    }

    const check = checkConnection(
      sourceModule,
      conn.sourceHandle,
      targetModule,
      conn.targetHandle
    );

    results.push({
      connection: conn,
      ...check
    });
  });

  return results;
}
