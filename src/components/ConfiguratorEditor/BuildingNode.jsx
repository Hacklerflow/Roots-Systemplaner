import { Handle, Position } from '@xyflow/react';
import { getConnectionTypeColor } from '../../data/compatibilityChecker';

export default function BuildingNode({ data }) {
  const { name, outputs = [], onClick } = data;

  return (
    <div
      className="building-node"
      onClick={onClick}
      style={{
        background: 'var(--bg-secondary)',
        border: '2px solid var(--accent)',
        borderRadius: '8px',
        padding: '16px',
        minWidth: '200px',
        minHeight: '100px',
        cursor: 'pointer',
        position: 'relative',
      }}
    >
      <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>
        {name}
      </div>
      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
        Gebäude
      </div>

      {/* Ausgänge - Handles */}
      {outputs.map((output, index) => {
        const total = outputs.length;
        const yOffset = total === 1 ? 50 : (100 / (total + 1)) * (index + 1);

        return (
          <Handle
            key={output.id}
            type="source"
            position={Position.Right}
            id={output.id}
            style={{
              top: `${yOffset}%`,
              background: getConnectionTypeColor(output.connectionType),
              width: '12px',
              height: '12px',
              border: '2px solid var(--bg-primary)',
            }}
          />
        );
      })}
    </div>
  );
}
