import { useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Input } from '@/components/ui/input';

export default function JunctionNode({ data }) {
  const { label = '', onLabelChange, onDelete } = data;
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(label);
  const [isHovered, setIsHovered] = useState(false);

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
    <div
      className="relative flex items-center gap-3"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Knotenpunkt (Punkt) */}
      <div
        onClick={handleClick}
        className="w-6 h-6 rounded-full bg-accent border-[3px] border-background cursor-pointer relative shadow-[0_2px_8px_rgba(0,217,255,0.3)]"
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

        {/* Delete Button (erscheint bei Hover) */}
        {isHovered && onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-destructive border-2 border-background text-white cursor-pointer flex items-center justify-center text-[10px] font-bold p-0 z-10"
            title="Knotenpunkt löschen"
          >
            ×
          </button>
        )}
      </div>

      {/* Label (rechts vom Punkt) */}
      {isEditing ? (
        <Input
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          autoFocus
          placeholder="Beschriftung..."
          className="px-2 py-1 bg-background-secondary border-accent text-xs min-w-[100px] h-auto"
        />
      ) : (
        label && (
          <div className="text-xs text-foreground font-medium whitespace-nowrap">
            {label}
          </div>
        )
      )}
    </div>
  );
}
