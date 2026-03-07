import { useState } from 'react';
import { catalogsAPI } from '../../api/client';

export default function Pumpen({ pumpenkatalog, setPumpenkatalog }) {
  const [editingPump, setEditingPump] = useState(null);
  const [newPump, setNewPump] = useState({
    name: '',
    hersteller: '',
    modell: '',
    foerdermenge_m3h: null,
    foerderhoehe_m: null,
    leistung_kw: null,
    spannung: '',
    anschlussgroesse: '',
    preis: null,
    notizen: '',
  });

  const handleAdd = async () => {
    if (!newPump.name) {
      alert('Bitte Name eingeben!');
      return;
    }

    try {
      const response = await catalogsAPI.addPump(newPump);

      const pump = {
        id: response.pump.id,
        ...response.pump,
      };

      setPumpenkatalog([...pumpenkatalog, pump]);
      setNewPump({
        name: '',
        hersteller: '',
        modell: '',
        foerdermenge_m3h: null,
        foerderhoehe_m: null,
        leistung_kw: null,
        spannung: '',
        anschlussgroesse: '',
        preis: null,
        notizen: '',
      });
    } catch (error) {
      alert(`Fehler beim Speichern: ${error.message}`);
    }
  };

  const handleUpdate = async (id, updates) => {
    try {
      await catalogsAPI.updatePump(id, updates);
      setPumpenkatalog(pumpenkatalog.map(p => p.id === id ? { ...p, ...updates } : p));
    } catch (error) {
      alert(`Fehler beim Aktualisieren: ${error.message}`);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Pumpe wirklich löschen?')) {
      try {
        await catalogsAPI.deletePump(id);
        setPumpenkatalog(pumpenkatalog.filter(p => p.id !== id));
      } catch (error) {
        alert(`Fehler beim Löschen: ${error.message}`);
      }
    }
  };

  return (
    <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>
      <h2 style={{ marginTop: 0, marginBottom: '8px' }}>Pumpenkatalog</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '14px' }}>
        Verwalte verfügbare Pumpen mit technischen Daten und Preisen
      </p>

      {/* Pumpenliste */}
      {pumpenkatalog.length === 0 ? (
        <div style={{ padding: '16px', background: 'var(--bg-secondary)', borderRadius: '4px', color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '32px' }}>
          Keine Pumpen vorhanden
        </div>
      ) : (
        <div style={{ marginBottom: '32px', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: 'var(--bg-secondary)', borderRadius: '4px', overflow: 'hidden' }}>
            <thead>
              <tr style={{ background: 'var(--bg-tertiary)', borderBottom: '2px solid var(--border)' }}>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, fontSize: '13px' }}>Name</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, fontSize: '13px' }}>Hersteller</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, fontSize: '13px' }}>Modell</th>
                <th style={{ padding: '12px', textAlign: 'right', fontWeight: 600, fontSize: '13px' }}>Menge (m³/h)</th>
                <th style={{ padding: '12px', textAlign: 'right', fontWeight: 600, fontSize: '13px' }}>Höhe (m)</th>
                <th style={{ padding: '12px', textAlign: 'right', fontWeight: 600, fontSize: '13px' }}>Leistung (kW)</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, fontSize: '13px' }}>Spannung</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, fontSize: '13px' }}>DN</th>
                <th style={{ padding: '12px', textAlign: 'right', fontWeight: 600, fontSize: '13px' }}>Preis (€)</th>
                <th style={{ padding: '12px', textAlign: 'right', fontWeight: 600, fontSize: '13px' }}>Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {pumpenkatalog.map((pump) => (
                <tr key={pump.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px' }}>
                    {editingPump === pump.id ? (
                      <input
                        type="text"
                        value={pump.name}
                        onChange={(e) => handleUpdate(pump.id, { name: e.target.value })}
                        style={{ width: '100%', padding: '6px 8px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--text-primary)', fontFamily: 'inherit', fontSize: '13px' }}
                      />
                    ) : (
                      <span style={{ fontSize: '14px', fontWeight: 500 }}>{pump.name}</span>
                    )}
                  </td>
                  <td style={{ padding: '12px' }}>
                    {editingPump === pump.id ? (
                      <input
                        type="text"
                        value={pump.hersteller || ''}
                        onChange={(e) => handleUpdate(pump.id, { hersteller: e.target.value })}
                        style={{ width: '100%', padding: '6px 8px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--text-primary)', fontFamily: 'inherit', fontSize: '13px' }}
                      />
                    ) : (
                      <span style={{ fontSize: '14px' }}>{pump.hersteller || '—'}</span>
                    )}
                  </td>
                  <td style={{ padding: '12px' }}>
                    {editingPump === pump.id ? (
                      <input
                        type="text"
                        value={pump.modell || ''}
                        onChange={(e) => handleUpdate(pump.id, { modell: e.target.value })}
                        style={{ width: '100%', padding: '6px 8px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--text-primary)', fontFamily: 'inherit', fontSize: '13px' }}
                      />
                    ) : (
                      <span style={{ fontSize: '14px' }}>{pump.modell || '—'}</span>
                    )}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    {editingPump === pump.id ? (
                      <input
                        type="number"
                        step="0.1"
                        value={pump.foerdermenge_m3h ?? ''}
                        onChange={(e) => handleUpdate(pump.id, { foerdermenge_m3h: e.target.value ? parseFloat(e.target.value) : null })}
                        style={{ width: '80px', padding: '6px 8px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--text-primary)', fontFamily: 'inherit', fontSize: '13px', textAlign: 'right' }}
                      />
                    ) : (
                      <span style={{ fontSize: '14px' }}>{pump.foerdermenge_m3h ?? '—'}</span>
                    )}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    {editingPump === pump.id ? (
                      <input
                        type="number"
                        step="0.1"
                        value={pump.foerderhoehe_m ?? ''}
                        onChange={(e) => handleUpdate(pump.id, { foerderhoehe_m: e.target.value ? parseFloat(e.target.value) : null })}
                        style={{ width: '80px', padding: '6px 8px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--text-primary)', fontFamily: 'inherit', fontSize: '13px', textAlign: 'right' }}
                      />
                    ) : (
                      <span style={{ fontSize: '14px' }}>{pump.foerderhoehe_m ?? '—'}</span>
                    )}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    {editingPump === pump.id ? (
                      <input
                        type="number"
                        step="0.01"
                        value={pump.leistung_kw ?? ''}
                        onChange={(e) => handleUpdate(pump.id, { leistung_kw: e.target.value ? parseFloat(e.target.value) : null })}
                        style={{ width: '80px', padding: '6px 8px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--text-primary)', fontFamily: 'inherit', fontSize: '13px', textAlign: 'right' }}
                      />
                    ) : (
                      <span style={{ fontSize: '14px' }}>{pump.leistung_kw ?? '—'}</span>
                    )}
                  </td>
                  <td style={{ padding: '12px' }}>
                    {editingPump === pump.id ? (
                      <input
                        type="text"
                        value={pump.spannung || ''}
                        onChange={(e) => handleUpdate(pump.id, { spannung: e.target.value })}
                        placeholder="230V"
                        style={{ width: '80px', padding: '6px 8px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--text-primary)', fontFamily: 'inherit', fontSize: '13px' }}
                      />
                    ) : (
                      <span style={{ fontSize: '14px' }}>{pump.spannung || '—'}</span>
                    )}
                  </td>
                  <td style={{ padding: '12px' }}>
                    {editingPump === pump.id ? (
                      <input
                        type="text"
                        value={pump.anschlussgroesse || ''}
                        onChange={(e) => handleUpdate(pump.id, { anschlussgroesse: e.target.value })}
                        placeholder="DN25"
                        style={{ width: '80px', padding: '6px 8px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--text-primary)', fontFamily: 'inherit', fontSize: '13px' }}
                      />
                    ) : (
                      <span style={{ fontSize: '14px' }}>{pump.anschlussgroesse || '—'}</span>
                    )}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    {editingPump === pump.id ? (
                      <input
                        type="number"
                        step="0.01"
                        value={pump.preis ?? ''}
                        onChange={(e) => handleUpdate(pump.id, { preis: e.target.value ? parseFloat(e.target.value) : null })}
                        style={{ width: '100px', padding: '6px 8px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--text-primary)', fontFamily: 'inherit', fontSize: '13px', textAlign: 'right' }}
                      />
                    ) : (
                      <span style={{ fontSize: '14px' }}>{pump.preis ?? '—'}</span>
                    )}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      {editingPump === pump.id ? (
                        <button
                          onClick={() => setEditingPump(null)}
                          style={{ padding: '6px 12px', background: 'var(--success)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}
                        >
                          Fertig
                        </button>
                      ) : (
                        <button
                          onClick={() => setEditingPump(pump.id)}
                          style={{ padding: '6px 12px', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}
                        >
                          Bearbeiten
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(pump.id)}
                        style={{ padding: '6px 12px', background: 'var(--error)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}
                      >
                        Löschen
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Neue Pumpe hinzufügen */}
      <div style={{ background: 'var(--bg-secondary)', border: '2px solid var(--accent)', borderRadius: '8px', padding: '24px' }}>
        <h3 style={{ marginTop: 0, marginBottom: '16px' }}>Neue Pumpe hinzufügen</h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '13px' }}>Name *</label>
            <input
              type="text"
              value={newPump.name}
              onChange={(e) => setNewPump({ ...newPump, name: e.target.value })}
              placeholder="z.B. Heizkreispumpe 1"
              style={{ width: '100%', padding: '10px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--text-primary)', fontFamily: 'inherit', fontSize: '14px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '13px' }}>Hersteller</label>
            <input
              type="text"
              value={newPump.hersteller}
              onChange={(e) => setNewPump({ ...newPump, hersteller: e.target.value })}
              placeholder="z.B. Grundfos, Wilo"
              style={{ width: '100%', padding: '10px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--text-primary)', fontFamily: 'inherit', fontSize: '14px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '13px' }}>Modell</label>
            <input
              type="text"
              value={newPump.modell}
              onChange={(e) => setNewPump({ ...newPump, modell: e.target.value })}
              placeholder="Artikelnummer"
              style={{ width: '100%', padding: '10px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--text-primary)', fontFamily: 'inherit', fontSize: '14px' }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '13px' }}>Fördermenge (m³/h)</label>
            <input
              type="number"
              step="0.1"
              value={newPump.foerdermenge_m3h ?? ''}
              onChange={(e) => setNewPump({ ...newPump, foerdermenge_m3h: e.target.value ? parseFloat(e.target.value) : null })}
              placeholder="2.5"
              style={{ width: '100%', padding: '10px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--text-primary)', fontFamily: 'inherit', fontSize: '14px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '13px' }}>Förderhöhe (m)</label>
            <input
              type="number"
              step="0.1"
              value={newPump.foerderhoehe_m ?? ''}
              onChange={(e) => setNewPump({ ...newPump, foerderhoehe_m: e.target.value ? parseFloat(e.target.value) : null })}
              placeholder="6.0"
              style={{ width: '100%', padding: '10px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--text-primary)', fontFamily: 'inherit', fontSize: '14px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '13px' }}>Leistung (kW)</label>
            <input
              type="number"
              step="0.01"
              value={newPump.leistung_kw ?? ''}
              onChange={(e) => setNewPump({ ...newPump, leistung_kw: e.target.value ? parseFloat(e.target.value) : null })}
              placeholder="0.15"
              style={{ width: '100%', padding: '10px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--text-primary)', fontFamily: 'inherit', fontSize: '14px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '13px' }}>Spannung</label>
            <input
              type="text"
              value={newPump.spannung}
              onChange={(e) => setNewPump({ ...newPump, spannung: e.target.value })}
              placeholder="230V / 400V"
              style={{ width: '100%', padding: '10px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--text-primary)', fontFamily: 'inherit', fontSize: '14px' }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: '12px', alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '13px' }}>Anschlussgröße</label>
            <input
              type="text"
              value={newPump.anschlussgroesse}
              onChange={(e) => setNewPump({ ...newPump, anschlussgroesse: e.target.value })}
              placeholder="DN25"
              style={{ width: '100%', padding: '10px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--text-primary)', fontFamily: 'inherit', fontSize: '14px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '13px' }}>Preis (€)</label>
            <input
              type="number"
              step="0.01"
              value={newPump.preis ?? ''}
              onChange={(e) => setNewPump({ ...newPump, preis: e.target.value ? parseFloat(e.target.value) : null })}
              placeholder="450.00"
              style={{ width: '100%', padding: '10px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--text-primary)', fontFamily: 'inherit', fontSize: '14px' }}
            />
          </div>
          <button
            onClick={handleAdd}
            style={{ padding: '10px 16px', background: 'var(--accent)', color: 'var(--bg-primary)', border: 'none', borderRadius: '4px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', fontSize: '14px' }}
          >
            + Hinzufügen
          </button>
        </div>
      </div>
    </div>
  );
}
