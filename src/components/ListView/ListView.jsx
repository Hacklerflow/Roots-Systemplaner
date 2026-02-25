import { useState } from 'react';
import { checkCompatibility } from '../../data/compatibilityChecker';

export default function ListView({ configuration }) {
  const { building, chain } = configuration;

  if (!building) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        Keine Konfiguration vorhanden. Erstelle zuerst ein Gebäude im Konfigurator.
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '900px', margin: '0 auto' }}>
      <h2 style={{ marginTop: 0, marginBottom: '24px' }}>Systemkette</h2>

      {/* Gebäude */}
      <ElementCard element={building} />

      {/* Module mit Kompatibilitätsstatus */}
      {chain.map((module, index) => {
        const predecessor = index === 0 ? building : chain[index - 1];
        const check = checkCompatibility(predecessor, module);

        return (
          <div key={module.id}>
            {/* Verbindungsanzeige */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                marginLeft: '40px',
                padding: '12px 0',
              }}
            >
              <div
                style={{
                  width: '3px',
                  height: '40px',
                  background: check.compatible ? 'var(--success)' : 'var(--error)',
                }}
              />
              <div
                style={{
                  marginLeft: '12px',
                  fontSize: '12px',
                  color: check.compatible ? 'var(--success)' : 'var(--error)',
                }}
              >
                {check.compatible ? (
                  '✓ Kompatibel'
                ) : (
                  <div>
                    ✗ Nicht kompatibel
                    <div style={{ marginTop: '4px', fontSize: '11px' }}>
                      {check.missingRequirements.map((req, i) => (
                        <div key={i}>• {req}</div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modul */}
            <ElementCard element={module} />
          </div>
        );
      })}
    </div>
  );
}

function ElementCard({ element }) {
  const [expanded, setExpanded] = useState(false);

  const isBuilding = element.type === 'building';

  return (
    <div
      style={{
        background: 'var(--bg-secondary)',
        border: `2px solid ${isBuilding ? 'var(--accent)' : 'var(--success)'}`,
        borderRadius: '8px',
        marginBottom: '16px',
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
            {element.name}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            {isBuilding ? 'Gebäude' : element.properties?.modultyp || 'Modul'}
          </div>
        </div>
        <div style={{ fontSize: '18px', color: 'var(--text-secondary)' }}>
          {expanded ? '−' : '+'}
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div style={{ padding: '0 16px 16px 16px' }}>
          {/* Eigenschaften */}
          {Object.keys(element.properties || {}).length > 0 && (
            <Section title="Eigenschaften">
              {Object.entries(element.properties).map(([key, value]) => (
                <Property key={key} label={formatLabel(key)} value={value} />
              ))}
            </Section>
          )}

          {/* Leistungen */}
          {Object.keys(element.capabilities || {}).length > 0 && (
            <Section title="Leistungen">
              {Object.entries(element.capabilities).map(([key, value]) => (
                <Property key={key} label={formatLabel(key)} value={value} type={typeof value} />
              ))}
            </Section>
          )}

          {/* Voraussetzungen */}
          {!isBuilding && Object.keys(element.requirements || {}).length > 0 && (
            <Section title="Voraussetzungen">
              {Object.entries(element.requirements).map(([key, value]) => (
                <Property key={key} label={formatLabel(key)} value={value} type={typeof value} />
              ))}
            </Section>
          )}
        </div>
      )}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <div
        style={{
          fontSize: '12px',
          fontWeight: 600,
          color: 'var(--accent)',
          marginBottom: '8px',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}
      >
        {title}
      </div>
      <div
        style={{
          background: 'var(--bg-tertiary)',
          border: '1px solid var(--border)',
          borderRadius: '4px',
          padding: '12px',
        }}
      >
        {children}
      </div>
    </div>
  );
}

function Property({ label, value, type = 'string' }) {
  let displayValue = value;

  if (value === null || value === undefined || value === '') {
    displayValue = '—';
  } else if (type === 'boolean') {
    displayValue = value ? '✓ Ja' : '✗ Nein';
  }

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: '6px 0',
        fontSize: '13px',
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
