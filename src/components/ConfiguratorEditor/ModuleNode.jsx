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
        borderRadius: '8px',
        padding: '16px',
        minWidth: '220px',
        minHeight: '120px',
        cursor: 'pointer',
        position: 'relative',
      }}
    >
      {/* Modul-Info */}
      <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>
        {name}
      </div>
      <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
        {subtitle}
      </div>

      {/* Info über Ein-/Ausgänge */}
      <div style={{ marginTop: '8px', fontSize: '10px', color: 'var(--text-secondary)' }}>
        {inputs.length} Ein | {outputs.length} Aus
      </div>

      {/* Eingänge - Handles */}
      {inputs.map((input, index) => {
        const total = inputs.length;
        const yOffset = total === 1 ? 50 : (100 / (total + 1)) * (index + 1);

        return (
          <Handle
            key={input.id}
            type="target"
            position={Position.Left}
            id={input.id}
            style={{
              top: `${yOffset}%`,
              background: getConnectionTypeColor(input.connectionType),
              width: '12px',
              height: '12px',
              border: '2px solid var(--bg-primary)',
            }}
          />
        );
      })}

      {/* Eingänge - Labels */}
      {inputs.map((input, index) => {
        const total = inputs.length;
        const yOffset = total === 1 ? 50 : (100 / (total + 1)) * (index + 1);

        return (
          <div
            key={`label-${input.id}`}
            style={{
              position: 'absolute',
              left: '20px',
              top: `calc(${yOffset}% - 8px)`,
              fontSize: '10px',
              color: 'var(--text-secondary)',
              pointerEvents: 'none',
            }}
          >
            {input.label}
          </div>
        );
      })}

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

      {/* Ausgänge - Labels */}
      {outputs.map((output, index) => {
        const total = outputs.length;
        const yOffset = total === 1 ? 50 : (100 / (total + 1)) * (index + 1);

        return (
          <div
            key={`label-${output.id}`}
            style={{
              position: 'absolute',
              right: '20px',
              top: `calc(${yOffset}% - 8px)`,
              fontSize: '10px',
              color: 'var(--text-secondary)',
              pointerEvents: 'none',
            }}
          >
            {output.label}
          </div>
        );
      })}
    </div>
  );
}
