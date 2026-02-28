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

  // Labels für Ausgang und Eingang
  const sourceLabel = data.sourceLabel || '';
  const targetLabel = data.targetLabel || '';

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
        strokeWidth="20"
        style={{ cursor: 'pointer', pointerEvents: 'stroke' }}
        onClick={handleClick}
      />

      <EdgeLabelRenderer>
        {/* Source Label (Ausgang) - fester Abstand von 40px zum Modul */}
        {sourceLabel && (
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${sourceX + 40}px, ${sourceY - 20}px)`,
              background: '#000000',
              color: 'var(--text-primary)',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: 500,
              pointerEvents: 'none',
              whiteSpace: 'nowrap',
              border: '1px solid var(--border)',
            }}
          >
            {sourceLabel}
          </div>
        )}

        {/* Target Label (Eingang) - fester Abstand von 40px zum Modul */}
        {targetLabel && (
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${targetX - 40}px, ${targetY - 20}px)`,
              background: '#000000',
              color: 'var(--text-primary)',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: 500,
              pointerEvents: 'none',
              whiteSpace: 'nowrap',
              border: '1px solid var(--border)',
            }}
          >
            {targetLabel}
          </div>
        )}

        {/* Länge und Dimension - in der Mitte */}
        {hasProperties && (
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY - 20}px)`,
              background: '#000000',
              color: 'var(--text-primary)',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: 500,
              pointerEvents: 'none',
              whiteSpace: 'nowrap',
              border: '1px solid var(--border)',
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
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY + (hasProperties ? 10 : 0)}px)`,
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
