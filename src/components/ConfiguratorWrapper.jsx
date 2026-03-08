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
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: '#1a1a1a',
        color: 'rgba(255, 255, 255, 0.6)',
      }}>
        Lade Projekt...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: '#1a1a1a',
        color: 'rgba(255, 255, 255, 0.87)',
        gap: '20px',
      }}>
        <div style={{ color: '#ef4444', fontSize: '18px' }}>{error}</div>
        <button
          onClick={handleBackToDashboard}
          style={{
            padding: '10px 20px',
            background: '#2ea043',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 600,
          }}
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
          <button
            onClick={handleBackToDashboard}
            style={{
              padding: '8px 16px',
              background: 'rgba(255, 255, 255, 0.1)',
              color: 'var(--text-primary)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 500,
            }}
          >
            ← Zurück
          </button>

          <div>
            <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>
              {project?.name || 'Projekt'}
            </h1>
            <p style={{
              margin: 0,
              fontSize: '12px',
              color: 'rgba(255, 255, 255, 0.5)',
            }}>
              {saving ? 'Speichert...' : `Zuletzt gespeichert: ${formatLastSaved()}`}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{
            fontSize: '12px',
            color: 'rgba(255, 255, 255, 0.6)',
          }}>
            {user?.name}
          </span>

          {hasBuilding && (
            <button
              onClick={() => saveProject(true)}
              disabled={saving}
              style={{
                padding: '10px 16px',
                background: saving ? '#666' : 'var(--success)',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontWeight: 600,
                cursor: saving ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit',
                fontSize: '13px',
              }}
            >
              {saving ? '💾 Speichert...' : '💾 Speichern'}
            </button>
          )}
        </div>
      </header>

      {/* Existing tab content */}
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
              formulaskatalog={formulaskatalog}
              pumpenkatalog={pumpenkatalog}
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
