import { useState } from 'react';
import { Handle, Position } from '@xyflow/react';

export default function JunctionNode({ data }) {
  const { label = '', onLabelChange } = data;
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(label);

  const handleClick = () => {
    setIsEditing(true);
    setEditValue(label);
  };

  const handleSave = () => {
    onLabelChange(editValue);
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditValue(label);
    }
  };

  // 4 Positionen für Handles (jeweils Input und Output)
  const handlePositions = [
    { position: Position.Top, id: 'top' },
    { position: Position.Right, id: 'right' },
    { position: Position.Bottom, id: 'bottom' },
    { position: Position.Left, id: 'left' },
  ];

  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '12px' }}>
      {/* Knotenpunkt (Punkt) */}
      <div
        onClick={handleClick}
        style={{
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          background: 'var(--accent)',
          border: '3px solid var(--bg-primary)',
          cursor: 'pointer',
          position: 'relative',
          boxShadow: '0 2px 8px rgba(0, 217, 255, 0.3)',
        }}
      >
        {/* Handles für alle 4 Richtungen */}
        {handlePositions.map(({ position, id }) => (
          <div key={id}>
            {/* Output Handle */}
            <Handle
              type="source"
              position={position}
              id={`${id}-out`}
              style={{
                background: 'var(--accent)',
                width: '10px',
                height: '10px',
                border: '2px solid var(--bg-primary)',
              }}
            />
            {/* Input Handle (gleiche Position) */}
            <Handle
              type="target"
              position={position}
              id={`${id}-in`}
              style={{
                background: 'var(--accent)',
                width: '10px',
                height: '10px',
                border: '2px solid var(--bg-primary)',
              }}
            />
          </div>
        ))}
      </div>

      {/* Label (rechts vom Punkt) */}
      {isEditing ? (
        <input
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          autoFocus
          placeholder="Beschriftung..."
          style={{
            padding: '4px 8px',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--accent)',
            borderRadius: '4px',
            color: 'var(--text-primary)',
            fontFamily: 'inherit',
            fontSize: '12px',
            minWidth: '100px',
          }}
        />
      ) : (
        label && (
          <div
            style={{
              fontSize: '12px',
              color: 'var(--text-primary)',
              fontWeight: 500,
              whiteSpace: 'nowrap',
            }}
          >
            {label}
          </div>
        )
      )}
    </div>
  );
}
