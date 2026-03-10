import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-background-secondary border-2 border-accent max-w-[600px] max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="text-accent mb-2">Airtable-Integration</DialogTitle>
          <p className="text-foreground-secondary text-[13px]">
            Konfiguriere die Verbindung zu deiner Airtable-Base für den Export der Stückliste.
          </p>
        </DialogHeader>

        {/* Anleitung */}
        <div className="bg-background-tertiary border border-border rounded p-3 text-xs leading-relaxed">
          <strong>So erhältst du die benötigten Daten:</strong>
          <ol className="mt-2 pl-5 space-y-2">
            <li>
              <strong>Personal Access Token:</strong><br/>
              • Airtable.com → Account → Developer Hub → Create Token<br/>
              • <strong>WICHTIG:</strong> Scopes wählen:<br/>
              &nbsp;&nbsp;✓ <code className="bg-background px-1 py-0.5 rounded">data.records:read</code><br/>
              &nbsp;&nbsp;✓ <code className="bg-background px-1 py-0.5 rounded">data.records:write</code><br/>
              • <strong>WICHTIG:</strong> Deine Base auswählen!
            </li>
            <li>
              <strong>Base ID:</strong><br/>
              Öffne deine Base → URL: <code className="bg-background px-1 py-0.5 rounded">https://airtable.com/<strong>appXXXXXXXXXXXXXX</strong>/...</code>
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
        <div className="space-y-4">
          {/* Personal Access Token */}
          <div>
            <label className="block mb-2 font-semibold text-[13px]">
              Personal Access Token *
            </label>
            <Input
              type="password"
              value={settings.personalAccessToken}
              onChange={(e) => setSettings({ ...settings, personalAccessToken: e.target.value })}
              placeholder="patXXXXXXXXXXXXXX.XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
              className="bg-background-tertiary border-border font-mono text-xs"
            />
          </div>

          {/* Base ID */}
          <div>
            <label className="block mb-2 font-semibold text-[13px]">
              Base ID *
            </label>
            <Input
              type="text"
              value={settings.baseId}
              onChange={(e) => setSettings({ ...settings, baseId: e.target.value })}
              placeholder="appXXXXXXXXXXXXXX"
              className="bg-background-tertiary border-border font-mono"
            />
          </div>

          {/* Info: 3 Tabellen werden verwendet */}
          <div className="bg-success/10 border border-success rounded p-3 text-xs">
            <strong>ℹ️ Automatische Tabellennamen:</strong><br/>
            Die App sendet an 3 feste Tabellen in deiner Base:<br/>
            • <code className="bg-background px-1 py-0.5 rounded">Projekte</code><br/>
            • <code className="bg-background px-1 py-0.5 rounded">Komponenten</code><br/>
            • <code className="bg-background px-1 py-0.5 rounded">Leitungen</code>
          </div>
        </div>

        {/* Test Result */}
        {testResult && (
          <div className={`px-3 py-3 rounded text-xs whitespace-pre-line ${
            testResult.success
              ? 'bg-success/10 border border-success'
              : 'bg-destructive/10 border border-destructive'
          }`}>
            {testResult.message}
          </div>
        )}

        {/* Buttons */}
        <div className="space-y-3">
          <Button
            onClick={handleTest}
            disabled={!settings.personalAccessToken || !settings.baseId || isTesting}
            variant="secondary"
            className="w-full bg-background-tertiary hover:bg-border"
          >
            {isTesting ? '⏳ Teste alle 3 Tabellen...' : '🔍 Verbindung testen'}
          </Button>

          <div className="flex gap-3">
            <Button
              onClick={handleSave}
              disabled={!settings.personalAccessToken || !settings.baseId}
              className="flex-1 bg-accent hover:bg-accent/90 text-background disabled:bg-background-tertiary disabled:text-foreground-secondary"
            >
              {isSaving ? 'Speichern...' : 'Speichern'}
            </Button>
            <Button
              onClick={handleClear}
              variant="destructive"
              className="bg-destructive hover:bg-destructive/90"
            >
              Löschen
            </Button>
            <Button
              onClick={onClose}
              variant="secondary"
              className="bg-background-tertiary hover:bg-border"
            >
              Abbrechen
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
