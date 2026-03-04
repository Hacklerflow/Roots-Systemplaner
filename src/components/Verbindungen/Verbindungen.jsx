import { useState } from 'react';
import { CONNECTION_TYPES, CONNECTION_TYPE_LABELS } from '../../data/types';
import { catalogsAPI } from '../../api/client';

export default function Verbindungen({ verbindungsartenkatalog, setVerbindungsartenkatalog, leitungskatalog, onReload }) {
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
      const connectionData = {
        name: newVerbindungsart.name,
        kuerzel: newVerbindungsart.kuerzel,
        typ: newVerbindungsart.connectionType, // Map connectionType → typ
      };

      await catalogsAPI.addConnection(connectionData);

      // Reload catalogs from backend
      if (onReload) {
        await onReload();
      }

      setNewVerbindungsart({
        connectionType: CONNECTION_TYPES.HYDRAULIC,
        name: '',
        kuerzel: '',
        kompatible_leitungen: [],
      });
    } catch (error) {
      console.error('Fehler beim Hinzufügen:', error);
      alert('Fehler beim Hinzufügen: ' + error.message);
    }
  };

  const handleUpdate = async (id, updates) => {
    try {
      const connection = verbindungsartenkatalog.find(v => v.id === id);
      const updateData = {
        name: updates.name || connection.name,
        kuerzel: updates.kuerzel || connection.kuerzel,
        typ: updates.connectionType || connection.connectionType, // Map connectionType → typ
      };

      await catalogsAPI.updateConnection(id, updateData);

      // Reload catalogs from backend
      if (onReload) {
        await onReload();
      }
    } catch (error) {
      console.error('Fehler beim Aktualisieren:', error);
      alert('Fehler beim Aktualisieren: ' + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Verbindungsart wirklich löschen?')) {
      return;
    }

    try {
      await catalogsAPI.deleteConnection(id);

      // Reload catalogs from backend
      if (onReload) {
        await onReload();
      }
    } catch (error) {
      console.error('Fehler beim Löschen:', error);
      alert('Fehler beim Löschen: ' + error.message);
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
    <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>
      <h2 style={{ marginTop: 0, marginBottom: '8px' }}>Verbindungsarten-Katalog</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '14px' }}>
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
      <div
        style={{
          background: 'var(--bg-secondary)',
          border: '2px solid var(--accent)',
          borderRadius: '8px',
          padding: '24px',
          marginTop: '32px',
        }}
      >
        <h3 style={{ marginTop: 0, marginBottom: '16px' }}>Neue Verbindungsart hinzufügen</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr 100px 1fr 120px', gap: '12px', alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '13px' }}>
              Verbindungstyp
            </label>
            <select
              value={newVerbindungsart.connectionType}
              onChange={(e) => setNewVerbindungsart({ ...newVerbindungsart, connectionType: e.target.value, kompatible_leitungen: [] })}
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
              {Object.entries(CONNECTION_TYPE_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '13px' }}>
              Name
            </label>
            <input
              type="text"
              value={newVerbindungsart.name}
              onChange={(e) => setNewVerbindungsart({ ...newVerbindungsart, name: e.target.value })}
              placeholder="z.B. DN50 Flanschverbindung"
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
              Kürzel *
            </label>
            <input
              type="text"
              value={newVerbindungsart.kuerzel}
              onChange={(e) => setNewVerbindungsart({ ...newVerbindungsart, kuerzel: e.target.value.toUpperCase().slice(0, 6) })}
              placeholder="MAX 6"
              maxLength={6}
              style={{
                width: '100%',
                padding: '10px',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                color: 'var(--text-primary)',
                fontFamily: 'inherit',
                fontSize: '14px',
                textTransform: 'uppercase',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '13px' }}>
              Kompatible Leitungen
            </label>
            <select
              multiple
              value={newVerbindungsart.kompatible_leitungen}
              onChange={(e) => {
                const selected = Array.from(e.target.selectedOptions, option => option.value);
                setNewVerbindungsart({ ...newVerbindungsart, kompatible_leitungen: selected });
              }}
              style={{
                width: '100%',
                minHeight: '42px',
                padding: '6px',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                color: 'var(--text-primary)',
                fontFamily: 'inherit',
                fontSize: '13px',
              }}
            >
              {getLeitungenByType(newVerbindungsart.connectionType).map((leitung) => (
                <option key={leitung.id} value={leitung.id}>
                  {leitung.dimension}
                </option>
              ))}
            </select>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Mehrfachauswahl: Strg/Cmd + Klick
            </div>
          </div>

          <button
            onClick={handleAdd}
            style={{
              padding: '10px 16px',
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
            + Hinzufügen
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({ title, verbindungsarten, leitungen, connectionType, editingVerbindungsart, setEditingVerbindungsart, onUpdate, onDelete }) {
  return (
    <div style={{ marginBottom: '32px' }}>
      <h3 style={{ marginBottom: '16px', color: 'var(--accent)' }}>{title}</h3>
      {verbindungsarten.length === 0 ? (
        <div style={{ padding: '16px', background: 'var(--bg-secondary)', borderRadius: '4px', color: 'var(--text-secondary)', fontSize: '13px' }}>
          Keine Verbindungsarten vorhanden
        </div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', background: 'var(--bg-secondary)', borderRadius: '4px', overflow: 'hidden' }}>
          <thead>
            <tr style={{ background: 'var(--bg-tertiary)', borderBottom: '2px solid var(--border)' }}>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, fontSize: '13px' }}>Name</th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, fontSize: '13px', width: '100px' }}>Kürzel</th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, fontSize: '13px' }}>Kompatible Leitungen</th>
              <th style={{ padding: '12px', textAlign: 'right', fontWeight: 600, fontSize: '13px' }}>Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {verbindungsarten.map((verbindungsart) => (
              <tr key={verbindungsart.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '12px' }}>
                  {editingVerbindungsart === verbindungsart.id ? (
                    <input
                      type="text"
                      value={verbindungsart.name}
                      onChange={(e) => onUpdate(verbindungsart.id, { name: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '6px 8px',
                        background: 'var(--bg-tertiary)',
                        border: '1px solid var(--border)',
                        borderRadius: '4px',
                        color: 'var(--text-primary)',
                        fontFamily: 'inherit',
                        fontSize: '13px',
                      }}
                    />
                  ) : (
                    <span style={{ fontSize: '14px', fontWeight: 600 }}>{verbindungsart.name}</span>
                  )}
                </td>
                <td style={{ padding: '12px' }}>
                  {editingVerbindungsart === verbindungsart.id ? (
                    <input
                      type="text"
                      value={verbindungsart.kuerzel || ''}
                      onChange={(e) => onUpdate(verbindungsart.id, { kuerzel: e.target.value.toUpperCase().slice(0, 6) })}
                      maxLength={6}
                      placeholder="MAX 6"
                      style={{
                        width: '100%',
                        padding: '6px 8px',
                        background: 'var(--bg-tertiary)',
                        border: '1px solid var(--border)',
                        borderRadius: '4px',
                        color: 'var(--text-primary)',
                        fontFamily: 'inherit',
                        fontSize: '13px',
                        textTransform: 'uppercase',
                      }}
                    />
                  ) : (
                    <span style={{
                      fontSize: '13px',
                      fontWeight: 700,
                      color: 'var(--accent)',
                      fontFamily: 'monospace',
                    }}>
                      {verbindungsart.kuerzel || '—'}
                    </span>
                  )}
                </td>
                <td style={{ padding: '12px' }}>
                  {editingVerbindungsart === verbindungsart.id ? (
                    <div>
                      <select
                        multiple
                        value={verbindungsart.kompatible_leitungen || []}
                        onChange={(e) => {
                          const selected = Array.from(e.target.selectedOptions, option => option.value);
                          onUpdate(verbindungsart.id, { kompatible_leitungen: selected });
                        }}
                        style={{
                          width: '100%',
                          minHeight: '80px',
                          padding: '6px',
                          background: 'var(--bg-tertiary)',
                          border: '1px solid var(--border)',
                          borderRadius: '4px',
                          color: 'var(--text-primary)',
                          fontFamily: 'inherit',
                          fontSize: '12px',
                        }}
                      >
                        {leitungen.map((leitung) => (
                          <option key={leitung.id} value={leitung.id}>
                            {leitung.dimension}
                          </option>
                        ))}
                      </select>
                      <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                        Strg/Cmd + Klick für Mehrfachauswahl
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {verbindungsart.kompatible_leitungen && verbindungsart.kompatible_leitungen.length > 0 ? (
                        verbindungsart.kompatible_leitungen.map(leitungId => {
                          const leitung = leitungen.find(l => l.id === leitungId);
                          return leitung ? (
                            <span
                              key={leitungId}
                              style={{
                                display: 'inline-block',
                                padding: '4px 8px',
                                background: 'var(--bg-tertiary)',
                                border: '1px solid var(--border)',
                                borderRadius: '4px',
                                fontSize: '12px',
                                color: 'var(--text-primary)',
                              }}
                            >
                              {leitung.dimension}
                            </span>
                          ) : null;
                        })
                      ) : (
                        <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Keine</span>
                      )}
                    </div>
                  )}
                </td>
                <td style={{ padding: '12px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    {editingVerbindungsart === verbindungsart.id ? (
                      <button
                        onClick={() => setEditingVerbindungsart(null)}
                        style={{
                          padding: '6px 12px',
                          background: 'var(--success)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: 600,
                        }}
                      >
                        Fertig
                      </button>
                    ) : (
                      <button
                        onClick={() => setEditingVerbindungsart(verbindungsart.id)}
                        style={{
                          padding: '6px 12px',
                          background: 'var(--bg-tertiary)',
                          color: 'var(--text-primary)',
                          border: '1px solid var(--border)',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: 600,
                        }}
                      >
                        Bearbeiten
                      </button>
                    )}
                    <button
                      onClick={() => onDelete(verbindungsart.id)}
                      style={{
                        padding: '6px 12px',
                        background: 'var(--error)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 600,
                      }}
                    >
                      Löschen
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
