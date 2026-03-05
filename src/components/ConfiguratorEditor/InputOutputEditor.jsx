import { useState, useEffect } from 'react';
import {
  CONNECTION_TYPES,
  CONNECTION_TYPE_LABELS,
  getConnectionTypeOptions,
} from '../../data/types';

export default function InputOutputEditor({ connector, type, onUpdate, onDelete, leitungskatalog = [], verbindungsartenkatalog = [], dimensionskatalog = [], modultypen = [] }) {
  const [dimension, setDimension] = useState(connector.dimension || '');
  const [verbindungsart, setVerbindungsart] = useState(connector.verbindungsart || '');
  const [connectionType, setConnectionType] = useState(connector.connectionType || CONNECTION_TYPES.HYDRAULIC);
  const [allowedModuleTypes, setAllowedModuleTypes] = useState(connector.allowedModuleTypes || []);

  // Pump configuration (only for outputs with hydraulic connection type)
  const [pumpEnabled, setPumpEnabled] = useState(connector.pump?.enabled || false);
  const [pumpCapacity, setPumpCapacity] = useState(connector.pump?.förderhoehe_m || 0);

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
    const finalPumpEnabled = updates.pumpEnabled !== undefined ? updates.pumpEnabled : pumpEnabled;
    const finalPumpCapacity = updates.pumpCapacity !== undefined ? updates.pumpCapacity : pumpCapacity;

    // Include pump data only for hydraulic outputs
    const pumpData = (type === 'output' && finalConnectionType === CONNECTION_TYPES.HYDRAULIC) ? {
      enabled: finalPumpEnabled,
      förderhoehe_m: finalPumpEnabled ? parseFloat(finalPumpCapacity) || 0 : 0,
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

      {/* Pump Configuration (only for hydraulic outputs) */}
      {type === 'output' && connectionType === CONNECTION_TYPES.HYDRAULIC && (
        <div style={{
          marginBottom: '12px',
          padding: '12px',
          background: 'var(--bg-primary)',
          border: '1px solid var(--border)',
          borderRadius: '4px',
        }}>
          <div style={{ marginBottom: '8px' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '12px',
              fontWeight: 500,
              cursor: 'pointer',
            }}>
              <input
                type="checkbox"
                checked={pumpEnabled}
                onChange={(e) => {
                  const enabled = e.target.checked;
                  setPumpEnabled(enabled);
                  handleSave({ pumpEnabled: enabled });
                }}
                style={{ cursor: 'pointer' }}
              />
              <span>Pumpe aktivieren</span>
            </label>
          </div>

          {pumpEnabled && (
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 500 }}>
                Förderhöhe (m)
              </label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={pumpCapacity}
                onChange={(e) => {
                  const value = e.target.value;
                  setPumpCapacity(value);
                }}
                onBlur={(e) => {
                  const value = parseFloat(e.target.value) || 0;
                  setPumpCapacity(value);
                  handleSave({ pumpCapacity: value });
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
                placeholder="z.B. 10"
              />
              <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Maximale Förderhöhe der Pumpe in Metern
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
