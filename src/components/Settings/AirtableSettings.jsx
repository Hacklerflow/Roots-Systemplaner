import { useState, useEffect } from 'react';

export default function AirtableSettings({ onClose }) {
  const [settings, setSettings] = useState({
    personalAccessToken: '',
    baseId: '',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

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
      });
      setTestResult(null);
    }
  };

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      // Teste alle 3 Tabellen
      const tables = ['Projekte', 'Komponenten', 'Leitungen'];
      const results = [];

      for (const table of tables) {
        const response = await fetch(
          `https://api.airtable.com/v0/${settings.baseId}/${encodeURIComponent(table)}?maxRecords=1`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${settings.personalAccessToken}`,
            },
          }
        );

        if (!response.ok) {
          const error = await response.json();
          results.push({ table, success: false, error });
        } else {
          results.push({ table, success: true });
        }
      }

      // Prüfe ob alle erfolgreich waren
      const allSuccess = results.every(r => r.success);
      const failedTables = results.filter(r => !r.success);

      if (allSuccess) {
        // Automatisch speichern bei erfolgreichem Test
        localStorage.setItem('airtable_settings', JSON.stringify(settings));
        setTestResult({
          success: true,
          message: '✅ Alle Tabellen gefunden!\n\n✓ Projekte\n✓ Komponenten\n✓ Leitungen\n\nDie Einstellungen wurden automatisch gespeichert.'
        });
      } else {
        let errorMessage = '❌ Folgende Tabellen fehlen:\n\n';
        failedTables.forEach(f => {
          errorMessage += `• ${f.table}\n`;
        });
        errorMessage += '\nBitte erstelle diese Tabellen in deiner Airtable-Base!';

        setTestResult({ success: false, message: errorMessage });
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: `❌ Netzwerkfehler:\n\n${error.message}`
      });
    } finally {
      setIsTesting(false);
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
          <ol style={{ margin: '8px 0 0 0', paddingLeft: '20px', lineHeight: '1.6' }}>
            <li style={{ marginBottom: '8px' }}>
              <strong>Personal Access Token:</strong><br/>
              • Airtable.com → Account → Developer Hub → Create Token<br/>
              • <strong>WICHTIG:</strong> Scopes wählen:<br/>
              &nbsp;&nbsp;✓ <code>data.records:read</code><br/>
              &nbsp;&nbsp;✓ <code>data.records:write</code><br/>
              • <strong>WICHTIG:</strong> Deine Base auswählen!
            </li>
            <li style={{ marginBottom: '8px' }}>
              <strong>Base ID:</strong><br/>
              Öffne deine Base → URL: <code>https://airtable.com/<strong>appXXXXXXXXXXXXXX</strong>/...</code>
            </li>
            <li>
              <strong>3 Tabellen erstellen:</strong><br/>
              • "Projekte"<br/>
              • "Komponenten"<br/>
              • "Leitungen"<br/>
              (Exakte Namen verwenden!)
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

          {/* Info: 3 Tabellen werden verwendet */}
          <div
            style={{
              background: 'rgba(46, 160, 67, 0.1)',
              border: '1px solid var(--success)',
              borderRadius: '4px',
              padding: '12px',
              fontSize: '12px',
            }}
          >
            <strong>ℹ️ Automatische Tabellennamen:</strong><br/>
            Die App sendet an 3 feste Tabellen in deiner Base:<br/>
            • <code>Projekte</code><br/>
            • <code>Komponenten</code><br/>
            • <code>Leitungen</code>
          </div>
        </div>

        {/* Test Result */}
        {testResult && (
          <div
            style={{
              padding: '12px',
              borderRadius: '4px',
              marginBottom: '16px',
              background: testResult.success ? 'rgba(46, 160, 67, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              border: `1px solid ${testResult.success ? 'var(--success)' : 'var(--error)'}`,
              whiteSpace: 'pre-line',
              fontSize: '12px',
              color: 'var(--text-primary)',
            }}
          >
            {testResult.message}
          </div>
        )}

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
          <button
            onClick={handleTest}
            disabled={!settings.personalAccessToken || !settings.baseId || isTesting}
            style={{
              flex: 1,
              padding: '12px',
              background: 'var(--bg-tertiary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border)',
              borderRadius: '4px',
              fontWeight: 600,
              cursor: settings.personalAccessToken && settings.baseId && !isTesting
                ? 'pointer'
                : 'not-allowed',
              fontFamily: 'inherit',
              fontSize: '14px',
              opacity: settings.personalAccessToken && settings.baseId ? 1 : 0.5,
            }}
          >
            {isTesting ? '⏳ Teste alle 3 Tabellen...' : '🔍 Verbindung testen'}
          </button>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={handleSave}
            disabled={!settings.personalAccessToken || !settings.baseId}
            style={{
              flex: 1,
              padding: '12px',
              background: settings.personalAccessToken && settings.baseId
                ? 'var(--accent)'
                : 'var(--bg-tertiary)',
              color: settings.personalAccessToken && settings.baseId
                ? 'var(--bg-primary)'
                : 'var(--text-secondary)',
              border: 'none',
              borderRadius: '4px',
              fontWeight: 600,
              cursor: settings.personalAccessToken && settings.baseId
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
