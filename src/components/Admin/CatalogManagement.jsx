import { useState, useEffect } from 'react';
import { catalogsAPI, adminAPI } from '../../api/client';
import { Button } from '@/components/ui/button';

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
      setMessage({ type: 'success', text: 'Aktueller Katalog wurde als Standard-Set gespeichert!' });
      loadDefaultSetInfo(); // Reload info
      setTimeout(() => setMessage(null), 5000);
    } catch (error) {
      console.error('Fehler beim Speichern des Standard-Sets:', error);
      setMessage({ type: 'error', text: 'Fehler beim Speichern des Standard-Sets: ' + error.message });
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
    return <div className="bg-background-secondary border border-border rounded-lg p-6">Lade Katalog-Statistiken...</div>;
  }

  return (
    <div>
      {/* Message Display */}
      {message && (
        <div className={`p-3 mb-4 rounded-md border ${
          message.type === 'success'
            ? 'bg-success/10 border-success/30 text-success'
            : 'bg-destructive/10 border-destructive/30 text-destructive'
        }`}>
          {message.text}
        </div>
      )}

      <div className="bg-background-secondary border border-border rounded-lg p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-semibold mb-2">Katalog-Übersicht</h2>
            <p className="text-foreground-secondary text-sm">
              Verwaltung aller Katalog-Daten (Module, Verbindungen, Leitungen, etc.)
            </p>
          </div>
          <Button onClick={loadStats} variant="outline">
            Aktualisieren
          </Button>
        </div>

        {stats && (
          <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4">
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
      <div className="bg-background-secondary border border-border rounded-lg p-6 mt-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-semibold mb-2">Standard-Set</h2>
            <p className="text-foreground-secondary text-sm">
              Definiere ein Standard-Set, das für alle Benutzer geladen wird
            </p>
          </div>
        </div>

        {defaultSetInfo && (
          <div className="mb-5">
            <div className="bg-background-tertiary border border-border rounded-lg p-5">
              <div className="text-sm text-foreground-secondary mb-3 font-semibold">
                Aktuelles Standard-Set:
              </div>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3 text-xs">
                <div>
                  <span className="text-foreground-secondary">Modultypen:</span>{' '}
                  <strong className="text-accent">{defaultSetInfo.counts?.moduleTypes || 0}</strong>
                </div>
                <div>
                  <span className="text-foreground-secondary">Module:</span>{' '}
                  <strong className="text-accent">{defaultSetInfo.counts?.modules || 0}</strong>
                </div>
                <div>
                  <span className="text-foreground-secondary">Verbindungen:</span>{' '}
                  <strong className="text-accent">{defaultSetInfo.counts?.connections || 0}</strong>
                </div>
                <div>
                  <span className="text-foreground-secondary">Leitungen:</span>{' '}
                  <strong className="text-accent">{defaultSetInfo.counts?.pipes || 0}</strong>
                </div>
                <div>
                  <span className="text-foreground-secondary">Dimensionen:</span>{' '}
                  <strong className="text-accent">{defaultSetInfo.counts?.dimensions || 0}</strong>
                </div>
                <div>
                  <span className="text-foreground-secondary">Formeln:</span>{' '}
                  <strong className="text-accent">{defaultSetInfo.counts?.formulas || 0}</strong>
                </div>
                <div>
                  <span className="text-foreground-secondary">Pumpen:</span>{' '}
                  <strong className="text-accent">{defaultSetInfo.counts?.pumps || 0}</strong>
                </div>
              </div>
              {defaultSetInfo.lastUpdated && (
                <div className="mt-3 text-xs text-foreground-secondary">
                  Zuletzt aktualisiert: {new Date(defaultSetInfo.lastUpdated).toLocaleString('de-DE')}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex gap-3 flex-wrap">
          <Button
            onClick={handleSaveAsDefault}
            disabled={loadingDefault}
            className="bg-accent hover:bg-accent/90"
          >
            Aktuellen Katalog als Standard speichern
          </Button>
          <Button
            onClick={handleLoadDefault}
            disabled={loadingDefault}
            variant="outline"
          >
            Standard-Set in Kataloge laden
          </Button>
        </div>

        <div className="mt-4 p-4 bg-background-tertiary rounded-md border border-border">
          <p className="m-0 text-xs text-foreground-secondary">
            <strong>Hinweis:</strong> Das Standard-Set wird für alle Benutzer geladen, wenn ihre Kataloge leer sind.
            Du kannst hier die aktuellen Kataloge als Standard definieren oder das Standard-Set in die aktuellen Kataloge laden.
          </p>
        </div>
      </div>

      <div className="bg-background-secondary border border-border rounded-lg p-6 mt-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-semibold mb-2">Katalog-Verwaltung</h2>
            <p className="text-foreground-secondary text-sm">
              Diese Kataloge können in den Einstellungen des Configurators verwaltet werden
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
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

        <div className="mt-6 p-4 bg-background-tertiary rounded-md border border-border">
          <p className="m-0 text-xs text-foreground-secondary">
            <strong>Hinweis:</strong> Die Katalog-Verwaltung erfolgt über die Einstellungen im Configurator.
            Öffne ein beliebiges Projekt und navigiere zu den Einstellungen, um Kataloge zu bearbeiten.
          </p>
        </div>
      </div>
    </div>
  );
}

function CatalogCard({ title, count, icon, description }) {
  return (
    <div className="bg-background-tertiary border border-border rounded-lg p-5">
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-sm text-foreground-secondary mb-1">{title}</div>
      <div className="text-3xl font-bold text-accent mb-2">{count}</div>
      <div className="text-xs text-foreground-secondary">{description}</div>
    </div>
  );
}

function ManagementLink({ title, description, path }) {
  return (
    <div className="bg-background-tertiary border border-border rounded-md p-4 flex justify-between items-center">
      <div>
        <div className="text-base font-semibold mb-1">{title}</div>
        <div className="text-xs text-foreground-secondary">{description}</div>
      </div>
      <div className="text-xs text-foreground-secondary font-mono">
        {path}
      </div>
    </div>
  );
}
