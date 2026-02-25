// Zentrale Moduldatenbank mit allen verfügbaren Modulen (neues Ein-/Ausgangs-System)

import { MODULE_TYPES, CONNECTION_TYPES } from './types';

export const initialModules = [
  {
    id: 'roots-hub-12',
    type: 'module',
    name: 'Roots Hub 12',
    moduleType: MODULE_TYPES.HEAT_PUMP,
    properties: {
      hersteller: 'Roots Energy',
      leistung_nominal_kw: 12,
      abmessungen: '800 x 600 x 1200 mm',
      gewicht_kg: 180,
    },
    inputs: [
      {
        id: 'hub12-in-1',
        label: 'DN50 Quelle',
        connectionType: CONNECTION_TYPES.HYDRAULIC,
        allowedModuleTypes: [MODULE_TYPES.RECOOLER, MODULE_TYPES.BUILDING],
      },
      {
        id: 'hub12-in-2',
        label: '400V Strom',
        connectionType: CONNECTION_TYPES.ELECTRIC,
        allowedModuleTypes: [MODULE_TYPES.BUILDING],
      },
    ],
    outputs: [
      {
        id: 'hub12-out-1',
        label: 'DN50 Heizung',
        connectionType: CONNECTION_TYPES.HYDRAULIC,
        allowedModuleTypes: [MODULE_TYPES.STORAGE, MODULE_TYPES.CONSUMER],
      },
      {
        id: 'hub12-out-2',
        label: 'Steuerung',
        connectionType: CONNECTION_TYPES.CONTROL,
        allowedModuleTypes: [MODULE_TYPES.STORAGE],
      },
    ],
  },
  {
    id: 'roots-hub-20',
    type: 'module',
    name: 'Roots Hub 20',
    moduleType: MODULE_TYPES.HEAT_PUMP,
    properties: {
      hersteller: 'Roots Energy',
      leistung_nominal_kw: 20,
      abmessungen: '900 x 700 x 1300 mm',
      gewicht_kg: 240,
    },
    inputs: [
      {
        id: 'hub20-in-1',
        label: 'DN65 Quelle',
        connectionType: CONNECTION_TYPES.HYDRAULIC,
        allowedModuleTypes: [MODULE_TYPES.RECOOLER, MODULE_TYPES.BUILDING],
      },
      {
        id: 'hub20-in-2',
        label: '400V Strom',
        connectionType: CONNECTION_TYPES.ELECTRIC,
        allowedModuleTypes: [MODULE_TYPES.BUILDING],
      },
    ],
    outputs: [
      {
        id: 'hub20-out-1',
        label: 'DN65 Heizung',
        connectionType: CONNECTION_TYPES.HYDRAULIC,
        allowedModuleTypes: [MODULE_TYPES.STORAGE, MODULE_TYPES.CONSUMER],
      },
      {
        id: 'hub20-out-2',
        label: 'Steuerung',
        connectionType: CONNECTION_TYPES.CONTROL,
        allowedModuleTypes: [MODULE_TYPES.STORAGE],
      },
    ],
  },
  {
    id: 'roots-hub-35',
    type: 'module',
    name: 'Roots Hub 35',
    moduleType: MODULE_TYPES.HEAT_PUMP,
    properties: {
      hersteller: 'Roots Energy',
      leistung_nominal_kw: 35,
      abmessungen: '1000 x 800 x 1400 mm',
      gewicht_kg: 320,
    },
    inputs: [
      {
        id: 'hub35-in-1',
        label: 'DN80 Quelle',
        connectionType: CONNECTION_TYPES.HYDRAULIC,
        allowedModuleTypes: [MODULE_TYPES.RECOOLER, MODULE_TYPES.BUILDING],
      },
      {
        id: 'hub35-in-2',
        label: '400V Strom',
        connectionType: CONNECTION_TYPES.ELECTRIC,
        allowedModuleTypes: [MODULE_TYPES.BUILDING],
      },
    ],
    outputs: [
      {
        id: 'hub35-out-1',
        label: 'DN80 Heizung',
        connectionType: CONNECTION_TYPES.HYDRAULIC,
        allowedModuleTypes: [MODULE_TYPES.STORAGE, MODULE_TYPES.CONSUMER],
      },
      {
        id: 'hub35-out-2',
        label: 'Steuerung',
        connectionType: CONNECTION_TYPES.CONTROL,
        allowedModuleTypes: [MODULE_TYPES.STORAGE],
      },
    ],
  },
  {
    id: 'rueckkuehler-basic',
    type: 'module',
    name: 'Rückkühler Basic',
    moduleType: MODULE_TYPES.RECOOLER,
    properties: {
      hersteller: 'Roots Energy',
      leistung_nominal_kw: 50,
      abmessungen: '1200 x 800 x 1800 mm',
      gewicht_kg: 280,
    },
    inputs: [],
    outputs: [
      {
        id: 'recooler-out-1',
        label: 'DN50 Kühlkreis',
        connectionType: CONNECTION_TYPES.HYDRAULIC,
        allowedModuleTypes: [MODULE_TYPES.HEAT_PUMP],
      },
    ],
  },
  {
    id: 'solarthermie',
    type: 'module',
    name: 'Solarthermie-Modul',
    moduleType: MODULE_TYPES.SOLAR,
    properties: {
      hersteller: 'Roots Energy',
      kollektorfläche_m2: 12,
      leistung_nominal_kw: 8,
      abmessungen: '2000 x 1200 x 100 mm',
      gewicht_kg: 85,
    },
    inputs: [],
    outputs: [
      {
        id: 'solar-out-1',
        label: 'DN32 Solar',
        connectionType: CONNECTION_TYPES.HYDRAULIC,
        allowedModuleTypes: [MODULE_TYPES.STORAGE],
      },
    ],
  },
  {
    id: 'pufferspeicher-500',
    type: 'module',
    name: 'Pufferspeicher 500L',
    moduleType: MODULE_TYPES.STORAGE,
    properties: {
      hersteller: 'Roots Energy',
      volumen_liter: 500,
      abmessungen: '600 x 600 x 1800 mm',
      gewicht_kg: 120,
      speicherkapazität_kwh: 29,
    },
    inputs: [
      {
        id: 'puffer500-in-1',
        label: 'DN50 Ladung',
        connectionType: CONNECTION_TYPES.HYDRAULIC,
        allowedModuleTypes: [MODULE_TYPES.HEAT_PUMP, MODULE_TYPES.SOLAR],
      },
      {
        id: 'puffer500-in-2',
        label: 'Steuerung',
        connectionType: CONNECTION_TYPES.CONTROL,
        allowedModuleTypes: [MODULE_TYPES.HEAT_PUMP],
      },
    ],
    outputs: [
      {
        id: 'puffer500-out-1',
        label: 'DN50 Heizkreis',
        connectionType: CONNECTION_TYPES.HYDRAULIC,
        allowedModuleTypes: [MODULE_TYPES.CONSUMER],
      },
    ],
  },
  {
    id: 'pufferspeicher-1000',
    type: 'module',
    name: 'Pufferspeicher 1000L',
    moduleType: MODULE_TYPES.STORAGE,
    properties: {
      hersteller: 'Roots Energy',
      volumen_liter: 1000,
      abmessungen: '800 x 800 x 2000 mm',
      gewicht_kg: 210,
      speicherkapazität_kwh: 58,
    },
    inputs: [
      {
        id: 'puffer1000-in-1',
        label: 'DN65 Ladung',
        connectionType: CONNECTION_TYPES.HYDRAULIC,
        allowedModuleTypes: [MODULE_TYPES.HEAT_PUMP, MODULE_TYPES.SOLAR],
      },
      {
        id: 'puffer1000-in-2',
        label: 'Steuerung',
        connectionType: CONNECTION_TYPES.CONTROL,
        allowedModuleTypes: [MODULE_TYPES.HEAT_PUMP],
      },
    ],
    outputs: [
      {
        id: 'puffer1000-out-1',
        label: 'DN65 Heizkreis',
        connectionType: CONNECTION_TYPES.HYDRAULIC,
        allowedModuleTypes: [MODULE_TYPES.CONSUMER],
      },
    ],
  },
];
