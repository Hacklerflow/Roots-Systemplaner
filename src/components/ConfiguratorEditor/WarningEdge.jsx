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
        {/* Warning Icon - nur bei Warnung */}
        {data.warning && (
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
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
