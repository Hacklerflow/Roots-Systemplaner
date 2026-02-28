import { useState } from 'react';
import { CONNECTION_TYPES, CONNECTION_TYPE_LABELS } from '../../data/types';

export default function Leitungen({ leitungskatalog, setLeitungskatalog }) {
  const [editingLeitung, setEditingLeitung] = useState(null);
  const [newLeitung, setNewLeitung] = useState({ connectionType: CONNECTION_TYPES.HYDRAULIC, dimension: '', preis_pro_meter: null });

  const handleAdd = () => {
    if (!newLeitung.dimension || !newLeitung.preis_pro_meter) {
      alert('Bitte Dimension und Preis eingeben!');
      return;
    }

    const leitung = {
      id: `${newLeitung.connectionType}-${Date.now()}`,
      ...newLeitung,
    };

    setLeitungskatalog([...leitungskatalog, leitung]);
    setNewLeitung({ connectionType: CONNECTION_TYPES.HYDRAULIC, dimension: '', preis_pro_meter: null });
  };

  const handleUpdate = (id, updates) => {
    setLeitungskatalog(leitungskatalog.map(l => l.id === id ? { ...l, ...updates } : l));
  };

  const handleDelete = (id) => {
    if (confirm('Leitung wirklich löschen?')) {
      setLeitungskatalog(leitungskatalog.filter(l => l.id !== id));
    }
  };

  const getLeitungenByType = (type) => {
    return leitungskatalog.filter(l => l.connectionType === type);
  };

  return (
    <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>
      <h2 style={{ marginTop: 0, marginBottom: '8px' }}>Leitungskatalog</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '14px' }}>
        Verwalte verfügbare Leitungstypen mit Dimensionen und Preisen pro Meter
      </p>

      {/* Hydraulische Leitungen */}
      <Section
        title="Hydraulische Leitungen"
        leitungen={getLeitungenByType(CONNECTION_TYPES.HYDRAULIC)}
        connectionType={CONNECTION_TYPES.HYDRAULIC}
        editingLeitung={editingLeitung}
        setEditingLeitung={setEditingLeitung}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />

      {/* Elektrische Leitungen */}
      <Section
        title="Elektrische Leitungen"
        leitungen={getLeitungenByType(CONNECTION_TYPES.ELECTRIC)}
        connectionType={CONNECTION_TYPES.ELECTRIC}
        editingLeitung={editingLeitung}
        setEditingLeitung={setEditingLeitung}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />

      {/* Steuerungsleitungen */}
      <Section
        title="Steuerungsleitungen"
        leitungen={getLeitungenByType(CONNECTION_TYPES.CONTROL)}
        connectionType={CONNECTION_TYPES.CONTROL}
        editingLeitung={editingLeitung}
        setEditingLeitung={setEditingLeitung}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />

      {/* Neue Leitung hinzufügen */}
      <div
        style={{
          background: 'var(--bg-secondary)',
          border: '2px solid var(--accent)',
          borderRadius: '8px',
          padding: '24px',
          marginTop: '32px',
        }}
      >
        <h3 style={{ marginTop: 0, marginBottom: '16px' }}>Neue Leitung hinzufügen</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr 200px 120px', gap: '12px', alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '13px' }}>
              Verbindungstyp
            </label>
            <select
              value={newLeitung.connectionType}
              onChange={(e) => setNewLeitung({ ...newLeitung, connectionType: e.target.value })}
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
              Dimension
            </label>
            <input
              type="text"
              value={newLeitung.dimension}
              onChange={(e) => setNewLeitung({ ...newLeitung, dimension: e.target.value })}
              placeholder="z.B. DN50, NYM 3x1.5mm²"
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
              Preis/m (€)
            </label>
            <input
              type="number"
              step="0.01"
              value={newLeitung.preis_pro_meter ?? ''}
              onChange={(e) => setNewLeitung({ ...newLeitung, preis_pro_meter: e.target.value ? parseFloat(e.target.value) : null })}
              placeholder="15.50"
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

function Section({ title, leitungen, connectionType, editingLeitung, setEditingLeitung, onUpdate, onDelete }) {
  return (
    <div style={{ marginBottom: '32px' }}>
      <h3 style={{ marginBottom: '16px', color: 'var(--accent)' }}>{title}</h3>
      {leitungen.length === 0 ? (
        <div style={{ padding: '16px', background: 'var(--bg-secondary)', borderRadius: '4px', color: 'var(--text-secondary)', fontSize: '13px' }}>
          Keine Leitungen vorhanden
        </div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', background: 'var(--bg-secondary)', borderRadius: '4px', overflow: 'hidden' }}>
          <thead>
            <tr style={{ background: 'var(--bg-tertiary)', borderBottom: '2px solid var(--border)' }}>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, fontSize: '13px' }}>Dimension</th>
              <th style={{ padding: '12px', textAlign: 'right', fontWeight: 600, fontSize: '13px' }}>Preis/m (€)</th>
              <th style={{ padding: '12px', textAlign: 'right', fontWeight: 600, fontSize: '13px' }}>Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {leitungen.map((leitung) => (
              <tr key={leitung.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '12px' }}>
                  {editingLeitung === leitung.id ? (
                    <input
                      type="text"
                      value={leitung.dimension}
                      onChange={(e) => onUpdate(leitung.id, { dimension: e.target.value })}
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
                    <span style={{ fontSize: '14px' }}>{leitung.dimension}</span>
                  )}
                </td>
                <td style={{ padding: '12px', textAlign: 'right' }}>
                  {editingLeitung === leitung.id ? (
                    <input
                      type="number"
                      step="0.01"
                      value={leitung.preis_pro_meter ?? ''}
                      onChange={(e) => onUpdate(leitung.id, { preis_pro_meter: e.target.value ? parseFloat(e.target.value) : null })}
                      style={{
                        width: '100px',
                        padding: '6px 8px',
                        background: 'var(--bg-tertiary)',
                        border: '1px solid var(--border)',
                        borderRadius: '4px',
                        color: 'var(--text-primary)',
                        fontFamily: 'inherit',
                        fontSize: '13px',
                        textAlign: 'right',
                      }}
                    />
                  ) : (
                    <span style={{ fontSize: '14px' }}>{leitung.preis_pro_meter ?? '—'}</span>
                  )}
                </td>
                <td style={{ padding: '12px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    {editingLeitung === leitung.id ? (
                      <button
                        onClick={() => setEditingLeitung(null)}
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
                        onClick={() => setEditingLeitung(leitung.id)}
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
                      onClick={() => onDelete(leitung.id)}
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
