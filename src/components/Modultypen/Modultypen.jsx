import { useState } from 'react';

export default function Modultypen({ modultypen, setModultypen }) {
  const [editingType, setEditingType] = useState(null);
  const [newTypeName, setNewTypeName] = useState('');

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
    };

    setModultypen([...modultypen, newType]);
    setNewTypeName('');
  };

  const handleUpdate = (id, newName) => {
    if (!newName.trim()) {
      alert('Name darf nicht leer sein!');
      return;
    }

    if (modultypen.some(t => t.id !== id && t.name === newName.trim())) {
      alert('Dieser Modultyp existiert bereits!');
      return;
    }

    setModultypen(modultypen.map(t => t.id === id ? { ...t, name: newName.trim() } : t));
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
        <div style={{ display: 'flex', gap: '12px', alignItems: 'end' }}>
          <div style={{ flex: 1 }}>
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
                  display: 'flex',
                  alignItems: 'center',
                  padding: '16px',
                  borderBottom: index < modultypen.length - 1 ? '1px solid var(--border)' : 'none',
                  gap: '12px',
                }}
              >
                {editingType === type.id ? (
                  <>
                    <input
                      type="text"
                      defaultValue={type.name}
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleUpdate(type.id, e.target.value);
                        } else if (e.key === 'Escape') {
                          setEditingType(null);
                        }
                      }}
                      onBlur={(e) => handleUpdate(type.id, e.target.value)}
                      style={{
                        flex: 1,
                        padding: '8px',
                        background: 'var(--bg-tertiary)',
                        border: '1px solid var(--accent)',
                        borderRadius: '4px',
                        color: 'var(--text-primary)',
                        fontFamily: 'inherit',
                        fontSize: '14px',
                      }}
                    />
                    <button
                      onClick={() => setEditingType(null)}
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
                      Fertig
                    </button>
                  </>
                ) : (
                  <>
                    <div style={{ flex: 1, fontSize: '14px', fontWeight: 500 }}>
                      {type.name}
                    </div>
                    <button
                      onClick={() => setEditingType(type.id)}
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
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
