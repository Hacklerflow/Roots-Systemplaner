import { useState, useEffect } from 'react';
import { CONNECTION_TYPES } from '../../data/types';
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

export default function Leitungen({ leitungskatalog, setLeitungskatalog, dimensionskatalog = [], verbindungsartenkatalog = [] }) {
  const [editingLeitung, setEditingLeitung] = useState(null);

  const [newLeitung, setNewLeitung] = useState({
    connectionType: '--',
    dimension: '--',
    material: '',
    preis_pro_meter: null,
    produktlink: ''
  });

  const handleAdd = async () => {
    if (!newLeitung.preis_pro_meter) {
      alert('Bitte Preis eingeben!');
      return;
    }

    try {
      const response = await catalogsAPI.addPipe({
        connection_type: newLeitung.connectionType === '--' ? null : newLeitung.connectionType,
        leitungstyp: newLeitung.material || null,
        dimension: newLeitung.dimension === '--' ? null : newLeitung.dimension,
        preis_pro_meter: newLeitung.preis_pro_meter,
      });

      const leitung = {
        id: response.pipe.id,
        connectionType: response.pipe.connection_type || '--',
        material: response.pipe.leitungstyp || '',
        dimension: response.pipe.dimension || '--',
        preis_pro_meter: response.pipe.preis_pro_meter,
        produktlink: newLeitung.produktlink || '',
      };

      setLeitungskatalog([...leitungskatalog, leitung]);
      setNewLeitung({
        connectionType: '--',
        dimension: '--',
        material: '',
        preis_pro_meter: null,
        produktlink: ''
      });
    } catch (error) {
      alert(`Fehler beim Speichern: ${error.message}`);
    }
  };

  const handleUpdate = async (id, updates) => {
    try {
      // Convert frontend format to backend format
      const backendUpdates = {};
      if (updates.connectionType !== undefined) backendUpdates.connection_type = updates.connectionType;
      if (updates.material !== undefined) backendUpdates.leitungstyp = updates.material;
      if (updates.dimension !== undefined) backendUpdates.dimension = updates.dimension;
      if (updates.preis_pro_meter !== undefined) backendUpdates.preis_pro_meter = updates.preis_pro_meter;

      await catalogsAPI.updatePipe(id, backendUpdates);

      // Update local state
      setLeitungskatalog(leitungskatalog.map(l => l.id === id ? { ...l, ...updates } : l));
    } catch (error) {
      alert(`Fehler beim Aktualisieren: ${error.message}`);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Leitung wirklich löschen?')) {
      try {
        await catalogsAPI.deletePipe(id);
        setLeitungskatalog(leitungskatalog.filter(l => l.id !== id));
      } catch (error) {
        alert(`Fehler beim Löschen: ${error.message}`);
      }
    }
  };

  // Get connection type (hydraulisch/elektrisch/steuerung) from connection name
  const getConnectionTypeFromName = (connectionName) => {
    const connection = verbindungsartenkatalog.find(v => v.name === connectionName);
    return connection ? connection.connectionType : null;
  };

  const getLeitungenByType = (verbindungsTyp) => {
    if (verbindungsTyp === null) {
      // Nicht zugeordnete Leitungen (connectionType ist "--" oder null)
      return leitungskatalog.filter(l => !l.connectionType || l.connectionType === '--');
    }
    // Direkter Vergleich des connectionType (ist jetzt schon der Typ, nicht mehr der Name)
    return leitungskatalog.filter(l => l.connectionType === verbindungsTyp);
  };

  // Verfügbare Dimensionen (alle, da nicht verbindungstyp-spezifisch)
  const getAvailableDimensionen = () => {
    return dimensionskatalog.map(d => d.name || d.value);
  };

  return (
    <div className="p-8 max-w-[1400px] mx-auto">
      <h2 className="mt-0 mb-2">Leitungskatalog</h2>
      <p className="text-foreground-secondary mb-8 text-sm">
        Verwalte verfügbare Leitungstypen mit Dimensionen, Material und Preisen pro Meter
      </p>

      {/* Hydraulische Leitungen */}
      <Section
        title="Hydraulische Leitungen"
        leitungen={getLeitungenByType(CONNECTION_TYPES.HYDRAULIC)}
        dimensionen={getAvailableDimensionen()}
        editingLeitung={editingLeitung}
        setEditingLeitung={setEditingLeitung}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />

      {/* Elektrische Leitungen */}
      <Section
        title="Elektrische Leitungen"
        leitungen={getLeitungenByType(CONNECTION_TYPES.ELECTRIC)}
        dimensionen={getAvailableDimensionen()}
        editingLeitung={editingLeitung}
        setEditingLeitung={setEditingLeitung}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />

      {/* Steuerungsleitungen */}
      <Section
        title="Steuerungsleitungen"
        leitungen={getLeitungenByType(CONNECTION_TYPES.CONTROL)}
        dimensionen={getAvailableDimensionen()}
        editingLeitung={editingLeitung}
        setEditingLeitung={setEditingLeitung}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />

      {/* Nicht zugeordnete Leitungen */}
      {getLeitungenByType(null).length > 0 && (
        <Section
          title="Nicht zugeordnete Leitungen"
          leitungen={getLeitungenByType(null)}
          dimensionen={getAvailableDimensionen()}
          editingLeitung={editingLeitung}
          setEditingLeitung={setEditingLeitung}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          showAllConnections={true}
        />
      )}

      {/* Neue Leitung hinzufügen */}
      <div className="bg-background-secondary border-2 border-accent rounded-lg p-6 mt-8">
        <h3 className="mt-0 mb-4">Neue Leitung hinzufügen</h3>
        <div className="grid grid-cols-[200px_1fr_1fr_120px] gap-3 items-end mb-3">
          <div>
            <label className="block mb-2 font-semibold text-[13px]">
              Verbindungstyp
            </label>
            <Select value={newLeitung.connectionType} onValueChange={(value) => setNewLeitung({ ...newLeitung, connectionType: value })}>
              <SelectTrigger className="bg-background-tertiary border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-background-secondary border-border">
                <SelectItem value="--">--</SelectItem>
                <SelectItem value={CONNECTION_TYPES.HYDRAULIC}>Hydraulisch</SelectItem>
                <SelectItem value={CONNECTION_TYPES.ELECTRIC}>Elektrisch</SelectItem>
                <SelectItem value={CONNECTION_TYPES.CONTROL}>Steuerung</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block mb-2 font-semibold text-[13px]">
              Dimension
            </label>
            <Select value={newLeitung.dimension} onValueChange={(value) => setNewLeitung({ ...newLeitung, dimension: value })}>
              <SelectTrigger className="bg-background-tertiary border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-background-secondary border-border">
                <SelectItem value="--">--</SelectItem>
                {getAvailableDimensionen().map(dim => (
                  <SelectItem key={dim} value={dim}>{dim}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {getAvailableDimensionen().length === 0 && (
              <div className="text-[11px] text-foreground-secondary mt-1">
                Dimensionen können später in Einstellungen → Dimensionen angelegt werden
              </div>
            )}
          </div>

          <div>
            <label className="block mb-2 font-semibold text-[13px]">
              Material
            </label>
            <Input
              type="text"
              value={newLeitung.material}
              onChange={(e) => setNewLeitung({ ...newLeitung, material: e.target.value })}
              placeholder="z.B. Kupfer, Stahl"
              className="bg-background-tertiary border-border"
            />
          </div>

          <div>
            <label className="block mb-2 font-semibold text-[13px]">
              Preis/m (€)
            </label>
            <Input
              type="number"
              step="0.01"
              value={newLeitung.preis_pro_meter ?? ''}
              onChange={(e) => setNewLeitung({ ...newLeitung, preis_pro_meter: e.target.value ? parseFloat(e.target.value) : null })}
              placeholder="15.50"
              className="bg-background-tertiary border-border"
            />
          </div>
        </div>

        <div className="grid grid-cols-[1fr_120px] gap-3 items-end">
          <div>
            <label className="block mb-2 font-semibold text-[13px]">
              Produktlink (optional)
            </label>
            <Input
              type="url"
              value={newLeitung.produktlink}
              onChange={(e) => setNewLeitung({ ...newLeitung, produktlink: e.target.value })}
              placeholder="https://..."
              className="bg-background-tertiary border-border"
            />
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

function Section({ title, leitungen, dimensionen, editingLeitung, setEditingLeitung, onUpdate, onDelete, showAllConnections = false }) {
  return (
    <div className="mb-8">
      <h3 className="mb-4 text-accent">{title}</h3>
      {leitungen.length === 0 ? (
        <div className="p-4 bg-background-secondary rounded text-foreground-secondary text-[13px]">
          Keine Leitungen vorhanden
        </div>
      ) : (
        <div className="bg-background-secondary rounded-lg overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-background-tertiary border-b-2 border-border">
                {showAllConnections && <th className="p-3 text-left font-semibold text-[13px]">Verbindung</th>}
                <th className="p-3 text-left font-semibold text-[13px]">Dimension</th>
                <th className="p-3 text-left font-semibold text-[13px]">Material</th>
                <th className="p-3 text-right font-semibold text-[13px]">Preis/m (€)</th>
                <th className="p-3 text-left font-semibold text-[13px]">Produktlink</th>
                <th className="p-3 text-right font-semibold text-[13px]">Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {leitungen.map((leitung) => (
                <tr key={leitung.id} className="border-b border-border">
                  {/* Verbindung (nur bei showAllConnections) */}
                  {showAllConnections && (
                    <td className="p-3">
                      {editingLeitung === leitung.id ? (
                        <Select
                          value={leitung.connectionType || '--'}
                          onValueChange={(value) => onUpdate(leitung.id, { connectionType: value === '--' ? null : value })}
                        >
                          <SelectTrigger className="bg-background-tertiary border-border text-[13px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-background-secondary border-border">
                            <SelectItem value="--">--</SelectItem>
                            <SelectItem value={CONNECTION_TYPES.HYDRAULIC}>Hydraulisch</SelectItem>
                            <SelectItem value={CONNECTION_TYPES.ELECTRIC}>Elektrisch</SelectItem>
                            <SelectItem value={CONNECTION_TYPES.CONTROL}>Steuerung</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <span className="text-sm">
                          {leitung.connectionType === CONNECTION_TYPES.HYDRAULIC ? 'Hydraulisch' :
                           leitung.connectionType === CONNECTION_TYPES.ELECTRIC ? 'Elektrisch' :
                           leitung.connectionType === CONNECTION_TYPES.CONTROL ? 'Steuerung' :
                           '--'}
                        </span>
                      )}
                    </td>
                  )}

                  {/* Dimension */}
                  <td className="p-3">
                    {editingLeitung === leitung.id ? (
                      <Select
                        value={leitung.dimension || '--'}
                        onValueChange={(value) => onUpdate(leitung.id, { dimension: value === '--' ? null : value })}
                      >
                        <SelectTrigger className="bg-background-tertiary border-border text-[13px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-background-secondary border-border">
                          <SelectItem value="--">--</SelectItem>
                          {dimensionen.map(dim => (
                            <SelectItem key={dim} value={dim}>{dim}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <span className="text-sm">{leitung.dimension || '--'}</span>
                    )}
                  </td>

                  {/* Material */}
                  <td className="p-3">
                    {editingLeitung === leitung.id ? (
                      <Input
                        type="text"
                        value={leitung.material || ''}
                        onChange={(e) => onUpdate(leitung.id, { material: e.target.value })}
                        placeholder="z.B. Kupfer"
                        className="bg-background-tertiary border-border text-[13px]"
                      />
                    ) : (
                      <span className="text-sm">{leitung.material || '—'}</span>
                    )}
                  </td>

                  {/* Preis */}
                  <td className="p-3 text-right">
                    {editingLeitung === leitung.id ? (
                      <Input
                        type="number"
                        step="0.01"
                        value={leitung.preis_pro_meter ?? ''}
                        onChange={(e) => onUpdate(leitung.id, { preis_pro_meter: e.target.value ? parseFloat(e.target.value) : null })}
                        className="w-[100px] bg-background-tertiary border-border text-[13px] text-right"
                      />
                    ) : (
                      <span className="text-sm">{leitung.preis_pro_meter ?? '—'}</span>
                    )}
                  </td>

                  {/* Produktlink */}
                  <td className="p-3">
                    {editingLeitung === leitung.id ? (
                      <Input
                        type="url"
                        value={leitung.produktlink || ''}
                        onChange={(e) => onUpdate(leitung.id, { produktlink: e.target.value })}
                        placeholder="https://..."
                        className="bg-background-tertiary border-border text-[13px]"
                      />
                    ) : leitung.produktlink ? (
                      <a
                        href={leitung.produktlink}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button
                          variant="secondary"
                          size="sm"
                          className="bg-background-tertiary border-border text-xs"
                        >
                          Link
                        </Button>
                      </a>
                    ) : (
                      <span className="text-xs text-foreground-secondary">—</span>
                    )}
                  </td>

                  {/* Aktionen */}
                  <td className="p-3 text-right">
                    <div className="flex gap-2 justify-end">
                      {editingLeitung === leitung.id ? (
                        <Button
                          onClick={() => setEditingLeitung(null)}
                          className="bg-success hover:bg-success/90 text-white text-xs"
                          size="sm"
                        >
                          Fertig
                        </Button>
                      ) : (
                        <Button
                          onClick={() => setEditingLeitung(leitung.id)}
                          variant="secondary"
                          className="bg-background-tertiary border-border text-xs"
                          size="sm"
                        >
                          Bearbeiten
                        </Button>
                      )}
                      <Button
                        onClick={() => onDelete(leitung.id)}
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
