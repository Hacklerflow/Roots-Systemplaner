import { Handle, Position } from '@xyflow/react';
import { getConnectionTypeColor } from '../../data/compatibilityChecker';

export default function ModuleNode({ data }) {
  const { name, moduleType, properties, inputs = [], outputs = [], onClick } = data;

  // Subtitle erstellen
  let subtitle = moduleType || 'Modul';
  if (properties?.leistung_nominal_kw) {
    subtitle += ` | ${properties.leistung_nominal_kw} kW`;
  } else if (properties?.volumen_liter) {
    subtitle += ` | ${properties.volumen_liter} L`;
  }

  return (
    <div
      className="module-node"
      onClick={onClick}
      style={{
        background: 'var(--bg-secondary)',
        border: '2px solid var(--success)',
        borderRadius: '6px',
        padding: '10px',
        minWidth: '160px',
        minHeight: '80px',
        cursor: 'pointer',
        position: 'relative',
      }}
    >
      {/* Modul-Info */}
      <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '2px' }}>
        {name}
      </div>
      <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>
        {subtitle}
      </div>

      {/* Eingänge - Handles */}
      {inputs.map((input, index) => {
        const total = inputs.length;
        const yOffset = total === 1 ? 50 : (100 / (total + 1)) * (index + 1);

        return (
          <div key={input.id}>
            <Handle
              type="target"
              position={Position.Left}
              id={input.id}
              style={{
                top: `${yOffset}%`,
                background: getConnectionTypeColor(input.connectionType),
                width: '10px',
                height: '10px',
                border: '2px solid var(--bg-primary)',
              }}
            />
            {input.label && (
              <div
                style={{
                  position: 'absolute',
                  left: '14px',
                  top: `calc(${yOffset}% - 6px)`,
                  fontSize: '7px',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  whiteSpace: 'nowrap',
                  pointerEvents: 'none',
                  fontFamily: 'monospace',
                  textTransform: 'uppercase',
                }}
              >
                {input.label}
              </div>
            )}
          </div>
        );
      })}

      {/* Ausgänge - Handles */}
      {outputs.map((output, index) => {
        const total = outputs.length;
        const yOffset = total === 1 ? 50 : (100 / (total + 1)) * (index + 1);

        return (
          <div key={output.id}>
            <Handle
              type="source"
              position={Position.Right}
              id={output.id}
              style={{
                top: `${yOffset}%`,
                background: getConnectionTypeColor(output.connectionType),
                width: '10px',
                height: '10px',
                border: '2px solid var(--bg-primary)',
              }}
            />
            {output.label && (
              <div
                style={{
                  position: 'absolute',
                  right: '14px',
                  top: `calc(${yOffset}% - 6px)`,
                  fontSize: '7px',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  whiteSpace: 'nowrap',
                  pointerEvents: 'none',
                  fontFamily: 'monospace',
                  textTransform: 'uppercase',
                }}
              >
                {output.label}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
