import { useState, useEffect } from 'react';
import {
  CONNECTION_TYPES,
  CONNECTION_TYPE_LABELS,
  getConnectionTypeOptions,
} from '../../data/types';

export default function InputOutputEditor({ connector, type, onUpdate, onDelete, leitungskatalog = [], verbindungsartenkatalog = [], dimensionskatalog = [], modultypen = [], pumpenkatalog = [] }) {
  const [dimension, setDimension] = useState(connector.dimension || '');
  const [verbindungsart, setVerbindungsart] = useState(connector.verbindungsart || '');
  const [connectionType, setConnectionType] = useState(connector.connectionType || CONNECTION_TYPES.HYDRAULIC);
  const [allowedModuleTypes, setAllowedModuleTypes] = useState(connector.allowedModuleTypes || []);

  // Pump configuration (for inputs and outputs with hydraulic connection type)
  const [selectedPumpId, setSelectedPumpId] = useState(connector.pump?.pump_id || null);
  const [pumpExcludeFromBOM, setPumpExcludeFromBOM] = useState(connector.pump?.nicht_in_stueckliste || false);

  // Finde das Kürzel der gewählten Verbindungsart
  const getKuerzel = (verbindungsartName) => {
    if (!verbindungsartName) return '';
    const verbindungsartObj = verbindungsartenkatalog.find(v => v.name === verbindungsartName);
    return verbindungsartObj?.kuerzel || '';
  };

  // Automatisch generiertes Label: Nur das Kürzel der Verbindungsart
  const generatedLabel = getKuerzel(verbindungsart);

  const handleSave = (updates = {}) => {
    const finalVerbindungsart = updates.verbindungsart !== undefined ? updates.verbindungsart : verbindungsart;
    const label = getKuerzel(finalVerbindungsart);
    const finalConnectionType = updates.connectionType !== undefined ? updates.connectionType : connectionType;
    const finalSelectedPumpId = updates.selectedPumpId !== undefined ? updates.selectedPumpId : selectedPumpId;
    const finalPumpExcludeFromBOM = updates.pumpExcludeFromBOM !== undefined ? updates.pumpExcludeFromBOM : pumpExcludeFromBOM;

    // Include pump data for both inputs and outputs with hydraulic connection type
    const pumpData = (finalConnectionType === CONNECTION_TYPES.HYDRAULIC && finalSelectedPumpId) ? {
      pump_id: finalSelectedPumpId,
      nicht_in_stueckliste: finalPumpExcludeFromBOM,
    } : null;

    onUpdate({
      ...connector,
      label,
      dimension: updates.dimension !== undefined ? updates.dimension : dimension,
      verbindungsart: finalVerbindungsart,
      connectionType: finalConnectionType,
      allowedModuleTypes: updates.allowedModuleTypes !== undefined ? updates.allowedModuleTypes : allowedModuleTypes,
      pump: pumpData,
    });
  };

  const toggleModuleType = (moduleType) => {
    let newAllowedTypes;
    if (allowedModuleTypes.includes(moduleType)) {
      newAllowedTypes = allowedModuleTypes.filter(t => t !== moduleType);
    } else {
      newAllowedTypes = [...allowedModuleTypes, moduleType];
    }
    setAllowedModuleTypes(newAllowedTypes);
    return newAllowedTypes;
  };

  // Verfügbare Dimensionen: Nur für den gewählten Verbindungstyp
  const getAvailableDimensions = () => {
    const filteredDimensions = dimensionskatalog
      .filter(d => d.connectionType === connectionType)
      .map(d => d.name);
    const uniqueDimensions = [...new Set(filteredDimensions)];
    return uniqueDimensions.filter(Boolean).sort();
  };

  // Verfügbare Verbindungsarten: Filtere nach Dimension (falls gewählt)
  const getAvailableVerbindungsarten = () => {
    if (!dimension) {
      // Keine Dimension gewählt: zeige alle Verbindungsarten des connectionType
      return verbindungsartenkatalog.filter(v => v.connectionType === connectionType);
    }

    // Finde alle Verbindungsarten, die die gewählte Dimension unterstützen
    // Entweder: Name enthält Dimension ODER kompatible Leitungen haben diese Dimension
    return verbindungsartenkatalog.filter(v => {
      // Option 1: Name enthält die Dimension
      if (v.name.includes(dimension)) {
        return true;
      }

      // Option 2: Mindestens eine kompatible Leitung hat diese Dimension
      if (v.kompatible_leitungen && v.kompatible_leitungen.length > 0) {
        return v.kompatible_leitungen.some(leitungId => {
          const leitung = leitungskatalog.find(l => l.id === leitungId);
          return leitung && leitung.dimension === dimension;
        });
      }

      return false;
    });
  };

  const availableDimensions = getAvailableDimensions();
  const availableVerbindungsarten = getAvailableVerbindungsarten();

  return (
    <div
      style={{
        background: 'var(--bg-tertiary)',
        border: '1px solid var(--border)',
        borderRadius: '4px',
        padding: '12px',
        marginBottom: '12px',
      }}
    >
      {/* Connection Type */}
      <div style={{ marginBottom: '12px' }}>
        <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 500 }}>
          Verbindungstyp
        </label>
        <select
          value={connectionType}
          onChange={(e) => {
            const newType = e.target.value;
            setConnectionType(newType);
            // Reset Dimension und Verbindungsart bei Typ-Wechsel
            setDimension('');
            setVerbindungsart('');
            handleSave({ connectionType: newType, dimension: '', verbindungsart: '' });
          }}
          style={{
            width: '100%',
            padding: '6px',
            background: 'var(--bg-primary)',
            border: '1px solid var(--border)',
            borderRadius: '4px',
            color: 'var(--text-primary)',
            fontFamily: 'inherit',
            fontSize: '12px',
          }}
        >
          {getConnectionTypeOptions().map(ct => (
            <option key={ct} value={ct}>
              {CONNECTION_TYPE_LABELS[ct]}
            </option>
          ))}
        </select>
      </div>

      {/* Dimension */}
      <div style={{ marginBottom: '12px' }}>
        <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 500 }}>
          Dimension
        </label>
        <select
          value={dimension}
          onChange={(e) => {
            const newDimension = e.target.value;
            setDimension(newDimension);
            // Reset Verbindungsart bei Dimensions-Wechsel
            setVerbindungsart('');
            handleSave({ dimension: newDimension, verbindungsart: '' });
          }}
          style={{
            width: '100%',
            padding: '6px',
            background: 'var(--bg-primary)',
            border: '1px solid var(--border)',
            borderRadius: '4px',
            color: 'var(--text-primary)',
            fontFamily: 'inherit',
            fontSize: '12px',
          }}
        >
          <option value="">Keine / Benutzerdefiniert</option>
          {availableDimensions.map(dim => (
            <option key={dim} value={dim}>
              {dim}
            </option>
          ))}
        </select>
        {availableDimensions.length === 0 && (
          <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Keine Dimensionen im Katalog verfügbar
          </div>
        )}
      </div>

      {/* Verbindungsart */}
      <div style={{ marginBottom: '12px' }}>
        <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 500 }}>
          Verbindungsart
          {dimension && (
            <span style={{ fontWeight: 400, fontSize: '10px', color: 'var(--text-secondary)', marginLeft: '6px' }}>
              (für {dimension})
            </span>
          )}
        </label>
        <select
          value={verbindungsart}
          onChange={(e) => {
            const newVerbindungsart = e.target.value;
            setVerbindungsart(newVerbindungsart);
            handleSave({ verbindungsart: newVerbindungsart });
          }}
          style={{
            width: '100%',
            padding: '6px',
            background: 'var(--bg-primary)',
            border: '1px solid var(--border)',
            borderRadius: '4px',
            color: 'var(--text-primary)',
            fontFamily: 'inherit',
            fontSize: '12px',
          }}
        >
          <option value="">Keine / Benutzerdefiniert</option>
          {availableVerbindungsarten.map(v => (
            <option key={v.id} value={v.name}>
              {v.name}
            </option>
          ))}
        </select>
        {availableVerbindungsarten.length === 0 && dimension && (
          <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Keine Verbindungsarten für {dimension} verfügbar
          </div>
        )}
      </div>

      {/* Generiertes Label (Vorschau) - Nur Kürzel */}
      {generatedLabel && (
        <div style={{
          marginBottom: '12px',
          padding: '8px',
          background: 'var(--bg-primary)',
          border: '1px solid var(--border)',
          borderRadius: '4px',
        }}>
          <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
            Kürzel (wird angezeigt):
          </div>
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent)', fontFamily: 'monospace' }}>
            {generatedLabel}
          </div>
        </div>
      )}

      {/* Allowed Module Types */}
      <div style={{ marginBottom: '12px' }}>
        <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 500 }}>
          Erlaubte Modultypen
        </label>
        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
          Leer = alle erlaubt
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {modultypen.map(moduleType => (
            <button
              type="button"
              key={moduleType.id}
              onClick={(e) => {
                e.stopPropagation();
                const newAllowedTypes = toggleModuleType(moduleType.name);
                handleSave({ allowedModuleTypes: newAllowedTypes });
              }}
              style={{
                padding: '4px 8px',
                background: allowedModuleTypes.includes(moduleType.name) ? 'var(--accent)' : 'var(--bg-primary)',
                color: allowedModuleTypes.includes(moduleType.name) ? 'var(--bg-primary)' : 'var(--text-secondary)',
                border: `1px solid ${allowedModuleTypes.includes(moduleType.name) ? 'var(--accent)' : 'var(--border)'}`,
                borderRadius: '3px',
                fontSize: '10px',
                fontWeight: 500,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              {moduleType.name}
            </button>
          ))}
        </div>
      </div>

      {/* Pump Configuration (for hydraulic inputs and outputs) */}
      {connectionType === CONNECTION_TYPES.HYDRAULIC && (
        <div style={{
          marginBottom: '12px',
          padding: '12px',
          background: 'var(--bg-primary)',
          border: '1px solid var(--border)',
          borderRadius: '4px',
        }}>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 500 }}>
              Pumpe zuweisen
            </label>
            <select
              value={selectedPumpId || ''}
              onChange={(e) => {
                const pumpId = e.target.value ? parseInt(e.target.value) : null;
                setSelectedPumpId(pumpId);
                handleSave({ selectedPumpId: pumpId });
              }}
              style={{
                width: '100%',
                padding: '6px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                color: 'var(--text-primary)',
                fontFamily: 'inherit',
                fontSize: '12px',
              }}
            >
              <option value="">Keine Pumpe</option>
              {pumpenkatalog.map(pump => (
                <option key={pump.id} value={pump.id}>
                  {pump.name} {pump.hersteller && `(${pump.hersteller})`} {pump.foerderhoehe_m && `- ${pump.foerderhoehe_m}m`}
                </option>
              ))}
            </select>
            {pumpenkatalog.length === 0 && (
              <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Keine Pumpen im Katalog verfügbar. Legen Sie Pumpen im Einstellungen-Tab an.
              </div>
            )}
          </div>

          {selectedPumpId && (
            <div>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '11px',
                fontWeight: 400,
                cursor: 'pointer',
                color: 'var(--text-secondary)',
              }}>
                <input
                  type="checkbox"
                  checked={pumpExcludeFromBOM}
                  onChange={(e) => {
                    const exclude = e.target.checked;
                    setPumpExcludeFromBOM(exclude);
                    handleSave({ pumpExcludeFromBOM: exclude });
                  }}
                  style={{ cursor: 'pointer' }}
                />
                <span>Nicht separat in Stückliste anführen</span>
              </label>
              <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Pumpe wird nicht in Stückliste aufgeführt und Preis wird ignoriert
              </div>
            </div>
          )}
        </div>
      )}

      {/* Delete Button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        style={{
          width: '100%',
          padding: '6px',
          background: 'var(--error)',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          fontSize: '11px',
          fontWeight: 600,
          cursor: 'pointer',
          fontFamily: 'inherit',
        }}
      >
        Löschen
      </button>
    </div>
  );
}
