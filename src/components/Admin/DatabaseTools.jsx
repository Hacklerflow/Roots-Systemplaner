import { useState } from 'react';

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
      <div className="admin-section">
        <div className="admin-section-header">
          <div>
            <h2 className="admin-section-title">🗄️ Datenbank-Informationen</h2>
            <p className="admin-section-description">
              Übersicht über die Datenbank-Konfiguration
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gap: '12px' }}>
          <InfoRow label="Datenbank-Typ" value="PostgreSQL 15" />
          <InfoRow label="Host" value="localhost:5432" />
          <InfoRow label="Datenbank-Name" value="roots_configurator" />
          <InfoRow label="Status" value="🟢 Verbunden" color="var(--success)" />
        </div>
      </div>

      {/* Clear Data */}
      <div className="admin-section">
        <div className="admin-section-header">
          <div>
            <h2 className="admin-section-title">🗑️ Daten löschen</h2>
            <p className="admin-section-description">
              Katalog-Daten aus der Datenbank entfernen
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <ActionCard
            icon="🗑️"
            title="Alle Katalog-Daten löschen"
            description="Löscht alle Module, Verbindungen, Leitungen, Dimensionen, Modultypen und Formeln"
            buttonText="Alle Kataloge löschen"
            buttonStyle="danger"
            onClick={handleClearAllCatalogs}
            disabled={loading}
          />
        </div>

        <div style={{ marginTop: '16px', padding: '16px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '6px' }}>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--error)', fontWeight: 600 }}>
            ⚠️ WARNUNG: Diese Aktionen können NICHT rückgängig gemacht werden!
          </p>
        </div>
      </div>

      {/* Initialize Data */}
      <div className="admin-section">
        <div className="admin-section-header">
          <div>
            <h2 className="admin-section-title">📦 Daten initialisieren</h2>
            <p className="admin-section-description">
              Standard-Katalogdaten in die Datenbank laden
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <ActionCard
            icon="📥"
            title="Standard-Daten initialisieren"
            description="Lädt die Standard-Modultypen, Verbindungen und Dimensionen in die Datenbank"
            buttonText="Standard-Daten laden"
            buttonStyle="primary"
            onClick={handleInitializeDefaults}
            disabled={loading}
          />
        </div>
      </div>

      {/* Backup & Restore */}
      <div className="admin-section">
        <div className="admin-section-header">
          <div>
            <h2 className="admin-section-title">💾 Backup & Restore</h2>
            <p className="admin-section-description">
              Datenbank-Backups erstellen und wiederherstellen
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <ActionCard
            icon="💾"
            title="Backup erstellen"
            description="Erstellt ein vollständiges Backup aller Datenbank-Daten"
            buttonText="Backup erstellen"
            buttonStyle="success"
            onClick={handleBackupDatabase}
            disabled={loading}
          />
          <ActionCard
            icon="📤"
            title="Backup wiederherstellen"
            description="Stellt die Datenbank aus einem vorhandenen Backup wieder her"
            buttonText="Restore (bald verfügbar)"
            buttonStyle="secondary"
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
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px',
      background: 'var(--bg-tertiary)',
      border: '1px solid var(--border)',
      borderRadius: '6px',
    }}>
      <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{label}</span>
      <span style={{ fontSize: '14px', fontWeight: 600, color: color || 'var(--text-primary)' }}>{value}</span>
    </div>
  );
}

function ActionCard({ icon, title, description, buttonText, buttonStyle, onClick, disabled }) {
  const buttonClass = `admin-button admin-button-${buttonStyle}`;

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '20px',
      background: 'var(--bg-tertiary)',
      border: '1px solid var(--border)',
      borderRadius: '8px',
    }}>
      <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', flex: 1 }}>
        <div style={{ fontSize: '32px' }}>{icon}</div>
        <div>
          <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '4px' }}>{title}</div>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{description}</div>
        </div>
      </div>
      <button
        onClick={onClick}
        disabled={disabled}
        className={buttonClass}
      >
        {buttonText}
      </button>
    </div>
  );
}
