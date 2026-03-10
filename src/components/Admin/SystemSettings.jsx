import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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
      <div className="bg-background-secondary border border-border rounded-lg p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-semibold mb-2">Allgemeine Einstellungen</h2>
            <p className="text-foreground-secondary text-sm">
              Grundlegende System-Konfiguration
            </p>
          </div>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-success hover:bg-success/90"
          >
            {saving ? 'Speichert...' : 'Speichern'}
          </Button>
        </div>

        <div className="flex flex-col gap-4">
          <SettingRow
            label="Anwendungsname"
            description="Der Name der Anwendung, wie er in der UI angezeigt wird"
          >
            <Input
              type="text"
              value={settings.appName}
              onChange={(e) => setSettings({ ...settings, appName: e.target.value })}
              className="bg-background-tertiary border-border w-[300px]"
            />
          </SettingRow>

          <SettingRow
            label="Version"
            description="Aktuelle Version der Anwendung"
          >
            <Input
              type="text"
              value={settings.appVersion}
              disabled
              className="bg-background-tertiary border-border w-[150px] text-foreground-secondary"
            />
          </SettingRow>
        </div>
      </div>

      {/* System Settings */}
      <div className="bg-background-secondary border border-border rounded-lg p-6 mt-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-semibold mb-2">System-Einstellungen</h2>
            <p className="text-foreground-secondary text-sm">
              Erweiterte System-Konfiguration
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
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
      <div className="bg-background-secondary border border-border rounded-lg p-6 mt-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-semibold mb-2">API & Integrationen</h2>
            <p className="text-foreground-secondary text-sm">
              Externe Dienste und API-Konfiguration
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <SettingRow
            label="API-Basis-URL"
            description="Die Basis-URL für das Backend-API"
          >
            <Input
              type="text"
              value="http://localhost:3001"
              disabled
              className="bg-background-tertiary border-border w-[300px] text-foreground-secondary font-mono text-xs"
            />
          </SettingRow>

          <div className="p-4 bg-background-tertiary border border-border rounded-md">
            <p className="mb-3 text-sm font-semibold">
              Airtable Integration
            </p>
            <p className="mb-4 text-xs text-foreground-secondary">
              Airtable API-Einstellungen können in den Projekt-Einstellungen konfiguriert werden.
            </p>
            <Button
              onClick={() => alert('Airtable-Einstellungen sind projekt-spezifisch und können in den Projekt-Einstellungen konfiguriert werden.')}
              variant="outline"
              size="sm"
            >
              Zu Projekt-Einstellungen
            </Button>
          </div>
        </div>
      </div>

      {/* About */}
      <div className="bg-background-secondary border border-border rounded-lg p-6 mt-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-semibold mb-2">Über das System</h2>
            <p className="text-foreground-secondary text-sm">
              System-Informationen und Credits
            </p>
          </div>
        </div>

        <div className="p-5 bg-background-tertiary border border-border rounded-lg">
          <div className="mb-4">
            <div className="text-2xl font-bold mb-2">
              Roots Configurator
            </div>
            <div className="text-sm text-foreground-secondary mb-4">
              Version {settings.appVersion}
            </div>
          </div>

          <div className="text-sm text-foreground-secondary leading-relaxed">
            <p className="mb-3">
              Professionelles Planungstool für Roots Energy Wärmepumpensysteme mit Stücklisten-Generierung.
            </p>
            <p className="m-0">
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
    <div className="flex justify-between items-center p-4 bg-background-tertiary border border-border rounded-md">
      <div className="flex-1">
        <div className="text-base font-semibold mb-1">{label}</div>
        <div className="text-xs text-foreground-secondary">{description}</div>
      </div>
      <div>{children}</div>
    </div>
  );
}

function ToggleSwitch({ checked, onChange }) {
  return (
    <button
      onClick={onChange}
      className={`w-12 h-[26px] rounded-full border-2 relative transition-all ${
        checked
          ? 'bg-accent border-accent'
          : 'bg-background border-border'
      }`}
    >
      <div className={`w-[18px] h-[18px] bg-white rounded-full absolute top-[2px] transition-all ${
        checked ? 'left-[22px]' : 'left-[2px]'
      }`} />
    </button>
  );
}
