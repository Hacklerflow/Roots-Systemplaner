import { useState, useCallback, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import BuildingNode from './BuildingNode';
import ModuleNode from './ModuleNode';
import ElementModal from './ElementModal';
import { createBuilding, createModuleInstance } from '../../data/types';
import { checkCompatibility, getCompatibleModules } from '../../data/compatibilityChecker';

const nodeTypes = {
  building: BuildingNode,
  module: ModuleNode,
};

export default function ConfiguratorEditor({ modules, configuration, setConfiguration }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedElement, setSelectedElement] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Synchronisiere configuration mit nodes/edges
  useEffect(() => {
    const newNodes = [];
    const newEdges = [];

    if (configuration.building) {
      newNodes.push({
        id: configuration.building.id,
        type: 'building',
        position: { x: 50, y: 200 },
        data: {
          ...configuration.building,
          onClick: () => openModal(configuration.building),
        },
      });
    }

    configuration.chain.forEach((module, index) => {
      newNodes.push({
        id: module.id,
        type: 'module',
        position: { x: 350 + index * 300, y: 200 },
        data: {
          ...module,
          onClick: () => openModal(module),
        },
      });

      // Edge zum vorherigen Element
      const sourceId =
        index === 0
          ? configuration.building?.id
          : configuration.chain[index - 1]?.id;

      if (sourceId) {
        newEdges.push({
          id: `${sourceId}-${module.id}`,
          source: sourceId,
          target: module.id,
          animated: true,
          style: { stroke: 'var(--accent)' },
        });
      }
    });

    setNodes(newNodes);
    setEdges(newEdges);
  }, [configuration]);

  const openModal = (element) => {
    setSelectedElement(element);
    setModalOpen(true);
  };

  const handleSaveElement = (updatedElement) => {
    if (updatedElement.type === 'building') {
      setConfiguration({
        ...configuration,
        building: updatedElement,
      });
    } else {
      setConfiguration({
        ...configuration,
        chain: configuration.chain.map((m) =>
          m.id === updatedElement.id ? updatedElement : m
        ),
      });
    }
  };

  const handleCreateBuilding = () => {
    const building = createBuilding();
    setConfiguration({
      building,
      chain: [],
    });
  };

  const handleAddModule = (moduleTemplate) => {
    if (!configuration.building) {
      alert('Bitte erst ein Gebäude erstellen.');
      return;
    }

    // Prüfe Kompatibilität
    const lastElement =
      configuration.chain.length > 0
        ? configuration.chain[configuration.chain.length - 1]
        : configuration.building;

    const check = checkCompatibility(lastElement, moduleTemplate);

    if (!check.compatible) {
      alert(
        `Modul nicht kompatibel:\n${check.missingRequirements.join('\n')}`
      );
      return;
    }

    const moduleInstance = createModuleInstance(moduleTemplate);
    setConfiguration({
      ...configuration,
      chain: [...configuration.chain, moduleInstance],
    });
  };

  const handleClearConfiguration = () => {
    if (confirm('Konfiguration wirklich löschen?')) {
      setConfiguration({
        building: null,
        chain: [],
      });
    }
  };

  const handleDeleteNode = (nodeId) => {
    if (nodeId === configuration.building?.id) {
      handleClearConfiguration();
    } else {
      // Entferne Modul und alle nachfolgenden Module
      const index = configuration.chain.findIndex((m) => m.id === nodeId);
      if (index !== -1) {
        setConfiguration({
          ...configuration,
          chain: configuration.chain.slice(0, index),
        });
      }
    }
  };

  // Hole kompatible und inkompatible Module
  const lastElement =
    configuration.chain.length > 0
      ? configuration.chain[configuration.chain.length - 1]
      : configuration.building;

  const { compatible, incompatible } = lastElement
    ? getCompatibleModules(lastElement, modules)
    : { compatible: [], incompatible: [] };

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
          disabled={!!configuration.building}
          style={{
            padding: '10px 16px',
            background: configuration.building ? 'var(--bg-tertiary)' : 'var(--accent)',
            color: configuration.building ? 'var(--text-secondary)' : 'var(--bg-primary)',
            border: 'none',
            borderRadius: '4px',
            fontWeight: 600,
            cursor: configuration.building ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit',
            fontSize: '13px',
          }}
        >
          {configuration.building ? 'Gebäude vorhanden' : 'Neues Gebäude'}
        </button>

        {configuration.building && (
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
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          minZoom={0.5}
          maxZoom={2}
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
      {configuration.building && (
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
            Verfügbare Module
          </h3>

          {/* Kompatible Module */}
          {compatible.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '12px', color: 'var(--success)', marginBottom: '8px' }}>
                ✓ Kompatibel
              </div>
              {compatible.map(({ module }) => (
                <ModuleCard
                  key={module.id}
                  module={module}
                  compatible={true}
                  onAdd={() => handleAddModule(module)}
                />
              ))}
            </div>
          )}

          {/* Inkompatible Module */}
          {incompatible.length > 0 && (
            <div>
              <div style={{ fontSize: '12px', color: 'var(--error)', marginBottom: '8px' }}>
                ✗ Nicht kompatibel
              </div>
              {incompatible.map(({ module, check }) => (
                <ModuleCard
                  key={module.id}
                  module={module}
                  compatible={false}
                  reason={check.missingRequirements.join(', ')}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <ElementModal
          element={selectedElement}
          onClose={() => setModalOpen(false)}
          onSave={handleSaveElement}
        />
      )}
    </div>
  );
}

function ModuleCard({ module, compatible, onAdd, reason }) {
  return (
    <div
      style={{
        background: 'var(--bg-tertiary)',
        border: `1px solid ${compatible ? 'var(--success)' : 'var(--error)'}`,
        borderRadius: '4px',
        padding: '12px',
        marginBottom: '8px',
        opacity: compatible ? 1 : 0.5,
      }}
      title={!compatible ? `Grund: ${reason}` : ''}
    >
      <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '4px' }}>
        {module.name}
      </div>
      <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
        {module.properties?.modultyp}
      </div>

      {compatible && onAdd && (
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
      )}

      {!compatible && reason && (
        <div
          style={{
            fontSize: '10px',
            color: 'var(--error)',
            marginTop: '8px',
          }}
        >
          {reason}
        </div>
      )}
    </div>
  );
}
