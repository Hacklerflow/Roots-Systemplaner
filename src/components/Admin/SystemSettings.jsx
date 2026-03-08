import { useState, useEffect } from 'react';

export default function SystemSettings() {
  const [settings, setSettings] = useState({
    appName: 'Roots Configurator',
    appVersion: '1.0.0',
    maintenanceMode: false,
    allowRegistration: true,
    requireEmailVerification: false,
  });

  const [saving, setSaving] = useState(false);

  const handleToggle = (key) => {
    setSettings({ ...settings, [key]: !settings[key] });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      // TODO: API call to save settings
      // await adminAPI.updateSettings(settings);
      alert('Einstellungen gespeichert!');
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
      alert('Fehler beim Speichern der Einstellungen!');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {/* General Settings */}
      <div className="admin-section">
        <div className="admin-section-header">
          <div>
            <h2 className="admin-section-title">Allgemeine Einstellungen</h2>
            <p className="admin-section-description">
              Grundlegende System-Konfiguration
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="admin-button admin-button-success"
          >
            {saving ? 'Speichert...' : 'Speichern'}
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <SettingRow
            label="Anwendungsname"
            description="Der Name der Anwendung, wie er in der UI angezeigt wird"
          >
            <input
              type="text"
              value={settings.appName}
              onChange={(e) => setSettings({ ...settings, appName: e.target.value })}
              style={{
                padding: '8px 12px',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                color: 'var(--text-primary)',
                fontFamily: 'inherit',
                fontSize: '14px',
                width: '300px',
              }}
            />
          </SettingRow>

          <SettingRow
            label="Version"
            description="Aktuelle Version der Anwendung"
          >
            <input
              type="text"
              value={settings.appVersion}
              disabled
              style={{
                padding: '8px 12px',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                color: 'var(--text-secondary)',
                fontFamily: 'inherit',
                fontSize: '14px',
                width: '150px',
              }}
            />
          </SettingRow>
        </div>
      </div>

      {/* System Settings */}
      <div className="admin-section">
        <div className="admin-section-header">
          <div>
            <h2 className="admin-section-title">🔧 System-Einstellungen</h2>
            <p className="admin-section-description">
              Erweiterte System-Konfiguration
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <SettingRow
            label="Wartungsmodus"
            description="Wenn aktiviert, können nur Admins auf die Anwendung zugreifen"
          >
            <ToggleSwitch
              checked={settings.maintenanceMode}
              onChange={() => handleToggle('maintenanceMode')}
            />
          </SettingRow>

          <SettingRow
            label="Registrierung erlauben"
            description="Erlaubt neuen Benutzern, sich selbst zu registrieren"
          >
            <ToggleSwitch
              checked={settings.allowRegistration}
              onChange={() => handleToggle('allowRegistration')}
            />
          </SettingRow>

          <SettingRow
            label="E-Mail-Verifizierung erforderlich"
            description="Neue Benutzer müssen ihre E-Mail-Adresse verifizieren"
          >
            <ToggleSwitch
              checked={settings.requireEmailVerification}
              onChange={() => handleToggle('requireEmailVerification')}
            />
          </SettingRow>
        </div>
      </div>

      {/* API & Integration */}
      <div className="admin-section">
        <div className="admin-section-header">
          <div>
            <h2 className="admin-section-title">🔌 API & Integrationen</h2>
            <p className="admin-section-description">
              Externe Dienste und API-Konfiguration
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <SettingRow
            label="API-Basis-URL"
            description="Die Basis-URL für das Backend-API"
          >
            <input
              type="text"
              value="http://localhost:3001"
              disabled
              style={{
                padding: '8px 12px',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                color: 'var(--text-secondary)',
                fontFamily: 'monospace',
                fontSize: '13px',
                width: '300px',
              }}
            />
          </SettingRow>

          <div style={{ padding: '16px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: '6px' }}>
            <p style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600 }}>
              Airtable Integration
            </p>
            <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
              Airtable API-Einstellungen können in den Projekt-Einstellungen konfiguriert werden.
            </p>
            <button
              onClick={() => alert('Airtable-Einstellungen sind projekt-spezifisch und können in den Projekt-Einstellungen konfiguriert werden.')}
              className="admin-button admin-button-secondary"
              style={{ fontSize: '13px' }}
            >
              Zu Projekt-Einstellungen
            </button>
          </div>
        </div>
      </div>

      {/* About */}
      <div className="admin-section">
        <div className="admin-section-header">
          <div>
            <h2 className="admin-section-title">ℹ️ Über das System</h2>
            <p className="admin-section-description">
              System-Informationen und Credits
            </p>
          </div>
        </div>

        <div style={{ padding: '20px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: '8px' }}>
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>
              Roots Configurator
            </div>
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Version {settings.appVersion}
            </div>
          </div>

          <div style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            <p style={{ margin: '0 0 12px 0' }}>
              Professionelles Planungstool für Roots Energy Wärmepumpensysteme mit Stücklisten-Generierung.
            </p>
            <p style={{ margin: 0 }}>
              © 2024 Roots Energy. Alle Rechte vorbehalten.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingRow({ label, description, children }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '16px',
      background: 'var(--bg-tertiary)',
      border: '1px solid var(--border)',
      borderRadius: '6px',
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '4px' }}>{label}</div>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{description}</div>
      </div>
      <div>{children}</div>
    </div>
  );
}

function ToggleSwitch({ checked, onChange }) {
  return (
    <button
      onClick={onChange}
      style={{
        width: '48px',
        height: '26px',
        background: checked ? 'var(--accent)' : 'var(--bg-primary)',
        border: `2px solid ${checked ? 'var(--accent)' : 'var(--border)'}`,
        borderRadius: '13px',
        position: 'relative',
        cursor: 'pointer',
        transition: 'all 0.2s',
      }}
    >
      <div style={{
        width: '18px',
        height: '18px',
        background: 'white',
        borderRadius: '50%',
        position: 'absolute',
        top: '2px',
        left: checked ? '24px' : '2px',
        transition: 'all 0.2s',
      }} />
    </button>
  );
}
