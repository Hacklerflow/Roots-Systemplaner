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
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">
          Verbindungstyp-Kategorien
        </h2>
        <p className="text-foreground-secondary text-sm">
          Diese drei Kategorien sind fest definiert und können nicht geändert werden.
          Sie werden verwendet, um Leitungen und Verbindungen zu klassifizieren.
        </p>
      </div>

      <div className="grid gap-5">
        {connectionTypes.map((type) => (
          <div
            key={type.value}
            className="bg-background-secondary border-2 border-border rounded-lg p-6 flex items-start gap-5"
            style={{ borderLeft: `4px solid ${type.color}` }}
          >
            <div className="text-5xl leading-none">{type.icon}</div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-semibold">{type.label}</h3>
                <code className="text-xs px-2 py-1 bg-background-tertiary border border-border rounded font-mono">
                  {type.value}
                </code>
              </div>
              <p className="text-foreground-secondary text-sm">
                {type.description}
              </p>
            </div>
            <div className="px-3 py-1.5 bg-background-tertiary border border-border rounded text-[11px] font-semibold text-foreground-secondary uppercase tracking-wide">
              System
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-5 bg-accent/10 border border-accent/30 rounded-lg">
        <div className="flex gap-3 items-start">
          <div className="text-xl">ℹ️</div>
          <div>
            <div className="font-semibold mb-1 text-accent">
              Hinweis
            </div>
            <div className="text-xs text-foreground-secondary">
              Diese Kategorien sind fest im System verankert und können nicht hinzugefügt, bearbeitet oder gelöscht werden.
              Sie dienen als Grundlage für die Klassifizierung von Leitungen und Verbindungen im gesamten Konfigurator.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
