// Neues Datenmodell für Roots Systemkonfigurator mit Ein-/Ausgangs-System

/**
 * Modul-Typen Konstanten
 */
export const MODULE_TYPES = {
  HEAT_PUMP: 'Wärmepumpe',
  HUB: 'Hub',
  SOURCE: 'Quelle',
  STORAGE: 'Speicher',
  SOLAR_THERMAL: 'Soletherme',
  NETWORK_COMPONENT: 'Netzwerkkomponente',
  BUILDING: 'Gebäude',
};

/**
 * Verbindungstypen Konstanten
 */
export const CONNECTION_TYPES = {
  HYDRAULIC: 'hydraulic',
  ELECTRIC: 'electric',
  CONTROL: 'control',
};

/**
 * Verbindungstyp-Labels (für UI)
 */
export const CONNECTION_TYPE_LABELS = {
  [CONNECTION_TYPES.HYDRAULIC]: 'Hydraulisch',
  [CONNECTION_TYPES.ELECTRIC]: 'Elektrisch',
  [CONNECTION_TYPES.CONTROL]: 'Steuerung',
};

/**
 * Factory-Funktion für einen Input
 */
export function createInput(label = '', connectionType = CONNECTION_TYPES.HYDRAULIC, allowedTypes = []) {
  return {
    id: `input-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    label,
    connectionType,
    allowedModuleTypes: allowedTypes,
  };
}

/**
 * Factory-Funktion für einen Output
 */
export function createOutput(label = '', connectionType = CONNECTION_TYPES.HYDRAULIC, allowedTypes = []) {
  return {
    id: `output-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    label,
    connectionType,
    allowedModuleTypes: allowedTypes,
  };
}

/**
 * Factory-Funktion für ein neues Gebäude
 */
export function createBuilding(name = 'Neues Gebäude') {
  return {
    id: `building-${Date.now()}`,
    type: 'building',
    moduleType: MODULE_TYPES.BUILDING,
    name,
    properties: {
      baujahr: null,
      strasse: '',
      hausnummer: '',
      stockwerke: null,
    },
    inputs: [], // Gebäude hat keine Eingänge
    outputs: [
      // Standard-Ausgänge
      createOutput('Heizung', CONNECTION_TYPES.HYDRAULIC, [MODULE_TYPES.HUB, MODULE_TYPES.HEAT_PUMP, MODULE_TYPES.STORAGE]),
      createOutput('Strom 400V', CONNECTION_TYPES.ELECTRIC, [MODULE_TYPES.HUB, MODULE_TYPES.HEAT_PUMP]),
    ],
  };
}

/**
 * Factory-Funktion für ein neues Modul aus Template
 */
export function createModuleInstance(moduleTemplate) {
  return {
    ...moduleTemplate,
    id: `module-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    // Deep-copy inputs/outputs um Referenzen zu vermeiden
    inputs: moduleTemplate.inputs.map(inp => ({ ...inp, id: `input-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` })),
    outputs: moduleTemplate.outputs.map(out => ({ ...out, id: `output-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` })),
  };
}

/**
 * Factory-Funktion für ein neues Modul-Template
 */
export function createModuleTemplate(name = 'Neues Modul', moduleType = MODULE_TYPES.HUB) {
  return {
    id: `template-${Date.now()}`,
    type: 'module',
    moduleType,
    name,
    properties: {
      hersteller: 'Roots Energy',
      abmessungen: '',
      gewicht_kg: null,
    },
    inputs: [],
    outputs: [],
  };
}

/**
 * Hilfsfunktion: Prüft ob ein Element ein Gebäude ist
 */
export function isBuilding(element) {
  return element && element.type === 'building';
}

/**
 * Hilfsfunktion: Prüft ob ein Element ein Modul ist
 */
export function isModule(element) {
  return element && element.type === 'module';
}

/**
 * Hilfsfunktion: Prüft ob ein Element ein Junction ist
 */
export function isJunction(element) {
  return element && element.type === 'junction';
}

/**
 * Factory-Funktion für einen Junction/Knotenpunkt
 */
export function createJunction(label = '') {
  return {
    id: `junction-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: 'junction',
    label,
    position: { x: 0, y: 0 },
  };
}

/**
 * Gibt alle Modul-Typen als Array zurück (für UI Select)
 */
export function getModuleTypeOptions() {
  return Object.values(MODULE_TYPES).filter(type => type !== MODULE_TYPES.BUILDING);
}

/**
 * Gibt alle Verbindungstypen als Array zurück (für UI Select)
 */
export function getConnectionTypeOptions() {
  return Object.values(CONNECTION_TYPES);
}
