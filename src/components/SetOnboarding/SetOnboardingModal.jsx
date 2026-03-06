import { useState, useEffect } from 'react';
import { setsAPI } from '../../api/client';

export default function SetOnboardingModal({ isOpen, onComplete }) {
  const [sets, setSets] = useState([]);
  const [selectedSetId, setSelectedSetId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadSets();
    }
  }, [isOpen]);

  const loadSets = async () => {
    try {
      const response = await setsAPI.getAll();
      setSets(response.sets);
      // Pre-select BASIC set if available
      const basicSet = response.sets.find(s => s.is_default);
      if (basicSet) {
        setSelectedSetId(basicSet.id);
      }
    } catch (err) {
      console.error('Load sets error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async () => {
    if (!selectedSetId) {
      alert('Bitte wähle ein Set aus!');
      return;
    }

    try {
      await setsAPI.activate(selectedSetId);
      onComplete();
    } catch (err) {
      console.error('Activate set error:', err);
      alert('Fehler beim Aktivieren des Sets');
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
    }}>
      <div style={{
        background: 'var(--bg-secondary)',
        borderRadius: '12px',
        padding: '32px',
        maxWidth: '600px',
        width: '90%',
        maxHeight: '80vh',
        overflow: 'auto',
      }}>
        <h2 style={{ margin: 0, marginBottom: '12px', fontSize: '24px' }}>
          Willkommen im Roots Configurator!
        </h2>
        <p style={{ margin: 0, marginBottom: '24px', color: 'var(--text-secondary)', fontSize: '14px' }}>
          Um mit der Konfiguration zu starten, wähle bitte ein Katalog-Set aus.
          Das BASIC Set enthält alle Standard-Module und -Verbindungen.
        </p>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Lade Sets...
          </div>
        ) : (
          <>
            <div style={{ marginBottom: '24px' }}>
              {sets.map((set) => (
                <div
                  key={set.id}
                  onClick={() => setSelectedSetId(set.id)}
                  style={{
                    background: selectedSetId === set.id ? 'var(--bg-tertiary)' : 'transparent',
                    border: `2px solid ${selectedSetId === set.id ? 'var(--accent)' : 'var(--border)'}`,
                    borderRadius: '8px',
                    padding: '16px',
                    marginBottom: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '16px', fontWeight: 600 }}>
                      {set.name}
                    </span>
                    {set.is_default && (
                      <span style={{
                        fontSize: '10px',
                        padding: '3px 10px',
                        background: 'var(--success)',
                        color: 'white',
                        borderRadius: '12px',
                        fontWeight: 600,
                      }}>
                        EMPFOHLEN
                      </span>
                    )}
                  </div>
                  {set.description && (
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                      {set.description}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={handleActivate}
              disabled={!selectedSetId}
              style={{
                width: '100%',
                padding: '14px',
                background: selectedSetId ? 'var(--accent)' : 'var(--bg-tertiary)',
                color: selectedSetId ? 'var(--bg-primary)' : 'var(--text-secondary)',
                border: 'none',
                borderRadius: '4px',
                fontWeight: 600,
                cursor: selectedSetId ? 'pointer' : 'not-allowed',
                fontFamily: 'inherit',
                fontSize: '16px',
                opacity: selectedSetId ? 1 : 0.5,
              }}
            >
              Set aktivieren und starten
            </button>
          </>
        )}
      </div>
    </div>
  );
}
