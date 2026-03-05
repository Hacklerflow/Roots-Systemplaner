import { useState, useEffect, useRef } from 'react';
import ConfiguratorWrapper from './components/ConfiguratorWrapper';
import SystemSetsModal from './components/SystemSets/SystemSetsModal';
import { catalogsAPI } from './api/client';
import { initialModules } from './data/moduleDatabase';
import { initialLeitungen } from './data/leitungskatalog';
import { initialVerbindungsarten } from './data/verbindungsartenkatalog';
import { initialDimensionen } from './data/dimensionskatalog';
import { initialModultypen } from './data/modultypenkatalog';

/**
 * ConfiguratorApp - Container for the configurator
 * Manages tabs, catalogs (now loaded from backend), and system sets
 * Project data is handled by ConfiguratorWrapper (loads from backend)
 */
function ConfiguratorApp() {
  const [activeTab, setActiveTab] = useState('konfigurator');
  const [settingsDropdownOpen, setSettingsDropdownOpen] = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState('verbindungen');
  const [systemSetsModalOpen, setSystemSetsModalOpen] = useState(false);
  const settingsDropdownRef = useRef(null);

  const [catalogsLoaded, setCatalogsLoaded] = useState(false);
  const [catalogsError, setCatalogsError] = useState('');

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

  // ===== SHARED CATALOGS (loaded from backend) =====

  const [modules, setModules] = useState(initialModules);
  const [leitungskatalog, setLeitungskatalog] = useState(initialLeitungen);
  const [verbindungsartenkatalog, setVerbindungsartenkatalog] = useState(initialVerbindungsarten);
  const [dimensionskatalog, setDimensionskatalog] = useState(initialDimensionen);
  const [modultypen, setModultypen] = useState(initialModultypen);

  // Load all catalogs from backend on mount
  useEffect(() => {
    loadCatalogs();
  }, []);

  const loadCatalogs = async () => {
    try {
      setCatalogsError('');

      // Load all catalogs in parallel
      const [
        moduleTypesRes,
        modulesRes,
        connectionsRes,
        pipesRes,
        dimensionsRes,
      ] = await Promise.all([
        catalogsAPI.getModuleTypes(),
        catalogsAPI.getModules(),
        catalogsAPI.getConnections(),
        catalogsAPI.getPipes(),
        catalogsAPI.getDimensions(),
      ]);

      // Convert backend format to frontend format

      // Module Types
      if (moduleTypesRes.moduleTypes?.length > 0) {
        const convertedModuleTypes = moduleTypesRes.moduleTypes.map(mt => ({
          name: mt.name,
          kategorie: mt.kategorie,
          berechnungsart: mt.berechnungsart,
          einheit: mt.einheit,
        }));
        setModultypen(convertedModuleTypes);
      }

      // Modules
      if (modulesRes.modules?.length > 0) {
        const convertedModules = modulesRes.modules.map(m => ({
          name: m.name,
          modultyp: m.modultyp,
          hersteller: m.hersteller,
          abmessungen: m.abmessungen,
          gewichtKg: m.gewicht_kg,
          leistungKw: m.leistung_kw,
          volumenL: m.volumen_l,
          preis: m.preis,
          inputs: Array.isArray(m.eingaenge) ? m.eingaenge :
                  (typeof m.eingaenge === 'string' ? JSON.parse(m.eingaenge) : []),
          outputs: Array.isArray(m.ausgaenge) ? m.ausgaenge :
                   (typeof m.ausgaenge === 'string' ? JSON.parse(m.ausgaenge) : []),
        }));
        setModules(convertedModules);
      }

      // Connections
      if (connectionsRes.connections?.length > 0) {
        const convertedConnections = connectionsRes.connections.map(c => ({
          id: c.id,
          name: c.name,
          kuerzel: c.kuerzel,
          connectionType: c.typ,
          kompatible_leitungen: Array.isArray(c.kompatible_leitungen) ? c.kompatible_leitungen :
                                 (typeof c.kompatible_leitungen === 'string' ? JSON.parse(c.kompatible_leitungen) : []),
        }));
        setVerbindungsartenkatalog(convertedConnections);
      }

      // Pipes
      if (pipesRes.pipes?.length > 0) {
        const convertedPipes = pipesRes.pipes.map(p => ({
          id: p.id,
          connectionType: p.connection_type,
          material: p.leitungstyp,
          dimension: p.dimension,
          preis_pro_meter: p.preis_pro_meter,
        }));
        setLeitungskatalog(convertedPipes);
      }

      // Dimensions
      if (dimensionsRes.dimensions?.length > 0) {
        const convertedDimensions = dimensionsRes.dimensions.map(d => ({
          name: d.name,
          value: d.value,
        }));
        setDimensionskatalog(convertedDimensions);
      }

      setCatalogsLoaded(true);
      console.log('✅ Kataloge vom Backend geladen');
    } catch (error) {
      console.error('❌ Fehler beim Laden der Kataloge:', error);
      setCatalogsError('Kataloge konnten nicht geladen werden. Fallback auf lokale Daten.');
      // Keep using initial values as fallback
      setCatalogsLoaded(true);
    }
  };

  // Wrapper functions to save catalog changes to backend
  const handleModulesChange = async (newModules) => {
    setModules(newModules);
    // Note: Individual module add/update/delete is handled in ModuleDatabase component
  };

  const handleLeitungskatalogChange = async (newLeitungen) => {
    setLeitungskatalog(newLeitungen);
    // Sync to backend handled in Leitungen component
  };

  const handleVerbindungsartenkatalogChange = async (newVerbindungen) => {
    setVerbindungsartenkatalog(newVerbindungen);
    // Sync to backend handled in Verbindungen component
  };

  const handleDimensionskatalogChange = async (newDimensionen) => {
    setDimensionskatalog(newDimensionen);
    // Sync to backend handled in Dimensionen component
  };

  const handleModultypenChange = async (newModultypen) => {
    setModultypen(newModultypen);
    // Sync to backend handled in Modultypen component
  };

  // System Sets (keeping for now - can be migrated later)
  const [systemSets, setSystemSets] = useState(() => {
    try {
      const stored = localStorage.getItem('roots-system-sets');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Fehler beim Laden der System Sets:', e);
    }
    return [];
  });

  const [activeSetId, setActiveSetId] = useState(() => {
    try {
      return localStorage.getItem('roots-active-set-id') || null;
    } catch (e) {
      return null;
    }
  });

  useEffect(() => {
    localStorage.setItem('roots-system-sets', JSON.stringify(systemSets));
  }, [systemSets]);

  useEffect(() => {
    if (activeSetId) {
      localStorage.setItem('roots-active-set-id', activeSetId);
    }
  }, [activeSetId]);

  const handleCreateSystemSet = (name) => {
    const today = new Date().toISOString().slice(0, 10);
    const newSet = {
      id: `set-${Date.now()}`,
      name: `${name} ${today}`,
      createdAt: new Date().toISOString(),
      modules,
      leitungskatalog,
      verbindungsartenkatalog,
      dimensionskatalog,
      modultypen,
    };
    setSystemSets([...systemSets, newSet]);
    setActiveSetId(newSet.id);
  };

  const handleSwitchSystemSet = (setId) => {
    const set = systemSets.find(s => s.id === setId);
    if (!set) return;
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

  const handleImportSystemSets = (importedSets) => {
    const existingIds = new Set(systemSets.map(s => s.id));
    const duplicates = importedSets.filter(s => existingIds.has(s.id));

    if (duplicates.length > 0) {
      const shouldOverwrite = confirm(
        `${duplicates.length} Set(s) mit gleichen IDs existieren bereits.\n\nÜberschreiben?`
      );
      if (shouldOverwrite) {
        const updatedSets = systemSets.map(existing => {
          const imported = importedSets.find(imp => imp.id === existing.id);
          return imported || existing;
        });
        const newSets = importedSets.filter(imp => !existingIds.has(imp.id));
        setSystemSets([...updatedSets, ...newSets]);
      } else {
        const processedSets = importedSets.map(set => {
          if (existingIds.has(set.id)) {
            return { ...set, id: `set-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` };
          }
          return set;
        });
        setSystemSets([...systemSets, ...processedSets]);
      }
    } else {
      setSystemSets([...systemSets, ...importedSets]);
    }
  };

  // Show loading state while catalogs are loading
  if (!catalogsLoaded) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: '#1a1a1a',
        color: 'rgba(255, 255, 255, 0.6)',
      }}>
        Lade Kataloge...
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Catalog Error Banner */}
      {catalogsError && (
        <div style={{
          background: 'rgba(239, 160, 68, 0.15)',
          borderBottom: '1px solid #ef9444',
          color: '#ffc085',
          padding: '12px 24px',
          fontSize: '14px',
          textAlign: 'center',
        }}>
          ⚠️ {catalogsError}
        </div>
      )}

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
        <div ref={settingsDropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
          <button
            className={`tab ${activeTab === 'einstellungen' ? 'active' : ''}`}
            onClick={() => {
              setSettingsDropdownOpen(!settingsDropdownOpen);
              if (!settingsDropdownOpen) setActiveTab('einstellungen');
            }}
          >
            Einstellungen {settingsDropdownOpen ? '▲' : '▼'}
          </button>

          {settingsDropdownOpen && (
            <div style={{
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
            }}>
              {['verbindungen', 'leitungen', 'dimensionen', 'modultypen', 'systemsets'].map(tab => {
                const labels = {
                  verbindungen: 'Verbindungen',
                  leitungen: 'Leitungen',
                  dimensionen: 'Dimensionen',
                  modultypen: 'Modultypen',
                  systemsets: 'System Sets',
                };
                return (
                  <button
                    key={tab}
                    onClick={() => {
                      setActiveSettingsTab(tab);
                      setSettingsDropdownOpen(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: activeSettingsTab === tab ? 'var(--accent)' : 'transparent',
                      color: activeSettingsTab === tab ? 'var(--bg-primary)' : 'var(--text-primary)',
                      border: 'none',
                      borderBottom: '1px solid var(--border)',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: activeSettingsTab === tab ? 600 : 400,
                    }}
                  >
                    {labels[tab]}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ConfiguratorWrapper handles project loading/saving */}
      <ConfiguratorWrapper
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeSettingsTab={activeSettingsTab}
        modules={modules}
        setModules={handleModulesChange}
        leitungskatalog={leitungskatalog}
        setLeitungskatalog={handleLeitungskatalogChange}
        verbindungsartenkatalog={verbindungsartenkatalog}
        setVerbindungsartenkatalog={handleVerbindungsartenkatalogChange}
        dimensionskatalog={dimensionskatalog}
        setDimensionskatalog={handleDimensionskatalogChange}
        modultypen={modultypen}
        setModultypen={handleModultypenChange}
        onReloadCatalogs={loadCatalogs}
        systemSets={systemSets}
        activeSetId={activeSetId}
        onCreateSet={handleCreateSystemSet}
        onSwitchSet={handleSwitchSystemSet}
        onDeleteSet={handleDeleteSystemSet}
        onImportSets={handleImportSystemSets}
      />

      {/* System Sets Modal */}
      <SystemSetsModal
        isOpen={systemSetsModalOpen}
        onClose={() => setSystemSetsModalOpen(false)}
        systemSets={systemSets}
        activeSetId={activeSetId}
        onCreateSet={handleCreateSystemSet}
        onSwitchSet={handleSwitchSystemSet}
        onDeleteSet={handleDeleteSystemSet}
        onImportSets={handleImportSystemSets}
      />
    </div>
  );
}

export default ConfiguratorApp;
