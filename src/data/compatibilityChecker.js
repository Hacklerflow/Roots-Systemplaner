// Kompatibilitätsprüfung zwischen Elementen in der Kette

/**
 * Prüft ob ein Element mit seinem Vorgänger kompatibel ist
 *
 * @param {Object} predecessor - Das vorherige Element in der Kette
 * @param {Object} element - Das zu prüfende Element
 * @returns {Object} { compatible: boolean, missingRequirements: string[] }
 */
export function checkCompatibility(predecessor, element) {
  if (!predecessor || !element) {
    return { compatible: true, missingRequirements: [] };
  }

  const missingRequirements = [];

  // Prüfe alle requirements des Elements
  const requirements = element.requirements || {};
  const capabilities = predecessor.capabilities || {};

  // Boolean-Flags prüfen
  Object.keys(requirements).forEach((key) => {
    const required = requirements[key];

    if (typeof required === 'boolean' && required === true) {
      // Element benötigt dieses Flag auf true
      if (capabilities[key] !== true) {
        missingRequirements.push(formatRequirementName(key));
      }
    }
  });

  // Numerische Voraussetzungen prüfen
  // max_heizlast_kw: Modul kann max X kW Heizlast bedienen
  if (requirements.max_heizlast_kw !== null && requirements.max_heizlast_kw !== undefined) {
    const heizlast = capabilities.heizlast_kw;
    if (heizlast !== null && heizlast !== undefined) {
      if (heizlast > requirements.max_heizlast_kw) {
        missingRequirements.push(
          `Heizlast zu hoch (${heizlast} kW > ${requirements.max_heizlast_kw} kW max)`
        );
      }
    }
  }

  // min_leistung_kw: Element benötigt mindestens X kW Leistung
  if (requirements.min_leistung_kw !== null && requirements.min_leistung_kw !== undefined) {
    const leistung = capabilities.verfuegbare_leistung_kw;
    if (leistung === null || leistung === undefined || leistung < requirements.min_leistung_kw) {
      missingRequirements.push(
        `Zu wenig Leistung (benötigt ${requirements.min_leistung_kw} kW)`
      );
    }
  }

  return {
    compatible: missingRequirements.length === 0,
    missingRequirements,
  };
}

/**
 * Filtert Module nach Kompatibilität mit einem Element
 *
 * @param {Object} currentElement - Das aktuelle letzte Element der Kette
 * @param {Array} moduleDatabase - Array aller verfügbaren Module
 * @returns {Object} { compatible: Module[], incompatible: Module[] }
 */
export function getCompatibleModules(currentElement, moduleDatabase) {
  const compatible = [];
  const incompatible = [];

  moduleDatabase.forEach((module) => {
    const check = checkCompatibility(currentElement, module);

    if (check.compatible) {
      compatible.push({
        module,
        check,
      });
    } else {
      incompatible.push({
        module,
        check,
      });
    }
  });

  return { compatible, incompatible };
}

/**
 * Formatiert einen Requirement-Key zu einem lesbaren Namen
 */
function formatRequirementName(key) {
  const names = {
    tiefenbohrung_required: 'Tiefenbohrung',
    kellerfläche: 'Kellerfläche',
    dachfläche: 'Dachfläche',
    wärmequelle_vorhanden: 'Wärmequelle',
  };
  return names[key] || key;
}

/**
 * Validiert eine komplette Kette
 *
 * @param {Object} building - Das Gebäude
 * @param {Array} chain - Array der Module in der Kette
 * @returns {Array} Array von Validierungsergebnissen für jede Verbindung
 */
export function validateChain(building, chain) {
  if (!building || chain.length === 0) {
    return [];
  }

  const results = [];
  let predecessor = building;

  chain.forEach((element, index) => {
    const check = checkCompatibility(predecessor, element);
    results.push({
      index,
      element,
      predecessor,
      ...check,
    });
    predecessor = element;
  });

  return results;
}
