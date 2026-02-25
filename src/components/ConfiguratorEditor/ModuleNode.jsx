import { Handle, Position } from '@xyflow/react';

export default function ModuleNode({ data }) {
  const { name, properties, capabilities, onClick, isCompatible = true } = data;

  // Subtitle erstellen
  let subtitle = '';
  if (properties?.leistung_nominal_kw) {
    subtitle = `${properties.leistung_nominal_kw} kW`;
  } else if (properties?.volumen_liter) {
    subtitle = `${properties.volumen_liter} L`;
  } else if (properties?.kollektorfläche_m2) {
    subtitle = `${properties.kollektorfläche_m2} m²`;
  }

  return (
    <div
      className="module-node"
      onClick={onClick}
      style={{
        background: 'var(--bg-secondary)',
        border: `2px solid ${isCompatible ? 'var(--success)' : 'var(--error)'}`,
        borderRadius: '8px',
        padding: '16px',
        minWidth: '200px',
        cursor: 'pointer',
        opacity: isCompatible ? 1 : 0.6,
      }}
    >
      <Handle
        type="target"
        position={Position.Left}
        style={{
          background: 'var(--accent)',
          width: '12px',
          height: '12px',
        }}
      />

      <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>
        {name}
      </div>
      {subtitle && (
        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
          {subtitle}
        </div>
      )}

      <div style={{ marginTop: '12px', fontSize: '11px', color: 'var(--text-secondary)' }}>
        {properties?.modultyp && <div>Typ: {properties.modultyp}</div>}
        {capabilities?.wärmequelle_vorhanden && <div>✓ Wärmequelle</div>}
        {capabilities?.verfuegbare_leistung_kw && (
          <div>⚡ {capabilities.verfuegbare_leistung_kw} kW</div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        style={{
          background: 'var(--accent)',
          width: '12px',
          height: '12px',
        }}
      />
    </div>
  );
}
