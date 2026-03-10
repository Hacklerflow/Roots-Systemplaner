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
export default function ConfiguratorEditor({ modules: moduleTemplates, configuration, setConfiguration, leitungskatalog, verbindungsartenkatalog, dimensionskatalog, modultypen, formulaskatalog, pumpenkatalog }) {
  return (
    <ReactFlowProvider>
      <ConfiguratorEditorInner
        modules={moduleTemplates}
        configuration={configuration}
        setConfiguration={setConfiguration}
        leitungskatalog={leitungskatalog}
        verbindungsartenkatalog={verbindungsartenkatalog}
        dimensionskatalog={dimensionskatalog}
        modultypen={modultypen}
        formulaskatalog={formulaskatalog}
        pumpenkatalog={pumpenkatalog}
      />
    </ReactFlowProvider>
  );
}

// Innere Komponente die useReactFlow verwenden kann
function ConfiguratorEditorInner({ modules: moduleTemplates, configuration, setConfiguration, leitungskatalog, verbindungsartenkatalog, dimensionskatalog, modultypen, formulaskatalog, pumpenkatalog }) {
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

      // Prüfe Kompatibilität
      const check = checkConnection(
        sourceModule,
        params.sourceHandle,
        targetModule,
        params.targetHandle
      );

      // Blockiere inkompatible Verbindungen
      if (!check.valid) {
        alert(`Verbindung nicht möglich:\n${check.reason}`);
        return;
      }

      // Füge Verbindung hinzu
      const newConnection = {
        id: `${params.source}-${params.sourceHandle}-${params.target}-${params.targetHandle}`,
        source: params.source,
        sourceHandle: params.sourceHandle,
        target: params.target,
        targetHandle: params.targetHandle,
        // Neue Felder für Druckverlust-Berechnung
        rohrlänge_m: null,         // Rohrlänge in Metern (vom User einzugeben)
        rohrdimension: null,       // z.B. "DN50" (vom User einzugeben)
        faktor: 1.4,               // Standard-Faktor (editierbar)
        druckverlust_m: null,      // Berechneter Druckverlust (cached)
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
    <div className="flex h-full w-full relative">
      {/* Toolbar */}
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        {!hasBuilding ? (
          <button
            onClick={handleCreateBuilding}
            className="px-4 py-2.5 bg-accent text-background font-semibold rounded cursor-pointer text-sm"
          >
            Neues Gebäude
          </button>
        ) : null}
      </div>

      {/* React Flow Canvas */}
      <div className="flex-1 relative">
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
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-foreground-secondary pointer-events-none">
            <div className="text-5xl mb-4">📦</div>
            <div>Füge Module über die Sidebar hinzu</div>
          </div>
        )}
      </div>

      {/* Sidebar mit Modulen */}
      {hasBuilding && (
        <div className="w-[300px] bg-background-secondary border-l border-border p-4 overflow-y-auto">
          <h3 className="mt-0 mb-4 text-sm">
            Elemente hinzufügen
          </h3>

          {/* Knotenpunkt Button */}
          <button
            onClick={handleAddJunction}
            className="w-full py-2.5 mb-4 bg-accent text-background rounded font-semibold cursor-pointer text-sm"
          >
            + Knotenpunkt
          </button>

          <div className="text-xs text-foreground-secondary mb-3 font-semibold">
            MODULE
          </div>

          {/* Module nach Type gruppieren */}
          {(() => {
            // Gruppiere Module nach moduleType
            const grouped = moduleTemplates.reduce((acc, template) => {
              const type = template.moduleType || 'Sonstige';
              if (!acc[type]) acc[type] = [];
              acc[type].push(template);
              return acc;
            }, {});

            // Rendere gruppiert
            return Object.entries(grouped).map(([type, templates]) => (
              <div key={type} className="mb-4">
                <div className="text-[10px] text-accent mb-1.5 font-semibold uppercase tracking-wider">
                  {type}
                </div>
                {templates.map((template) => (
                  <ModuleCard
                    key={template.id}
                    module={template}
                    onAdd={() => handleAddModule(template)}
                  />
                ))}
              </div>
            ));
          })()}
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
          leitungskatalog={leitungskatalog}
          verbindungsartenkatalog={verbindungsartenkatalog}
          dimensionskatalog={dimensionskatalog}
          modultypen={modultypen}
          pumpenkatalog={pumpenkatalog}
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
          leitungskatalog={leitungskatalog}
          verbindungsartenkatalog={verbindungsartenkatalog}
          formulaskatalog={formulaskatalog}
          onClose={() => setConnectionModalOpen(false)}
          onSave={handleSaveConnection}
          onDelete={() => {
            handleDeleteConnection(selectedConnection.id);
            setConnectionModalOpen(false);
          }}
        />
      )}
    </div>
  );
}

function ModuleCard({ module, onAdd }) {
  return (
    <div className="bg-background-tertiary border border-border rounded p-2 mb-1.5 flex items-center gap-2">
      <div className="flex-1">
        <div className="font-semibold text-xs mb-0.5">
          {module.name}
        </div>
        <div className="text-[10px] text-foreground-secondary">
          {module.moduleType}
        </div>
      </div>

      <button
        onClick={onAdd}
        className="w-8 h-8 p-0 bg-accent text-background rounded text-lg font-semibold cursor-pointer flex items-center justify-center"
      >
        +
      </button>
    </div>
  );
}
