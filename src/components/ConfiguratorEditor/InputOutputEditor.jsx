import { useState } from 'react';
import {
  CONNECTION_TYPES,
  CONNECTION_TYPE_LABELS,
  getModuleTypeOptions,
  getConnectionTypeOptions,
} from '../../data/types';

export default function InputOutputEditor({ connector, type, onUpdate, onDelete }) {
  const [label, setLabel] = useState(connector.label || '');
  const [connectionType, setConnectionType] = useState(connector.connectionType || CONNECTION_TYPES.HYDRAULIC);
  const [allowedModuleTypes, setAllowedModuleTypes] = useState(connector.allowedModuleTypes || []);

  const handleSave = () => {
    onUpdate({
      ...connector,
      label,
      connectionType,
      allowedModuleTypes,
    });
  };

  const toggleModuleType = (moduleType) => {
    if (allowedModuleTypes.includes(moduleType)) {
      setAllowedModuleTypes(allowedModuleTypes.filter(t => t !== moduleType));
    } else {
      setAllowedModuleTypes([...allowedModuleTypes, moduleType]);
    }
  };

  const moduleTypeOptions = getModuleTypeOptions();

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
      {/* Label */}
      <div style={{ marginBottom: '12px' }}>
        <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 500 }}>
          Label (z.B. "DN50")
        </label>
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onBlur={handleSave}
          placeholder={type === 'input' ? 'Eingang' : 'Ausgang'}
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
        />
      </div>

      {/* Connection Type */}
      <div style={{ marginBottom: '12px' }}>
        <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 500 }}>
          Verbindungstyp
        </label>
        <select
          value={connectionType}
          onChange={(e) => {
            setConnectionType(e.target.value);
            setTimeout(handleSave, 0);
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

      {/* Allowed Module Types */}
      <div style={{ marginBottom: '12px' }}>
        <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 500 }}>
          Erlaubte Modultypen
        </label>
        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
          Leer = alle erlaubt
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {moduleTypeOptions.map(moduleType => (
            <button
              key={moduleType}
              onClick={() => {
                toggleModuleType(moduleType);
                setTimeout(handleSave, 0);
              }}
              style={{
                padding: '4px 8px',
                background: allowedModuleTypes.includes(moduleType) ? 'var(--accent)' : 'var(--bg-primary)',
                color: allowedModuleTypes.includes(moduleType) ? 'var(--bg-primary)' : 'var(--text-secondary)',
                border: `1px solid ${allowedModuleTypes.includes(moduleType) ? 'var(--accent)' : 'var(--border)'}`,
                borderRadius: '3px',
                fontSize: '10px',
                fontWeight: 500,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              {moduleType}
            </button>
          ))}
        </div>
      </div>

      {/* Delete Button */}
      <button
        onClick={onDelete}
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
