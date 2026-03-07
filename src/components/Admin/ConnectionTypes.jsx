import { useState } from 'react';
import { CONNECTION_TYPES } from '../../data/types';

/**
 * Admin component for managing connection type categories
 * Shows the three fixed types (Hydraulik, Elektrik, Steuerung)
 */
export default function ConnectionTypes() {
  const connectionTypes = [
    {
      value: CONNECTION_TYPES.HYDRAULIC,
      label: 'Hydraulisch',
      description: 'Hydraulische Verbindungen für Flüssigkeiten (Wasser, Sole, etc.)',
      icon: '💧',
      color: '#3b82f6',
    },
    {
      value: CONNECTION_TYPES.ELECTRIC,
      label: 'Elektrisch',
      description: 'Elektrische Verbindungen für Stromversorgung',
      icon: '⚡',
      color: '#eab308',
    },
    {
      value: CONNECTION_TYPES.CONTROL,
      label: 'Steuerung',
      description: 'Steuerungsleitungen für Signale und Datenübertragung',
      icon: '🎛️',
      color: '#8b5cf6',
    },
  ];

  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ marginTop: 0, marginBottom: '8px', fontSize: '24px' }}>
          Verbindungstyp-Kategorien
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>
          Diese drei Kategorien sind fest definiert und können nicht geändert werden.
          Sie werden verwendet, um Leitungen und Verbindungen zu klassifizieren.
        </p>
      </div>

      <div style={{ display: 'grid', gap: '20px' }}>
        {connectionTypes.map((type) => (
          <div
            key={type.value}
            style={{
              background: 'var(--bg-secondary)',
              border: '2px solid var(--border)',
              borderLeft: `4px solid ${type.color}`,
              borderRadius: '8px',
              padding: '24px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '20px',
            }}
          >
            <div style={{ fontSize: '48px', lineHeight: 1 }}>{type.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>{type.label}</h3>
                <code
                  style={{
                    fontSize: '12px',
                    padding: '4px 8px',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    fontFamily: 'monospace',
                  }}
                >
                  {type.value}
                </code>
              </div>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px' }}>
                {type.description}
              </p>
            </div>
            <div
              style={{
                padding: '6px 12px',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              System
            </div>
          </div>
        ))}
      </div>

      <div style={{
        marginTop: '32px',
        padding: '20px',
        background: 'rgba(59, 130, 246, 0.1)',
        border: '1px solid rgba(59, 130, 246, 0.3)',
        borderRadius: '8px',
      }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          <div style={{ fontSize: '20px' }}>ℹ️</div>
          <div>
            <div style={{ fontWeight: 600, marginBottom: '4px', color: '#3b82f6' }}>
              Hinweis
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Diese Kategorien sind fest im System verankert und können nicht hinzugefügt, bearbeitet oder gelöscht werden.
              Sie dienen als Grundlage für die Klassifizierung von Leitungen und Verbindungen im gesamten Konfigurator.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
