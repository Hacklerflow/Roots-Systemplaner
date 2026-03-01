import { useState } from 'react';
import { createModuleTemplate, createInput, createOutput } from '../../data/types';
import InputOutputEditor from '../ConfiguratorEditor/InputOutputEditor';

export default function ModuleDatabase({ modules, setModules, leitungskatalog = [], verbindungsartenkatalog = [], dimensionskatalog = [], modultypen = [] }) {
  const [editingModule, setEditingModule] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = () => {
    setEditingModule(createModuleTemplate());
    setIsCreating(true);
  };

  const handleSave = (module) => {
    if (isCreating) {
      setModules([...modules, module]);
    } else {
      setModules(modules.map((m) => (m.id === module.id ? module : m)));
    }
    setEditingModule(null);
    setIsCreating(false);
  };

  const handleDelete = (id) => {
    if (confirm('Modul wirklich löschen?')) {
      setModules(modules.filter((m) => m.id !== id));
    }
  };

  const handleCancel = () => {
    setEditingModule(null);
    setIsCreating(false);
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto', minHeight: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ margin: 0 }}>Moduldatenbank</h2>
        <button
          onClick={handleCreate}
          disabled={!!editingModule}
          style={{
            padding: '12px 24px',
            background: editingModule ? 'var(--bg-tertiary)' : 'var(--accent)',
            color: editingModule ? 'var(--text-secondary)' : 'var(--bg-primary)',
            border: 'none',
            borderRadius: '4px',
            fontWeight: 600,
            cursor: editingModule ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit',
            fontSize: '14px',
          }}
        >
          + Neues Modul
        </button>
      </div>

      {/* Formular beim Erstellen/Bearbeiten */}
      {editingModule && (
        <ModuleForm
          module={editingModule}
          onSave={handleSave}
          onCancel={handleCancel}
          onDelete={handleDelete}
          isCreating={isCreating}
          leitungskatalog={leitungskatalog}
          verbindungsartenkatalog={verbindungsartenkatalog}
          dimensionskatalog={dimensionskatalog}
          modultypen={modultypen}
        />
      )}

      {/* Modulliste - Gruppiert nach Modultyp */}
      {(() => {
        const grouped = modules.reduce((acc, module) => {
          const type = module.moduleType || 'Sonstige';
          if (!acc[type]) acc[type] = [];
          acc[type].push(module);
          return acc;
        }, {});

        return Object.entries(grouped).map(([type, typeModules]) => (
          <div key={type} style={{ marginBottom: '32px' }}>
            <h3 style={{ marginBottom: '16px', color: 'var(--accent)', fontSize: '16px' }}>
              {type}
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
              {typeModules.map((module) => (
                <ModuleCard
                  key={module.id}
                  module={module}
                  onEdit={() => {
                    setEditingModule({ ...module });
                    setIsCreating(false);
                  }}
                  disabled={!!editingModule}
                  modultypen={modultypen}
                />
              ))}
            </div>
          </div>
        ));
      })()}
    </div>
  );
}

