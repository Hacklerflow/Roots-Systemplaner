// Datenmodell für Roots Systemkonfigurator

/**
 * Factory-Funktion für ein neues Gebäude
 */
export function createBuilding(name = 'Neues Gebäude') {
  return {
    id: `building-${Date.now()}`,
    type: 'building',
    name,
    properties: {
      baujahr: null,
      strasse: '',
      hausnummer: '',
      stockwerke: null,
    },
    capabilities: {
      tiefenbohrung_vorhanden: false,
      kellerfläche: false,
      dachfläche: false,
      heizlast_kw: null,
    },
    requirements: {}, // Gebäude hat keine Voraussetzungen
  };
}

/**
 * Factory-Funktion für ein neues Modul aus Template
 */
export function createModuleInstance(moduleTemplate) {
  return {
    ...moduleTemplate,
    id: `module-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  };
}

/**
 * Factory-Funktion für ein neues Modul-Template
 */
export function createModuleTemplate(name = 'Neues Modul') {
  return {
    id: `template-${Date.now()}`,
    type: 'module',
    name,
    properties: {
      modultyp: '',
      hersteller: 'Roots Energy',
      abmessungen: '',
      gewicht_kg: null,
    },
    capabilities: {
      wärmequelle_vorhanden: false,
      verfuegbare_leistung_kw: null,
    },
    requirements: {
      tiefenbohrung_required: false,
      kellerfläche: false,
      dachfläche: false,
      wärmequelle_vorhanden: false,
      min_leistung_kw: null,
      max_heizlast_kw: null,
    },
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
