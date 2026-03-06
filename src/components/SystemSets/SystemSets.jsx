import { useState, useEffect, useRef } from 'react';
import { setsAPI } from '../../api/client';

export default function SystemSets({ onReloadCatalogs }) {
  const [sets, setSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newSetName, setNewSetName] = useState('');
  const [newSetDescription, setNewSetDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadSets();
  }, []);

  const loadSets = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await setsAPI.getAll();
      setSets(response.sets);
    } catch (err) {
      console.error('Load sets error:', err);
      setError('Fehler beim Laden der Sets');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newSetName.trim()) {
      alert('Bitte einen Namen eingeben!');
      return;
    }

    try {
      await setsAPI.create(newSetName.trim(), newSetDescription.trim() || null);
      setNewSetName('');
      setNewSetDescription('');
      setIsCreating(false);
      await loadSets();
      alert('Set erfolgreich erstellt!');
    } catch (err) {
      console.error('Create set error:', err);
      alert('Fehler beim Erstellen des Sets');
    }
  };

  const handleActivate = async (setId) => {
    if (!confirm('Möchtest du dieses Set aktivieren?\n\nDeine Katalog-Ansicht wird aktualisiert.')) {
      return;
    }

    try {
      await setsAPI.activate(setId);
      await loadSets();
      // Reload catalogs in parent component
      if (onReloadCatalogs) {
        await onReloadCatalogs();
      }
      alert('Set erfolgreich aktiviert!');
    } catch (err) {
      console.error('Activate set error:', err);
      alert('Fehler beim Aktivieren des Sets');
    }
  };

  const handleDelete = async (setId, setName) => {
    if (!confirm(`Set "${setName}" wirklich löschen?\n\nDiese Aktion kann nicht rückgängig gemacht werden!`)) {
      return;
    }

    try {
      await setsAPI.delete(setId);
      await loadSets();
      alert('Set erfolgreich gelöscht!');
    } catch (err) {
      console.error('Delete set error:', err);
      alert('Fehler beim Löschen des Sets');
    }
  };

  const handleExport = async (setId) => {
    try {
      await setsAPI.export(setId);
    } catch (err) {
      console.error('Export set error:', err);
      alert('Fehler beim Exportieren des Sets');
    }
  };

  const handleImportFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const imported = JSON.parse(e.target.result);

        if (!imported.type || imported.type !== 'roots-catalog-set') {
          alert('Ungültige Datei: Falsches Format!');
          return;
        }

        if (!imported.set || !imported.set.name || !imported.set.data) {
          alert('Ungültige Datei: Set-Daten fehlen!');
          return;
        }

        await setsAPI.import(imported);
        await loadSets();
        alert('Set erfolgreich importiert!');
      } catch (error) {
        console.error('Import error:', error);
        alert('Fehler beim Importieren: Ungültige JSON-Datei!');
      }
    };

    reader.readAsText(file);
    event.target.value = '';
  };

  const activeSet = sets.find(s => s.is_active);

  if (loading) {
    return <div style={{ padding: '24px' }}>Lade Sets...</div>;
  }

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: 'calc(100vh - 140px)', padding: '24px' }}>
      {/* Error Banner */}
      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid #ef4444',
          borderRadius: '4px',
          padding: '12px',
          marginBottom: '24px',
          color: '#fca5a5',
        }}>
          {error}
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ margin: 0, marginBottom: '4px', fontSize: '24px' }}>Katalog-Sets</h2>
        <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)' }}>
          Verwalte deine Katalog-Vorlagen (Module, Leitungen, Dimensionen, etc.)
        </p>
      </div>

      {/* Import Button */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', maxWidth: '700px' }}>
        <button
          onClick={() => fileInputRef.current?.click()}
          style={{
            flex: 1,
            padding: '12px 16px',
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
          📂 Set importieren
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImportFile}
          style={{ display: 'none' }}
        />
      </div>

      {/* Active Set Display */}
      {activeSet && (
        <div style={{
          background: 'var(--bg-secondary)',
          border: '2px solid var(--accent)',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '24px',
          maxWidth: '700px',
        }}>
          <div style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: 600, marginBottom: '8px' }}>
            AKTIVES SET
          </div>
          <div style={{ fontSize: '20px', fontWeight: 600, marginBottom: '4px' }}>
            {activeSet.name}
          </div>
          {activeSet.description && (
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              {activeSet.description}
            </div>
          )}
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Erstellt am {new Date(activeSet.created_at).toLocaleDateString('de-DE')}
            {activeSet.creator_name && ` von ${activeSet.creator_name}`}
          </div>
        </div>
      )}

      {/* Create New Set */}
      <div style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '24px',
        maxWidth: '700px',
      }}>
        <h3 style={{ margin: 0, marginBottom: '16px', fontSize: '16px' }}>
          Neues Set erstellen
        </h3>
        {!isCreating ? (
          <button
            onClick={() => setIsCreating(true)}
            style={{
              width: '100%',
              padding: '12px',
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
            + Aktuellen Katalog-Stand als neues Set speichern
          </button>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input
              type="text"
              value={newSetName}
              onChange={(e) => setNewSetName(e.target.value)}
              placeholder="Set-Name (z.B. Wien Projekt 2026)"
              autoFocus
              style={{
                padding: '12px',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                color: 'var(--text-primary)',
                fontFamily: 'inherit',
                fontSize: '14px',
              }}
            />
            <textarea
              value={newSetDescription}
              onChange={(e) => setNewSetDescription(e.target.value)}
              placeholder="Beschreibung (optional)"
              rows={3}
              style={{
                padding: '12px',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                color: 'var(--text-primary)',
                fontFamily: 'inherit',
                fontSize: '14px',
                resize: 'vertical',
              }}
            />
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={handleCreate}
                style={{
                  flex: 1,
                  padding: '12px 20px',
                  background: 'var(--success)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  fontSize: '14px',
                }}
              >
                Speichern
              </button>
              <button
                onClick={() => {
                  setIsCreating(false);
                  setNewSetName('');
                  setNewSetDescription('');
                }}
                style={{
                  flex: 1,
                  padding: '12px 20px',
                  background: 'var(--bg-tertiary)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border)',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  fontSize: '14px',
                }}
              >
                Abbrechen
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Available Sets */}
      <div style={{ maxWidth: '700px' }}>
        <h3 style={{ margin: 0, marginBottom: '16px', fontSize: '16px' }}>
          Verfügbare Sets ({sets.length})
        </h3>
        {sets.length === 0 ? (
          <div style={{
            padding: '40px',
            textAlign: 'center',
            color: 'var(--text-secondary)',
            fontSize: '14px',
            background: 'var(--bg-secondary)',
            borderRadius: '8px',
          }}>
            Noch keine Sets vorhanden
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {sets.map((set) => (
              <div
                key={set.id}
                style={{
                  background: set.is_active ? 'var(--bg-tertiary)' : 'var(--bg-secondary)',
                  border: `1px solid ${set.is_active ? 'var(--accent)' : 'var(--border)'}`,
                  borderRadius: '8px',
                  padding: '16px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                      <span style={{ fontSize: '16px', fontWeight: 600 }}>
                        {set.name}
                      </span>
                      {set.is_active && (
                        <span style={{
                          fontSize: '10px',
                          padding: '3px 10px',
                          background: 'var(--accent)',
                          color: 'var(--bg-primary)',
                          borderRadius: '12px',
                          fontWeight: 600,
                        }}>
                          AKTIV
                        </span>
                      )}
                      {set.is_default && (
                        <span style={{
                          fontSize: '10px',
                          padding: '3px 10px',
                          background: 'var(--success)',
                          color: 'white',
                          borderRadius: '12px',
                          fontWeight: 600,
                        }}>
                          BASIC
                        </span>
                      )}
                    </div>
                    {set.description && (
                      <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                        {set.description}
                      </div>
                    )}
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      {new Date(set.created_at).toLocaleDateString('de-DE')}
                      {set.creator_name && ` • Erstellt von ${set.creator_name}`}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {!set.is_active && (
                      <button
                        onClick={() => handleActivate(set.id)}
                        style={{
                          padding: '8px 16px',
                          background: 'var(--accent)',
                          color: 'var(--bg-primary)',
                          border: 'none',
                          borderRadius: '4px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                          fontSize: '13px',
                        }}
                      >
                        Aktivieren
                      </button>
                    )}
                    <button
                      onClick={() => handleExport(set.id)}
                      style={{
                        padding: '8px 16px',
                        background: 'var(--success)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        fontSize: '13px',
                      }}
                    >
                      💾 Export
                    </button>
                    {!set.is_default && (
                      <button
                        onClick={() => handleDelete(set.id, set.name)}
                        disabled={set.is_active}
                        style={{
                          padding: '8px 16px',
                          background: set.is_active ? 'var(--bg-tertiary)' : 'var(--error)',
                          color: set.is_active ? 'var(--text-secondary)' : 'white',
                          border: 'none',
                          borderRadius: '4px',
                          fontWeight: 600,
                          cursor: set.is_active ? 'not-allowed' : 'pointer',
                          fontFamily: 'inherit',
                          fontSize: '13px',
                          opacity: set.is_active ? 0.5 : 1,
                        }}
                      >
                        Löschen
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
