import { useState } from 'react';
import { checkConnection } from '../../data/compatibilityChecker';
import { CONNECTION_TYPE_LABELS } from '../../data/types';

export default function ListView({ configuration, setConfiguration, modultypen = [] }) {
  const { modules = [], connections = [] } = configuration || {};

  if (!modules || modules.length === 0) {
    return (
      <div className="p-6 text-center text-foreground-secondary">
        Keine Konfiguration vorhanden. Erstelle zuerst Module im Konfigurator.
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1200px] mx-auto min-h-full">
      <h2 className="mt-0 mb-6">System-Übersicht</h2>

      {/* Module */}
      {modules.length > 0 && (
        <Section title="Module">
          {modules.map((module) => (
            <ModuleCard
              key={module.id}
              module={module}
              modultypen={modultypen}
              onUpdateModule={(updatedModule) => {
                setConfiguration({
                  ...configuration,
                  modules: modules.map(m => m.id === updatedModule.id ? updatedModule : m),
                });
              }}
            />
          ))}
        </Section>
      )}

      {/* Verbindungen */}
      <Section title="Verbindungen">
        {connections.length === 0 ? (
          <div className="text-sm text-foreground-secondary p-3">
            Keine Verbindungen vorhanden
          </div>
        ) : (
          connections.map((conn, index) => {
            const sourceModule = modules.find(m => m.id === conn.source);
            const targetModule = modules.find(m => m.id === conn.target);

            if (!sourceModule || !targetModule) return null;

            const check = checkConnection(
              sourceModule,
              conn.sourceHandle,
              targetModule,
              conn.targetHandle
            );

            const output = sourceModule.outputs?.find(o => o.id === conn.sourceHandle);
            const input = targetModule.inputs?.find(i => i.id === conn.targetHandle);

            return (
              <ConnectionCard
                key={conn.id || index}
                connection={conn}
                sourceModule={sourceModule}
                targetModule={targetModule}
                output={output}
                input={input}
                check={check}
              />
            );
          })
        )}
      </Section>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="mb-8">
      <h3 className="text-base font-semibold mb-4 text-accent uppercase tracking-wider">
        {title}
      </h3>
      <div>{children}</div>
    </div>
  );
}

