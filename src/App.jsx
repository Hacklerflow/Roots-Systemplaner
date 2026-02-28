import { useState, useEffect, useRef } from 'react';
import ConfiguratorEditor from './components/ConfiguratorEditor/ConfiguratorEditor';
import ListView from './components/ListView/ListView';
import ModuleDatabase from './components/ModuleDatabase/ModuleDatabase';
import Stueckliste from './components/Stueckliste/Stueckliste';
import Verbindungen from './components/Verbindungen/Verbindungen';
import Leitungen from './components/Leitungen/Leitungen';
import ErrorBoundary from './components/ErrorBoundary';
import { initialModules } from './data/moduleDatabase';
import { initialLeitungen } from './data/leitungskatalog';
import { initialVerbindungsarten } from './data/verbindungsartenkatalog';

function App() {
  const [activeTab, setActiveTab] = useState('konfigurator');
  const fileInputRef = useRef(null);

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

  // Leitungskatalog State (mit localStorage Persistenz)
  const [leitungskatalog, setLeitungskatalog] = useState(() => {
    try {
      const stored = localStorage.getItem('roots-leitungskatalog');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Fehler beim Laden des Leitungskatalogs:', e);
      localStorage.removeItem('roots-leitungskatalog');
    }
    return initialLeitungen;
  });

  useEffect(() => {
    localStorage.setItem('roots-leitungskatalog', JSON.stringify(leitungskatalog));
  }, [leitungskatalog]);

  // Verbindungsarten-Katalog State (mit localStorage Persistenz)
  const [verbindungsartenkatalog, setVerbindungsartenkatalog] = useState(() => {
    try {
      const stored = localStorage.getItem('roots-verbindungsartenkatalog');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Fehler beim Laden des Verbindungsartenkatalogs:', e);
      localStorage.removeItem('roots-verbindungsartenkatalog');
    }
    return initialVerbindungsarten;
  });

  useEffect(() => {
    localStorage.setItem('roots-verbindungsartenkatalog', JSON.stringify(verbindungsartenkatalog));
  }, [verbindungsartenkatalog]);

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
            junctions: [],
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
              junctions: [],
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
              junctions: [],
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
              junctions: [],
              connections: [],
            };
          }

          return {
            building: parsed.building || null,
            modules: parsed.modules || [],
            junctions: parsed.junctions || [],
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
      junctions: [],    // Array von Knotenpunkten
      connections: [],  // Array von Verbindungen
    };
  });

  useEffect(() => {
    localStorage.setItem('roots-configuration', JSON.stringify(configuration));
  }, [configuration]);

  // Export Konfiguration als JSON
  const handleExportConfiguration = () => {
    if (!configuration?.building) {
      alert('Bitte erstelle zuerst ein Gebäude!');
      return;
    }

    const buildingName = configuration.building.name || 'Konfiguration';
    const fileName = `${buildingName.replace(/[^a-zA-Z0-9]/g, '_')}.json`;

    const dataStr = JSON.stringify(configuration, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });

    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Import Konfiguration aus JSON
  const handleImportConfiguration = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result);

        if (!imported.building) {
          alert('Ungültige Konfigurationsdatei: Kein Gebäude gefunden!');
          return;
        }

        if (imported.modules && !imported.modules.every(m =>
          Array.isArray(m.inputs) && Array.isArray(m.outputs)
        )) {
          alert('Ungültige Konfigurationsdatei: Module haben ungültige Struktur!');
          return;
        }

        setConfiguration({
          building: imported.building || null,
          modules: imported.modules || [],
          junctions: imported.junctions || [],
          connections: imported.connections || [],
        });

        alert(`Konfiguration "${imported.building.name}" erfolgreich geladen!`);
      } catch (error) {
        console.error('Fehler beim Laden der Konfiguration:', error);
        alert('Fehler beim Laden der Datei. Bitte überprüfe das Format.');
      }
    };
    reader.readAsText(file);

    event.target.value = '';
  };

  const hasBuilding = !!configuration?.building;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Header */}
      <header
        style={{
          background: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border)',
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>
          Roots Systemkonfigurator
        </h1>

        {/* Buttons */}
        {activeTab === 'konfigurator' && hasBuilding && (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleExportConfiguration}
              style={{
                padding: '10px 16px',
                background: 'var(--success)',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: '13px',
              }}
            >
              💾 Speichern
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                padding: '10px 16px',
                background: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                border: '2px solid var(--accent)',
                borderRadius: '4px',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: '13px',
              }}
            >
              📂 Öffnen
            </button>
          </div>
        )}
        {activeTab === 'konfigurator' && !hasBuilding && (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                padding: '10px 16px',
                background: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                border: '2px solid var(--accent)',
                borderRadius: '4px',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: '13px',
              }}
            >
              📂 Öffnen
            </button>
          </div>
        )}
      </header>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleImportConfiguration}
        style={{ display: 'none' }}
      />

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
          className={`tab ${activeTab === 'stueckliste' ? 'active' : ''}`}
          onClick={() => setActiveTab('stueckliste')}
        >
          Stückliste
        </button>
        <button
          className={`tab ${activeTab === 'verbindungen' ? 'active' : ''}`}
          onClick={() => setActiveTab('verbindungen')}
        >
          Verbindungen
        </button>
        <button
          className={`tab ${activeTab === 'leitungen' ? 'active' : ''}`}
          onClick={() => setActiveTab('leitungen')}
        >
          Leitungen
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
              leitungskatalog={leitungskatalog}
              verbindungsartenkatalog={verbindungsartenkatalog}
            />
          )}

          {activeTab === 'liste' && <ListView configuration={configuration} />}

          {activeTab === 'stueckliste' && (
            <Stueckliste
              configuration={configuration}
              setConfiguration={setConfiguration}
            />
          )}

          {activeTab === 'verbindungen' && (
            <Verbindungen
              verbindungsartenkatalog={verbindungsartenkatalog}
              setVerbindungsartenkatalog={setVerbindungsartenkatalog}
              leitungskatalog={leitungskatalog}
            />
          )}

          {activeTab === 'leitungen' && (
            <Leitungen
              leitungskatalog={leitungskatalog}
              setLeitungskatalog={setLeitungskatalog}
            />
          )}

          {activeTab === 'datenbank' && (
            <ModuleDatabase modules={modules} setModules={setModules} />
          )}
        </ErrorBoundary>
      </div>
    </div>
  );
}

export default App;
