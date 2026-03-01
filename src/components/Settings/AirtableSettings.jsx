import { useState, useEffect } from 'react';

export default function AirtableSettings({ onClose }) {
  const [settings, setSettings] = useState({
    personalAccessToken: '',
    baseId: '',
    tableName: '',
  });

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Lade gespeicherte Einstellungen
    const saved = localStorage.getItem('airtable_settings');
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (e) {
        console.error('Fehler beim Laden der Airtable-Einstellungen:', e);
      }
    }
  }, []);

  const handleSave = () => {
    setIsSaving(true);
    localStorage.setItem('airtable_settings', JSON.stringify(settings));
    setTimeout(() => {
      setIsSaving(false);
      onClose();
    }, 500);
  };

  const handleClear = () => {
    if (confirm('Airtable-Einstellungen wirklich löschen?')) {
      localStorage.removeItem('airtable_settings');
      setSettings({
        personalAccessToken: '',
        baseId: '',
        tableName: '',
      });
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--bg-secondary)',
          border: '2px solid var(--accent)',
          borderRadius: '8px',
          padding: '24px',
          maxWidth: '600px',
          width: '90%',
          maxHeight: '90vh',
          overflow: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ marginTop: 0, marginBottom: '8px', color: 'var(--accent)' }}>
          Airtable-Integration
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '13px' }}>
          Konfiguriere die Verbindung zu deiner Airtable-Base für den Export der Stückliste.
        </p>

        {/* Anleitung */}
        <div
          style={{
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border)',
            borderRadius: '4px',
            padding: '12px',
            marginBottom: '24px',
            fontSize: '12px',
          }}
        >
          <strong>So erhältst du die benötigten Daten:</strong>
          <ol style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
            <li>
              <strong>Personal Access Token:</strong> Airtable.com → Account → Developer Hub → Personal Access Tokens → Create Token
            </li>
            <li>
              <strong>Base ID:</strong> Öffne deine Base → URL: https://airtable.com/<strong>appXXXXXXXXXXXXXX</strong>/...
            </li>
            <li>
              <strong>Table Name:</strong> Der Name deiner Tabelle (z.B. "Stückliste" oder "Quotes")
            </li>
          </ol>
        </div>

        {/* Formular */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
          {/* Personal Access Token */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '13px' }}>
              Personal Access Token *
            </label>
            <input
              type="password"
              value={settings.personalAccessToken}
              onChange={(e) => setSettings({ ...settings, personalAccessToken: e.target.value })}
              placeholder="patXXXXXXXXXXXXXX.XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
              style={{
                width: '100%',
                padding: '10px',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                color: 'var(--text-primary)',
                fontFamily: 'monospace',
                fontSize: '12px',
              }}
            />
          </div>

          {/* Base ID */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '13px' }}>
              Base ID *
            </label>
            <input
              type="text"
              value={settings.baseId}
              onChange={(e) => setSettings({ ...settings, baseId: e.target.value })}
              placeholder="appXXXXXXXXXXXXXX"
              style={{
                width: '100%',
                padding: '10px',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                color: 'var(--text-primary)',
                fontFamily: 'monospace',
                fontSize: '14px',
              }}
            />
          </div>

          {/* Table Name */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '13px' }}>
              Table Name *
            </label>
            <input
              type="text"
              value={settings.tableName}
              onChange={(e) => setSettings({ ...settings, tableName: e.target.value })}
              placeholder="Stückliste"
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

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={handleSave}
            disabled={!settings.personalAccessToken || !settings.baseId || !settings.tableName}
            style={{
              flex: 1,
              padding: '12px',
              background: settings.personalAccessToken && settings.baseId && settings.tableName
                ? 'var(--accent)'
                : 'var(--bg-tertiary)',
              color: settings.personalAccessToken && settings.baseId && settings.tableName
                ? 'var(--bg-primary)'
                : 'var(--text-secondary)',
              border: 'none',
              borderRadius: '4px',
              fontWeight: 600,
              cursor: settings.personalAccessToken && settings.baseId && settings.tableName
                ? 'pointer'
                : 'not-allowed',
              fontFamily: 'inherit',
              fontSize: '14px',
            }}
          >
            {isSaving ? 'Speichern...' : 'Speichern'}
          </button>
          <button
            onClick={handleClear}
            style={{
              padding: '12px 24px',
              background: 'var(--error)',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: '14px',
            }}
          >
            Löschen
          </button>
          <button
            onClick={onClose}
            style={{
              padding: '12px 24px',
              background: 'var(--bg-tertiary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border)',
              borderRadius: '4px',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: '14px',
            }}
          >
            Abbrechen
          </button>
        </div>
      </div>
    </div>
  );
}
