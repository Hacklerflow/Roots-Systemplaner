import { useState, useEffect } from 'react';
import ConfiguratorEditor from './components/ConfiguratorEditor/ConfiguratorEditor';
import ListView from './components/ListView/ListView';
import ModuleDatabase from './components/ModuleDatabase/ModuleDatabase';
import ErrorBoundary from './components/ErrorBoundary';
import { initialModules } from './data/moduleDatabase';

function App() {
  const [activeTab, setActiveTab] = useState('konfigurator');

  // Keyboard shortcut: Cmd+Shift+K or Ctrl+Shift+K zum Zurücksetzen
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'K') {
        if (confirm('Alle Daten löschen und App zurücksetzen? Diese Aktion kann nicht rückgängig gemacht werden.')) {
          localStorage.clear();
          window.location.reload();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Moduldatenbank State (mit localStorage Persistenz)
  const [modules, setModules] = useState(() => {
    try {
      const stored = localStorage.getItem('roots-modules');
      if (stored) {
        const parsed = JSON.parse(stored);
        // Validiere dass es ein Array ist und jedes Modul inputs/outputs hat
        if (Array.isArray(parsed) && parsed.every(m => Array.isArray(m.inputs) && Array.isArray(m.outputs))) {
          return parsed;
        } else {
          console.warn('Ungültige Moduldaten in localStorage, verwende Standardmodule');
          localStorage.removeItem('roots-modules');
        }
      }
    } catch (e) {
      console.error('Fehler beim Laden der Module:', e);
      localStorage.removeItem('roots-modules');
    }
    return initialModules;
  });

  useEffect(() => {
    localStorage.setItem('roots-modules', JSON.stringify(modules));
  }, [modules]);

  // Konfigurations State (STRUKTUR: building + modules + connections)
  const [configuration, setConfiguration] = useState(() => {
    try {
      const stored = localStorage.getItem('roots-configuration');

      if (stored) {
        const parsed = JSON.parse(stored);

        // Migration: Altes Format zu neuem Format
        if (parsed.chain) {
          console.warn('Altes Konfigurationsformat erkannt - wird zurückgesetzt');
          localStorage.removeItem('roots-configuration');
          return {
            building: null,
            modules: [],
            connections: [],
          };
        }

        // Neues Format validieren
        if (parsed.hasOwnProperty('modules') && parsed.hasOwnProperty('connections')) {
          // Validiere dass modules ein Array ist
          if (!Array.isArray(parsed.modules) || !Array.isArray(parsed.connections)) {
            console.warn('Ungültige Konfiguration in localStorage, wird zurückgesetzt');
            localStorage.removeItem('roots-configuration');
            return {
              building: null,
              modules: [],
              connections: [],
            };
          }

          // Validiere dass jedes Modul inputs/outputs hat
          const allModulesValid = parsed.modules.every(m =>
            m && Array.isArray(m.inputs) && Array.isArray(m.outputs)
          );

          if (!allModulesValid) {
            console.warn('Module haben ungültige Struktur, Konfiguration wird zurückgesetzt');
            localStorage.removeItem('roots-configuration');
            return {
              building: null,
              modules: [],
              connections: [],
            };
          }

          // Validiere building falls vorhanden
          if (parsed.building && (!Array.isArray(parsed.building.inputs) || !Array.isArray(parsed.building.outputs))) {
            console.warn('Gebäude hat ungültige Struktur, Konfiguration wird zurückgesetzt');
            localStorage.removeItem('roots-configuration');
            return {
              building: null,
              modules: [],
              connections: [],
            };
          }

          return {
            building: parsed.building || null,
            modules: parsed.modules || [],
            connections: parsed.connections || [],
          };
        }
      }
    } catch (e) {
      console.error('Fehler beim Laden der Konfiguration:', e);
      localStorage.removeItem('roots-configuration');
    }

    // Default: leere Konfiguration
    return {
      building: null,   // Gebäude (nicht als Node)
      modules: [],      // Array von Modulen
      connections: [],  // Array von Verbindungen
    };
  });

  useEffect(() => {
    localStorage.setItem('roots-configuration', JSON.stringify(configuration));
  }, [configuration]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Header */}
      <header
        style={{
          background: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border)',
          padding: '16px 24px',
        }}
      >
        <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>
          Roots Systemkonfigurator
        </h1>
        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
          Modulare Wärmepumpen-Planung mit Ein-/Ausgangs-System
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'konfigurator' ? 'active' : ''}`}
          onClick={() => setActiveTab('konfigurator')}
        >
          Konfigurator
        </button>
        <button
          className={`tab ${activeTab === 'liste' ? 'active' : ''}`}
          onClick={() => setActiveTab('liste')}
        >
          Listenansicht
        </button>
        <button
          className={`tab ${activeTab === 'datenbank' ? 'active' : ''}`}
          onClick={() => setActiveTab('datenbank')}
        >
          Moduldatenbank
        </button>
      </div>

      {/* Tab Content */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        <ErrorBoundary>
          {activeTab === 'konfigurator' && (
            <ConfiguratorEditor
              modules={modules}
              configuration={configuration}
              setConfiguration={setConfiguration}
            />
          )}

          {activeTab === 'liste' && <ListView configuration={configuration} />}

          {activeTab === 'datenbank' && (
            <ModuleDatabase modules={modules} setModules={setModules} />
          )}
        </ErrorBoundary>
      </div>
    </div>
  );
}

export default App;
