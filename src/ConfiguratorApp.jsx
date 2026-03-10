import { useState, useEffect, useRef } from 'react';
import ConfiguratorWrapper from './components/ConfiguratorWrapper';
import SystemSetsModal from './components/SystemSets/SystemSetsModal';
import { catalogsAPI } from './api/client';
// Keine Fallback-Daten mehr - alle Kataloge kommen aus der Datenbank

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

  const [modules, setModules] = useState([]);
  const [leitungskatalog, setLeitungskatalog] = useState([]);
  const [verbindungsartenkatalog, setVerbindungsartenkatalog] = useState([]);
  const [dimensionskatalog, setDimensionskatalog] = useState([]);
  const [modultypen, setModultypen] = useState([]);
  const [formulaskatalog, setFormulaskatalog] = useState([]);
  const [pumpenkatalog, setPumpenkatalog] = useState([]);
  const [soleskatalog, setSoleskatalog] = useState([]);

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
        formulasRes,
        pumpsRes,
        solesRes,
      ] = await Promise.all([
        catalogsAPI.getModuleTypes(),
        catalogsAPI.getModules(),
        catalogsAPI.getConnections(),
        catalogsAPI.getPipes(),
        catalogsAPI.getDimensions(),
        catalogsAPI.getFormulas(),
        catalogsAPI.getPumps(),
        catalogsAPI.getSoles(),
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

      // Modules - convert and resolve pump references
      if (modulesRes.modules?.length > 0) {
        const convertedModules = modulesRes.modules.map(m => {
          const inputs = Array.isArray(m.eingaenge) ? m.eingaenge :
                  (typeof m.eingaenge === 'string' ? JSON.parse(m.eingaenge) : []);
          const outputs = Array.isArray(m.ausgaenge) ? m.ausgaenge :
                   (typeof m.ausgaenge === 'string' ? JSON.parse(m.ausgaenge) : []);

          // Resolve pump_id to full pump data
          const resolvedinputs = inputs.map(inp => ({
            ...inp,
            pump: inp.pump?.pump_id && pumpsRes.pumps
              ? {
                  ...(pumpsRes.pumps.find(p => p.id === inp.pump.pump_id) || {}),
                  pump_id: inp.pump.pump_id,
                  nicht_in_stueckliste: inp.pump.nicht_in_stueckliste || false,
                }
              : inp.pump,
          }));

          const resolvedOutputs = outputs.map(out => ({
            ...out,
            pump: out.pump?.pump_id && pumpsRes.pumps
              ? {
                  ...(pumpsRes.pumps.find(p => p.id === out.pump.pump_id) || {}),
                  pump_id: out.pump.pump_id,
                  nicht_in_stueckliste: out.pump.nicht_in_stueckliste || false,
                }
              : out.pump,
          }));

          return {
            id: m.id,
            name: m.name,
            modultyp: m.modultyp,
            moduleType: m.modultyp,
            hersteller: m.hersteller,
            abmessungen: m.abmessungen,
            gewichtKg: m.gewicht_kg,
            leistungKw: m.leistung_kw,
            volumenL: m.volumen_l,
            preis: m.preis,
            inputs: resolvedinputs,
            outputs: resolvedOutputs,
          };
        });
        setModules(convertedModules);
      } else {
        // Set empty array if no modules from backend
        setModules([]);
      }

      // Connections
      if (connectionsRes.connections?.length > 0) {
        const convertedConnections = connectionsRes.connections.map(c => {
          let kompatible = [];
          if (Array.isArray(c.kompatible_leitungen)) {
            kompatible = c.kompatible_leitungen.map(id => parseInt(id));
          } else if (typeof c.kompatible_leitungen === 'string') {
            kompatible = JSON.parse(c.kompatible_leitungen).map(id => parseInt(id));
          }

          return {
            id: c.id,
            name: c.name,
            kuerzel: c.kuerzel,
            connectionType: c.typ,
            kompatible_leitungen: kompatible,
          };
        });
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

      // Formulas
      if (formulasRes.formulas?.length > 0) {
        const convertedFormulas = formulasRes.formulas.map(f => ({
          id: f.id,
          name: f.name,
          formula: f.formula,
          beschreibung: f.beschreibung,
          variablen: Array.isArray(f.variablen) ? f.variablen :
                     (typeof f.variablen === 'string' ? JSON.parse(f.variablen) : []),
          is_active: f.is_active,
        }));
        setFormulaskatalog(convertedFormulas);
      }

      // Pumps
      if (pumpsRes.pumps?.length > 0) {
        setPumpenkatalog(pumpsRes.pumps);
      }

      // Soles
      if (solesRes.soles?.length > 0) {
        setSoleskatalog(solesRes.soles);
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

  const handleFormulaskatalogChange = async (newFormulas) => {
    setFormulaskatalog(newFormulas);
    // Sync to backend handled in Formulas component
  };

  const handlePumpenkatalogChange = async (newPumpen) => {
    setPumpenkatalog(newPumpen);
    // Sync to backend handled in Pumpen component
  };

  const handleSoleskatalogChange = async (newSoles) => {
    setSoleskatalog(newSoles);
    // Sync to backend handled in Soles component
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
      const storedId = localStorage.getItem('roots-active-set-id');
      // Allow working without an active set
      return storedId || 'no-set';
    } catch (e) {
      return 'no-set';
    }
  });

  useEffect(() => {
    localStorage.setItem('roots-system-sets', JSON.stringify(systemSets));
  }, [systemSets]);

  useEffect(() => {
    if (activeSetId && activeSetId !== 'no-set') {
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
      formulaskatalog,
      pumpenkatalog,
      soleskatalog,
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
    setFormulaskatalog(set.formulaskatalog || []);
    setPumpenkatalog(set.pumpenkatalog || []);
    setSoleskatalog(set.soleskatalog || []);
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
      <div className="flex items-center justify-center h-screen bg-[#1a1a1a] text-foreground-secondary">
        Lade Kataloge...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Catalog Error Banner */}
      {catalogsError && (
        <div className="bg-[rgba(239,160,68,0.15)] border-b border-[#ef9444] text-[#ffc085] px-6 py-3 text-sm text-center">
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
          className={`tab ${activeTab === 'pumpen' ? 'active' : ''}`}
          onClick={() => setActiveTab('pumpen')}
        >
          Pumpenanalyse
        </button>
        <button
          className={`tab ${activeTab === 'datenbank' ? 'active' : ''}`}
          onClick={() => setActiveTab('datenbank')}
        >
          Moduldatenbank
        </button>

        {/* Einstellungen Dropdown */}
        <div ref={settingsDropdownRef} className="relative inline-block">
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
            <div className="absolute top-full left-0 bg-background-secondary border border-border rounded mt-1 min-w-[200px] shadow-lg z-[1000]">
              {['dimensionen', 'leitungen', 'verbindungen', 'modultypen', 'formulas', 'pumpen', 'soles', 'manual', 'systemsets'].map(tab => {
                const labels = {
                  verbindungen: 'Verbindungen',
                  leitungen: 'Leitungen',
                  dimensionen: 'Dimensionen',
                  modultypen: 'Modultypen',
                  formulas: 'Formeln',
                  pumpen: 'Pumpen',
                  soles: 'Sole',
                  manual: 'Benutzerhandbuch',
                  systemsets: 'System Sets',
                };
                return (
                  <button
                    key={tab}
                    onClick={() => {
                      setActiveSettingsTab(tab);
                      setSettingsDropdownOpen(false);
                    }}
                    className={`w-full px-4 py-3 border-b border-border text-left cursor-pointer text-sm ${
                      activeSettingsTab === tab
                        ? 'bg-accent text-background font-semibold'
                        : 'bg-transparent text-foreground font-normal'
                    }`}
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
        formulaskatalog={formulaskatalog}
        setFormulaskatalog={handleFormulaskatalogChange}
        pumpenkatalog={pumpenkatalog}
        setPumpenkatalog={handlePumpenkatalogChange}
        soleskatalog={soleskatalog}
        setSoleskatalog={handleSoleskatalogChange}
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
