import { useState, useCallback, useEffect } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import BuildingNode from './BuildingNode';
import ModuleNode from './ModuleNode';
import JunctionNode from './JunctionNode';
import WarningEdge from './WarningEdge';
import ElementModal from './ElementModal';
import ConnectionModal from './ConnectionModal';
import { createBuilding, createModuleInstance, createJunction, isBuilding, isJunction } from '../../data/types';
import { checkConnection, getEdgeStyle } from '../../data/compatibilityChecker';

const nodeTypes = {
  building: BuildingNode,
  module: ModuleNode,
  junction: JunctionNode,
};

const edgeTypes = {
  warning: WarningEdge,
};

// Wrapper Komponente mit ReactFlowProvider
export default function ConfiguratorEditor({ modules: moduleTemplates, configuration, setConfiguration }) {
  return (
    <ReactFlowProvider>
      <ConfiguratorEditorInner
        modules={moduleTemplates}
        configuration={configuration}
        setConfiguration={setConfiguration}
      />
    </ReactFlowProvider>
  );
}

// Innere Komponente die useReactFlow verwenden kann
function ConfiguratorEditorInner({ modules: moduleTemplates, configuration, setConfiguration }) {
  const reactFlowInstance = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedElement, setSelectedElement] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedConnection, setSelectedConnection] = useState(null);
  const [connectionModalOpen, setConnectionModalOpen] = useState(false);

  // Synchronisiere configuration mit nodes/edges
  useEffect(() => {
    const newNodes = [];
    const newEdges = [];

    const modules = configuration?.modules || [];
    const junctions = configuration?.junctions || [];
    const connections = configuration?.connections || [];

    // Module zu Nodes konvertieren (OHNE Gebäude)
    modules
      .filter(module => !isBuilding(module)) // Gebäude nicht als Node
      .forEach((module, index) => {
        newNodes.push({
          id: module.id,
          type: 'module',
          position: module.position || {
            x: 100 + index * 280,
            y: 100 + (index % 3) * 180,
          },
          data: {
            ...module,
            onClick: () => openModal(module),
          },
        });
      });

    // Junctions zu Nodes konvertieren
    junctions.forEach((junction, index) => {
      newNodes.push({
        id: junction.id,
        type: 'junction',
        position: junction.position || {
          x: 400,
          y: 100 + index * 100,
        },
        data: {
          label: junction.label || '',
          onLabelChange: (newLabel) => handleJunctionLabelChange(junction.id, newLabel),
          onDelete: () => handleDeleteJunction(junction.id),
        },
      });
    });

    // Connections zu Edges konvertieren
    connections.forEach((conn) => {
      const sourceModule = modules.find(m => m.id === conn.source) ||
                          junctions.find(j => j.id === conn.source) ||
                          (configuration?.building?.id === conn.source ? configuration.building : null);
      const targetModule = modules.find(m => m.id === conn.target) ||
                          junctions.find(j => j.id === conn.target);

      if (!sourceModule || !targetModule) return;

      // Prüfe Kompatibilität
      const check = checkConnection(
        sourceModule,
        conn.sourceHandle,
        targetModule,
        conn.targetHandle
      );

      // Ermittle connectionType und Labels vom Output/Input
      // Bei Junctions gibt es keine outputs/inputs, daher Fallback
      const output = sourceModule.outputs?.find(o => o.id === conn.sourceHandle);
      const input = targetModule.inputs?.find(i => i.id === conn.targetHandle);
      const connectionType = output?.connectionType || input?.connectionType || 'hydraulic';

      const edgeId = conn.id || `${conn.source}-${conn.sourceHandle}-${conn.target}-${conn.targetHandle}`;
      newEdges.push({
        id: edgeId,
        source: conn.source,
        sourceHandle: conn.sourceHandle,
        target: conn.target,
        targetHandle: conn.targetHandle,
        type: 'warning',
        animated: !check.warning,
        style: getEdgeStyle(connectionType),
        data: {
          warning: check.warning,
          warningReason: check.reason,
          onClick: openConnectionModal,
          sourceLabel: output?.label || '',
          targetLabel: input?.label || '',
          laenge_meter: conn.laenge_meter,
          dimension: conn.dimension,
        },
      });
    });

    setNodes(newNodes);
    setEdges(newEdges);
  }, [configuration]);

  const openModal = (element) => {
    setSelectedElement(element);
    setModalOpen(true);
  };

  const openConnectionModal = (edgeId) => {
    const connection = (configuration?.connections || []).find(c => c.id === edgeId);
    if (connection) {
      setSelectedConnection(connection);
      setConnectionModalOpen(true);
    }
  };

  const handleSaveElement = (updatedElement) => {
    if (isBuilding(updatedElement)) {
      // Gebäude separat speichern
      setConfiguration({
        ...configuration,
        building: updatedElement,
      });
    } else {
      // Modul in Liste aktualisieren
      setConfiguration({
        ...configuration,
        modules: (configuration?.modules || []).map((m) =>
          m.id === updatedElement.id ? updatedElement : m
        ),
      });
    }
  };

  const handleCreateBuilding = () => {
    const building = createBuilding();
    setConfiguration({
      building, // Gebäude separat speichern
      modules: [],
      connections: [],
    });
  };

  const handleAddModule = (moduleTemplate) => {
    const moduleInstance = createModuleInstance(moduleTemplate);

    // Platziere in der Mitte der aktuellen Ansicht
    const viewport = reactFlowInstance.getViewport();
    const centerX = (window.innerWidth / 2 - viewport.x) / viewport.zoom;
    const centerY = (window.innerHeight / 2 - viewport.y) / viewport.zoom;

    moduleInstance.position = { x: centerX - 110, y: centerY - 60 }; // Zentriert am Modul

    setConfiguration({
      ...configuration,
      modules: [...(configuration?.modules || []), moduleInstance],
    });
  };

  const handleClearConfiguration = () => {
    if (confirm('Konfiguration wirklich löschen?')) {
      setConfiguration({
        building: null,
        modules: [],
        junctions: [],
        connections: [],
      });
    }
  };

  const handleDeleteModule = (moduleId) => {
    if (confirm('Modul wirklich löschen?')) {
      setConfiguration({
        ...configuration,
        modules: (configuration?.modules || []).filter((m) => m.id !== moduleId),
        connections: (configuration?.connections || []).filter(
          (c) => c.source !== moduleId && c.target !== moduleId
        ),
      });
    }
  };

  const handleAddJunction = () => {
    const junction = createJunction();

    // Platziere in der Mitte der aktuellen Ansicht
    const viewport = reactFlowInstance.getViewport();
    const centerX = (window.innerWidth / 2 - viewport.x) / viewport.zoom;
    const centerY = (window.innerHeight / 2 - viewport.y) / viewport.zoom;

    junction.position = { x: centerX - 12, y: centerY - 12 }; // Zentriert am Punkt

    setConfiguration({
      ...configuration,
      junctions: [...(configuration?.junctions || []), junction],
    });
  };

  const handleDeleteJunction = (junctionId) => {
    if (confirm('Knotenpunkt wirklich löschen?')) {
      setConfiguration({
        ...configuration,
        junctions: (configuration?.junctions || []).filter((j) => j.id !== junctionId),
        connections: (configuration?.connections || []).filter(
          (c) => c.source !== junctionId && c.target !== junctionId
        ),
      });
    }
  };

  const handleJunctionLabelChange = (junctionId, newLabel) => {
    setConfiguration({
      ...configuration,
      junctions: (configuration?.junctions || []).map((j) =>
        j.id === junctionId ? { ...j, label: newLabel } : j
      ),
    });
  };

  const handleSaveConnection = (updatedConnection) => {
    setConfiguration({
      ...configuration,
      connections: (configuration?.connections || []).map((c) =>
        c.id === updatedConnection.id ? updatedConnection : c
      ),
    });
  };

  const handleDeleteConnection = (connectionId) => {
    setConfiguration({
      ...configuration,
      connections: (configuration?.connections || []).filter((c) => c.id !== connectionId),
    });
  };

  // Handle neue Verbindung
  const handleConnect = useCallback(
    (params) => {
      const modules = configuration?.modules || [];
      const junctions = configuration?.junctions || [];
      const connections = configuration?.connections || [];

      const sourceModule = modules.find(m => m.id === params.source) ||
                          junctions.find(j => j.id === params.source) ||
                          (configuration?.building?.id === params.source ? configuration.building : null);
      const targetModule = modules.find(m => m.id === params.target) ||
                          junctions.find(j => j.id === params.target);

      if (!sourceModule || !targetModule) return;

      // Prüfe ob Input bereits verbunden ist
      const inputAlreadyConnected = connections.some(
        c => c.target === params.target && c.targetHandle === params.targetHandle
      );

      if (inputAlreadyConnected) {
        alert('Dieser Eingang ist bereits verbunden!');
        return;
      }

      // Prüfe Kompatibilität (aber erlaube trotzdem)
      const check = checkConnection(
        sourceModule,
        params.sourceHandle,
        targetModule,
        params.targetHandle
      );

      if (check.warning) {
        const proceed = confirm(
          `Warnung: ${check.reason}\n\nTrotzdem verbinden?`
        );
        if (!proceed) return;
      }

      // Füge Verbindung hinzu
      const newConnection = {
        id: `${params.source}-${params.sourceHandle}-${params.target}-${params.targetHandle}`,
        source: params.source,
        sourceHandle: params.sourceHandle,
        target: params.target,
        targetHandle: params.targetHandle,
      };

      setConfiguration({
        ...configuration,
        connections: [...connections, newConnection],
      });
    },
    [configuration, setConfiguration]
  );

  // Handle Verbindung löschen
  const handleEdgesDelete = useCallback(
    (edgesToDelete) => {
      const edgeIds = edgesToDelete.map(e => e.id);
      setConfiguration({
        ...configuration,
        connections: (configuration?.connections || []).filter(
          c => !edgeIds.includes(c.id)
        ),
      });
    },
    [configuration, setConfiguration]
  );

  // Handle Node-Position Update
  const handleNodesChange = useCallback(
    (changes) => {
      onNodesChange(changes);

      // Speichere Position nur wenn Dragging beendet ist (nicht während des Verschiebens)
      changes.forEach(change => {
        if (change.type === 'position' && change.position && change.dragging === false) {
          setConfiguration(prev => ({
            ...prev,
            modules: (prev?.modules || []).map(m =>
              m.id === change.id
                ? { ...m, position: change.position }
                : m
            ),
            junctions: (prev?.junctions || []).map(j =>
              j.id === change.id
                ? { ...j, position: change.position }
                : j
            ),
          }));
        }
      });
    },
    [onNodesChange, setConfiguration]
  );

  const hasBuilding = !!configuration?.building;

  return (
    <div style={{ display: 'flex', height: '100%', width: '100%', position: 'relative' }}>
      {/* Toolbar */}
      <div
        style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          zIndex: 10,
          display: 'flex',
          gap: '8px',
        }}
      >
        {!hasBuilding ? (
          <button
            onClick={handleCreateBuilding}
            style={{
              padding: '10px 16px',
              background: 'var(--accent)',
              color: 'var(--bg-primary)',
              border: 'none',
              borderRadius: '4px',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: '13px',
            }}
          >
            Neues Gebäude
          </button>
        ) : (
          <>
            <button
              onClick={() => openModal(configuration.building)}
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
              📋 {configuration.building?.name || 'Gebäude'} bearbeiten
            </button>
            <button
              onClick={handleClearConfiguration}
              style={{
                padding: '10px 16px',
                background: 'var(--error)',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: '13px',
              }}
            >
              Konfiguration löschen
            </button>
          </>
        )}
      </div>

      {/* React Flow Canvas */}
      <div style={{ flex: 1, position: 'relative' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={handleNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={handleConnect}
          onEdgesDelete={handleEdgesDelete}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView={nodes.length > 0}
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.3}
          maxZoom={2}
          deleteKeyCode="Delete"
        >
          <Background color="var(--border)" gap={16} />
          <Controls />
          <MiniMap
            style={{
              background: 'var(--bg-secondary)',
            }}
            nodeColor={(node) => {
              if (node.type === 'building') return 'var(--accent)';
              return 'var(--success)';
            }}
          />
        </ReactFlow>
        {/* Platzhalter wenn keine Module */}
        {hasBuilding && nodes.length === 0 && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              color: 'var(--text-secondary)',
              pointerEvents: 'none',
            }}
          >
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
            <div>Füge Module über die Sidebar hinzu</div>
          </div>
        )}
      </div>

      {/* Sidebar mit Modulen */}
      {hasBuilding && (
        <div
          style={{
            width: '300px',
            background: 'var(--bg-secondary)',
            borderLeft: '1px solid var(--border)',
            padding: '16px',
            overflowY: 'auto',
          }}
        >
          <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '14px' }}>
            Elemente hinzufügen
          </h3>

          {/* Knotenpunkt Button */}
          <button
            onClick={handleAddJunction}
            style={{
              width: '100%',
              padding: '10px',
              marginBottom: '16px',
              background: 'var(--accent)',
              color: 'var(--bg-primary)',
              border: 'none',
              borderRadius: '4px',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: '13px',
            }}
          >
            + Knotenpunkt
          </button>

          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '12px', fontWeight: 600 }}>
            MODULE
          </div>

          {moduleTemplates.map((template) => (
            <ModuleCard
              key={template.id}
              module={template}
              onAdd={() => handleAddModule(template)}
            />
          ))}
        </div>
      )}

      {/* Element Modal */}
      {modalOpen && (
        <ElementModal
          element={selectedElement}
          onClose={() => setModalOpen(false)}
          onSave={handleSaveElement}
          onDelete={() => {
            handleDeleteModule(selectedElement.id);
            setModalOpen(false);
          }}
        />
      )}

      {/* Connection Modal */}
      {connectionModalOpen && selectedConnection && (
        <ConnectionModal
          connection={selectedConnection}
          sourceModule={
            (configuration?.modules || []).find(m => m.id === selectedConnection.source) ||
            (configuration?.junctions || []).find(j => j.id === selectedConnection.source) ||
            configuration?.building
          }
          targetModule={
            (configuration?.modules || []).find(m => m.id === selectedConnection.target) ||
            (configuration?.junctions || []).find(j => j.id === selectedConnection.target)
          }
          onClose={() => setConnectionModalOpen(false)}
          onSave={handleSaveConnection}
          onDelete={() => {
            handleDeleteConnection(selectedConnection.id);
            setConnectionModalOpen(false);
          }}
        />
      )}

      {/* Hidden File Input für Import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleImportConfiguration}
        style={{ display: 'none' }}
      />
    </div>
  );
}

function ModuleCard({ module, onAdd }) {
  return (
    <div
      style={{
        background: 'var(--bg-tertiary)',
        border: '1px solid var(--border)',
        borderRadius: '4px',
        padding: '12px',
        marginBottom: '8px',
      }}
    >
      <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '4px' }}>
        {module.name}
      </div>
      <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
        {module.moduleType}
      </div>

      <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
        {module.inputs.length} Ein | {module.outputs.length} Aus
      </div>

      <button
        onClick={onAdd}
        style={{
          width: '100%',
          padding: '6px',
          background: 'var(--accent)',
          color: 'var(--bg-primary)',
          border: 'none',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: 600,
          cursor: 'pointer',
          fontFamily: 'inherit',
        }}
      >
        Hinzufügen
      </button>
    </div>
  );
}
