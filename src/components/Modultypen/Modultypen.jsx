import { useState } from 'react';
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

export default function Modultypen({ modultypen, setModultypen }) {
  const [editingType, setEditingType] = useState(null);
  const [newTypeName, setNewTypeName] = useState('');
  const [newBerechnungsart, setNewBerechnungsart] = useState('pro_unit');
  const [newEinheit, setNewEinheit] = useState('');
  const [editFormData, setEditFormData] = useState(null);

  const handleAdd = async () => {
    if (!newTypeName.trim()) {
      alert('Bitte einen Namen eingeben!');
      return;
    }

    if (modultypen.some(t => t.name === newTypeName.trim())) {
      alert('Dieser Modultyp existiert bereits!');
      return;
    }

    try {
      const response = await catalogsAPI.addModuleType({
        name: newTypeName.trim(),
        berechnungsart: newBerechnungsart,
        einheit: newBerechnungsart === 'pro_einheit' ? newEinheit.trim() : '',
      });

      const newType = {
        id: response.moduleType.id,
        name: response.moduleType.name,
        berechnungsart: response.moduleType.berechnungsart,
        einheit: response.moduleType.einheit || '',
      };

      setModultypen([...modultypen, newType]);
      setNewTypeName('');
      setNewBerechnungsart('pro_unit');
      setNewEinheit('');
    } catch (error) {
      alert(`Fehler beim Speichern: ${error.message}`);
    }
  };

  const handleUpdate = async (id, updates) => {
    if (!updates.name.trim()) {
      alert('Name darf nicht leer sein!');
      return;
    }

    if (modultypen.some(t => t.id !== id && t.name === updates.name.trim())) {
      alert('Dieser Modultyp existiert bereits!');
      return;
    }

    try {
      await catalogsAPI.updateModuleType(id, {
        name: updates.name.trim(),
        berechnungsart: updates.berechnungsart,
        einheit: updates.berechnungsart === 'pro_einheit' ? updates.einheit.trim() : '',
      });

      setModultypen(modultypen.map(t => t.id === id ? {
        ...t,
        name: updates.name.trim(),
        berechnungsart: updates.berechnungsart,
        einheit: updates.berechnungsart === 'pro_einheit' ? updates.einheit.trim() : '',
      } : t));
      setEditingType(null);
    } catch (error) {
      alert(`Fehler beim Aktualisieren: ${error.message}`);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Modultyp wirklich löschen?\n\nHinweis: Bestehende Module mit diesem Typ werden nicht gelöscht, aber der Typ wird nicht mehr in der Auswahl erscheinen.')) {
      try {
        await catalogsAPI.deleteModuleType(id);
        setModultypen(modultypen.filter(t => t.id !== id));
      } catch (error) {
        alert(`Fehler beim Löschen: ${error.message}`);
      }
    }
  };

  return (
    <div className="p-8 max-w-[1000px] mx-auto">
      <h2 className="mt-0 mb-2">Modultypen</h2>
      <p className="text-foreground-secondary mb-8 text-sm">
        Verwalte die verfügbaren Modultypen für die Moduldatenbank
      </p>

      {/* Neuen Modultyp hinzufügen */}
      <div className="bg-background-secondary border-2 border-accent rounded-lg p-6 mb-8">
        <h3 className="mt-0 mb-4">Neuen Modultyp hinzufügen</h3>
        <div className="grid grid-cols-[2fr_1fr_1fr] gap-3 mb-4">
          <div>
            <label className="block mb-2 font-semibold text-[13px]">
              Name
            </label>
            <Input
              type="text"
              value={newTypeName}
              onChange={(e) => setNewTypeName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleAdd();
                }
              }}
              placeholder="z.B. Wärmepumpe, Pufferspeicher"
              className="bg-background-tertiary border-border"
            />
          </div>
          <div>
            <label className="block mb-2 font-semibold text-[13px]">
              Berechnungsart
            </label>
            <Select value={newBerechnungsart} onValueChange={setNewBerechnungsart}>
              <SelectTrigger className="bg-background-tertiary border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-background-secondary border-border">
                <SelectItem value="pro_unit">Pro Stück</SelectItem>
                <SelectItem value="pro_einheit">Pro Einheit</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block mb-2 font-semibold text-[13px]">
              Einheit
            </label>
            <Input
              type="text"
              value={newEinheit}
              onChange={(e) => setNewEinheit(e.target.value)}
              placeholder={newBerechnungsart === 'pro_einheit' ? 'z.B. lm, m²' : ''}
              disabled={newBerechnungsart === 'pro_unit'}
              className="bg-background-tertiary border-border disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
        </div>
        <Button
          onClick={handleAdd}
          className="w-full bg-accent hover:bg-accent/90 text-background"
        >
          + Hinzufügen
        </Button>
      </div>

      {/* Liste der Modultypen */}
      <div className="mb-8">
        <h3 className="mb-4 text-accent">Verfügbare Modultypen</h3>
        {modultypen.length === 0 ? (
          <div className="p-4 bg-background-secondary rounded text-foreground-secondary text-[13px]">
            Keine Modultypen vorhanden
          </div>
        ) : (
          <div className="bg-background-secondary rounded-lg overflow-hidden">
            {modultypen.map((type, index) => (
              <div
                key={type.id}
                className={`p-4 ${index < modultypen.length - 1 ? 'border-b border-border' : ''}`}
              >
                {editingType === type.id ? (
                  <div>
                    <div className="grid grid-cols-[2fr_1fr_1fr] gap-3 mb-3">
                      <Input
                        type="text"
                        value={editFormData.name}
                        onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                        autoFocus
                        className="bg-background-tertiary border-accent"
                      />
                      <Select
                        value={editFormData.berechnungsart}
                        onValueChange={(value) => setEditFormData({ ...editFormData, berechnungsart: value })}
                      >
                        <SelectTrigger className="bg-background-tertiary border-border">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-background-secondary border-border">
                          <SelectItem value="pro_unit">Pro Stück</SelectItem>
                          <SelectItem value="pro_einheit">Pro Einheit</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        type="text"
                        value={editFormData.einheit}
                        onChange={(e) => setEditFormData({ ...editFormData, einheit: e.target.value })}
                        placeholder={editFormData.berechnungsart === 'pro_einheit' ? 'z.B. lm, m²' : ''}
                        disabled={editFormData.berechnungsart === 'pro_unit'}
                        className="bg-background-tertiary border-border disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleUpdate(type.id, editFormData)}
                        className="bg-success hover:bg-success/90 text-white text-xs"
                        size="sm"
                      >
                        Speichern
                      </Button>
                      <Button
                        onClick={() => {
                          setEditingType(null);
                          setEditFormData(null);
                        }}
                        variant="secondary"
                        className="bg-background-tertiary border-border text-xs"
                        size="sm"
                      >
                        Abbrechen
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="text-sm font-medium mb-1">
                        {type.name}
                      </div>
                      <div className="text-xs text-foreground-secondary">
                        {type.berechnungsart === 'pro_einheit' ? (
                          <>Pro Einheit ({type.einheit})</>
                        ) : (
                          <>Pro Stück</>
                        )}
                      </div>
                    </div>
                    <Button
                      onClick={() => {
                        setEditingType(type.id);
                        setEditFormData({
                          name: type.name,
                          berechnungsart: type.berechnungsart || 'pro_unit',
                          einheit: type.einheit || '',
                        });
                      }}
                      variant="secondary"
                      className="bg-background-tertiary border-border text-xs"
                      size="sm"
                    >
                      Bearbeiten
                    </Button>
                    <Button
                      onClick={() => handleDelete(type.id)}
                      variant="destructive"
                      className="bg-destructive hover:bg-destructive/90 text-xs"
                      size="sm"
                    >
                      Löschen
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
