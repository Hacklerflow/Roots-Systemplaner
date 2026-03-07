import { useState, useEffect } from 'react';
import { CONNECTION_TYPES } from '../../data/types';
import { catalogsAPI } from '../../api/client';

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
    return leitungskatalog.filter(l => {
      if (!l.connectionType || l.connectionType === '--') return false;
      const type = getConnectionTypeFromName(l.connectionType);
      return type === verbindungsTyp;
    });
  };

  // Get connections by type (hydraulisch/elektrisch/steuerung)
  const getConnectionsByType = (typ) => {
    return verbindungsartenkatalog.filter(v => v.connectionType === typ);
  };

  // Verfügbare Dimensionen (alle, da nicht verbindungstyp-spezifisch)
  const getAvailableDimensionen = () => {
    return dimensionskatalog.map(d => d.name || d.value);
  };

  return (
    <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>
      <h2 style={{ marginTop: 0, marginBottom: '8px' }}>Leitungskatalog</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '14px' }}>
        Verwalte verfügbare Leitungstypen mit Dimensionen, Material und Preisen pro Meter
      </p>

      {/* Hydraulische Leitungen */}
      <Section
        title="Hydraulische Leitungen"
        leitungen={getLeitungenByType(CONNECTION_TYPES.HYDRAULIC)}
        connections={getConnectionsByType(CONNECTION_TYPES.HYDRAULIC)}
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
        connections={getConnectionsByType(CONNECTION_TYPES.ELECTRIC)}
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
        connections={getConnectionsByType(CONNECTION_TYPES.CONTROL)}
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
          connections={verbindungsartenkatalog}
          dimensionen={getAvailableDimensionen()}
          editingLeitung={editingLeitung}
          setEditingLeitung={setEditingLeitung}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          showAllConnections={true}
        />
      )}

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
        <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr 1fr 120px', gap: '12px', alignItems: 'end', marginBottom: '12px' }}>
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
              <option value="--">--</option>
              <option value={CONNECTION_TYPES.HYDRAULIC}>Hydraulisch</option>
              <option value={CONNECTION_TYPES.ELECTRIC}>Elektrisch</option>
              <option value={CONNECTION_TYPES.CONTROL}>Steuerung</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '13px' }}>
              Dimension
            </label>
            <select
              value={newLeitung.dimension}
              onChange={(e) => setNewLeitung({ ...newLeitung, dimension: e.target.value })}
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
              <option value="--">--</option>
              {getAvailableDimensionen().map(dim => (
                <option key={dim} value={dim}>{dim}</option>
              ))}
            </select>
            {getAvailableDimensionen().length === 0 && (
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                ℹ️ Dimensionen können später in Einstellungen → Dimensionen angelegt werden
              </div>
            )}
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '13px' }}>
              Material
            </label>
            <input
              type="text"
              value={newLeitung.material}
              onChange={(e) => setNewLeitung({ ...newLeitung, material: e.target.value })}
              placeholder="z.B. Kupfer, Stahl"
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
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: '12px', alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '13px' }}>
              Produktlink (optional)
            </label>
            <input
              type="url"
              value={newLeitung.produktlink}
              onChange={(e) => setNewLeitung({ ...newLeitung, produktlink: e.target.value })}
              placeholder="https://..."
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

function Section({ title, leitungen, connections, dimensionen, editingLeitung, setEditingLeitung, onUpdate, onDelete, showAllConnections = false }) {
  // Group connections by type for showAllConnections mode
  const getConnectionsByType = (typ) => {
    return connections.filter(v => v.connectionType === typ);
  };

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
              {showAllConnections && <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, fontSize: '13px' }}>Verbindung</th>}
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, fontSize: '13px' }}>Dimension</th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, fontSize: '13px' }}>Material</th>
              <th style={{ padding: '12px', textAlign: 'right', fontWeight: 600, fontSize: '13px' }}>Preis/m (€)</th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, fontSize: '13px' }}>Produktlink</th>
              <th style={{ padding: '12px', textAlign: 'right', fontWeight: 600, fontSize: '13px' }}>Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {leitungen.map((leitung) => (
              <tr key={leitung.id} style={{ borderBottom: '1px solid var(--border)' }}>
                {/* Verbindung (nur bei showAllConnections) */}
                {showAllConnections && (
                  <td style={{ padding: '12px' }}>
                    {editingLeitung === leitung.id ? (
                      <select
                        value={leitung.connectionType || '--'}
                        onChange={(e) => onUpdate(leitung.id, { connectionType: e.target.value === '--' ? null : e.target.value })}
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
                      >
                        <option value="--">--</option>
                        <option value={CONNECTION_TYPES.HYDRAULIC}>Hydraulisch</option>
                        <option value={CONNECTION_TYPES.ELECTRIC}>Elektrisch</option>
                        <option value={CONNECTION_TYPES.CONTROL}>Steuerung</option>
                      </select>
                    ) : (
                      <span style={{ fontSize: '14px' }}>
                        {leitung.connectionType === CONNECTION_TYPES.HYDRAULIC ? 'Hydraulisch' :
                         leitung.connectionType === CONNECTION_TYPES.ELECTRIC ? 'Elektrisch' :
                         leitung.connectionType === CONNECTION_TYPES.CONTROL ? 'Steuerung' :
                         '--'}
                      </span>
                    )}
                  </td>
                )}

                {/* Dimension */}
                <td style={{ padding: '12px' }}>
                  {editingLeitung === leitung.id ? (
                    <select
                      value={leitung.dimension || '--'}
                      onChange={(e) => onUpdate(leitung.id, { dimension: e.target.value === '--' ? null : e.target.value })}
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
                    >
                      <option value="--">--</option>
                      {dimensionen.map(dim => (
                        <option key={dim} value={dim}>{dim}</option>
                      ))}
                    </select>
                  ) : (
                    <span style={{ fontSize: '14px' }}>{leitung.dimension || '--'}</span>
                  )}
                </td>

                {/* Material */}
                <td style={{ padding: '12px' }}>
                  {editingLeitung === leitung.id ? (
                    <input
                      type="text"
                      value={leitung.material || ''}
                      onChange={(e) => onUpdate(leitung.id, { material: e.target.value })}
                      placeholder="z.B. Kupfer"
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
                    <span style={{ fontSize: '14px' }}>{leitung.material || '—'}</span>
                  )}
                </td>

                {/* Preis */}
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

                {/* Produktlink */}
                <td style={{ padding: '12px' }}>
                  {editingLeitung === leitung.id ? (
                    <input
                      type="url"
                      value={leitung.produktlink || ''}
                      onChange={(e) => onUpdate(leitung.id, { produktlink: e.target.value })}
                      placeholder="https://..."
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
                  ) : leitung.produktlink ? (
                    <a
                      href={leitung.produktlink}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ textDecoration: 'none' }}
                    >
                      <button
                        style={{
                          padding: '4px 10px',
                          background: 'var(--bg-tertiary)',
                          color: 'var(--text-primary)',
                          border: '1px solid var(--border)',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '11px',
                          fontWeight: 500,
                          fontFamily: 'inherit',
                        }}
                      >
                        🔗 Link
                      </button>
                    </a>
                  ) : (
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>—</span>
                  )}
                </td>

                {/* Aktionen */}
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
