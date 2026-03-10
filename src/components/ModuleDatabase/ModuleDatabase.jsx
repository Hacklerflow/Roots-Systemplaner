import { useState } from 'react';
import { createModuleTemplate, createInput, createOutput } from '../../data/types';
import InputOutputEditor from '../ConfiguratorEditor/InputOutputEditor';
import { catalogsAPI } from '../../api/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function ModuleDatabase({ modules, setModules, leitungskatalog = [], verbindungsartenkatalog = [], dimensionskatalog = [], modultypen = [], pumpenkatalog = [], onReloadCatalogs }) {
  const [editingModule, setEditingModule] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = () => {
    setEditingModule(createModuleTemplate());
    setIsCreating(true);
  };

  const handleSave = async (module) => {
    setSaving(true);
    setError('');

    try {
      // Convert frontend format to backend format
      const backendModule = {
        name: module.name,
        modultyp: module.modultyp || module.moduleType,
        hersteller: module.hersteller,
        abmessungen: module.abmessungen,
        gewicht_kg: module.gewichtKg,
        leistung_kw: module.leistungKw,
        volumen_l: module.volumenL,
        preis: module.preis,
        eingaenge: module.inputs,
        ausgaenge: module.outputs,
      };

      if (isCreating) {
        // Create new module in backend
        await catalogsAPI.addModule(backendModule);

        // Update local state
        setModules([...modules, module]);
      } else {
        // Find module ID in backend (we need to search by name since frontend uses temp IDs)
        const backendModules = await catalogsAPI.getModules();
        const backendMod = backendModules.modules.find(m => m.name === module.name);

        if (backendMod) {
          await catalogsAPI.updateModule(backendMod.id, backendModule);
        }

        // Update local state
        setModules(modules.map((m) => (m.id === module.id ? module : m)));
      }

      setEditingModule(null);
      setIsCreating(false);

      // Reload catalogs to get fresh data from backend
      if (onReloadCatalogs) {
        await onReloadCatalogs();
      }
    } catch (err) {
      console.error('Fehler beim Speichern:', err);
      setError('Fehler beim Speichern: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (moduleToDelete) => {
    if (!confirm('Modul wirklich löschen?')) return;

    setSaving(true);
    setError('');

    try {
      // Validate module has a name
      if (!moduleToDelete || !moduleToDelete.name) {
        throw new Error('Modul hat keinen Namen - kann nicht gelöscht werden');
      }

      // Find module in backend by name
      const backendModules = await catalogsAPI.getModules();

      if (!backendModules || !backendModules.modules || !Array.isArray(backendModules.modules)) {
        throw new Error('Backend returned invalid data structure');
      }

      // Try exact match first, then trimmed match
      let backendMod = backendModules.modules.find(m => m.name === moduleToDelete.name);
      if (!backendMod) {
        backendMod = backendModules.modules.find(m => m.name.trim() === moduleToDelete.name.trim());
      }

      if (backendMod) {
        await catalogsAPI.deleteModule(backendMod.id);
      }

      // Always reload catalogs from backend to ensure sync
      if (onReloadCatalogs) {
        await onReloadCatalogs();
      } else {
        // Fallback: Update local state if onReloadCatalogs is not available
        setModules(modules.filter((m) => m.name !== moduleToDelete.name));
      }
    } catch (err) {
      console.error('Fehler beim Löschen:', err);
      setError('Fehler beim Löschen: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditingModule(null);
    setIsCreating(false);
  };

  return (
    <div className="p-6 max-w-[1400px] mx-auto min-h-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="m-0">Moduldatenbank</h2>
          {saving && <p className="m-0 mt-1 text-xs text-foreground-secondary">Speichert...</p>}
        </div>
        <Button
          onClick={handleCreate}
          disabled={!!editingModule || saving}
          className="bg-accent hover:bg-accent/90 text-background disabled:bg-background-tertiary disabled:text-foreground-secondary disabled:cursor-not-allowed"
        >
          + Neues Modul
        </Button>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-destructive/10 border border-destructive text-destructive/90 p-3 rounded-md mb-4">
          {error}
        </div>
      )}

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
          pumpenkatalog={pumpenkatalog}
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

        // Sortiere die Gruppen alphabetisch nach Modultyp
        return Object.entries(grouped)
          .sort(([typeA], [typeB]) => typeA.localeCompare(typeB))
          .map(([type, typeModules]) => (
          <div key={type} className="mb-8">
            <h3 className="mb-4 text-accent text-base">
              {type}
            </h3>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-4">
              {typeModules.map((module) => (
                <ModuleCard
                  key={module.id}
                  module={module}
                  onEdit={() => {
                    // Convert backend format to frontend format
                    const editModule = {
                      ...module,
                      moduleType: module.moduleType || module.modultyp,
                      properties: {
                        hersteller: module.hersteller || module.properties?.hersteller || '',
                        abmessungen: module.abmessungen || module.properties?.abmessungen || '',
                        gewicht_kg: module.gewichtKg || module.properties?.gewicht_kg || null,
                        preis_euro: module.preis || module.properties?.preis_euro || null,
                      },
                    };
                    setEditingModule(editModule);
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
    <div className={`bg-background-secondary border border-border rounded-lg p-4 ${disabled ? 'opacity-50' : ''}`}>
      <div className="font-semibold text-base mb-1">
        {module.name}
      </div>
      <div className="text-xs text-foreground-secondary mb-3">
        {module.moduleType || 'Modul'}
        {showsUnit && <span className="ml-1 text-accent">({moduleTypeInfo.einheit})</span>}
      </div>

      {/* Schnellinfo */}
      <div className="text-[11px] text-foreground-secondary mb-3">
        {module.inputs.length} Eingänge | {module.outputs.length} Ausgänge
      </div>

      {/* Produktlink Button (falls vorhanden) */}
      {module.properties?.produktlink && (
        <a
          href={module.properties.produktlink}
          target="_blank"
          rel="noopener noreferrer"
          className="block mb-2"
        >
          <Button
            variant="secondary"
            className="w-full bg-background-tertiary border-border text-foreground-secondary text-[11px] h-auto py-1.5"
          >
            Produktlink
          </Button>
        </a>
      )}

      {/* Bearbeiten Button */}
      <Button
        onClick={onEdit}
        disabled={disabled}
        variant="secondary"
        className="w-full bg-background-tertiary border-border disabled:cursor-not-allowed text-xs"
      >
        Bearbeiten
      </Button>
    </div>
  );
}

function ModuleForm({ module, onSave, onCancel, onDelete, isCreating, leitungskatalog = [], verbindungsartenkatalog = [], dimensionskatalog = [], modultypen = [], pumpenkatalog = [] }) {
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
      className="bg-background-secondary border-2 border-accent rounded-lg p-6 mb-8"
    >
      <h3 className="mt-0 mb-6">
        {isCreating ? 'Neues Modul erstellen' : 'Modul bearbeiten'}
      </h3>

      {/* Name & Modultyp */}
      <div className="grid grid-cols-[2fr_1fr] gap-4 mb-6">
        <div>
          <label className="block mb-2 font-semibold text-[13px]">
            Name *
          </label>
          <Input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="bg-background-tertiary border-border"
          />
        </div>

        <div>
          <label className="block mb-2 font-semibold text-[13px]">
            Modultyp *
          </label>
          <Select
            required
            value={formData.moduleType || (modultypen.length > 0 ? modultypen[0].name : '')}
            onValueChange={(value) => setFormData({ ...formData, moduleType: value })}
          >
            <SelectTrigger className="bg-background-tertiary border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-background-secondary border-border">
              {modultypen.length === 0 ? (
                <SelectItem value="">Keine Modultypen verfügbar</SelectItem>
              ) : (
                modultypen.map(type => (
                  <SelectItem key={type.id} value={type.name}>{type.name}</SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          {modultypen.length === 0 && (
            <div className="text-[11px] text-foreground-secondary mt-1">
              Bitte erstelle zuerst Modultypen im Tab "Modultypen"
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
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
          <h4 className="text-[13px] font-semibold mb-3 text-accent">
            Eingänge ({formData.inputs.length}/12)
          </h4>
          <div className="max-h-[400px] overflow-y-auto">
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
                pumpenkatalog={pumpenkatalog}
              />
            ))}
          </div>
          <Button
            type="button"
            onClick={handleAddInput}
            disabled={formData.inputs.length >= 12}
            className="w-full mt-2 bg-success hover:bg-success/90 text-white disabled:bg-background-tertiary disabled:text-foreground-secondary disabled:cursor-not-allowed text-xs"
          >
            + Eingang
          </Button>
        </div>

        {/* Ausgänge */}
        <div>
          <h4 className="text-[13px] font-semibold mb-3 text-accent">
            Ausgänge ({formData.outputs.length}/36)
          </h4>
          <div className="max-h-[400px] overflow-y-auto">
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
                pumpenkatalog={pumpenkatalog}
              />
            ))}
          </div>
          <Button
            type="button"
            onClick={handleAddOutput}
            disabled={formData.outputs.length >= 36}
            className="w-full mt-2 bg-success hover:bg-success/90 text-white disabled:bg-background-tertiary disabled:text-foreground-secondary disabled:cursor-not-allowed text-xs"
          >
            + Ausgang
          </Button>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-3 mt-6">
        <Button
          type="submit"
          className="flex-1 bg-accent hover:bg-accent/90 text-background"
        >
          {isCreating ? 'Erstellen' : 'Speichern'}
        </Button>
        <Button
          type="button"
          onClick={onCancel}
          variant="secondary"
          className="flex-1 bg-background-tertiary border-border"
        >
          Abbrechen
        </Button>
        {!isCreating && (
          <Button
            type="button"
            onClick={() => {
              onDelete(formData);  // Pass the whole module, not just the ID
              onCancel();
            }}
            variant="destructive"
            className="flex-1 bg-destructive hover:bg-destructive/90"
          >
            Löschen
          </Button>
        )}
      </div>
    </form>
  );
}

function FormSection({ title, children }) {
  return (
    <div>
      <div className="text-[13px] font-semibold text-accent mb-3">
        {title}
      </div>
      <div className="flex flex-col gap-3">
        {children}
      </div>
    </div>
  );
}

function FormField({ label, value, onChange, type = 'text', step }) {
  return (
    <div>
      <label className="block mb-1 text-xs">
        {label}
      </label>
      <Input
        type={type}
        step={step}
        value={value ?? ''}
        onChange={(e) => {
          const val = type === 'number' ? (e.target.value ? parseFloat(e.target.value) : null) : e.target.value;
          onChange(val);
        }}
        className="bg-background-tertiary border-border text-xs"
      />
    </div>
  );
}
