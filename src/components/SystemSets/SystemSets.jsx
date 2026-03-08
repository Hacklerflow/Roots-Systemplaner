import { useState, useRef } from 'react';

export default function SystemSets({
  systemSets,
  activeSetId,
  onCreateSet,
  onSwitchSet,
  onDeleteSet,
  onImportSets,
}) {
  const [newSetName, setNewSetName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const fileInputRef = useRef(null);

  const handleCreate = () => {
    if (!newSetName.trim()) {
      alert('Bitte einen Namen eingeben!');
      return;
    }
    onCreateSet(newSetName.trim());
    setNewSetName('');
    setIsCreating(false);
  };

  const handleSwitch = (setId) => {
    if (setId === activeSetId) return;

    if (confirm('Möchtest du wirklich das System Set wechseln?\n\nAlle aktuellen Kataloge (Module, Leitungen, etc.) werden durch das ausgewählte Set ersetzt!')) {
      onSwitchSet(setId);
    }
  };

  const handleDelete = (setId, setName) => {
    if (setId === activeSetId) {
      alert('Das aktive Set kann nicht gelöscht werden!');
      return;
    }

    if (confirm(`System Set "${setName}" wirklich löschen?\n\nDiese Aktion kann nicht rückgängig gemacht werden!`)) {
      onDeleteSet(setId);
    }
  };

  // Export einzelnes Set
  const handleExportSet = (set) => {
    const exportData = {
      version: '1.0',
      type: 'roots-system-set',
      exportDate: new Date().toISOString(),
      set: set,
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `SystemSet_${set.name.replace(/[^a-zA-Z0-9]/g, '_')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Export alle Sets
  const handleExportAllSets = () => {
    if (systemSets.length === 0) {
      alert('Keine System Sets zum Exportieren vorhanden!');
      return;
    }

    const exportData = {
      version: '1.0',
      type: 'roots-system-sets-collection',
      exportDate: new Date().toISOString(),
      sets: systemSets,
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const today = new Date().toISOString().slice(0, 10);
    const link = document.createElement('a');
    link.href = url;
    link.download = `RootsSystemSets_${today}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Import Sets
  const handleImportFile = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result);

        // Validierung
        if (!imported.version || !imported.type) {
          alert('Ungültige Datei: Falsches Format!');
          return;
        }

        let setsToImport = [];

        // Einzelnes Set oder Collection?
        if (imported.type === 'roots-system-set' && imported.set) {
          setsToImport = [imported.set];
        } else if (imported.type === 'roots-system-sets-collection' && imported.sets) {
          setsToImport = imported.sets;
        } else {
          alert('Ungültige Datei: Unbekannter Typ!');
          return;
        }

        // Validiere Set-Struktur
        const invalidSets = setsToImport.filter(set =>
          !set.id || !set.name || !set.createdAt
        );

        if (invalidSets.length > 0) {
          alert('Ungültige Datei: Ein oder mehrere Sets haben eine ungültige Struktur!');
          return;
        }

        // Import durchführen
        onImportSets(setsToImport);
        alert(`${setsToImport.length} System Set(s) erfolgreich importiert!`);
      } catch (error) {
        console.error('Import-Fehler:', error);
        alert('Fehler beim Importieren: Ungültige JSON-Datei!');
      }
    };

    reader.readAsText(file);
    event.target.value = ''; // Reset input
  };

  const activeSet = systemSets.find(s => s.id === activeSetId);

  return (
    <div style={{
      background: 'var(--bg-primary)',
      minHeight: 'calc(100vh - 140px)',
      padding: '24px',
    }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ margin: 0, marginBottom: '4px', fontSize: '24px' }}>System Sets</h2>
        <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)' }}>
          Verwalte deine Katalog-Vorlagen (Module, Leitungen, Dimensionen, etc.)
        </p>
      </div>

      {/* Info Box - Was wird gespeichert */}
      <div style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '24px',
        maxWidth: '700px',
      }}>
        <h3 style={{
          margin: '0 0 12px 0',
          fontSize: '14px',
          fontWeight: 600,
          color: 'var(--text-primary)',
        }}>
          Ein System Set speichert folgende Kataloge:
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '8px',
          fontSize: '13px',
          color: 'var(--text-secondary)',
        }}>
          <div>
            <strong style={{ color: 'var(--text-primary)' }}>Moduldatenbank:</strong>
            <div style={{ marginLeft: '12px', marginTop: '4px', lineHeight: '1.6' }}>
              • Module<br/>
              • Modultypen
            </div>
          </div>
          <div>
            <strong style={{ color: 'var(--text-primary)' }}>Einstellungen:</strong>
            <div style={{ marginLeft: '12px', marginTop: '4px', lineHeight: '1.6' }}>
              • Verbindungen<br/>
              • Leitungen<br/>
              • Dimensionen<br/>
              • Formeln<br/>
              • Pumpen<br/>
              • Sole
            </div>
          </div>
        </div>
        <p style={{
          margin: '12px 0 0 0',
          fontSize: '12px',
          color: 'var(--text-secondary)',
          fontStyle: 'italic',
        }}>
          Tipp: Erstelle Sets für verschiedene Projekttypen (z.B. "Einfamilienhaus Standard", "Gewerbe 2024")
        </p>
      </div>

      {/* Import/Export Buttons */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', maxWidth: '700px' }}>
        <button
          onClick={handleExportAllSets}
          disabled={systemSets.length === 0}
          style={{
            flex: 1,
            padding: '12px 16px',
            background: systemSets.length === 0 ? 'var(--bg-tertiary)' : 'var(--success)',
            color: systemSets.length === 0 ? 'var(--text-secondary)' : 'white',
            border: 'none',
            borderRadius: '4px',
            fontWeight: 600,
            cursor: systemSets.length === 0 ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit',
            fontSize: '14px',
            opacity: systemSets.length === 0 ? 0.5 : 1,
          }}
        >
          Alle Sets exportieren
        </button>
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
          Sets importieren
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
        <div
          style={{
            background: 'var(--bg-secondary)',
            border: '2px solid var(--accent)',
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '24px',
            maxWidth: '700px',
          }}
        >
          <div style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: 600, marginBottom: '8px' }}>
            AKTIVES SET
          </div>
          <div style={{ fontSize: '20px', fontWeight: 600, marginBottom: '4px' }}>
            {activeSet.name}
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Erstellt am {new Date(activeSet.createdAt).toLocaleDateString('de-DE')}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '12px' }}>
            {activeSet.modules?.length || 0} Module • {activeSet.leitungskatalog?.length || 0} Leitungen • {activeSet.dimensionskatalog?.length || 0} Dimensionen
          </div>
        </div>
      )}

      {/* Create New Set */}
      <div
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '24px',
          maxWidth: '700px',
        }}
      >
        <h3 style={{ margin: 0, marginBottom: '16px', fontSize: '16px' }}>
          Neues System Set erstellen
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
            + Aktuellen Stand als neues Set speichern
          </button>
        ) : (
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              value={newSetName}
              onChange={(e) => setNewSetName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreate();
                if (e.key === 'Escape') {
                  setIsCreating(false);
                  setNewSetName('');
                }
              }}
              placeholder="z.B. Wien System Set"
              autoFocus
              style={{
                flex: 1,
                padding: '12px',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                color: 'var(--text-primary)',
                fontFamily: 'inherit',
                fontSize: '14px',
              }}
            />
            <button
              onClick={handleCreate}
              style={{
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
              }}
              style={{
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
        )}
      </div>

      {/* Available Sets */}
      <div style={{ maxWidth: '700px' }}>
        <h3 style={{ margin: 0, marginBottom: '16px', fontSize: '16px' }}>
          Verfügbare System Sets ({systemSets.length})
        </h3>
        {systemSets.length === 0 ? (
          <div
            style={{
              padding: '40px',
              textAlign: 'center',
              color: 'var(--text-secondary)',
              fontSize: '14px',
              background: 'var(--bg-secondary)',
              borderRadius: '8px',
            }}
          >
            Noch keine System Sets vorhanden
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {systemSets.map((set) => (
              <div
                key={set.id}
                style={{
                  background: set.id === activeSetId ? 'var(--bg-tertiary)' : 'var(--bg-secondary)',
                  border: `1px solid ${set.id === activeSetId ? 'var(--accent)' : 'var(--border)'}`,
                  borderRadius: '8px',
                  padding: '16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <span style={{ fontSize: '16px', fontWeight: 600 }}>
                      {set.name}
                    </span>
                    {set.id === activeSetId && (
                      <span
                        style={{
                          fontSize: '10px',
                          padding: '3px 10px',
                          background: 'var(--accent)',
                          color: 'var(--bg-primary)',
                          borderRadius: '12px',
                          fontWeight: 600,
                        }}
                      >
                        AKTIV
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    {new Date(set.createdAt).toLocaleDateString('de-DE')} • {set.modules?.length || 0} Module • {set.leitungskatalog?.length || 0} Leitungen
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {set.id !== activeSetId && (
                    <button
                      onClick={() => handleSwitch(set.id)}
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
                    onClick={() => handleExportSet(set)}
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
                    Export
                  </button>
                  <button
                    onClick={() => handleDelete(set.id, set.name)}
                    disabled={set.id === activeSetId}
                    style={{
                      padding: '8px 16px',
                      background: set.id === activeSetId ? 'var(--bg-tertiary)' : 'var(--error)',
                      color: set.id === activeSetId ? 'var(--text-secondary)' : 'white',
                      border: 'none',
                      borderRadius: '4px',
                      fontWeight: 600,
                      cursor: set.id === activeSetId ? 'not-allowed' : 'pointer',
                      fontFamily: 'inherit',
                      fontSize: '13px',
                      opacity: set.id === activeSetId ? 0.5 : 1,
                    }}
                  >
                    Löschen
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
