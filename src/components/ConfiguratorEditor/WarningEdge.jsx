import { BaseEdge, EdgeLabelRenderer, getBezierPath } from '@xyflow/react';

export default function WarningEdge({
  id,
  sourceX,
  sourceY,
  sourcePosition,
  targetX,
  targetY,
  targetPosition,
  style = {},
  data = {},
}) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const handleClick = (e) => {
    e.stopPropagation();
    if (data.onClick) {
      data.onClick(id);
    }
  };

  // Connection properties (Länge und Dimension)
  const laenge = data.laenge_meter;
  const dimension = data.dimension;
  const hasProperties = laenge || dimension;

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          ...style,
          cursor: 'pointer',
          strokeWidth: style.strokeWidth || 3,
        }}
      />
      {/* Invisible wider path for easier clicking */}
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth="50"
        style={{ cursor: 'pointer', pointerEvents: 'stroke' }}
        onClick={handleClick}
      />

      <EdgeLabelRenderer>
        {/* Länge und Dimension - direkt auf der Linie */}
        {hasProperties && (
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              background: 'rgba(0, 0, 0, 0.5)',
              color: 'var(--text-primary)',
              padding: '2px 4px',
              borderRadius: '3px',
              fontSize: '9px',
              fontWeight: 600,
              pointerEvents: 'none',
              whiteSpace: 'nowrap',
              fontFamily: 'monospace',
              display: 'flex',
              gap: '8px',
            }}
          >
            {laenge && <span>{laenge} m</span>}
            {laenge && dimension && <span>|</span>}
            {dimension && <span>{dimension}</span>}
          </div>
        )}

        {/* Warning Icon - unter den Properties */}
        {data.warning && (
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY + (hasProperties ? 20 : 0)}px)`,
              background: 'var(--bg-secondary)',
              border: '2px solid var(--error)',
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              pointerEvents: 'none',
            }}
            title={data.warningReason || 'Warnung'}
          >
            ⚠️
          </div>
        )}
      </EdgeLabelRenderer>
    </>
  );
}
