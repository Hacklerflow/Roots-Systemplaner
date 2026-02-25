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

  return (
    <>
      <BaseEdge id={id} path={edgePath} style={style} />

      {data.warning && (
        <EdgeLabelRenderer>
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
              pointerEvents: 'all',
              cursor: 'help',
            }}
            title={data.warningReason || 'Warnung'}
          >
            ⚠️
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
