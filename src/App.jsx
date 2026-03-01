import { useState, useEffect, useRef } from 'react';
import ConfiguratorEditor from './components/ConfiguratorEditor/ConfiguratorEditor';
import ListView from './components/ListView/ListView';
import ModuleDatabase from './components/ModuleDatabase/ModuleDatabase';
import Stueckliste from './components/Stueckliste/Stueckliste';
import Verbindungen from './components/Verbindungen/Verbindungen';
import Leitungen from './components/Leitungen/Leitungen';
import Dimensionen from './components/Dimensionen/Dimensionen';
import Modultypen from './components/Modultypen/Modultypen';
import SystemSetsModal from './components/SystemSets/SystemSetsModal';
import ErrorBoundary from './components/ErrorBoundary';
import { initialModules } from './data/moduleDatabase';
import { initialLeitungen } from './data/leitungskatalog';
import { initialVerbindungsarten } from './data/verbindungsartenkatalog';
import { initialDimensionen } from './data/dimensionskatalog';
import { initialModultypen } from './data/modultypenkatalog';

function App() {
  const [activeTab, setActiveTab] = useState('konfigurator');
  const [settingsDropdownOpen, setSettingsDropdownOpen] = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState('verbindungen');
  const [systemSetsModalOpen, setSystemSetsModalOpen] = useState(false);
  const fileInputRef = useRef(null);
  const settingsDropdownRef = useRef(null);

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

  // Click outside to close settings dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (settingsDropdownRef.current && !settingsDropdownRef.current.contains(event.target)) {
        setSettingsDropdownOpen(false);
      }
    };

    if (settingsDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [settingsDropdownOpen]);

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

  // Dimensionskatalog State (mit localStorage Persistenz)
  const [dimensionskatalog, setDimensionskatalog] = useState(() => {
    try {
      const stored = localStorage.getItem('roots-dimensionskatalog');
      if (stored) {
        const parsed = JSON.parse(stored);
        // Validiere dass es ein Array ist und nicht leer
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        } else {
          console.warn('Dimensionskatalog ist leer, verwende Initial-Daten');
          localStorage.removeItem('roots-dimensionskatalog');
        }
      }
    } catch (e) {
      console.error('Fehler beim Laden des Dimensionskatalogs:', e);
      localStorage.removeItem('roots-dimensionskatalog');
    }
    return initialDimensionen;
  });

  useEffect(() => {
    localStorage.setItem('roots-dimensionskatalog', JSON.stringify(dimensionskatalog));
  }, [dimensionskatalog]);

  // Runtime-Check: Falls Dimensionskatalog leer ist, Initial-Daten laden
  useEffect(() => {
    if (dimensionskatalog.length === 0) {
      console.warn('Runtime: Dimensionskatalog ist leer, lade Initial-Daten');
      setDimensionskatalog(initialDimensionen);
    }
  }, []);

  // Modultypen State (mit localStorage Persistenz)
  const [modultypen, setModultypen] = useState(() => {
    try {
      const stored = localStorage.getItem('roots-modultypen');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        } else {
          console.warn('Modultypen ist leer, verwende Initial-Daten');
          localStorage.removeItem('roots-modultypen');
        }
      }
    } catch (e) {
      console.error('Fehler beim Laden der Modultypen:', e);
      localStorage.removeItem('roots-modultypen');
    }
    return initialModultypen;
  });

  useEffect(() => {
    localStorage.setItem('roots-modultypen', JSON.stringify(modultypen));
  }, [modultypen]);

  // Runtime-Check: Falls Modultypen leer, Initial-Daten laden
  useEffect(() => {
    if (modultypen.length === 0) {
      console.warn('Runtime: Modultypen ist leer, lade Initial-Daten');
      setModultypen(initialModultypen);
    }
  }, []);

  // System Sets State (mit localStorage Persistenz)
  const [systemSets, setSystemSets] = useState(() => {
    try {
      const stored = localStorage.getItem('roots-system-sets');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Fehler beim Laden der System Sets:', e);
    }
    return [];
  });

  const [activeSetId, setActiveSetId] = useState(() => {
    try {
      const stored = localStorage.getItem('roots-active-set-id');
      return stored || null;
    } catch (e) {
      console.error('Fehler beim Laden der aktiven Set-ID:', e);
    }
    return null;
  });

  useEffect(() => {
    localStorage.setItem('roots-system-sets', JSON.stringify(systemSets));
  }, [systemSets]);

  useEffect(() => {
    if (activeSetId) {
      localStorage.setItem('roots-active-set-id', activeSetId);
    }
  }, [activeSetId]);

  // System Sets Functions
  const handleCreateSystemSet = (name) => {
    const today = new Date().toISOString().slice(0, 10);
    const newSet = {
      id: `set-${Date.now()}`,
      name: `${name} ${today}`,
      createdAt: new Date().toISOString(),
      modules: modules,
      leitungskatalog: leitungskatalog,
      verbindungsartenkatalog: verbindungsartenkatalog,
      dimensionskatalog: dimensionskatalog,
      modultypen: modultypen,
    };

    setSystemSets([...systemSets, newSet]);
    setActiveSetId(newSet.id);
  };

  const handleSwitchSystemSet = (setId) => {
    const set = systemSets.find(s => s.id === setId);
    if (!set) return;

    // Alle Kataloge durch das Set ersetzen
    setModules(set.modules || []);
    setLeitungskatalog(set.leitungskatalog || []);
    setVerbindungsartenkatalog(set.verbindungsartenkatalog || []);
    setDimensionskatalog(set.dimensionskatalog || []);
    setModultypen(set.modultypen || []);
    setActiveSetId(setId);
  };

  const handleDeleteSystemSet = (setId) => {
    setSystemSets(systemSets.filter(s => s.id !== setId));
    if (activeSetId === setId) {
      setActiveSetId(null);
    }
  };

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
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>
            Roots Systemkonfigurator
          </h1>

          {/* System Set Indicator & Button */}
          <button
            onClick={() => setSystemSetsModalOpen(true)}
            style={{
              padding: '8px 16px',
              background: 'var(--bg-tertiary)',
              color: 'var(--text-primary)',
              border: '2px solid var(--accent)',
              borderRadius: '4px',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span>⚙️</span>
            <span>
              {systemSets.find(s => s.id === activeSetId)?.name || 'Kein System Set'}
            </span>
          </button>
        </div>

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
          className={`tab ${activeTab === 'datenbank' ? 'active' : ''}`}
          onClick={() => setActiveTab('datenbank')}
        >
          Moduldatenbank
        </button>

        {/* Einstellungen Dropdown */}
        <div
          ref={settingsDropdownRef}
          style={{ position: 'relative', display: 'inline-block' }}
        >
          <button
            className={`tab ${activeTab === 'einstellungen' ? 'active' : ''}`}
            onClick={() => {
              setSettingsDropdownOpen(!settingsDropdownOpen);
              if (!settingsDropdownOpen) {
                setActiveTab('einstellungen');
              }
            }}
          >
            Einstellungen {settingsDropdownOpen ? '▲' : '▼'}
          </button>

          {settingsDropdownOpen && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                marginTop: '4px',
                minWidth: '200px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                zIndex: 1000,
              }}
            >
              <button
                className={`settings-dropdown-item ${activeSettingsTab === 'verbindungen' ? 'active' : ''}`}
                onClick={() => {
                  setActiveSettingsTab('verbindungen');
                  setSettingsDropdownOpen(false);
                }}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: activeSettingsTab === 'verbindungen' ? 'var(--accent)' : 'transparent',
                  color: activeSettingsTab === 'verbindungen' ? 'var(--bg-primary)' : 'var(--text-primary)',
                  border: 'none',
                  borderBottom: '1px solid var(--border)',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  fontSize: '14px',
                  fontWeight: activeSettingsTab === 'verbindungen' ? 600 : 400,
                }}
              >
                Verbindungen
              </button>
              <button
                className={`settings-dropdown-item ${activeSettingsTab === 'leitungen' ? 'active' : ''}`}
                onClick={() => {
                  setActiveSettingsTab('leitungen');
                  setSettingsDropdownOpen(false);
                }}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: activeSettingsTab === 'leitungen' ? 'var(--accent)' : 'transparent',
                  color: activeSettingsTab === 'leitungen' ? 'var(--bg-primary)' : 'var(--text-primary)',
                  border: 'none',
                  borderBottom: '1px solid var(--border)',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  fontSize: '14px',
                  fontWeight: activeSettingsTab === 'leitungen' ? 600 : 400,
                }}
              >
                Leitungen
              </button>
              <button
                className={`settings-dropdown-item ${activeSettingsTab === 'dimensionen' ? 'active' : ''}`}
                onClick={() => {
                  setActiveSettingsTab('dimensionen');
                  setSettingsDropdownOpen(false);
                }}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: activeSettingsTab === 'dimensionen' ? 'var(--accent)' : 'transparent',
                  color: activeSettingsTab === 'dimensionen' ? 'var(--bg-primary)' : 'var(--text-primary)',
                  border: 'none',
                  borderBottom: '1px solid var(--border)',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  fontSize: '14px',
                  fontWeight: activeSettingsTab === 'dimensionen' ? 600 : 400,
                }}
              >
                Dimensionen
              </button>
              <button
                className={`settings-dropdown-item ${activeSettingsTab === 'modultypen' ? 'active' : ''}`}
                onClick={() => {
                  setActiveSettingsTab('modultypen');
                  setSettingsDropdownOpen(false);
                }}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: activeSettingsTab === 'modultypen' ? 'var(--accent)' : 'transparent',
                  color: activeSettingsTab === 'modultypen' ? 'var(--bg-primary)' : 'var(--text-primary)',
                  border: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  fontSize: '14px',
                  fontWeight: activeSettingsTab === 'modultypen' ? 600 : 400,
                }}
              >
                Modultypen
              </button>
            </div>
          )}
        </div>
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
              dimensionskatalog={dimensionskatalog}
              modultypen={modultypen}
            />
          )}

          {activeTab === 'liste' && <ListView configuration={configuration} />}

          {activeTab === 'stueckliste' && (
            <Stueckliste
              configuration={configuration}
              setConfiguration={setConfiguration}
            />
          )}

          {activeTab === 'einstellungen' && activeSettingsTab === 'verbindungen' && (
            <Verbindungen
              verbindungsartenkatalog={verbindungsartenkatalog}
              setVerbindungsartenkatalog={setVerbindungsartenkatalog}
              leitungskatalog={leitungskatalog}
            />
          )}

          {activeTab === 'einstellungen' && activeSettingsTab === 'leitungen' && (
            <Leitungen
              leitungskatalog={leitungskatalog}
              setLeitungskatalog={setLeitungskatalog}
              dimensionskatalog={dimensionskatalog}
            />
          )}

          {activeTab === 'einstellungen' && activeSettingsTab === 'dimensionen' && (
            <Dimensionen
              dimensionskatalog={dimensionskatalog}
              setDimensionskatalog={setDimensionskatalog}
            />
          )}

          {activeTab === 'einstellungen' && activeSettingsTab === 'modultypen' && (
            <Modultypen
              modultypen={modultypen}
              setModultypen={setModultypen}
            />
          )}

          {activeTab === 'datenbank' && (
            <ModuleDatabase
              modules={modules}
              setModules={setModules}
              leitungskatalog={leitungskatalog}
              verbindungsartenkatalog={verbindungsartenkatalog}
              dimensionskatalog={dimensionskatalog}
              modultypen={modultypen}
            />
          )}
        </ErrorBoundary>
      </div>

      {/* System Sets Modal */}
      <SystemSetsModal
        isOpen={systemSetsModalOpen}
        onClose={() => setSystemSetsModalOpen(false)}
        systemSets={systemSets}
        activeSetId={activeSetId}
        onCreateSet={handleCreateSystemSet}
        onSwitchSet={handleSwitchSystemSet}
        onDeleteSet={handleDeleteSystemSet}
      />
    </div>
  );
}

export default App;
