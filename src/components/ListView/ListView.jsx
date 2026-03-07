import { useState } from 'react';
import { checkConnection } from '../../data/compatibilityChecker';
import { CONNECTION_TYPE_LABELS } from '../../data/types';

export default function ListView({ configuration, setConfiguration, modultypen = [] }) {
  const { modules = [], connections = [] } = configuration || {};

  if (!modules || modules.length === 0) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        Keine Konfiguration vorhanden. Erstelle zuerst Module im Konfigurator.
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', minHeight: '100%' }}>
      <h2 style={{ marginTop: 0, marginBottom: '24px' }}>System-Übersicht</h2>

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
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', padding: '12px' }}>
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
    <div style={{ marginBottom: '32px' }}>
      <h3
        style={{
          fontSize: '16px',
          fontWeight: 600,
          marginBottom: '16px',
          color: 'var(--accent)',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}
      >
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
    <div
      style={{
        background: 'var(--bg-secondary)',
        border: '2px solid var(--success)',
        borderRadius: '8px',
        marginBottom: '12px',
      }}
    >
      {/* Header */}
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          padding: '16px',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <div style={{ fontWeight: 600, fontSize: '16px', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {module.name}
            {hasPumps && (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '2px 6px',
                background: 'var(--accent)',
                color: 'var(--bg-primary)',
                borderRadius: '10px',
                fontSize: '9px',
                fontWeight: 600,
              }}>
                💧 PUMPE
              </span>
            )}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            {module.moduleType} | {(module.inputs || []).length} Ein | {(module.outputs || []).length} Aus
            {hasPumps && ` | ${pumps.length} Pumpe${pumps.length > 1 ? 'n' : ''}`}
          </div>
        </div>
        <div style={{ fontSize: '18px', color: 'var(--text-secondary)' }}>
          {expanded ? '−' : '+'}
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div style={{ padding: '0 16px 16px 16px', borderTop: '1px solid var(--border)' }}>
          {/* Produktlink Button */}
          {module.properties?.produktlink && (
            <div style={{ marginTop: '16px', marginBottom: '16px' }}>
              <a
                href={module.properties.produktlink}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: 'none' }}
              >
                <button
                  style={{
                    padding: '10px 16px',
                    background: 'var(--accent)',
                    color: 'var(--bg-primary)',
                    border: 'none',
                    borderRadius: '4px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    fontSize: '13px',
                    width: '100%',
                  }}
                >
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
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '6px 0',
                    fontSize: '13px',
                    borderBottom: '1px solid var(--border)',
                    alignItems: 'center',
                  }}
                >
                  <span style={{ color: 'var(--text-secondary)' }}>Menge ({einheit}):</span>
                  <input
                    type="number"
                    step="0.01"
                    value={module.properties?.menge ?? ''}
                    onChange={(e) => handleMengeChange(e.target.value ? parseFloat(e.target.value) : null)}
                    style={{
                      width: '100px',
                      padding: '4px 8px',
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--border)',
                      borderRadius: '4px',
                      color: 'var(--text-primary)',
                      fontFamily: 'inherit',
                      fontSize: '13px',
                      fontWeight: 500,
                    }}
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
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '6px 0',
                    fontSize: '13px',
                    borderBottom: '1px solid var(--border)',
                    backgroundColor: 'var(--bg-tertiary)',
                    marginTop: '4px',
                    paddingLeft: '8px',
                    paddingRight: '8px',
                    borderRadius: '4px',
                  }}
                >
                  <span style={{ color: 'var(--accent)', fontWeight: 600 }}>Gesamtpreis (€):</span>
                  <span style={{ color: 'var(--accent)', fontWeight: 600 }}>
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
                  style={{
                    padding: '8px',
                    background: 'var(--bg-tertiary)',
                    borderRadius: '4px',
                    marginBottom: '6px',
                  }}
                >
                  <div style={{ fontSize: '13px', fontWeight: 500 }}>
                    {input.label || `Eingang ${idx + 1}`}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
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
                  style={{
                    padding: '8px',
                    background: output.pump?.enabled ? 'rgba(46, 160, 67, 0.1)' : 'var(--bg-tertiary)',
                    border: output.pump?.enabled ? '1px solid var(--accent)' : 'none',
                    borderRadius: '4px',
                    marginBottom: '6px',
                  }}
                >
                  <div style={{ fontSize: '13px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {output.label || `Ausgang ${idx + 1}`}
                    {output.pump?.enabled && (
                      <span style={{
                        padding: '2px 6px',
                        background: 'var(--accent)',
                        color: 'var(--bg-primary)',
                        borderRadius: '8px',
                        fontSize: '8px',
                        fontWeight: 600,
                      }}>
                        💧 PUMPE
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Typ: {CONNECTION_TYPE_LABELS[output.connectionType]}
                    {(output.allowedModuleTypes || []).length > 0 && (
                      <div>Erlaubt: {(output.allowedModuleTypes || []).join(', ')}</div>
                    )}
                    {output.pump?.enabled && output.pump?.förderhoehe_m > 0 && (
                      <div style={{ color: 'var(--accent)', fontWeight: 600, marginTop: '4px' }}>
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
      style={{
        background: 'var(--bg-secondary)',
        border: `2px solid ${check.warning ? 'var(--error)' : 'var(--success)'}`,
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '12px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '13px', fontWeight: 600 }}>{sourceModule.name}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
            {output?.label || 'Ausgang'}
          </div>
        </div>

        <div style={{ fontSize: '20px', color: 'var(--text-secondary)' }}>→</div>

        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '13px', fontWeight: 600 }}>{targetModule.name}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
            {input?.label || 'Eingang'}
          </div>
        </div>
      </div>

      <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '8px' }}>
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
        style={{
          marginTop: '12px',
          padding: '8px',
          background: check.warning ? 'rgba(255, 68, 68, 0.1)' : 'rgba(0, 255, 136, 0.1)',
          borderRadius: '4px',
          fontSize: '12px',
          color: check.warning ? 'var(--error)' : 'var(--success)',
        }}
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
    <div style={{ marginBottom: '16px', marginTop: '16px' }}>
      <div
        style={{
          fontSize: '12px',
          fontWeight: 600,
          color: 'var(--accent)',
          marginBottom: '8px',
        }}
      >
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
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: '6px 0',
        fontSize: '13px',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <span style={{ color: 'var(--text-secondary)' }}>{label}:</span>
      <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{displayValue}</span>
    </div>
  );
}

function formatLabel(key) {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase());
}
