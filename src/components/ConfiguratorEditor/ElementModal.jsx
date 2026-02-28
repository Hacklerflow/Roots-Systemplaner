import { useState, useEffect } from 'react';
import InputOutputEditor from './InputOutputEditor';
import { createInput, createOutput, isBuilding, getModuleTypeOptions } from '../../data/types';

export default function ElementModal({ element, onClose, onSave, onDelete }) {
  const [formData, setFormData] = useState(element);

  useEffect(() => {
    setFormData(element);
  }, [element]);

  if (!element) return null;

  const handleChange = (section, key, value) => {
    setFormData({
      ...formData,
      [section]: {
        ...formData[section],
        [key]: value,
      },
    });
  };

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  const isBuildingElement = isBuilding(element);

  // Input/Output Management
  const handleUpdateInput = (index, updated) => {
    const newInputs = [...formData.inputs];
    newInputs[index] = updated;
    setFormData({ ...formData, inputs: newInputs });
  };

  const handleDeleteInput = (index) => {
    if (confirm('Eingang wirklich löschen?')) {
      setFormData({
        ...formData,
        inputs: formData.inputs.filter((_, i) => i !== index),
      });
    }
  };

  const handleAddInput = () => {
    const maxInputs = 12;
    if (formData.inputs.length >= maxInputs) {
      alert(`Maximal ${maxInputs} Eingänge erlaubt`);
      return;
    }
    setFormData({
      ...formData,
      inputs: [...formData.inputs, createInput()],
    });
  };

  const handleUpdateOutput = (index, updated) => {
    const newOutputs = [...formData.outputs];
    newOutputs[index] = updated;
    setFormData({ ...formData, outputs: newOutputs });
  };

  const handleDeleteOutput = (index) => {
    if (confirm('Ausgang wirklich löschen?')) {
      setFormData({
        ...formData,
        outputs: formData.outputs.filter((_, i) => i !== index),
      });
    }
  };

  const handleAddOutput = () => {
    const maxOutputs = 36;
    if (formData.outputs.length >= maxOutputs) {
      alert(`Maximal ${maxOutputs} Ausgänge erlaubt`);
      return;
    }
    setFormData({
      ...formData,
      outputs: [...formData.outputs, createOutput()],
    });
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          padding: '24px',
          maxWidth: '900px',
          width: '90%',
          maxHeight: '90vh',
          overflow: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ marginTop: 0, marginBottom: '24px' }}>
          {isBuildingElement ? 'Gebäude bearbeiten' : 'Modul bearbeiten'}
        </h2>

        {/* Name */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
            Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            style={{
              width: '100%',
              padding: '8px',
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border)',
              borderRadius: '4px',
              color: 'var(--text-primary)',
              fontFamily: 'inherit',
            }}
          />
        </div>

        {/* Modultyp (nur für Module) */}
        {!isBuildingElement && (
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
              Modultyp
            </label>
            <select
              value={formData.moduleType || ''}
              onChange={(e) => setFormData({ ...formData, moduleType: e.target.value })}
              style={{
                width: '100%',
                padding: '8px',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                color: 'var(--text-primary)',
                fontFamily: 'inherit',
              }}
            >
              {getModuleTypeOptions().map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        )}

        {/* Eigenschaften */}
        <Section title="Eigenschaften">
          {Object.keys(formData.properties || {}).map((key) => (
            <FormField
              key={key}
              label={formatLabel(key)}
              value={formData.properties[key]}
              onChange={(value) => handleChange('properties', key, value)}
            />
          ))}
        </Section>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
          {/* Eingänge (nicht für Gebäude) */}
          {!isBuildingElement && (
            <div>
              <Section title={`Eingänge (${formData.inputs.length}/12)`}>
                {formData.inputs.map((input, idx) => (
                  <InputOutputEditor
                    key={input.id}
                    connector={input}
                    type="input"
                    onUpdate={(updated) => handleUpdateInput(idx, updated)}
                    onDelete={() => handleDeleteInput(idx)}
                  />
                ))}
                <button
                  type="button"
                  onClick={handleAddInput}
                  disabled={formData.inputs.length >= 12}
                  style={{
                    width: '100%',
                    padding: '8px',
                    background: formData.inputs.length >= 12 ? 'var(--bg-tertiary)' : 'var(--success)',
                    color: formData.inputs.length >= 12 ? 'var(--text-secondary)' : 'var(--bg-primary)',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: formData.inputs.length >= 12 ? 'not-allowed' : 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  + Eingang hinzufügen
                </button>
              </Section>
            </div>
          )}

          {/* Ausgänge */}
          <div>
            <Section title={`Ausgänge (${formData.outputs.length}/36)`}>
              {formData.outputs.map((output, idx) => (
                <InputOutputEditor
                  key={output.id}
                  connector={output}
                  type="output"
                  onUpdate={(updated) => handleUpdateOutput(idx, updated)}
                  onDelete={() => handleDeleteOutput(idx)}
                />
              ))}
              <button
                type="button"
                onClick={handleAddOutput}
                disabled={formData.outputs.length >= 36}
                style={{
                  width: '100%',
                  padding: '8px',
                  background: formData.outputs.length >= 36 ? 'var(--bg-tertiary)' : 'var(--success)',
                  color: formData.outputs.length >= 36 ? 'var(--text-secondary)' : 'var(--bg-primary)',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: formData.outputs.length >= 36 ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                + Ausgang hinzufügen
              </button>
            </Section>
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
          <button
            onClick={handleSave}
            style={{
              flex: 1,
              padding: '12px',
              background: 'var(--accent)',
              color: 'var(--bg-primary)',
              border: 'none',
              borderRadius: '4px',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Speichern
          </button>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '12px',
              background: 'var(--bg-tertiary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border)',
              borderRadius: '4px',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Abbrechen
          </button>
          {onDelete && !isBuildingElement && (
            <button
              onClick={onDelete}
              style={{
                flex: 1,
                padding: '12px',
                background: 'var(--error)',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Löschen
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: '24px' }}>
      <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', color: 'var(--accent)' }}>
        {title}
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {children}
      </div>
    </div>
  );
}

function FormField({ label, value, onChange, type = 'string' }) {
  if (type === 'boolean') {
    return (
      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
        <input
          type="checkbox"
          checked={value || false}
          onChange={(e) => onChange(e.target.checked)}
          style={{ width: '16px', height: '16px' }}
        />
        <span style={{ fontSize: '13px' }}>{label}</span>
      </label>
    );
  }

  return (
    <div>
      <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px' }}>
        {label}
      </label>
      <input
        type={type === 'number' ? 'number' : 'text'}
        value={value ?? ''}
        onChange={(e) => {
          const val = type === 'number' ? (e.target.value ? parseFloat(e.target.value) : null) : e.target.value;
          onChange(val);
        }}
        style={{
          width: '100%',
          padding: '8px',
          background: 'var(--bg-tertiary)',
          border: '1px solid var(--border)',
          borderRadius: '4px',
          color: 'var(--text-primary)',
          fontFamily: 'inherit',
          fontSize: '13px',
        }}
      />
    </div>
  );
}

function formatLabel(key) {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase());
}
