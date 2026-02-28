import { useState, useEffect } from 'react';
import ConfiguratorEditor from './components/ConfiguratorEditor/ConfiguratorEditor';
import ListView from './components/ListView/ListView';
import ModuleDatabase from './components/ModuleDatabase/ModuleDatabase';
import ErrorBoundary from './components/ErrorBoundary';
import { initialModules } from './data/moduleDatabase';

function App() {
  const [activeTab, setActiveTab] = useState('konfigurator');

  // Moduldatenbank State (mit localStorage Persistenz)
  const [modules, setModules] = useState(() => {
    const stored = localStorage.getItem('roots-modules');
    return stored ? JSON.parse(stored) : initialModules;
  });

  useEffect(() => {
    localStorage.setItem('roots-modules', JSON.stringify(modules));
  }, [modules]);

  // Konfigurations State (STRUKTUR: building + modules + connections)
  const [configuration, setConfiguration] = useState(() => {
    const stored = localStorage.getItem('roots-configuration');

    if (stored) {
      try {
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
          return {
            building: parsed.building || null,
            modules: parsed.modules || [],
            connections: parsed.connections || [],
          };
        }
      } catch (e) {
        console.error('Fehler beim Laden der Konfiguration:', e);
      }
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
