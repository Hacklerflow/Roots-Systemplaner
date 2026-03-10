import { Handle, Position } from '@xyflow/react';
import { getConnectionTypeColor } from '../../data/compatibilityChecker';
import { cn } from '@/lib/utils';

export default function ModuleNode({ data }) {
  const { name, moduleType, properties, inputs = [], outputs = [], onClick } = data;

  // Check if module has any enabled pumps
  const hasPump = outputs.some(output => output.pump?.enabled && output.pump?.förderhoehe_m > 0);

  // Subtitle erstellen
  let subtitle = moduleType || 'Modul';
  if (properties?.leistung_nominal_kw) {
    subtitle += ` | ${properties.leistung_nominal_kw} kW`;
  } else if (properties?.volumen_liter) {
    subtitle += ` | ${properties.volumen_liter} L`;
  }

  return (
    <div
      className="bg-background-secondary border-2 border-success rounded-md p-2.5 min-w-[160px] min-h-[80px] cursor-pointer relative"
      onClick={onClick}
    >
      {/* Modul-Info */}
      <div className="font-semibold text-[13px] mb-0.5">
        {name}
      </div>
      <div className={cn(
        "text-[10px] text-foreground-secondary",
        hasPump ? "mb-1" : "mb-0"
      )}>
        {subtitle}
      </div>

      {/* Pump Badge */}
      {hasPump && (
        <div className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-accent text-background rounded-[10px] text-[9px] font-semibold">
          <span>💧</span>
          <span>PUMPE</span>
        </div>
      )}

      {/* Eingänge - Handles */}
      {inputs.map((input, index) => {
        const total = inputs.length;
        const yOffset = total === 1 ? 50 : (100 / (total + 1)) * (index + 1);

        return (
          <div key={input.id}>
            <Handle
              type="target"
              position={Position.Left}
              id={input.id}
              style={{
                top: `${yOffset}%`,
                background: getConnectionTypeColor(input.connectionType),
                width: '10px',
                height: '10px',
                border: '2px solid var(--bg-primary)',
              }}
            />
            {input.label && input.label.trim() !== '' && (
              <div
                className="absolute -left-8 text-[9px] font-semibold text-foreground bg-black/50 px-1 py-0.5 rounded-[3px] whitespace-nowrap pointer-events-none font-mono uppercase"
                style={{
                  top: `calc(${yOffset}% - 8px)`,
                }}
              >
                {input.label}
              </div>
            )}
          </div>
        );
      })}

      {/* Ausgänge - Handles */}
      {outputs.map((output, index) => {
        const total = outputs.length;
        const yOffset = total === 1 ? 50 : (100 / (total + 1)) * (index + 1);

        return (
          <div key={output.id}>
            <Handle
              type="source"
              position={Position.Right}
              id={output.id}
              style={{
                top: `${yOffset}%`,
                background: getConnectionTypeColor(output.connectionType),
                width: '10px',
                height: '10px',
                border: '2px solid var(--bg-primary)',
              }}
            />
            {output.label && output.label.trim() !== '' && (
              <div
                className="absolute -right-8 text-[9px] font-semibold text-foreground bg-black/50 px-1 py-0.5 rounded-[3px] whitespace-nowrap pointer-events-none font-mono uppercase"
                style={{
                  top: `calc(${yOffset}% - 8px)`,
                }}
              >
                {output.label}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
