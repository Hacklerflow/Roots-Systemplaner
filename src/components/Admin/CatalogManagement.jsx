import { useState, useEffect } from 'react';
import { catalogsAPI } from '../../api/client';

export default function CatalogManagement() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const [moduleTypes, modules, connections, pipes, dimensions, formulas] = await Promise.all([
        catalogsAPI.getModuleTypes(),
        catalogsAPI.getModules(),
        catalogsAPI.getConnections(),
        catalogsAPI.getPipes(),
        catalogsAPI.getDimensions(),
        catalogsAPI.getFormulas(),
      ]);

      setStats({
        moduleTypes: moduleTypes.moduleTypes?.length || 0,
        modules: modules.modules?.length || 0,
        connections: connections.connections?.length || 0,
        pipes: pipes.pipes?.length || 0,
        dimensions: dimensions.dimensions?.length || 0,
        formulas: formulas.formulas?.length || 0,
      });
    } catch (error) {
      console.error('Fehler beim Laden der Statistiken:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="admin-section">Lade Katalog-Statistiken...</div>;
  }

  return (
    <div>
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
          </div>
        )}
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
