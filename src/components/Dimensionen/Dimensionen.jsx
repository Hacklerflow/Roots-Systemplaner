import { useState } from 'react';
import { CONNECTION_TYPES, CONNECTION_TYPE_LABELS } from '../../data/types';

export default function Dimensionen({ dimensionskatalog, setDimensionskatalog }) {
  const [editingDimension, setEditingDimension] = useState(null);
  const [newDimension, setNewDimension] = useState({
    connectionType: CONNECTION_TYPES.HYDRAULIC,
    name: '',
  });

  const handleAdd = () => {
    if (!newDimension.name) {
      alert('Bitte Name eingeben!');
      return;
    }

    const dimension = {
      id: `dim-${newDimension.connectionType}-${Date.now()}`,
      ...newDimension,
    };

    setDimensionskatalog([...dimensionskatalog, dimension]);
    setNewDimension({
      connectionType: CONNECTION_TYPES.HYDRAULIC,
      name: '',
    });
  };

  const handleUpdate = (id, updates) => {
    setDimensionskatalog(dimensionskatalog.map(d => d.id === id ? { ...d, ...updates } : d));
  };

  const handleDelete = (id) => {
    if (confirm('Dimension wirklich löschen? Dies kann Leitungen und Verbindungen beeinflussen.')) {
      setDimensionskatalog(dimensionskatalog.filter(d => d.id !== id));
    }
  };

  const getDimensionenByType = (type) => {
    return dimensionskatalog.filter(d => d.connectionType === type);
  };

  return (
    <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>
      <h2 style={{ marginTop: 0, marginBottom: '8px' }}>Dimensionskatalog</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '14px' }}>
        Zentrale Verwaltung aller verfügbaren Dimensionen. Diese werden in Leitungen, Verbindungsarten und Modulen verwendet.
      </p>

      {/* Hydraulische Dimensionen */}
      <Section
        title="Hydraulische Dimensionen"
        dimensionen={getDimensionenByType(CONNECTION_TYPES.HYDRAULIC)}
        connectionType={CONNECTION_TYPES.HYDRAULIC}
        editingDimension={editingDimension}
        setEditingDimension={setEditingDimension}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />

      {/* Elektrische Dimensionen */}
      <Section
        title="Elektrische Dimensionen"
        dimensionen={getDimensionenByType(CONNECTION_TYPES.ELECTRIC)}
        connectionType={CONNECTION_TYPES.ELECTRIC}
        editingDimension={editingDimension}
        setEditingDimension={setEditingDimension}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />

      {/* Steuerungs-Dimensionen */}
      <Section
        title="Steuerungs-Dimensionen"
        dimensionen={getDimensionenByType(CONNECTION_TYPES.CONTROL)}
        connectionType={CONNECTION_TYPES.CONTROL}
        editingDimension={editingDimension}
        setEditingDimension={setEditingDimension}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />

      {/* Neue Dimension hinzufügen */}
      <div
        style={{
          background: 'var(--bg-secondary)',
          border: '2px solid var(--accent)',
          borderRadius: '8px',
          padding: '24px',
          marginTop: '32px',
        }}
      >
        <h3 style={{ marginTop: 0, marginBottom: '16px' }}>Neue Dimension hinzufügen</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr 120px', gap: '12px', alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '13px' }}>
              Verbindungstyp
            </label>
            <select
              value={newDimension.connectionType}
              onChange={(e) => setNewDimension({ ...newDimension, connectionType: e.target.value })}
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
              value={newDimension.name}
              onChange={(e) => setNewDimension({ ...newDimension, name: e.target.value })}
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

function Section({ title, dimensionen, connectionType, editingDimension, setEditingDimension, onUpdate, onDelete }) {
  return (
    <div style={{ marginBottom: '32px' }}>
      <h3 style={{ marginBottom: '16px', color: 'var(--accent)' }}>{title}</h3>
      {dimensionen.length === 0 ? (
        <div style={{ padding: '16px', background: 'var(--bg-secondary)', borderRadius: '4px', color: 'var(--text-secondary)', fontSize: '13px' }}>
          Keine Dimensionen vorhanden
        </div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', background: 'var(--bg-secondary)', borderRadius: '4px', overflow: 'hidden' }}>
          <thead>
            <tr style={{ background: 'var(--bg-tertiary)', borderBottom: '2px solid var(--border)' }}>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, fontSize: '13px' }}>Name</th>
              <th style={{ padding: '12px', textAlign: 'right', fontWeight: 600, fontSize: '13px' }}>Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {dimensionen.map((dimension) => (
              <tr key={dimension.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '12px' }}>
                  {editingDimension === dimension.id ? (
                    <input
                      type="text"
                      value={dimension.name}
                      onChange={(e) => onUpdate(dimension.id, { name: e.target.value })}
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
                    <span style={{ fontSize: '14px', fontWeight: 600 }}>{dimension.name}</span>
                  )}
                </td>
                <td style={{ padding: '12px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    {editingDimension === dimension.id ? (
                      <button
                        onClick={() => setEditingDimension(null)}
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
                        onClick={() => setEditingDimension(dimension.id)}
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
                      onClick={() => onDelete(dimension.id)}
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
