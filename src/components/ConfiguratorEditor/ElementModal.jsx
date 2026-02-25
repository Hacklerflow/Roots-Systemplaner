import { useState, useEffect } from 'react';

export default function ElementModal({ element, onClose, onSave }) {
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

  const isBuilding = element.type === 'building';

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
          maxWidth: '600px',
          width: '90%',
          maxHeight: '80vh',
          overflow: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ marginTop: 0, marginBottom: '24px' }}>
          {isBuilding ? 'Gebäude bearbeiten' : 'Modul bearbeiten'}
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

        {/* Leistungen */}
        <Section title="Leistungen">
          {Object.keys(formData.capabilities || {}).map((key) => (
            <FormField
              key={key}
              label={formatLabel(key)}
              value={formData.capabilities[key]}
              onChange={(value) => handleChange('capabilities', key, value)}
              type={typeof formData.capabilities[key]}
            />
          ))}
        </Section>

        {/* Voraussetzungen (nur für Module) */}
        {!isBuilding && (
          <Section title="Voraussetzungen">
            {Object.keys(formData.requirements || {}).map((key) => (
              <FormField
                key={key}
                label={formatLabel(key)}
                value={formData.requirements[key]}
                onChange={(value) => handleChange('requirements', key, value)}
                type={typeof formData.requirements[key]}
              />
            ))}
          </Section>
        )}

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
