import { CONNECTION_TYPES } from './types';

/**
 * Zentrale Dimensionsverwaltung
 * Alle Dimensionen werden hier definiert und von anderen Teilen der App verwendet
 */
export const initialDimensionen = [
  // Hydraulische Dimensionen
  { id: 'dim-dn25', connectionType: CONNECTION_TYPES.HYDRAULIC, name: 'DN25' },
  { id: 'dim-dn32', connectionType: CONNECTION_TYPES.HYDRAULIC, name: 'DN32' },
  { id: 'dim-dn50', connectionType: CONNECTION_TYPES.HYDRAULIC, name: 'DN50' },
  { id: 'dim-dn65', connectionType: CONNECTION_TYPES.HYDRAULIC, name: 'DN65' },
  { id: 'dim-dn80', connectionType: CONNECTION_TYPES.HYDRAULIC, name: 'DN80' },

  // Elektrische Dimensionen
  { id: 'dim-nym-3x1.5', connectionType: CONNECTION_TYPES.ELECTRIC, name: 'NYM 3x1.5mm²' },
  { id: 'dim-nym-3x2.5', connectionType: CONNECTION_TYPES.ELECTRIC, name: 'NYM 3x2.5mm²' },
  { id: 'dim-nym-5x2.5', connectionType: CONNECTION_TYPES.ELECTRIC, name: 'NYM 5x2.5mm²' },
  { id: 'dim-nym-5x4', connectionType: CONNECTION_TYPES.ELECTRIC, name: 'NYM 5x4mm²' },

  // Steuerungs-Dimensionen
  { id: 'dim-modbus', connectionType: CONNECTION_TYPES.CONTROL, name: 'Modbus (2x2x0.8)' },
  { id: 'dim-canbus', connectionType: CONNECTION_TYPES.CONTROL, name: 'CAN-Bus (2x2x0.8)' },
];
