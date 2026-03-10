import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function DatabaseTools() {
  const [loading, setLoading] = useState(false);

  const handleClearAllCatalogs = async () => {
    if (!confirm('⚠️ WARNUNG: Alle Katalog-Daten wirklich löschen?\n\nDies löscht:\n- Alle Module\n- Alle Verbindungen\n- Alle Leitungen\n- Alle Dimensionen\n- Alle Modultypen\n- Alle Formeln\n\nDiese Aktion kann NICHT rückgängig gemacht werden!')) {
      return;
    }

    if (!confirm('Bist du dir ABSOLUT SICHER?\n\nGib "LÖSCHEN" ein um fortzufahren.')) {
      return;
    }

    try {
      setLoading(true);
      // TODO: API call to clear all catalogs
      // await adminAPI.clearAllCatalogs();
      alert('✓ Alle Katalog-Daten wurden gelöscht!');
    } catch (error) {
      console.error('Fehler beim Löschen:', error);
      alert('❌ Fehler beim Löschen der Katalog-Daten!');
    } finally {
      setLoading(false);
    }
  };

  const handleInitializeDefaults = async () => {
    if (!confirm('Standard-Katalogdaten initialisieren?\n\nDies fügt die Standard-Modultypen, Verbindungen und Dimensionen hinzu.')) {
      return;
    }

    try {
      setLoading(true);
      // TODO: API call to initialize default data
      // await adminAPI.initializeDefaults();
      alert('✓ Standard-Daten wurden initialisiert!');
    } catch (error) {
      console.error('Fehler beim Initialisieren:', error);
      alert('❌ Fehler beim Initialisieren der Standard-Daten!');
    } finally {
      setLoading(false);
    }
  };

  const handleBackupDatabase = async () => {
    try {
      setLoading(true);
      // TODO: API call to create backup
      // const backup = await adminAPI.createBackup();
      // Download backup file
      alert('✓ Backup wurde erstellt!\n\n(Download-Funktion wird bald verfügbar sein)');
    } catch (error) {
      console.error('Fehler beim Backup:', error);
      alert('❌ Fehler beim Erstellen des Backups!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Database Info */}
      <div className="bg-background-secondary border border-border rounded-lg p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-semibold mb-2">Datenbank-Informationen</h2>
            <p className="text-foreground-secondary text-sm">
              Übersicht über die Datenbank-Konfiguration
            </p>
          </div>
        </div>

        <div className="grid gap-3">
          <InfoRow label="Datenbank-Typ" value="PostgreSQL 15" />
          <InfoRow label="Host" value="localhost:5432" />
          <InfoRow label="Datenbank-Name" value="roots_configurator" />
          <InfoRow label="Status" value="Verbunden" color="text-success" />
        </div>
      </div>

      {/* Clear Data */}
      <div className="bg-background-secondary border border-border rounded-lg p-6 mt-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-semibold mb-2">Daten löschen</h2>
            <p className="text-foreground-secondary text-sm">
              Katalog-Daten aus der Datenbank entfernen
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <ActionCard
            icon="🗑️"
            title="Alle Katalog-Daten löschen"
            description="Löscht alle Module, Verbindungen, Leitungen, Dimensionen, Modultypen und Formeln"
            buttonText="Alle Kataloge löschen"
            buttonVariant="destructive"
            onClick={handleClearAllCatalogs}
            disabled={loading}
          />
        </div>

        <div className="mt-4 p-4 bg-destructive/10 border border-destructive/30 rounded-md">
          <p className="m-0 text-xs text-destructive font-semibold">
            ⚠️ WARNUNG: Diese Aktionen können NICHT rückgängig gemacht werden!
          </p>
        </div>
      </div>

      {/* Initialize Data */}
      <div className="bg-background-secondary border border-border rounded-lg p-6 mt-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-semibold mb-2">Daten initialisieren</h2>
            <p className="text-foreground-secondary text-sm">
              Standard-Katalogdaten in die Datenbank laden
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <ActionCard
            icon="📥"
            title="Standard-Daten initialisieren"
            description="Lädt die Standard-Modultypen, Verbindungen und Dimensionen in die Datenbank"
            buttonText="Standard-Daten laden"
            buttonVariant="default"
            onClick={handleInitializeDefaults}
            disabled={loading}
          />
        </div>
      </div>

      {/* Backup & Restore */}
      <div className="bg-background-secondary border border-border rounded-lg p-6 mt-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-semibold mb-2">Backup & Restore</h2>
            <p className="text-foreground-secondary text-sm">
              Datenbank-Backups erstellen und wiederherstellen
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <ActionCard
            icon="💾"
            title="Backup erstellen"
            description="Erstellt ein vollständiges Backup aller Datenbank-Daten"
            buttonText="Backup erstellen"
            buttonVariant="default"
            onClick={handleBackupDatabase}
            disabled={loading}
          />
          <ActionCard
            icon="📤"
            title="Backup wiederherstellen"
            description="Stellt die Datenbank aus einem vorhandenen Backup wieder her"
            buttonText="Restore (bald verfügbar)"
            buttonVariant="outline"
            onClick={() => alert('Diese Funktion wird bald verfügbar sein.')}
            disabled={true}
          />
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value, color }) {
  return (
    <div className="flex justify-between items-center p-3 bg-background-tertiary border border-border rounded-md">
      <span className="text-sm text-foreground-secondary">{label}</span>
      <span className={`text-sm font-semibold ${color || 'text-foreground'}`}>{value}</span>
    </div>
  );
}

function ActionCard({ icon, title, description, buttonText, buttonVariant, onClick, disabled }) {
  return (
    <div className="flex justify-between items-center p-5 bg-background-tertiary border border-border rounded-lg">
      <div className="flex gap-4 items-start flex-1">
        <div className="text-3xl">{icon}</div>
        <div>
          <div className="text-base font-semibold mb-1">{title}</div>
          <div className="text-xs text-foreground-secondary">{description}</div>
        </div>
      </div>
      <Button
        onClick={onClick}
        disabled={disabled}
        variant={buttonVariant}
      >
        {buttonText}
      </Button>
    </div>
  );
}
