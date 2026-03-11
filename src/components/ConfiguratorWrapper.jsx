import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectsAPI } from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import ConfiguratorEditor from './ConfiguratorEditor/ConfiguratorEditor';
import ListView from './ListView/ListView';
import ModuleDatabase from './ModuleDatabase/ModuleDatabase';
import Stueckliste from './Stueckliste/Stueckliste';
import Verbindungen from './Verbindungen/Verbindungen';
import Leitungen from './Leitungen/Leitungen';
import Dimensionen from './Dimensionen/Dimensionen';
import Modultypen from './Modultypen/Modultypen';
import Formulas from './Formulas/Formulas';
import Pumpen from './Settings/Pumpen';
import Soles from './Soles/Soles';
import Manual from './Manual/Manual';
import SystemSets from './SystemSets/SystemSets';
import PumpAnalysis from './PumpAnalysis/PumpAnalysis';
import ErrorBoundary from './ErrorBoundary';

/**
 * Wrapper around the Configurator that handles:
 * - Loading project from backend
 * - Saving to backend
 * - Auto-save
 * - Navigation back to dashboard
 */
export default function ConfiguratorWrapper({
  activeTab,
  setActiveTab,
  activeSettingsTab,
  modules,
  setModules,
  leitungskatalog,
  setLeitungskatalog,
  verbindungsartenkatalog,
  setVerbindungsartenkatalog,
  dimensionskatalog,
  setDimensionskatalog,
  modultypen,
  setModultypen,
  formulaskatalog,
  setFormulaskatalog,
  pumpenkatalog,
  setPumpenkatalog,
  soleskatalog,
  setSoleskatalog,
  onReloadCatalogs,
  systemSets,
  activeSetId,
  onCreateSet,
  onSwitchSet,
  onDeleteSet,
  onImportSets,
}) {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [project, setProject] = useState(null);
  const [configuration, setConfiguration] = useState({
    building: null,
    modules: [],
    junctions: [],
    connections: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [error, setError] = useState('');

  // Load project from backend
  useEffect(() => {
    loadProject();
  }, [projectId]);

  // Auto-save every 30 seconds
  useEffect(() => {
    if (!project) return;

    const interval = setInterval(() => {
      saveProject();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [project, configuration]);

  const loadProject = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await projectsAPI.getById(projectId);
      const loadedProject = response.project;

      setProject(loadedProject);

      // Convert backend format to frontend format
      // Ensure nodes and edges are arrays (might be null for new projects)
      const nodes = Array.isArray(loadedProject.nodes) ? loadedProject.nodes : [];
      const edges = Array.isArray(loadedProject.edges) ? loadedProject.edges : [];

      const config = {
        building: loadedProject.building || null,
        modules: nodes.filter(n => n.type === 'module'),
        junctions: nodes.filter(n => n.type === 'junction'),
        connections: edges,
      };

      setConfiguration(config);
      setLastSaved(new Date(loadedProject.updated_at));
    } catch (err) {
      setError('Fehler beim Laden des Projekts: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const saveProject = async (showFeedback = false) => {
    if (!project || saving) return;

    try {
      setSaving(true);

      // Convert frontend format to backend format
      const nodes = [
        ...configuration.modules.map(m => ({ ...m, type: 'module' })),
        ...configuration.junctions.map(j => ({ ...j, type: 'junction' })),
      ];

      await projectsAPI.update(projectId, {
        name: project.name,
        description: project.description,
        tags: project.tags,
        nodes: nodes,
        edges: configuration.connections,
        building: configuration.building,
      });

      setLastSaved(new Date());

      if (showFeedback) {
        alert('Projekt gespeichert!');
      }
    } catch (err) {
      console.error('Speichern fehlgeschlagen:', err);
      if (showFeedback) {
        alert('Fehler beim Speichern: ' + err.message);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleBackToDashboard = async () => {
    // Save before leaving
    await saveProject();
    navigate('/dashboard');
  };

  const formatLastSaved = () => {
    if (!lastSaved) return '';
    const now = new Date();
    const diff = Math.floor((now - lastSaved) / 1000); // seconds

    if (diff < 60) return 'gerade eben';
    if (diff < 3600) return `vor ${Math.floor(diff / 60)} Min.`;
    return lastSaved.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#1a1a1a] text-foreground-secondary">
        Lade Projekt...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#1a1a1a] text-foreground gap-5">
        <div className="text-[#ef4444] text-lg">{error}</div>
        <button
          onClick={handleBackToDashboard}
          className="px-5 py-2.5 bg-[#2ea043] text-white rounded-md cursor-pointer text-sm font-semibold"
        >
          Zurück zur Übersicht
        </button>
      </div>
    );
  }

  const hasBuilding = !!configuration?.building;

  return (
    <>
      {/* Header with Back button and Save info */}
      <header className="bg-background-secondary border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBackToDashboard}
            className="px-4 py-2 bg-white/10 text-foreground border border-white/20 rounded cursor-pointer text-sm font-medium"
          >
            ← Zurück
          </button>

          <div>
            <h1 className="m-0 text-xl font-semibold">
              {project?.name || 'Projekt'}
            </h1>
            <p className="m-0 text-xs text-white/50">
              {saving ? 'Speichert...' : `Zuletzt gespeichert: ${formatLastSaved()}`}
            </p>
          </div>
        </div>

        <div className="flex gap-2 items-center">
          <span className="text-xs text-white/60">
            {user?.name}
          </span>

          {hasBuilding && (
            <button
              onClick={() => saveProject(true)}
              disabled={saving}
              className={`px-4 py-2.5 text-white rounded font-semibold text-sm ${
                saving ? 'bg-[#666] cursor-not-allowed' : 'bg-success cursor-pointer'
              }`}
            >
              {saving ? 'Speichert...' : 'Speichern'}
            </button>
          )}
        </div>
      </header>

      {/* Existing tab content */}
      <div className="flex-1 overflow-auto">
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
              formulaskatalog={formulaskatalog}
              pumpenkatalog={pumpenkatalog}
              soleskatalog={soleskatalog}
            />
          )}

          {activeTab === 'liste' && (
            <ListView
              configuration={configuration}
              setConfiguration={setConfiguration}
              modultypen={modultypen}
            />
          )}

          {activeTab === 'stueckliste' && (
            <Stueckliste
              configuration={configuration}
              setConfiguration={setConfiguration}
              modultypen={modultypen}
              project={project}
            />
          )}

          {activeTab === 'pumpen' && (
            <PumpAnalysis
              configuration={configuration}
              formulaskatalog={formulaskatalog}
              pipeCatalog={leitungskatalog}
              soleCatalog={soleskatalog}
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
              verbindungsartenkatalog={verbindungsartenkatalog}
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

          {activeTab === 'einstellungen' && activeSettingsTab === 'formulas' && (
            <Formulas
              formulaskatalog={formulaskatalog}
              setFormulaskatalog={setFormulaskatalog}
            />
          )}

          {activeTab === 'einstellungen' && activeSettingsTab === 'pumpen' && (
            <Pumpen
              pumpenkatalog={pumpenkatalog}
              setPumpenkatalog={setPumpenkatalog}
            />
          )}

          {activeTab === 'einstellungen' && activeSettingsTab === 'soles' && (
            <Soles
              soleskatalog={soleskatalog}
              onReload={onReloadCatalogs}
            />
          )}

          {activeTab === 'einstellungen' && activeSettingsTab === 'manual' && (
            <Manual />
          )}

          {activeTab === 'einstellungen' && activeSettingsTab === 'systemsets' && (
            <SystemSets
              systemSets={systemSets}
              activeSetId={activeSetId}
              onCreateSet={onCreateSet}
              onSwitchSet={onSwitchSet}
              onDeleteSet={onDeleteSet}
              onImportSets={onImportSets}
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
              pumpenkatalog={pumpenkatalog}
              onReloadCatalogs={onReloadCatalogs}
            />
          )}
        </ErrorBoundary>
      </div>
    </>
  );
}
