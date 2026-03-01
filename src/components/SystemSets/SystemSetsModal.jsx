import { useState } from 'react';

export default function SystemSetsModal({
  isOpen,
  onClose,
  systemSets,
  activeSetId,
  onCreateSet,
  onSwitchSet,
  onDeleteSet,
}) {
  const [newSetName, setNewSetName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  if (!isOpen) return null;

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
    if (setId === activeSetId) {
      onClose();
      return;
    }

    if (confirm('Möchtest du wirklich das System Set wechseln?\n\nAlle aktuellen Kataloge (Module, Leitungen, etc.) werden durch das ausgewählte Set ersetzt!')) {
      onSwitchSet(setId);
      onClose();
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

  const activeSet = systemSets.find(s => s.id === activeSetId);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--bg-primary)',
          border: '2px solid var(--accent)',
          borderRadius: '12px',
          maxWidth: '700px',
          width: '90%',
          maxHeight: '80vh',
          overflow: 'auto',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '24px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <h2 style={{ margin: 0, marginBottom: '4px' }}>System Sets</h2>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>
              Verwalte deine Katalog-Vorlagen (Module, Leitungen, Dimensionen, etc.)
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: '8px 12px',
              background: 'transparent',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border)',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '18px',
              fontFamily: 'inherit',
            }}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px' }}>
          {/* Active Set Display */}
          {activeSet && (
            <div
              style={{
                background: 'var(--bg-secondary)',
                border: '2px solid var(--accent)',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '24px',
              }}
            >
              <div style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: 600, marginBottom: '8px' }}>
                AKTIVES SET
              </div>
              <div style={{ fontSize: '18px', fontWeight: 600, marginBottom: '4px' }}>
                {activeSet.name}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Erstellt am {new Date(activeSet.createdAt).toLocaleDateString('de-DE')}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '8px' }}>
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
              padding: '16px',
              marginBottom: '24px',
            }}
          >
            <h3 style={{ margin: 0, marginBottom: '12px', fontSize: '14px' }}>
              Neues System Set erstellen
            </h3>
            {!isCreating ? (
              <button
                onClick={() => setIsCreating(true)}
                style={{
                  width: '100%',
                  padding: '10px',
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
                    padding: '10px',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    color: 'var(--text-primary)',
                    fontFamily: 'inherit',
                    fontSize: '13px',
                  }}
                />
                <button
                  onClick={handleCreate}
                  style={{
                    padding: '10px 16px',
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
                  Speichern
                </button>
                <button
                  onClick={() => {
                    setIsCreating(false);
                    setNewSetName('');
                  }}
                  style={{
                    padding: '10px 16px',
                    background: 'var(--bg-tertiary)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    fontSize: '13px',
                  }}
                >
                  Abbrechen
                </button>
              </div>
            )}
          </div>

          {/* Available Sets */}
          <div>
            <h3 style={{ margin: 0, marginBottom: '12px', fontSize: '14px' }}>
              Verfügbare System Sets ({systemSets.length})
            </h3>
            {systemSets.length === 0 ? (
              <div
                style={{
                  padding: '24px',
                  textAlign: 'center',
                  color: 'var(--text-secondary)',
                  fontSize: '13px',
                }}
              >
                Noch keine System Sets vorhanden
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {systemSets.map((set) => (
                  <div
                    key={set.id}
                    style={{
                      background: set.id === activeSetId ? 'var(--bg-tertiary)' : 'var(--bg-secondary)',
                      border: `1px solid ${set.id === activeSetId ? 'var(--accent)' : 'var(--border)'}`,
                      borderRadius: '6px',
                      padding: '12px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ fontSize: '14px', fontWeight: 600 }}>
                          {set.name}
                        </span>
                        {set.id === activeSetId && (
                          <span
                            style={{
                              fontSize: '10px',
                              padding: '2px 8px',
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
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                        {new Date(set.createdAt).toLocaleDateString('de-DE')} • {set.modules?.length || 0} Module • {set.leitungskatalog?.length || 0} Leitungen
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {set.id !== activeSetId && (
                        <button
                          onClick={() => handleSwitch(set.id)}
                          style={{
                            padding: '6px 12px',
                            background: 'var(--accent)',
                            color: 'var(--bg-primary)',
                            border: 'none',
                            borderRadius: '4px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            fontFamily: 'inherit',
                            fontSize: '12px',
                          }}
                        >
                          Aktivieren
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(set.id, set.name)}
                        disabled={set.id === activeSetId}
                        style={{
                          padding: '6px 12px',
                          background: set.id === activeSetId ? 'var(--bg-tertiary)' : 'var(--error)',
                          color: set.id === activeSetId ? 'var(--text-secondary)' : 'white',
                          border: 'none',
                          borderRadius: '4px',
                          fontWeight: 600,
                          cursor: set.id === activeSetId ? 'not-allowed' : 'pointer',
                          fontFamily: 'inherit',
                          fontSize: '12px',
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
      </div>
    </div>
  );
}