function ModuleCard({ module, onEdit, disabled, modultypen }) {
  // Find module type info
  const moduleTypeInfo = modultypen?.find(t => t.name === module.moduleType);
  const showsUnit = moduleTypeInfo?.berechnungsart === 'pro_einheit' && moduleTypeInfo?.einheit;

  return (
    <div
      style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        padding: '16px',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <div style={{ fontWeight: 600, fontSize: '16px', marginBottom: '4px' }}>
        {module.name}
      </div>
      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
        {module.moduleType || 'Modul'}
        {showsUnit && <span style={{ marginLeft: '4px', color: 'var(--accent)' }}>({moduleTypeInfo.einheit})</span>}
      </div>

      {/* Schnellinfo */}
      <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
        ⚡ {module.inputs.length} Eingänge | {module.outputs.length} Ausgänge
      </div>

      {/* Produktlink Button (falls vorhanden) */}
      {module.properties?.produktlink && (
        <a
          href={module.properties.produktlink}
          target="_blank"
          rel="noopener noreferrer"
          style={{ textDecoration: 'none', display: 'block', marginBottom: '8px' }}
        >
          <button
            style={{
              width: '100%',
              padding: '6px',
              background: 'var(--bg-tertiary)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border)',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: 500,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            🔗 Produktlink
          </button>
        </a>
      )}

      {/* Bearbeiten Button */}
      <button
        onClick={onEdit}
        disabled={disabled}
        style={{
          width: '100%',
          padding: '8px',
          background: 'var(--bg-tertiary)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border)',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: 600,
          cursor: disabled ? 'not-allowed' : 'pointer',
          fontFamily: 'inherit',
        }}
      >
        Bearbeiten
      </button>
    </div>
  );
}

function ModuleForm({ module, onSave, onCancel, onDelete, isCreating, leitungskatalog = [], verbindungsartenkatalog = [], dimensionskatalog = [], modultypen = [] }) {
  const [formData, setFormData] = useState(module);

  // Find module type info to determine if we need quantity field
  const moduleTypeInfo = modultypen?.find(t => t.name === formData.moduleType);
  const isProEinheit = moduleTypeInfo?.berechnungsart === 'pro_einheit';
  const einheit = moduleTypeInfo?.einheit || '';

  const handleChange = (section, key, value) => {
    setFormData({
      ...formData,
      [section]: {
        ...formData[section],
        [key]: value,
      },
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  // Input/Output Management
  const handleUpdateInput = (index, updated) => {
    const newInputs = [...formData.inputs];
    newInputs[index] = updated;
    setFormData({ ...formData, inputs: newInputs });
  };

  const handleDeleteInput = (index) => {
    setFormData({
      ...formData,
      inputs: formData.inputs.filter((_, i) => i !== index),
    });
  };

  const handleAddInput = () => {
    if (formData.inputs.length >= 12) {
      alert('Maximal 12 Eingänge erlaubt');
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
    setFormData({
      ...formData,
      outputs: formData.outputs.filter((_, i) => i !== index),
    });
  };

  const handleAddOutput = () => {
    if (formData.outputs.length >= 36) {
      alert('Maximal 36 Ausgänge erlaubt');
      return;
    }
    setFormData({
      ...formData,
      outputs: [...formData.outputs, createOutput()],
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        background: 'var(--bg-secondary)',
        border: '2px solid var(--accent)',
        borderRadius: '8px',
        padding: '24px',
        marginBottom: '32px',
      }}
    >
      <h3 style={{ marginTop: 0, marginBottom: '24px' }}>
        {isCreating ? 'Neues Modul erstellen' : 'Modul bearbeiten'}
      </h3>

      {/* Name & Modultyp */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '24px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '13px' }}>
            Name *
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            style={{
              width: '100%',
              padding: '10px',
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border)',
              borderRadius: '4px',
              color: 'var(--text-primary)',
              fontFamily: 'inherit',
              fontSize: '14px',
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '13px' }}>
            Modultyp *
          </label>
          <select
            required
            value={formData.moduleType || (modultypen.length > 0 ? modultypen[0].name : '')}
            onChange={(e) => setFormData({ ...formData, moduleType: e.target.value })}
            style={{
              width: '100%',
              padding: '10px',
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border)',
              borderRadius: '4px',
              color: 'var(--text-primary)',
              fontFamily: 'inherit',
              fontSize: '14px',
            }}
          >
            {modultypen.length === 0 ? (
              <option value="">Keine Modultypen verfügbar</option>
            ) : (
              modultypen.map(type => (
                <option key={type.id} value={type.name}>{type.name}</option>
              ))
            )}
          </select>
          {modultypen.length === 0 && (
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Bitte erstelle zuerst Modultypen im Tab "Modultypen"
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px' }}>
        {/* Eigenschaften */}
        <FormSection title="Eigenschaften">
          <FormField
            label="Hersteller"
            value={formData.properties.hersteller}
            onChange={(v) => handleChange('properties', 'hersteller', v)}
          />
          <FormField
            label="Abmessungen"
            value={formData.properties.abmessungen}
            onChange={(v) => handleChange('properties', 'abmessungen', v)}
          />
          {isProEinheit && (
            <FormField
              label={`Menge (${einheit})`}
              type="number"
              step="0.01"
              value={formData.properties.menge}
              onChange={(v) => handleChange('properties', 'menge', v)}
            />
          )}
          <FormField
            label={isProEinheit ? `Preis pro ${einheit} (€)` : "Preis (€)"}
            type="number"
            step="0.01"
            value={formData.properties.preis_euro}
            onChange={(v) => handleChange('properties', 'preis_euro', v)}
          />
          <FormField
            label="Produktlink"
            type="url"
            value={formData.properties.produktlink}
            onChange={(v) => handleChange('properties', 'produktlink', v)}
          />
        </FormSection>

        {/* Eingänge */}
        <div>
          <h4 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '12px', color: 'var(--accent)' }}>
            Eingänge ({formData.inputs.length}/12)
          </h4>
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {formData.inputs.map((input, idx) => (
              <InputOutputEditor
                key={input.id}
                connector={input}
                type="input"
                onUpdate={(updated) => handleUpdateInput(idx, updated)}
                onDelete={() => handleDeleteInput(idx)}
                leitungskatalog={leitungskatalog}
                verbindungsartenkatalog={verbindungsartenkatalog}
                dimensionskatalog={dimensionskatalog}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={handleAddInput}
            disabled={formData.inputs.length >= 12}
            style={{
              width: '100%',
              padding: '8px',
              marginTop: '8px',
              background: formData.inputs.length >= 12 ? 'var(--bg-tertiary)' : 'var(--success)',
              color: formData.inputs.length >= 12 ? 'var(--text-secondary)' : 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: formData.inputs.length >= 12 ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
            }}
          >
            + Eingang
          </button>
        </div>

        {/* Ausgänge */}
        <div>
          <h4 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '12px', color: 'var(--accent)' }}>
            Ausgänge ({formData.outputs.length}/36)
          </h4>
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {formData.outputs.map((output, idx) => (
              <InputOutputEditor
                key={output.id}
                connector={output}
                type="output"
                onUpdate={(updated) => handleUpdateOutput(idx, updated)}
                onDelete={() => handleDeleteOutput(idx)}
                leitungskatalog={leitungskatalog}
                verbindungsartenkatalog={verbindungsartenkatalog}
                dimensionskatalog={dimensionskatalog}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={handleAddOutput}
            disabled={formData.outputs.length >= 36}
            style={{
              width: '100%',
              padding: '8px',
              marginTop: '8px',
              background: formData.outputs.length >= 36 ? 'var(--bg-tertiary)' : 'var(--success)',
              color: formData.outputs.length >= 36 ? 'var(--text-secondary)' : 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: formData.outputs.length >= 36 ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
            }}
          >
            + Ausgang
          </button>
        </div>
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
        <button
          type="submit"
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
            fontSize: '14px',
          }}
        >
          {isCreating ? 'Erstellen' : 'Speichern'}
        </button>
        <button
          type="button"
          onClick={onCancel}
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
            fontSize: '14px',
          }}
        >
          Abbrechen
        </button>
        {!isCreating && (
          <button
            type="button"
            onClick={() => {
              onDelete(formData.id);
              onCancel();
            }}
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
              fontSize: '14px',
            }}
          >
            Löschen
          </button>
        )}
      </div>
    </form>
  );
}

function FormSection({ title, children }) {
  return (
    <div>
      <div
        style={{
          fontSize: '13px',
          fontWeight: 600,
          color: 'var(--accent)',
          marginBottom: '12px',
        }}
      >
        {title}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {children}
      </div>
    </div>
  );
}

function FormField({ label, value, onChange, type = 'text', step }) {
  return (
    <div>
      <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px' }}>
        {label}
      </label>
      <input
        type={type}
        step={step}
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
          fontSize: '12px',
        }}
      />
    </div>
  );
}
