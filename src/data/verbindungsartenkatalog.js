import { CONNECTION_TYPES } from './types';

/**
 * Initiale Verbindungsarten
 * Jede Verbindungsart definiert:
 * - id: Eindeutige ID
 * - connectionType: Typ der Verbindung (hydraulic/electric/control)
 * - name: Bezeichnung der Verbindungsart
 * - kuerzel: Kurzes Kürzel (max 6 Zeichen) für Anzeige im Konfigurator
 * - kompatible_leitungen: Array von Leitungs-IDs aus dem Leitungskatalog
 */
export const initialVerbindungsarten = [
  // Hydraulische Verbindungsarten
  {
    id: 'flansch-dn25',
    connectionType: CONNECTION_TYPES.HYDRAULIC,
    name: 'DN25 Flanschverbindung',
    kuerzel: 'FL25',
    kompatible_leitungen: ['dn25-hydraulic'],
  },
  {
    id: 'flansch-dn32',
    connectionType: CONNECTION_TYPES.HYDRAULIC,
    name: 'DN32 Flanschverbindung',
    kuerzel: 'FL32',
    kompatible_leitungen: ['dn32-hydraulic'],
  },
  {
    id: 'flansch-dn50',
    connectionType: CONNECTION_TYPES.HYDRAULIC,
    name: 'DN50 Flanschverbindung',
    kuerzel: 'FL50',
    kompatible_leitungen: ['dn50-hydraulic'],
  },
  {
    id: 'flansch-dn65',
    connectionType: CONNECTION_TYPES.HYDRAULIC,
    name: 'DN65 Flanschverbindung',
    kuerzel: 'FL65',
    kompatible_leitungen: ['dn65-hydraulic'],
  },
  {
    id: 'flansch-dn80',
    connectionType: CONNECTION_TYPES.HYDRAULIC,
    name: 'DN80 Flanschverbindung',
    kuerzel: 'FL80',
    kompatible_leitungen: ['dn80-hydraulic'],
  },
  {
    id: 'schraub-dn50',
    connectionType: CONNECTION_TYPES.HYDRAULIC,
    name: 'DN50 Schraubverbindung',
    kuerzel: 'SR50',
    kompatible_leitungen: ['dn50-hydraulic'],
  },
  {
    id: 'gewinde-dn25',
    connectionType: CONNECTION_TYPES.HYDRAULIC,
    name: 'DN25 Gewindeverbindung (AG/IG)',
    kuerzel: 'GW25',
    kompatible_leitungen: ['dn25-hydraulic'],
  },

  // Elektrische Verbindungsarten
  {
    id: 'stecker-230v',
    connectionType: CONNECTION_TYPES.ELECTRIC,
    name: '230V Steckverbindung',
    kuerzel: '230V',
    kompatible_leitungen: ['nym-3x1.5-electric', 'nym-3x2.5-electric'],
  },
  {
    id: 'stecker-400v',
    connectionType: CONNECTION_TYPES.ELECTRIC,
    name: '400V Starkstrom Stecker',
    kuerzel: '400V',
    kompatible_leitungen: ['nym-5x2.5-electric', 'nym-5x4-electric'],
  },
  {
    id: 'klemme-230v',
    connectionType: CONNECTION_TYPES.ELECTRIC,
    name: '230V Klemmenverbindung',
    kuerzel: 'K230V',
    kompatible_leitungen: ['nym-3x1.5-electric', 'nym-3x2.5-electric'],
  },
  {
    id: 'klemme-400v',
    connectionType: CONNECTION_TYPES.ELECTRIC,
    name: '400V Klemmenverbindung',
    kuerzel: 'K400V',
    kompatible_leitungen: ['nym-5x2.5-electric', 'nym-5x4-electric'],
  },

  // Steuerungs-Verbindungsarten
  {
    id: 'modbus-klemme',
    connectionType: CONNECTION_TYPES.CONTROL,
    name: 'Modbus Klemmenverbindung',
    kuerzel: 'MODBUS',
    kompatible_leitungen: ['modbus-control'],
  },
  {
    id: 'can-stecker',
    connectionType: CONNECTION_TYPES.CONTROL,
    name: 'CAN-Bus Steckverbindung',
    kuerzel: 'CAN',
    kompatible_leitungen: ['canbus-control'],
  },
  {
    id: 'rs485-klemme',
    connectionType: CONNECTION_TYPES.CONTROL,
    name: 'RS485 Klemmenverbindung',
    kuerzel: 'RS485',
    kompatible_leitungen: ['modbus-control', 'canbus-control'],
  },
];
