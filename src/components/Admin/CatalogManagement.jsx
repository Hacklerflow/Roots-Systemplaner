import { useState, useEffect } from 'react';
import { catalogsAPI, adminAPI } from '../../api/client';

export default function CatalogManagement() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [defaultSetInfo, setDefaultSetInfo] = useState(null);
  const [loadingDefault, setLoadingDefault] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    loadStats();
    loadDefaultSetInfo();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const [moduleTypes, modules, connections, pipes, dimensions, formulas, pumps] = await Promise.all([
        catalogsAPI.getModuleTypes(),
        catalogsAPI.getModules(),
        catalogsAPI.getConnections(),
        catalogsAPI.getPipes(),
        catalogsAPI.getDimensions(),
        catalogsAPI.getFormulas(),
        catalogsAPI.getPumps(),
      ]);

      setStats({
        moduleTypes: moduleTypes.moduleTypes?.length || 0,
        modules: modules.modules?.length || 0,
        connections: connections.connections?.length || 0,
        pipes: pipes.pipes?.length || 0,
        dimensions: dimensions.dimensions?.length || 0,
        formulas: formulas.formulas?.length || 0,
        pumps: pumps.pumps?.length || 0,
      });
    } catch (error) {
      console.error('Fehler beim Laden der Statistiken:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDefaultSetInfo = async () => {
    try {
      const data = await adminAPI.getDefaultCatalog();
      setDefaultSetInfo(data);
    } catch (error) {
      console.error('Fehler beim Laden der Standard-Set-Info:', error);
    }
  };

  const handleSaveAsDefault = async () => {
    if (!confirm('Möchtest du die aktuellen Kataloge als Standard-Set speichern? Dies überschreibt das vorherige Standard-Set.')) {
      return;
    }

    try {
      setLoadingDefault(true);
      await adminAPI.saveCurrentAsDefault();
      setMessage({ type: 'success', text: '✅ Aktueller Katalog wurde als Standard-Set gespeichert!' });
      loadDefaultSetInfo(); // Reload info
      setTimeout(() => setMessage(null), 5000);
    } catch (error) {
      console.error('Fehler beim Speichern des Standard-Sets:', error);
      setMessage({ type: 'error', text: '❌ Fehler beim Speichern des Standard-Sets: ' + error.message });
      setTimeout(() => setMessage(null), 5000);
    } finally {
      setLoadingDefault(false);
    }
  };

  const handleLoadDefault = async () => {
    if (!confirm('Möchtest du das Standard-Set laden? Dies überschreibt alle aktuellen Kataloge.')) {
      return;
    }

    try {
      setLoadingDefault(true);
      await adminAPI.loadDefaultCatalog();
      setMessage({ type: 'success', text: '✅ Standard-Set wurde in die Kataloge geladen!' });
      loadStats(); // Reload stats to show new data
      setTimeout(() => setMessage(null), 5000);
    } catch (error) {
      console.error('Fehler beim Laden des Standard-Sets:', error);
      setMessage({ type: 'error', text: '❌ Fehler beim Laden des Standard-Sets: ' + error.message });
      setTimeout(() => setMessage(null), 5000);
    } finally {
      setLoadingDefault(false);
    }
  };

  if (loading) {
    return <div className="admin-section">Lade Katalog-Statistiken...</div>;
  }

  return (
    <div>
      {/* Message Display */}
      {message && (
        <div style={{
          padding: '12px 16px',
          marginBottom: '16px',
          borderRadius: '6px',
          background: message.type === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          border: `1px solid ${message.type === 'success' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
          color: message.type === 'success' ? '#22c55e' : '#ef4444',
        }}>
          {message.text}
        </div>
      )}

      <div className="admin-section">
        <div className="admin-section-header">
          <div>
            <h2 className="admin-section-title">📦 Katalog-Übersicht</h2>
            <p className="admin-section-description">
              Verwaltung aller Katalog-Daten (Module, Verbindungen, Leitungen, etc.)
            </p>
          </div>
          <button onClick={loadStats} className="admin-button admin-button-secondary">
            🔄 Aktualisieren
          </button>
        </div>

        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
            <CatalogCard
              title="Modultypen"
              count={stats.moduleTypes}
              icon="🏷️"
              description="Kategorien für Module"
            />
            <CatalogCard
              title="Module"
              count={stats.modules}
              icon="🔧"
              description="Verfügbare Module"
            />
            <CatalogCard
              title="Verbindungen"
              count={stats.connections}
              icon="🔌"
              description="Verbindungsarten"
            />
            <CatalogCard
              title="Leitungen"
              count={stats.pipes}
              icon="🔗"
              description="Leitungskatalog"
            />
            <CatalogCard
              title="Dimensionen"
              count={stats.dimensions}
              icon="📏"
              description="Verfügbare Dimensionen"
            />
            <CatalogCard
              title="Formeln"
              count={stats.formulas}
              icon="🧮"
              description="Berechnungsformeln"
            />
            <CatalogCard
              title="Pumpen"
              count={stats.pumps}
              icon="⚙️"
              description="Pumpen-Katalog"
            />
          </div>
        )}
      </div>

      {/* Default Catalog Set Management */}
      <div className="admin-section">
        <div className="admin-section-header">
          <div>
            <h2 className="admin-section-title">⭐ Standard-Set</h2>
            <p className="admin-section-description">
              Definiere ein Standard-Set, das für alle Benutzer geladen wird
            </p>
          </div>
        </div>

        {defaultSetInfo && (
          <div style={{ marginBottom: '20px' }}>
            <div style={{
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '20px',
            }}>
              <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                <strong>Aktuelles Standard-Set:</strong>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px', fontSize: '13px' }}>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Modultypen:</span>{' '}
                  <strong style={{ color: 'var(--accent)' }}>{defaultSetInfo.counts?.moduleTypes || 0}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Module:</span>{' '}
                  <strong style={{ color: 'var(--accent)' }}>{defaultSetInfo.counts?.modules || 0}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Verbindungen:</span>{' '}
                  <strong style={{ color: 'var(--accent)' }}>{defaultSetInfo.counts?.connections || 0}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Leitungen:</span>{' '}
                  <strong style={{ color: 'var(--accent)' }}>{defaultSetInfo.counts?.pipes || 0}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Dimensionen:</span>{' '}
                  <strong style={{ color: 'var(--accent)' }}>{defaultSetInfo.counts?.dimensions || 0}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Formeln:</span>{' '}
                  <strong style={{ color: 'var(--accent)' }}>{defaultSetInfo.counts?.formulas || 0}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Pumpen:</span>{' '}
                  <strong style={{ color: 'var(--accent)' }}>{defaultSetInfo.counts?.pumps || 0}</strong>
                </div>
              </div>
              {defaultSetInfo.lastUpdated && (
                <div style={{ marginTop: '12px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Zuletzt aktualisiert: {new Date(defaultSetInfo.lastUpdated).toLocaleString('de-DE')}
                </div>
              )}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={handleSaveAsDefault}
            disabled={loadingDefault}
            className="admin-button admin-button-primary"
            style={{ opacity: loadingDefault ? 0.6 : 1 }}
          >
            💾 Aktuellen Katalog als Standard speichern
          </button>
          <button
            onClick={handleLoadDefault}
            disabled={loadingDefault}
            className="admin-button admin-button-secondary"
            style={{ opacity: loadingDefault ? 0.6 : 1 }}
          >
            📥 Standard-Set in Kataloge laden
          </button>
        </div>

        <div style={{ marginTop: '16px', padding: '16px', background: 'var(--bg-tertiary)', borderRadius: '6px', border: '1px solid var(--border)' }}>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>
            💡 <strong>Hinweis:</strong> Das Standard-Set wird für alle Benutzer geladen, wenn ihre Kataloge leer sind.
            Du kannst hier die aktuellen Kataloge als Standard definieren oder das Standard-Set in die aktuellen Kataloge laden.
          </p>
        </div>
      </div>

      <div className="admin-section">
        <div className="admin-section-header">
          <div>
            <h2 className="admin-section-title">⚙️ Katalog-Verwaltung</h2>
            <p className="admin-section-description">
              Diese Kataloge können in den Einstellungen des Configurators verwaltet werden
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <ManagementLink
            title="Modultypen verwalten"
            description="Neue Modultypen hinzufügen oder bestehende bearbeiten"
            path="/configurator/*/settings/modultypen"
          />
          <ManagementLink
            title="Module verwalten"
            description="Module hinzufügen, bearbeiten oder löschen"
            path="/configurator/*/settings/module"
          />
          <ManagementLink
            title="Verbindungen verwalten"
            description="Verbindungsarten definieren und bearbeiten"
            path="/configurator/*/settings/verbindungen"
          />
          <ManagementLink
            title="Leitungen verwalten"
            description="Leitungskatalog pflegen"
            path="/configurator/*/settings/leitungen"
          />
          <ManagementLink
            title="Dimensionen verwalten"
            description="Verfügbare Dimensionen definieren"
            path="/configurator/*/settings/dimensionen"
          />
          <ManagementLink
            title="Formeln verwalten"
            description="Berechnungsformeln erstellen und bearbeiten"
            path="/configurator/*/settings/formeln"
          />
        </div>

        <div style={{ marginTop: '24px', padding: '16px', background: 'var(--bg-tertiary)', borderRadius: '6px', border: '1px solid var(--border)' }}>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>
            💡 <strong>Hinweis:</strong> Die Katalog-Verwaltung erfolgt über die Einstellungen im Configurator.
            Öffne ein beliebiges Projekt und navigiere zu den Einstellungen, um Kataloge zu bearbeiten.
          </p>
        </div>
      </div>
    </div>
  );
}

function CatalogCard({ title, count, icon, description }) {
  return (
    <div style={{
      background: 'var(--bg-tertiary)',
      border: '1px solid var(--border)',
      borderRadius: '8px',
      padding: '20px',
    }}>
      <div style={{ fontSize: '32px', marginBottom: '8px' }}>{icon}</div>
      <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '4px' }}>{title}</div>
      <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--accent)', marginBottom: '8px' }}>{count}</div>
      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{description}</div>
    </div>
  );
}

function ManagementLink({ title, description, path }) {
  return (
    <div style={{
      background: 'var(--bg-tertiary)',
      border: '1px solid var(--border)',
      borderRadius: '6px',
      padding: '16px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    }}>
      <div>
        <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '4px' }}>{title}</div>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{description}</div>
      </div>
      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
        {path}
      </div>
    </div>
  );
}
