import { useState, useEffect } from 'react';
import InputOutputEditor from './InputOutputEditor';
import { createInput, createOutput, isBuilding, getModuleTypeOptions } from '../../data/types';

export default function ElementModal({ element, onClose, onSave, onDelete, leitungskatalog = [], verbindungsartenkatalog = [], dimensionskatalog = [], modultypen = [] }) {
  const [formData, setFormData] = useState(() => {
    // Migration: Entferne alte Felder von Gebäuden (moduleType, inputs, outputs)
    const cleanedElement = { ...element };
    if (isBuilding(element)) {
      delete cleanedElement.moduleType;
      delete cleanedElement.inputs;
      delete cleanedElement.outputs;
    }
    return {
      ...cleanedElement,
      inputs: !isBuilding(element) ? (element?.inputs || []) : undefined,
      outputs: !isBuilding(element) ? (element?.outputs || []) : undefined,
      properties: element?.properties || {},
    };
  });

  useEffect(() => {
    // Migration: Entferne alte Felder von Gebäuden
    const cleanedElement = { ...element };
    if (isBuilding(element)) {
      delete cleanedElement.moduleType;
      delete cleanedElement.inputs;
      delete cleanedElement.outputs;
    }
    setFormData({
      ...cleanedElement,
      inputs: !isBuilding(element) ? (element?.inputs || []) : undefined,
      outputs: !isBuilding(element) ? (element?.outputs || []) : undefined,
      properties: element?.properties || {},
    });
  }, [element]);

  if (!element) return null;

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

  const handleSave = () => {
    // Für Gebäude: Entferne alte Felder vor dem Speichern
    const dataToSave = { ...formData };
    if (isBuildingElement) {
      delete dataToSave.moduleType;
      delete dataToSave.inputs;
      delete dataToSave.outputs;
    }
    onSave(dataToSave);
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
        {isBuildingElement ? (
          /* Gebäude-spezifische Eigenschaften */
          <>
            <Section title="Adresse">
              <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <FormField
                  label="Straße"
                  value={formData.properties?.strasse || ''}
                  onChange={(value) => handleChange('properties', 'strasse', value)}
                />
                <FormField
                  label="Hausnummer"
                  value={formData.properties?.hausnummer || ''}
                  onChange={(value) => handleChange('properties', 'hausnummer', value)}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
                <FormField
                  label="PLZ"
                  value={formData.properties?.plz || ''}
                  onChange={(value) => handleChange('properties', 'plz', value)}
                />
                <FormField
                  label="Ort"
                  value={formData.properties?.ort || ''}
                  onChange={(value) => handleChange('properties', 'ort', value)}
                />
              </div>
            </Section>

            <Section title="Gebäudedaten">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <FormField
                  label="Baujahr"
                  type="number"
                  value={formData.properties?.baujahr ?? null}
                  onChange={(value) => handleChange('properties', 'baujahr', value ? parseInt(value) : null)}
                />
                <FormField
                  label="Stockwerke"
                  type="number"
                  value={formData.properties?.stockwerke ?? null}
                  onChange={(value) => handleChange('properties', 'stockwerke', value ? parseInt(value) : null)}
                />
                <FormField
                  label="Anzahl Einheiten"
                  type="number"
                  value={formData.properties?.anzahl_einheiten ?? null}
                  onChange={(value) => handleChange('properties', 'anzahl_einheiten', value ? parseInt(value) : null)}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
                <FormField
                  label="Wohnfläche (m²)"
                  type="number"
                  step="0.01"
                  value={formData.properties?.wohnflaeche_m2 ?? null}
                  onChange={(value) => handleChange('properties', 'wohnflaeche_m2', value ? parseFloat(value) : null)}
                />
                <FormField
                  label="Nutzfläche (m²)"
                  type="number"
                  step="0.01"
                  value={formData.properties?.nutzflaeche_m2 ?? null}
                  onChange={(value) => handleChange('properties', 'nutzflaeche_m2', value ? parseFloat(value) : null)}
                />
              </div>
            </Section>

            <Section title="Heizlast">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <FormField
                  label="Heizlast nach Norm (kW)"
                  type="number"
                  step="0.1"
                  value={formData.properties?.heizlast_norm_kw ?? null}
                  onChange={(value) => handleChange('properties', 'heizlast_norm_kw', value ? parseFloat(value) : null)}
                  placeholder="z.B. DIN EN 12831"
                />
                <FormField
                  label="Auslegungsheizlast (kW)"
                  type="number"
                  step="0.1"
                  value={formData.properties?.auslegungsheizlast_kw ?? null}
                  onChange={(value) => handleChange('properties', 'auslegungsheizlast_kw', value ? parseFloat(value) : null)}
                  placeholder="Tatsächliche Auslegung"
                />
              </div>
            </Section>

            <Section title="Energetische Daten">
              <FormField
                label="Energiestandard"
                value={formData.properties?.energiestandard || ''}
                onChange={(value) => handleChange('properties', 'energiestandard', value)}
                placeholder="z.B. KfW 55, Passivhaus, Altbau unsaniert"
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginTop: '12px' }}>
                <FormField
                  label="U-Wert Außenwand (W/m²K)"
                  type="number"
                  step="0.01"
                  value={formData.properties?.u_wert_aussenwand ?? null}
                  onChange={(value) => handleChange('properties', 'u_wert_aussenwand', value ? parseFloat(value) : null)}
                />
                <FormField
                  label="U-Wert Dach (W/m²K)"
                  type="number"
                  step="0.01"
                  value={formData.properties?.u_wert_dach ?? null}
                  onChange={(value) => handleChange('properties', 'u_wert_dach', value ? parseFloat(value) : null)}
                />
                <FormField
                  label="U-Wert Fenster (W/m²K)"
                  type="number"
                  step="0.01"
                  value={formData.properties?.u_wert_fenster ?? null}
                  onChange={(value) => handleChange('properties', 'u_wert_fenster', value ? parseFloat(value) : null)}
                />
              </div>
            </Section>

            <Section title="Warmwasser">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <FormField
                  label="Anzahl Personen"
                  type="number"
                  value={formData.properties?.warmwasser_personen ?? null}
                  onChange={(value) => handleChange('properties', 'warmwasser_personen', value ? parseInt(value) : null)}
                />
                <FormField
                  label="Bedarf (l/Tag)"
                  type="number"
                  value={formData.properties?.warmwasser_bedarf_l_tag ?? null}
                  onChange={(value) => handleChange('properties', 'warmwasser_bedarf_l_tag', value ? parseInt(value) : null)}
                />
              </div>
            </Section>

            <Section title="Heizsystem">
              <FormField
                label="Heizsystem"
                value={formData.properties?.heizsystem || ''}
                onChange={(value) => handleChange('properties', 'heizsystem', value)}
                placeholder="z.B. Fußbodenheizung, Heizkörper, Mischsystem"
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
                <FormField
                  label="Vorlauftemperatur Auslegung (°C)"
                  type="number"
                  step="0.1"
                  value={formData.properties?.vorlauftemperatur_auslegung ?? null}
                  onChange={(value) => handleChange('properties', 'vorlauftemperatur_auslegung', value ? parseFloat(value) : null)}
                />
                <FormField
                  label="Rücklauftemperatur Auslegung (°C)"
                  type="number"
                  step="0.1"
                  value={formData.properties?.ruecklauftemperatur_auslegung ?? null}
                  onChange={(value) => handleChange('properties', 'ruecklauftemperatur_auslegung', value ? parseFloat(value) : null)}
                />
              </div>
            </Section>

            <Section title="Sonstiges">
              <FormField
                label="Besonderheiten"
                value={formData.properties?.besonderheiten || ''}
                onChange={(value) => handleChange('properties', 'besonderheiten', value)}
                multiline
              />
              <FormField
                label="Notizen"
                value={formData.properties?.notizen || ''}
                onChange={(value) => handleChange('properties', 'notizen', value)}
                multiline
              />
            </Section>
          </>
        ) : (
          /* Module-spezifische Eigenschaften */
          <Section title="Eigenschaften">
            {isProEinheit && (
              <FormField
                label={`Menge (${einheit})`}
                type="number"
                value={formData.properties?.menge ?? null}
                onChange={(value) => handleChange('properties', 'menge', value)}
              />
            )}
            {Object.keys(formData.properties || {}).map((key) => {
              // Skip menge if it's shown separately above
              if (key === 'menge' && isProEinheit) return null;

              // Dynamic label for preis_euro
              let label = formatLabel(key);
              if (key === 'preis_euro' && isProEinheit) {
                label = `Preis pro ${einheit} (€)`;
              } else if (key === 'preis_euro') {
                label = 'Preis (€)';
              }

              return (
                <FormField
                  key={key}
                  label={label}
                  value={formData.properties[key]}
                  onChange={(value) => handleChange('properties', key, value)}
                />
              );
            })}
          </Section>
        )}

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
                    leitungskatalog={leitungskatalog}
                    verbindungsartenkatalog={verbindungsartenkatalog}
                    dimensionskatalog={dimensionskatalog}
                    modultypen={modultypen}
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

          {/* Ausgänge - nur für Module, nicht für Gebäude */}
          {!isBuildingElement && (
            <div>
              <Section title={`Ausgänge (${formData.outputs.length}/36)`}>
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
                    modultypen={modultypen}
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
          )}
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

function FormField({ label, value, onChange, type = 'string', multiline = false, placeholder = '', step }) {
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

  const inputStyle = {
    width: '100%',
    padding: '8px',
    background: 'var(--bg-tertiary)',
    border: '1px solid var(--border)',
    borderRadius: '4px',
    color: 'var(--text-primary)',
    fontFamily: 'inherit',
    fontSize: '13px',
  };

  return (
    <div>
      <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px' }}>
        {label}
      </label>
      {multiline ? (
        <textarea
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          style={{
            ...inputStyle,
            resize: 'vertical',
            minHeight: '60px',
          }}
        />
      ) : (
        <input
          type={type === 'number' ? 'number' : 'text'}
          value={value ?? ''}
          onChange={(e) => {
            const val = type === 'number' ? (e.target.value ? parseFloat(e.target.value) : null) : e.target.value;
            onChange(val);
          }}
          placeholder={placeholder}
          step={step}
          style={inputStyle}
        />
      )}
    </div>
  );
}

function formatLabel(key) {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase());
}
