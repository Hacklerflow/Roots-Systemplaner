import { useState, useEffect } from 'react';
import InputOutputEditor from './InputOutputEditor';
import { createInput, createOutput, isBuilding, getModuleTypeOptions } from '../../data/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function ElementModal({ element, onClose, onSave, onDelete, leitungskatalog = [], verbindungsartenkatalog = [], dimensionskatalog = [], modultypen = [], pumpenkatalog = [] }) {
  const [formData, setFormData] = useState({
    ...element,
    inputs: element?.inputs || [],
    outputs: element?.outputs || [],
    properties: element?.properties || {},
  });

  useEffect(() => {
    setFormData({
      ...element,
      inputs: element?.inputs || [],
      outputs: element?.outputs || [],
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
    <Dialog open={!!element} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-background-secondary border-border max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {isBuildingElement ? 'Gebäude bearbeiten' : 'Modul bearbeiten'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <label htmlFor="element-name" className="block text-[13px] font-semibold">
              Name
            </label>
            <Input
              id="element-name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="bg-background-tertiary border-border focus-visible:border-accent focus-visible:ring-accent/10"
            />
          </div>

          {/* Modultyp (nur für Module) */}
          {!isBuildingElement && (
            <div className="space-y-2">
              <label htmlFor="module-type" className="block text-[13px] font-semibold">
                Modultyp
              </label>
              <Select
                value={formData.moduleType || ''}
                onValueChange={(value) => setFormData({ ...formData, moduleType: value })}
              >
                <SelectTrigger className="bg-background-tertiary border-border focus:ring-accent">
                  <SelectValue placeholder="Modultyp auswählen" />
                </SelectTrigger>
                <SelectContent className="bg-background-secondary border-border">
                  {getModuleTypeOptions().map(type => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Eigenschaften */}
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

          {/* Eingänge und Ausgänge Grid */}
          {!isBuildingElement && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Eingänge */}
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
                      pumpenkatalog={pumpenkatalog}
                    />
                  ))}
                  <Button
                    type="button"
                    onClick={handleAddInput}
                    disabled={formData.inputs.length >= 12}
                    className="w-full bg-success hover:bg-success/90 text-background disabled:bg-background-tertiary disabled:text-text-secondary disabled:cursor-not-allowed text-xs"
                  >
                    + Eingang hinzufügen
                  </Button>
                </Section>
              </div>

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
                      leitungskatalog={leitungskatalog}
                      verbindungsartenkatalog={verbindungsartenkatalog}
                      dimensionskatalog={dimensionskatalog}
                      modultypen={modultypen}
                      pumpenkatalog={pumpenkatalog}
                    />
                  ))}
                  <Button
                    type="button"
                    onClick={handleAddOutput}
                    disabled={formData.outputs.length >= 36}
                    className="w-full bg-success hover:bg-success/90 text-background disabled:bg-background-tertiary disabled:text-text-secondary disabled:cursor-not-allowed text-xs"
                  >
                    + Ausgang hinzufügen
                  </Button>
                </Section>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="mt-6">
          <Button
            type="button"
            onClick={onClose}
            variant="secondary"
            className="bg-background-tertiary hover:bg-border"
          >
            Abbrechen
          </Button>
          {onDelete && !isBuildingElement && (
            <Button
              type="button"
              onClick={onDelete}
              variant="destructive"
              className="bg-destructive hover:bg-destructive/90"
            >
              Löschen
            </Button>
          )}
          <Button
            type="button"
            onClick={handleSave}
            className="bg-accent hover:bg-[#3ba958] text-background shadow-[0_2px_8px_rgba(46,160,67,0.3)]"
          >
            Speichern
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Section({ title, children }) {
  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold mb-3 text-accent">
        {title}
      </h3>
      <div className="flex flex-col gap-3">
        {children}
      </div>
    </div>
  );
}

function FormField({ label, value, onChange, type = 'string' }) {
  if (type === 'boolean') {
    return (
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={value || false}
          onChange={(e) => onChange(e.target.checked)}
          className="w-4 h-4"
        />
        <span className="text-[13px]">{label}</span>
      </label>
    );
  }

  return (
    <div>
      <label className="block mb-1 text-[13px]">
        {label}
      </label>
      <Input
        type={type === 'number' ? 'number' : 'text'}
        value={value ?? ''}
        onChange={(e) => {
          const val = type === 'number' ? (e.target.value ? parseFloat(e.target.value) : null) : e.target.value;
          onChange(val);
        }}
        className="bg-background-tertiary border-border focus-visible:border-accent focus-visible:ring-accent/10 text-[13px]"
      />
    </div>
  );
}

function formatLabel(key) {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase());
}
