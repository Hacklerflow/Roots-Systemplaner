import { useState, useCallback, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import BuildingNode from './BuildingNode';
import ModuleNode from './ModuleNode';
import WarningEdge from './WarningEdge';
import ElementModal from './ElementModal';
import { createBuilding, createModuleInstance, isBuilding } from '../../data/types';
import { checkConnection, getEdgeStyle } from '../../data/compatibilityChecker';

const nodeTypes = {
  building: BuildingNode,
  module: ModuleNode,
};

const edgeTypes = {
  warning: WarningEdge,
};

export default function ConfiguratorEditor({ modules: moduleTemplates, configuration, setConfiguration }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedElement, setSelectedElement] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Synchronisiere configuration mit nodes/edges
  useEffect(() => {
    const newNodes = [];
    const newEdges = [];

    // Module zu Nodes konvertieren (inkl. Gebäude)
    configuration.modules.forEach((module, index) => {
      const isFirstModule = index === 0;
      const isBuildingModule = isBuilding(module);

      newNodes.push({
        id: module.id,
        type: isBuildingModule ? 'building' : 'module',
        position: module.position || {
          x: isFirstModule ? 50 : 300 + (index - 1) * 280,
          y: isFirstModule ? 200 : 200 + (index % 3) * 150,
        },
        data: {
          ...module,
          onClick: () => openModal(module),
        },
      });
    });

    // Connections zu Edges konvertieren
    configuration.connections.forEach((conn) => {
      const sourceModule = configuration.modules.find(m => m.id === conn.source);
      const targetModule = configuration.modules.find(m => m.id === conn.target);

      if (!sourceModule || !targetModule) return;

      // Prüfe Kompatibilität
      const check = checkConnection(
        sourceModule,
        conn.sourceHandle,
        targetModule,
        conn.targetHandle
      );

      // Ermittle connectionType vom Output
      const output = sourceModule.outputs?.find(o => o.id === conn.sourceHandle);
      const connectionType = output?.connectionType || 'hydraulic';

      newEdges.push({
        id: conn.id || `${conn.source}-${conn.sourceHandle}-${conn.target}-${conn.targetHandle}`,
        source: conn.source,
        sourceHandle: conn.sourceHandle,
        target: conn.target,
        targetHandle: conn.targetHandle,
        type: check.warning ? 'warning' : 'default',
        animated: !check.warning,
        style: getEdgeStyle(connectionType),
        data: {
          warning: check.warning,
          warningReason: check.reason,
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

  const handleSaveElement = (updatedElement) => {
    setConfiguration({
      ...configuration,
      modules: configuration.modules.map((m) =>
        m.id === updatedElement.id ? updatedElement : m
      ),
    });
  };

  const handleCreateBuilding = () => {
    const building = createBuilding();
    setConfiguration({
      modules: [building],
      connections: [],
    });
  };

  const handleAddModule = (moduleTemplate) => {
    const moduleInstance = createModuleInstance(moduleTemplate);
    setConfiguration({
      ...configuration,
      modules: [...configuration.modules, moduleInstance],
    });
  };

  const handleClearConfiguration = () => {
    if (confirm('Konfiguration wirklich löschen?')) {
      setConfiguration({
        modules: [],
        connections: [],
      });
    }
  };

  const handleDeleteModule = (moduleId) => {
    if (confirm('Modul wirklich löschen?')) {
      setConfiguration({
        ...configuration,
        modules: configuration.modules.filter((m) => m.id !== moduleId),
        connections: configuration.connections.filter(
          (c) => c.source !== moduleId && c.target !== moduleId
        ),
      });
    }
  };

  // Handle neue Verbindung
  const handleConnect = useCallback(
    (params) => {
      const sourceModule = configuration.modules.find(m => m.id === params.source);
      const targetModule = configuration.modules.find(m => m.id === params.target);

      if (!sourceModule || !targetModule) return;

      // Prüfe ob Input bereits verbunden ist
      const inputAlreadyConnected = configuration.connections.some(
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
        connections: [...configuration.connections, newConnection],
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
        connections: configuration.connections.filter(
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

      // Speichere Position in configuration
      changes.forEach(change => {
        if (change.type === 'position' && change.position) {
          setConfiguration(prev => ({
            ...prev,
            modules: prev.modules.map(m =>
              m.id === change.id
                ? { ...m, position: change.position }
                : m
            ),
          }));
        }
      });
    },
    [onNodesChange, setConfiguration]
  );

  const hasBuilding = configuration.modules.some(m => isBuilding(m));

  return (
    <div style={{ display: 'flex', height: '100%', position: 'relative' }}>
      {/* Toolbar */}
      <div
        style={{
          position: 'absolute',
          top: '16px',
          left: '16px',
          zIndex: 10,
          display: 'flex',
          gap: '8px',
        }}
      >
        <button
          onClick={handleCreateBuilding}
          disabled={hasBuilding}
          style={{
            padding: '10px 16px',
            background: hasBuilding ? 'var(--bg-tertiary)' : 'var(--accent)',
            color: hasBuilding ? 'var(--text-secondary)' : 'var(--bg-primary)',
            border: 'none',
            borderRadius: '4px',
            fontWeight: 600,
            cursor: hasBuilding ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit',
            fontSize: '13px',
          }}
        >
          {hasBuilding ? 'Gebäude vorhanden' : 'Neues Gebäude'}
        </button>

        {hasBuilding && (
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
        )}
      </div>

      {/* React Flow Canvas */}
      <div style={{ flex: 1 }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={handleNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={handleConnect}
          onEdgesDelete={handleEdgesDelete}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
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
            Module hinzufügen
          </h3>

          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
            Ziehe eine Verbindung von einem Ausgang zu einem Eingang
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

      {/* Modal */}
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
