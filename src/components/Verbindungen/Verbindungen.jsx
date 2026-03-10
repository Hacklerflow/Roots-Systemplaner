import { useState } from 'react';
import { CONNECTION_TYPES, CONNECTION_TYPE_LABELS } from '../../data/types';
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

export default function Verbindungen({ verbindungsartenkatalog, setVerbindungsartenkatalog, leitungskatalog }) {
  const [editingVerbindungsart, setEditingVerbindungsart] = useState(null);
  const [newVerbindungsart, setNewVerbindungsart] = useState({
    connectionType: CONNECTION_TYPES.HYDRAULIC,
    name: '',
    kuerzel: '',
    kompatible_leitungen: [],
  });

  const handleAdd = async () => {
    if (!newVerbindungsart.name) {
      alert('Bitte Name eingeben!');
      return;
    }

    if (!newVerbindungsart.kuerzel) {
      alert('Bitte Kürzel eingeben!');
      return;
    }

    if (newVerbindungsart.kuerzel.length > 6) {
      alert('Kürzel darf maximal 6 Zeichen haben!');
      return;
    }

    try {
      const response = await catalogsAPI.addConnection({
        name: newVerbindungsart.name,
        kuerzel: newVerbindungsart.kuerzel,
        typ: newVerbindungsart.connectionType,
        kompatible_leitungen: newVerbindungsart.kompatible_leitungen,
      });

      const verbindungsart = {
        id: response.connection.id,
        name: response.connection.name,
        kuerzel: response.connection.kuerzel,
        connectionType: response.connection.typ,
        kompatible_leitungen: Array.isArray(response.connection.kompatible_leitungen)
          ? response.connection.kompatible_leitungen.map(id => parseInt(id))
          : (typeof response.connection.kompatible_leitungen === 'string'
              ? JSON.parse(response.connection.kompatible_leitungen).map(id => parseInt(id))
              : []),
      };

      setVerbindungsartenkatalog([...verbindungsartenkatalog, verbindungsart]);
      setNewVerbindungsart({
        connectionType: CONNECTION_TYPES.HYDRAULIC,
        name: '',
        kuerzel: '',
        kompatible_leitungen: [],
      });
    } catch (error) {
      alert(`Fehler beim Speichern: ${error.message}`);
    }
  };

  const handleUpdate = async (id, updates) => {
    try {
      // Convert frontend format to backend format
      const backendUpdates = {};
      if (updates.name !== undefined) backendUpdates.name = updates.name;
      if (updates.kuerzel !== undefined) backendUpdates.kuerzel = updates.kuerzel;
      if (updates.connectionType !== undefined) backendUpdates.typ = updates.connectionType;
      if (updates.kompatible_leitungen !== undefined) backendUpdates.kompatible_leitungen = updates.kompatible_leitungen;

      await catalogsAPI.updateConnection(id, backendUpdates);

      // Update local state
      setVerbindungsartenkatalog(
        verbindungsartenkatalog.map(v => v.id === id ? { ...v, ...updates } : v)
      );
    } catch (error) {
      alert(`Fehler beim Aktualisieren: ${error.message}`);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Verbindungsart wirklich löschen?')) {
      try {
        await catalogsAPI.deleteConnection(id);
        setVerbindungsartenkatalog(verbindungsartenkatalog.filter(v => v.id !== id));
      } catch (error) {
        alert(`Fehler beim Löschen: ${error.message}`);
      }
    }
  };

  const getVerbindungsartenByType = (type) => {
    return verbindungsartenkatalog.filter(v => v.connectionType === type);
  };

  // Leitungen nach Typ filtern
  const getLeitungenByType = (type) => {
    return leitungskatalog.filter(l => l.connectionType === type);
  };

  return (
    <div className="p-8 max-w-[1400px] mx-auto">
      <h2 className="mt-0 mb-2">Verbindungsarten-Katalog</h2>
      <p className="text-foreground-secondary mb-8 text-sm">
        Verwalte verfügbare Verbindungsarten (z.B. Flansch, Schraube, Stecker) und definiere kompatible Leitungen
      </p>

      {/* Hydraulische Verbindungsarten */}
      <Section
        title="Hydraulische Verbindungsarten"
        verbindungsarten={getVerbindungsartenByType(CONNECTION_TYPES.HYDRAULIC)}
        leitungen={getLeitungenByType(CONNECTION_TYPES.HYDRAULIC)}
        connectionType={CONNECTION_TYPES.HYDRAULIC}
        editingVerbindungsart={editingVerbindungsart}
        setEditingVerbindungsart={setEditingVerbindungsart}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />

      {/* Elektrische Verbindungsarten */}
      <Section
        title="Elektrische Verbindungsarten"
        verbindungsarten={getVerbindungsartenByType(CONNECTION_TYPES.ELECTRIC)}
        leitungen={getLeitungenByType(CONNECTION_TYPES.ELECTRIC)}
        connectionType={CONNECTION_TYPES.ELECTRIC}
        editingVerbindungsart={editingVerbindungsart}
        setEditingVerbindungsart={setEditingVerbindungsart}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />

      {/* Steuerungs-Verbindungsarten */}
      <Section
        title="Steuerungs-Verbindungsarten"
        verbindungsarten={getVerbindungsartenByType(CONNECTION_TYPES.CONTROL)}
        leitungen={getLeitungenByType(CONNECTION_TYPES.CONTROL)}
        connectionType={CONNECTION_TYPES.CONTROL}
        editingVerbindungsart={editingVerbindungsart}
        setEditingVerbindungsart={setEditingVerbindungsart}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />

      {/* Neue Verbindungsart hinzufügen */}
      <div className="bg-background-secondary border-2 border-accent rounded-lg p-6 mt-8">
        <h3 className="mt-0 mb-4">Neue Verbindungsart hinzufügen</h3>
        <div className="grid grid-cols-[180px_1fr_100px_1fr_120px] gap-3 items-end">
          <div>
            <label className="block mb-2 font-semibold text-[13px]">
              Verbindungstyp
            </label>
            <Select
              value={newVerbindungsart.connectionType}
              onValueChange={(value) => setNewVerbindungsart({ ...newVerbindungsart, connectionType: value, kompatible_leitungen: [] })}
            >
              <SelectTrigger className="bg-background-tertiary border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-background-secondary border-border">
                {Object.entries(CONNECTION_TYPE_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block mb-2 font-semibold text-[13px]">
              Name
            </label>
            <Input
              type="text"
              value={newVerbindungsart.name}
              onChange={(e) => setNewVerbindungsart({ ...newVerbindungsart, name: e.target.value })}
              placeholder="z.B. DN50 Flanschverbindung"
              className="bg-background-tertiary border-border"
            />
          </div>

          <div>
            <label className="block mb-2 font-semibold text-[13px]">
              Kürzel *
            </label>
            <Input
              type="text"
              value={newVerbindungsart.kuerzel}
              onChange={(e) => setNewVerbindungsart({ ...newVerbindungsart, kuerzel: e.target.value.toUpperCase().slice(0, 6) })}
              placeholder="MAX 6"
              maxLength={6}
              className="bg-background-tertiary border-border uppercase"
            />
          </div>

          <div>
            <label className="block mb-2 font-semibold text-[13px]">
              Kompatible Leitungen
            </label>
            <select
              multiple
              value={newVerbindungsart.kompatible_leitungen.map(id => String(id))}
              onChange={(e) => {
                const selected = Array.from(e.target.selectedOptions, option => parseInt(option.value));
                setNewVerbindungsart({ ...newVerbindungsart, kompatible_leitungen: selected });
              }}
              className="w-full min-h-[42px] p-1.5 bg-background-tertiary border border-border rounded text-foreground text-[13px]"
            >
              {getLeitungenByType(newVerbindungsart.connectionType).map((leitung) => (
                <option key={leitung.id} value={leitung.id}>
                  {leitung.dimension}
                </option>
              ))}
            </select>
            <div className="text-[11px] text-foreground-secondary mt-1">
              Mehrfachauswahl: Strg/Cmd + Klick
            </div>
          </div>

          <Button
            onClick={handleAdd}
            className="bg-accent hover:bg-accent/90 text-background"
          >
            + Hinzufügen
          </Button>
        </div>
      </div>
    </div>
  );
}

function Section({ title, verbindungsarten, leitungen, connectionType, editingVerbindungsart, setEditingVerbindungsart, onUpdate, onDelete }) {
  return (
    <div className="mb-8">
      <h3 className="mb-4 text-accent">{title}</h3>
      {verbindungsarten.length === 0 ? (
        <div className="p-4 bg-background-secondary rounded text-foreground-secondary text-[13px]">
          Keine Verbindungsarten vorhanden
        </div>
      ) : (
        <div className="bg-background-secondary rounded-lg overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-background-tertiary border-b-2 border-border">
                <th className="p-3 text-left font-semibold text-[13px]">Name</th>
                <th className="p-3 text-left font-semibold text-[13px] w-[100px]">Kürzel</th>
                <th className="p-3 text-left font-semibold text-[13px]">Kompatible Leitungen</th>
                <th className="p-3 text-right font-semibold text-[13px]">Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {verbindungsarten.map((verbindungsart) => (
                <tr key={verbindungsart.id} className="border-b border-border">
                  <td className="p-3">
                    {editingVerbindungsart === verbindungsart.id ? (
                      <Input
                        type="text"
                        value={verbindungsart.name}
                        onChange={(e) => onUpdate(verbindungsart.id, { name: e.target.value })}
                        className="bg-background-tertiary border-border text-[13px]"
                      />
                    ) : (
                      <span className="text-sm font-semibold">{verbindungsart.name}</span>
                    )}
                  </td>
                  <td className="p-3">
                    {editingVerbindungsart === verbindungsart.id ? (
                      <Input
                        type="text"
                        value={verbindungsart.kuerzel || ''}
                        onChange={(e) => onUpdate(verbindungsart.id, { kuerzel: e.target.value.toUpperCase().slice(0, 6) })}
                        maxLength={6}
                        placeholder="MAX 6"
                        className="bg-background-tertiary border-border text-[13px] uppercase"
                      />
                    ) : (
                      <span className="text-[13px] font-bold text-accent font-mono">
                        {verbindungsart.kuerzel || '—'}
                      </span>
                    )}
                  </td>
                  <td className="p-3">
                    {editingVerbindungsart === verbindungsart.id ? (
                      <div>
                        <select
                          multiple
                          value={(verbindungsart.kompatible_leitungen || []).map(id => String(id))}
                          onChange={(e) => {
                            const selected = Array.from(e.target.selectedOptions, option => parseInt(option.value));
                            onUpdate(verbindungsart.id, { kompatible_leitungen: selected });
                          }}
                          className="w-full min-h-[80px] p-1.5 bg-background-tertiary border border-border rounded text-foreground text-xs"
                        >
                          {leitungen.map((leitung) => (
                            <option key={leitung.id} value={leitung.id}>
                              {leitung.dimension}
                            </option>
                          ))}
                        </select>
                        <div className="text-[10px] text-foreground-secondary mt-1">
                          Strg/Cmd + Klick für Mehrfachauswahl
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {verbindungsart.kompatible_leitungen && verbindungsart.kompatible_leitungen.length > 0 ? (
                          verbindungsart.kompatible_leitungen.map(leitungId => {
                            const leitung = leitungen.find(l => l.id === leitungId);
                            return leitung ? (
                              <span
                                key={leitungId}
                                className="inline-block px-2 py-1 bg-background-tertiary border border-border rounded text-xs"
                              >
                                {leitung.dimension}
                              </span>
                            ) : null;
                          })
                        ) : (
                          <span className="text-[13px] text-foreground-secondary">Keine</span>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex gap-2 justify-end">
                      {editingVerbindungsart === verbindungsart.id ? (
                        <Button
                          onClick={() => setEditingVerbindungsart(null)}
                          className="bg-success hover:bg-success/90 text-white text-xs"
                          size="sm"
                        >
                          Fertig
                        </Button>
                      ) : (
                        <Button
                          onClick={() => setEditingVerbindungsart(verbindungsart.id)}
                          variant="secondary"
                          className="bg-background-tertiary border-border text-xs"
                          size="sm"
                        >
                          Bearbeiten
                        </Button>
                      )}
                      <Button
                        onClick={() => onDelete(verbindungsart.id)}
                        variant="destructive"
                        className="bg-destructive hover:bg-destructive/90 text-xs"
                        size="sm"
                      >
                        Löschen
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