function ModuleCard({ module, modultypen = [], onUpdateModule }) {
  const [expanded, setExpanded] = useState(false);

  // Find module type info
  const moduleTypeInfo = modultypen?.find(t => t.name === module.moduleType);
  const isProEinheit = moduleTypeInfo?.berechnungsart === 'pro_einheit';
  const einheit = moduleTypeInfo?.einheit || '';

  // Check for pumps
  const pumps = (module.outputs || []).filter(output => output.pump?.enabled && output.pump?.förderhoehe_m > 0);
  const hasPumps = pumps.length > 0;

  const handleMengeChange = (newMenge) => {
    if (onUpdateModule) {
      onUpdateModule({
        ...module,
        properties: {
          ...module.properties,
          menge: newMenge,
        },
      });
    }
  };

  return (
    <div className="bg-background-secondary border-2 border-success rounded-lg mb-3">
      {/* Header */}
      <div
        onClick={() => setExpanded(!expanded)}
        className="p-4 cursor-pointer flex justify-between items-center"
      >
        <div>
          <div className="font-semibold text-base mb-1 flex items-center gap-2">
            {module.name}
            {hasPumps && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-accent text-background rounded-full text-[9px] font-semibold">
                💧 PUMPE
              </span>
            )}
          </div>
          <div className="text-xs text-foreground-secondary">
            {module.moduleType} | {(module.inputs || []).length} Ein | {(module.outputs || []).length} Aus
            {hasPumps && ` | ${pumps.length} Pumpe${pumps.length > 1 ? 'n' : ''}`}
          </div>
        </div>
        <div className="text-lg text-foreground-secondary">
          {expanded ? '−' : '+'}
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-border">
          {/* Produktlink Button */}
          {module.properties?.produktlink && (
            <div className="mt-4 mb-4">
              <a
                href={module.properties.produktlink}
                target="_blank"
                rel="noopener noreferrer"
                className="no-underline"
              >
                <button className="px-4 py-2.5 bg-accent text-background rounded font-semibold cursor-pointer text-sm w-full">
                  🔗 Produktlink
                </button>
              </a>
            </div>
          )}

          {/* Eigenschaften */}
          {Object.keys(module.properties || {}).filter(key => key !== 'produktlink').length > 0 && (
            <DetailSection title="Eigenschaften">
              {/* Menge field for pro_einheit modules */}
              {isProEinheit && (
                <div className="flex justify-between py-1.5 text-sm border-b border-border items-center">
                  <span className="text-foreground-secondary">Menge ({einheit}):</span>
                  <input
                    type="number"
                    step="0.01"
                    value={module.properties?.menge ?? ''}
                    onChange={(e) => handleMengeChange(e.target.value ? parseFloat(e.target.value) : null)}
                    className="w-[100px] px-2 py-1 bg-background-tertiary border border-border rounded text-foreground text-sm font-medium"
                  />
                </div>
              )}

              {/* Other properties */}
              {Object.entries(module.properties)
                .filter(([key]) => key !== 'produktlink' && !(key === 'menge' && isProEinheit))
                .map(([key, value]) => {
                  let label = formatLabel(key);
                  let displayValue = value;

                  // Dynamic label for preis_euro
                  if (key === 'preis_euro') {
                    if (isProEinheit) {
                      label = `Preis pro ${einheit} (€)`;
                    } else {
                      label = 'Preis (€)';
                    }
                  }

                  return <Property key={key} label={label} value={displayValue} />;
                })}

              {/* Calculated total price for pro_einheit modules */}
              {isProEinheit && module.properties?.menge && module.properties?.preis_euro && (
                <div className="flex justify-between py-1.5 text-sm border-b border-border bg-background-tertiary mt-1 px-2 rounded">
                  <span className="text-accent font-semibold">Gesamtpreis (€):</span>
                  <span className="text-accent font-semibold">
                    {(module.properties.menge * module.properties.preis_euro).toFixed(2)}
                  </span>
                </div>
              )}
            </DetailSection>
          )}

          {/* Eingänge */}
          {(module.inputs || []).length > 0 && (
            <DetailSection title="Eingänge">
              {(module.inputs || []).map((input, idx) => (
                <div
                  key={input.id}
                  className="p-2 bg-background-tertiary rounded mb-1.5"
                >
                  <div className="text-sm font-medium">
                    {input.label || `Eingang ${idx + 1}`}
                  </div>
                  <div className="text-xs text-foreground-secondary mt-1">
                    Typ: {CONNECTION_TYPE_LABELS[input.connectionType]}
                    {(input.allowedModuleTypes || []).length > 0 && (
                      <div>Erlaubt: {(input.allowedModuleTypes || []).join(', ')}</div>
                    )}
                  </div>
                </div>
              ))}
            </DetailSection>
          )}

          {/* Ausgänge */}
          {(module.outputs || []).length > 0 && (
            <DetailSection title="Ausgänge">
              {(module.outputs || []).map((output, idx) => (
                <div
                  key={output.id}
                  className={`p-2 rounded mb-1.5 ${
                    output.pump?.enabled
                      ? 'bg-[rgba(46,160,67,0.1)] border border-accent'
                      : 'bg-background-tertiary'
                  }`}
                >
                  <div className="text-sm font-medium flex items-center gap-1.5">
                    {output.label || `Ausgang ${idx + 1}`}
                    {output.pump?.enabled && (
                      <span className="px-1.5 py-0.5 bg-accent text-background rounded-lg text-[8px] font-semibold">
                        💧 PUMPE
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-foreground-secondary mt-1">
                    Typ: {CONNECTION_TYPE_LABELS[output.connectionType]}
                    {(output.allowedModuleTypes || []).length > 0 && (
                      <div>Erlaubt: {(output.allowedModuleTypes || []).join(', ')}</div>
                    )}
                    {output.pump?.enabled && output.pump?.förderhoehe_m > 0 && (
                      <div className="text-accent font-semibold mt-1">
                        Förderhöhe: {output.pump.förderhoehe_m} m
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </DetailSection>
          )}
        </div>
      )}
    </div>
  );
}

function ConnectionCard({ connection, sourceModule, targetModule, output, input, check }) {
  return (
    <div
      className={`bg-background-secondary rounded-lg p-4 mb-3 border-2 ${
        check.warning ? 'border-error' : 'border-success'
      }`}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="flex-1">
          <div className="text-sm font-semibold">{sourceModule.name}</div>
          <div className="text-xs text-foreground-secondary">
            {output?.label || 'Ausgang'}
          </div>
        </div>

        <div className="text-xl text-foreground-secondary">→</div>

        <div className="flex-1">
          <div className="text-sm font-semibold">{targetModule.name}</div>
          <div className="text-xs text-foreground-secondary">
            {input?.label || 'Eingang'}
          </div>
        </div>
      </div>

      <div className="text-xs text-foreground-secondary mt-2">
        <div>Verbindungstyp: {CONNECTION_TYPE_LABELS[output?.connectionType || 'hydraulic']}</div>
        {connection?.laenge_meter && (
          <div>Länge: {connection.laenge_meter} m</div>
        )}
        {connection?.dimension && (
          <div>Dimension: {connection.dimension}</div>
        )}
        {connection?.anschluss_ausgang && (
          <div>Anschluss Ausgang: {connection.anschluss_ausgang}</div>
        )}
        {connection?.anschluss_eingang && (
          <div>Anschluss Eingang: {connection.anschluss_eingang}</div>
        )}
      </div>

      {/* Status */}
      <div
        className={`mt-3 p-2 rounded text-xs ${
          check.warning
            ? 'bg-[rgba(255,68,68,0.1)] text-error'
            : 'bg-[rgba(0,255,136,0.1)] text-success'
        }`}
      >
        {check.warning ? (
          <>
            ⚠️ Warnung: {check.reason}
          </>
        ) : (
          <>✓ Kompatibel</>
        )}
      </div>
    </div>
  );
}

function DetailSection({ title, children }) {
  return (
    <div className="mb-4 mt-4">
      <div className="text-xs font-semibold text-accent mb-2">
        {title}
      </div>
      <div>{children}</div>
    </div>
  );
}

function Property({ label, value }) {
  let displayValue = value;

  if (value === null || value === undefined || value === '') {
    displayValue = '—';
  }

  return (
    <div className="flex justify-between py-1.5 text-sm border-b border-border">
      <span className="text-foreground-secondary">{label}:</span>
      <span className="text-foreground font-medium">{displayValue}</span>
    </div>
  );
}

function formatLabel(key) {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase());
}
