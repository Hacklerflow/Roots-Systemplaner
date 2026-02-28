// Katalog mit Standard-Leitungstypen

import { CONNECTION_TYPES } from './types';

export const initialLeitungen = [
  // Hydraulische Leitungen
  {
    id: 'dn25-hydraulic',
    connectionType: CONNECTION_TYPES.HYDRAULIC,
    dimension: 'DN25',
    preis_pro_meter: 12.50,
  },
  {
    id: 'dn32-hydraulic',
    connectionType: CONNECTION_TYPES.HYDRAULIC,
    dimension: 'DN32',
    preis_pro_meter: 14.80,
  },
  {
    id: 'dn50-hydraulic',
    connectionType: CONNECTION_TYPES.HYDRAULIC,
    dimension: 'DN50',
    preis_pro_meter: 18.50,
  },
  {
    id: 'dn65-hydraulic',
    connectionType: CONNECTION_TYPES.HYDRAULIC,
    dimension: 'DN65',
    preis_pro_meter: 24.90,
  },
  {
    id: 'dn80-hydraulic',
    connectionType: CONNECTION_TYPES.HYDRAULIC,
    dimension: 'DN80',
    preis_pro_meter: 32.00,
  },

  // Elektrische Leitungen
  {
    id: 'nym-3x1.5-electric',
    connectionType: CONNECTION_TYPES.ELECTRIC,
    dimension: 'NYM 3x1.5mm²',
    preis_pro_meter: 2.50,
  },
  {
    id: 'nym-3x2.5-electric',
    connectionType: CONNECTION_TYPES.ELECTRIC,
    dimension: 'NYM 3x2.5mm²',
    preis_pro_meter: 3.80,
  },
  {
    id: 'nym-5x2.5-electric',
    connectionType: CONNECTION_TYPES.ELECTRIC,
    dimension: 'NYM 5x2.5mm²',
    preis_pro_meter: 5.20,
  },
  {
    id: '400v-5x4-electric',
    connectionType: CONNECTION_TYPES.ELECTRIC,
    dimension: '400V 5x4mm²',
    preis_pro_meter: 7.90,
  },

  // Steuerungsleitungen
  {
    id: 'modbus-control',
    connectionType: CONNECTION_TYPES.CONTROL,
    dimension: 'Modbus (2x2x0.8)',
    preis_pro_meter: 4.50,
  },
  {
    id: 'bus-control',
    connectionType: CONNECTION_TYPES.CONTROL,
    dimension: 'BUS-Kabel',
    preis_pro_meter: 3.20,
  },
  {
    id: 'steuerleitung-control',
    connectionType: CONNECTION_TYPES.CONTROL,
    dimension: 'Steuerleitung 4x0.75mm²',
    preis_pro_meter: 2.80,
  },
];
