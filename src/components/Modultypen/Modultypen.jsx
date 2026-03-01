import { useState } from 'react';

export default function Modultypen({ modultypen, setModultypen }) {
  const [editingType, setEditingType] = useState(null);
  const [newTypeName, setNewTypeName] = useState('');
  const [newBerechnungsart, setNewBerechnungsart] = useState('pro_unit');
  const [newEinheit, setNewEinheit] = useState('');
  const [editFormData, setEditFormData] = useState(null);

  const handleAdd = () => {
    if (!newTypeName.trim()) {
      alert('Bitte einen Namen eingeben!');
      return;
    }

    if (modultypen.some(t => t.name === newTypeName.trim())) {
      alert('Dieser Modultyp existiert bereits!');
      return;
    }

    const newType = {
      id: `type-${Date.now()}`,
      name: newTypeName.trim(),
      berechnungsart: newBerechnungsart,
      einheit: newBerechnungsart === 'pro_einheit' ? newEinheit.trim() : '',
    };

    setModultypen([...modultypen, newType]);
    setNewTypeName('');
    setNewBerechnungsart('pro_unit');
    setNewEinheit('');
  };

  const handleUpdate = (id, updates) => {
    if (!updates.name.trim()) {
      alert('Name darf nicht leer sein!');
      return;
    }

    if (modultypen.some(t => t.id !== id && t.name === updates.name.trim())) {
      alert('Dieser Modultyp existiert bereits!');
      return;
    }

    setModultypen(modultypen.map(t => t.id === id ? {
      ...t,
      name: updates.name.trim(),
      berechnungsart: updates.berechnungsart,
      einheit: updates.berechnungsart === 'pro_einheit' ? updates.einheit.trim() : '',
    } : t));
    setEditingType(null);
  };

  const handleDelete = (id) => {
    if (confirm('Modultyp wirklich löschen?\n\nHinweis: Bestehende Module mit diesem Typ werden nicht gelöscht, aber der Typ wird nicht mehr in der Auswahl erscheinen.')) {
      setModultypen(modultypen.filter(t => t.id !== id));
    }
  };

  return (
    <div style={{ padding: '32px', maxWidth: '1000px', margin: '0 auto' }}>
      <h2 style={{ marginTop: 0, marginBottom: '8px' }}>Modultypen</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '14px' }}>
        Verwalte die verfügbaren Modultypen für die Moduldatenbank
      </p>

      {/* Neuen Modultyp hinzufügen */}
      <div
        style={{
          background: 'var(--bg-secondary)',
          border: '2px solid var(--accent)',
          borderRadius: '8px',
          padding: '24px',
          marginBottom: '32px',
        }}
      >
        <h3 style={{ marginTop: 0, marginBottom: '16px' }}>Neuen Modultyp hinzufügen</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '13px' }}>
              Name
            </label>
            <input
              type="text"
              value={newTypeName}
              onChange={(e) => setNewTypeName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleAdd();
                }
              }}
              placeholder="z.B. Wärmepumpe, Pufferspeicher"
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
              Berechnungsart
            </label>
            <select
              value={newBerechnungsart}
              onChange={(e) => setNewBerechnungsart(e.target.value)}
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
              <option value="pro_unit">Pro Stück</option>
              <option value="pro_einheit">Pro Einheit</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '13px' }}>
              Einheit
            </label>
            <input
              type="text"
              value={newEinheit}
              onChange={(e) => setNewEinheit(e.target.value)}
              placeholder={newBerechnungsart === 'pro_einheit' ? 'z.B. lm, m²' : ''}
              disabled={newBerechnungsart === 'pro_unit'}
              style={{
                width: '100%',
                padding: '10px',
                background: newBerechnungsart === 'pro_unit' ? 'var(--bg-tertiary)' : 'var(--bg-tertiary)',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                color: 'var(--text-primary)',
                fontFamily: 'inherit',
                fontSize: '14px',
                opacity: newBerechnungsart === 'pro_unit' ? 0.5 : 1,
                cursor: newBerechnungsart === 'pro_unit' ? 'not-allowed' : 'text',
              }}
            />
          </div>
        </div>
        <button
          onClick={handleAdd}
          style={{
            width: '100%',
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

      {/* Liste der Modultypen */}
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ marginBottom: '16px', color: 'var(--accent)' }}>Verfügbare Modultypen</h3>
        {modultypen.length === 0 ? (
          <div style={{ padding: '16px', background: 'var(--bg-secondary)', borderRadius: '4px', color: 'var(--text-secondary)', fontSize: '13px' }}>
            Keine Modultypen vorhanden
          </div>
        ) : (
          <div style={{ background: 'var(--bg-secondary)', borderRadius: '8px', overflow: 'hidden' }}>
            {modultypen.map((type, index) => (
              <div
                key={type.id}
                style={{
                  padding: '16px',
                  borderBottom: index < modultypen.length - 1 ? '1px solid var(--border)' : 'none',
                }}
              >
                {editingType === type.id ? (
                  <div>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                      <div>
                        <input
                          type="text"
                          value={editFormData.name}
                          onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                          autoFocus
                          style={{
                            width: '100%',
                            padding: '8px',
                            background: 'var(--bg-tertiary)',
                            border: '1px solid var(--accent)',
                            borderRadius: '4px',
                            color: 'var(--text-primary)',
                            fontFamily: 'inherit',
                            fontSize: '14px',
                          }}
                        />
                      </div>
                      <div>
                        <select
                          value={editFormData.berechnungsart}
                          onChange={(e) => setEditFormData({ ...editFormData, berechnungsart: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '8px',
                            background: 'var(--bg-tertiary)',
                            border: '1px solid var(--border)',
                            borderRadius: '4px',
                            color: 'var(--text-primary)',
                            fontFamily: 'inherit',
                            fontSize: '14px',
                          }}
                        >
                          <option value="pro_unit">Pro Stück</option>
                          <option value="pro_einheit">Pro Einheit</option>
                        </select>
                      </div>
                      <div>
                        <input
                          type="text"
                          value={editFormData.einheit}
                          onChange={(e) => setEditFormData({ ...editFormData, einheit: e.target.value })}
                          placeholder={editFormData.berechnungsart === 'pro_einheit' ? 'z.B. lm, m²' : ''}
                          disabled={editFormData.berechnungsart === 'pro_unit'}
                          style={{
                            width: '100%',
                            padding: '8px',
                            background: 'var(--bg-tertiary)',
                            border: '1px solid var(--border)',
                            borderRadius: '4px',
                            color: 'var(--text-primary)',
                            fontFamily: 'inherit',
                            fontSize: '14px',
                            opacity: editFormData.berechnungsart === 'pro_unit' ? 0.5 : 1,
                            cursor: editFormData.berechnungsart === 'pro_unit' ? 'not-allowed' : 'text',
                          }}
                        />
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => {
                          handleUpdate(type.id, editFormData);
                        }}
                        style={{
                          padding: '8px 16px',
                          background: 'var(--success)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: 600,
                        }}
                      >
                        Speichern
                      </button>
                      <button
                        onClick={() => {
                          setEditingType(null);
                          setEditFormData(null);
                        }}
                        style={{
                          padding: '8px 16px',
                          background: 'var(--bg-tertiary)',
                          color: 'var(--text-primary)',
                          border: '1px solid var(--border)',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: 600,
                        }}
                      >
                        Abbrechen
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: 500, marginBottom: '4px' }}>
                        {type.name}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        {type.berechnungsart === 'pro_einheit' ? (
                          <>Pro Einheit ({type.einheit})</>
                        ) : (
                          <>Pro Stück</>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setEditingType(type.id);
                        setEditFormData({
                          name: type.name,
                          berechnungsart: type.berechnungsart || 'pro_unit',
                          einheit: type.einheit || '',
                        });
                      }}
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
                    <button
                      onClick={() => handleDelete(type.id)}
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
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
