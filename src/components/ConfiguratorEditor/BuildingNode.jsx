import { Handle, Position } from '@xyflow/react';

export default function BuildingNode({ data }) {
  const { name, capabilities, onClick } = data;

  // Subtitle erstellen
  const subtitle = capabilities?.heizlast_kw
    ? `${capabilities.heizlast_kw} kW Heizlast`
    : 'Keine Heizlast definiert';

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
        cursor: 'pointer',
      }}
    >
      <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>
        {name}
      </div>
      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
        {subtitle}
      </div>

      <div style={{ marginTop: '12px', fontSize: '11px', color: 'var(--text-secondary)' }}>
        {capabilities?.tiefenbohrung_vorhanden && <div>✓ Tiefenbohrung</div>}
        {capabilities?.kellerfläche && <div>✓ Kellerfläche</div>}
        {capabilities?.dachfläche && <div>✓ Dachfläche</div>}
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
