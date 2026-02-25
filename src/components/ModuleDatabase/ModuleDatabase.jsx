import { useState } from 'react';
import { createModuleTemplate } from '../../data/types';

export default function ModuleDatabase({ modules, setModules }) {
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
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
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
          isCreating={isCreating}
        />
      )}

      {/* Modulliste */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '16px' }}>
        {modules.map((module) => (
          <ModuleCard
            key={module.id}
            module={module}
            onEdit={() => {
              setEditingModule({ ...module });
              setIsCreating(false);
            }}
            onDelete={() => handleDelete(module.id)}
            disabled={!!editingModule}
          />
        ))}
      </div>
    </div>
  );
}

function ModuleCard({ module, onEdit, onDelete, disabled }) {
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
        {module.properties?.modultyp || 'Modul'}
      </div>

      {/* Schnellinfo */}
      <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
        {module.properties?.leistung_nominal_kw && (
          <div>⚡ {module.properties.leistung_nominal_kw} kW</div>
        )}
        {module.properties?.volumen_liter && (
          <div>📦 {module.properties.volumen_liter} L</div>
        )}
        {module.requirements?.tiefenbohrung_required && (
          <div>⚠️ Tiefenbohrung erforderlich</div>
        )}
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={onEdit}
          disabled={disabled}
          style={{
            flex: 1,
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
        <button
          onClick={onDelete}
          disabled={disabled}
          style={{
            flex: 1,
            padding: '8px',
            background: 'var(--error)',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: 600,
            cursor: disabled ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit',
          }}
        >
          Löschen
        </button>
      </div>
    </div>
  );
}

function ModuleForm({ module, onSave, onCancel, isCreating }) {
  const [formData, setFormData] = useState(module);

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

      {/* Name */}
      <div style={{ marginBottom: '24px' }}>
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px' }}>
        {/* Eigenschaften */}
        <FormSection title="Eigenschaften">
          <FormField
            label="Modultyp"
            value={formData.properties.modultyp}
            onChange={(v) => handleChange('properties', 'modultyp', v)}
          />
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
          <FormField
            label="Gewicht (kg)"
            type="number"
            value={formData.properties.gewicht_kg}
            onChange={(v) => handleChange('properties', 'gewicht_kg', v)}
          />
          <FormField
            label="Leistung nominal (kW)"
            type="number"
            value={formData.properties.leistung_nominal_kw}
            onChange={(v) => handleChange('properties', 'leistung_nominal_kw', v)}
          />
          <FormField
            label="Volumen (Liter)"
            type="number"
            value={formData.properties.volumen_liter}
            onChange={(v) => handleChange('properties', 'volumen_liter', v)}
          />
        </FormSection>

        {/* Leistungen */}
        <FormSection title="Leistungen">
          <FormField
            label="Wärmequelle vorhanden"
            type="boolean"
            value={formData.capabilities.wärmequelle_vorhanden}
            onChange={(v) => handleChange('capabilities', 'wärmequelle_vorhanden', v)}
          />
          <FormField
            label="Verfügbare Leistung (kW)"
            type="number"
            value={formData.capabilities.verfuegbare_leistung_kw}
            onChange={(v) => handleChange('capabilities', 'verfuegbare_leistung_kw', v)}
          />
        </FormSection>

        {/* Voraussetzungen */}
        <FormSection title="Voraussetzungen">
          <FormField
            label="Tiefenbohrung erforderlich"
            type="boolean"
            value={formData.requirements.tiefenbohrung_required}
            onChange={(v) => handleChange('requirements', 'tiefenbohrung_required', v)}
          />
          <FormField
            label="Kellerfläche"
            type="boolean"
            value={formData.requirements.kellerfläche}
            onChange={(v) => handleChange('requirements', 'kellerfläche', v)}
          />
          <FormField
            label="Dachfläche"
            type="boolean"
            value={formData.requirements.dachfläche}
            onChange={(v) => handleChange('requirements', 'dachfläche', v)}
          />
          <FormField
            label="Wärmequelle vorhanden"
            type="boolean"
            value={formData.requirements.wärmequelle_vorhanden}
            onChange={(v) => handleChange('requirements', 'wärmequelle_vorhanden', v)}
          />
          <FormField
            label="Max. Heizlast (kW)"
            type="number"
            value={formData.requirements.max_heizlast_kw}
            onChange={(v) => handleChange('requirements', 'max_heizlast_kw', v)}
          />
          <FormField
            label="Min. Leistung (kW)"
            type="number"
            value={formData.requirements.min_leistung_kw}
            onChange={(v) => handleChange('requirements', 'min_leistung_kw', v)}
          />
        </FormSection>
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
      </div>
    </form>
  );
}

function FormSection({ title, children }) {
  return (
    <div>
      <div
        style={{
          fontSize: '12px',
          fontWeight: 600,
          color: 'var(--accent)',
          marginBottom: '12px',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
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

function FormField({ label, value, onChange, type = 'text' }) {
  if (type === 'boolean') {
    return (
      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
        <input
          type="checkbox"
          checked={value || false}
          onChange={(e) => onChange(e.target.checked)}
          style={{ width: '16px', height: '16px' }}
        />
        <span style={{ fontSize: '12px' }}>{label}</span>
      </label>
    );
  }

  return (
    <div>
      <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px' }}>
        {label}
      </label>
      <input
        type={type}
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
