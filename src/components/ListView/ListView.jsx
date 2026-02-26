import { useState } from 'react';
import { checkConnection } from '../../data/compatibilityChecker';
import { CONNECTION_TYPE_LABELS, isBuilding } from '../../data/types';

export default function ListView({ configuration }) {
  const { building, modules = [], connections = [] } = configuration || {};

  if (!building && (!modules || modules.length === 0)) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        Keine Konfiguration vorhanden. Erstelle zuerst ein Gebäude im Konfigurator.
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ marginTop: 0, marginBottom: '24px' }}>System-Übersicht</h2>

      {/* Gebäude */}
      {building && (
        <Section title="Gebäude">
          <ModuleCard module={building} />
        </Section>
      )}

      {/* Module */}
      {modules.length > 0 && (
        <Section title="Module">
          {modules.map((module) => (
            <ModuleCard key={module.id} module={module} />
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

function ModuleCard({ module }) {
  const [expanded, setExpanded] = useState(false);
  const isBuildingModule = isBuilding(module);

  return (
    <div
      style={{
        background: 'var(--bg-secondary)',
        border: `2px solid ${isBuildingModule ? 'var(--accent)' : 'var(--success)'}`,
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
          <div style={{ fontWeight: 600, fontSize: '16px', marginBottom: '4px' }}>
            {module.name}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            {module.moduleType} | {module.inputs.length} Ein | {module.outputs.length} Aus
          </div>
        </div>
        <div style={{ fontSize: '18px', color: 'var(--text-secondary)' }}>
          {expanded ? '−' : '+'}
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div style={{ padding: '0 16px 16px 16px', borderTop: '1px solid var(--border)' }}>
          {/* Eigenschaften */}
          {Object.keys(module.properties || {}).length > 0 && (
            <DetailSection title="Eigenschaften">
              {Object.entries(module.properties).map(([key, value]) => (
                <Property key={key} label={formatLabel(key)} value={value} />
              ))}
            </DetailSection>
          )}

          {/* Eingänge */}
          {module.inputs.length > 0 && (
            <DetailSection title="Eingänge">
              {module.inputs.map((input, idx) => (
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
                    {input.allowedModuleTypes.length > 0 && (
                      <div>Erlaubt: {input.allowedModuleTypes.join(', ')}</div>
                    )}
                  </div>
                </div>
              ))}
            </DetailSection>
          )}

          {/* Ausgänge */}
          {module.outputs.length > 0 && (
            <DetailSection title="Ausgänge">
              {module.outputs.map((output, idx) => (
                <div
                  key={output.id}
                  style={{
                    padding: '8px',
                    background: 'var(--bg-tertiary)',
                    borderRadius: '4px',
                    marginBottom: '6px',
                  }}
                >
                  <div style={{ fontSize: '13px', fontWeight: 500 }}>
                    {output.label || `Ausgang ${idx + 1}`}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Typ: {CONNECTION_TYPE_LABELS[output.connectionType]}
                    {output.allowedModuleTypes.length > 0 && (
                      <div>Erlaubt: {output.allowedModuleTypes.join(', ')}</div>
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

function ConnectionCard({ sourceModule, targetModule, output, input, check }) {
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

      <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
        Verbindungstyp: {CONNECTION_TYPE_LABELS[output?.connectionType || 'hydraulic']}
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
