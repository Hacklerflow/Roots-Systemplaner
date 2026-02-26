import { BaseEdge, EdgeLabelRenderer, getBezierPath, useReactFlow } from '@xyflow/react';

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
  const { setEdges } = useReactFlow();

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const handleDelete = (e) => {
    e.stopPropagation();
    setEdges((edges) => edges.filter((edge) => edge.id !== id));
  };

  return (
    <>
      <BaseEdge id={id} path={edgePath} style={style} />

      <EdgeLabelRenderer>
        {/* Delete Button - immer sichtbar */}
        <button
          onClick={handleDelete}
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
            fontSize: '12px',
            fontWeight: 'bold',
            pointerEvents: 'all',
            cursor: 'pointer',
            color: 'var(--error)',
            padding: 0,
          }}
          title="Verbindung löschen (oder Delete-Taste)"
        >
          ✕
        </button>

        {/* Warning Icon - nur bei Warnung */}
        {data.warning && (
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX + 30}px, ${labelY}px)`,
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
        )}
      </EdgeLabelRenderer>
    </>
  );
}
