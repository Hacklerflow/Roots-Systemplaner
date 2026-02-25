// Zentrale Moduldatenbank mit allen verfügbaren Modulen

export const initialModules = [
  {
    id: 'roots-hub-12',
    type: 'module',
    name: 'Roots Hub 12',
    properties: {
      modultyp: 'Wärmepumpe',
      hersteller: 'Roots Energy',
      leistung_nominal_kw: 12,
      abmessungen: '800 x 600 x 1200 mm',
      gewicht_kg: 180,
    },
    capabilities: {
      wärmequelle_vorhanden: true,
      verfuegbare_leistung_kw: 12,
    },
    requirements: {
      tiefenbohrung_required: true,
      kellerfläche: true,
      max_heizlast_kw: 15,
    },
  },
  {
    id: 'roots-hub-20',
    type: 'module',
    name: 'Roots Hub 20',
    properties: {
      modultyp: 'Wärmepumpe',
      hersteller: 'Roots Energy',
      leistung_nominal_kw: 20,
      abmessungen: '900 x 700 x 1300 mm',
      gewicht_kg: 240,
    },
    capabilities: {
      wärmequelle_vorhanden: true,
      verfuegbare_leistung_kw: 20,
    },
    requirements: {
      tiefenbohrung_required: true,
      kellerfläche: true,
      max_heizlast_kw: 25,
    },
  },
  {
    id: 'roots-hub-35',
    type: 'module',
    name: 'Roots Hub 35',
    properties: {
      modultyp: 'Wärmepumpe',
      hersteller: 'Roots Energy',
      leistung_nominal_kw: 35,
      abmessungen: '1000 x 800 x 1400 mm',
      gewicht_kg: 320,
    },
    capabilities: {
      wärmequelle_vorhanden: true,
      verfuegbare_leistung_kw: 35,
    },
    requirements: {
      tiefenbohrung_required: true,
      kellerfläche: true,
      max_heizlast_kw: 40,
    },
  },
  {
    id: 'solarthermie',
    type: 'module',
    name: 'Solarthermie-Modul',
    properties: {
      modultyp: 'Solarthermie',
      hersteller: 'Roots Energy',
      kollektorfläche_m2: 12,
      abmessungen: '2000 x 1200 x 100 mm',
      gewicht_kg: 85,
    },
    capabilities: {
      wärmequelle_vorhanden: true,
      verfuegbare_leistung_kw: 8,
    },
    requirements: {
      dachfläche: true,
    },
  },
  {
    id: 'pufferspeicher-500',
    type: 'module',
    name: 'Pufferspeicher 500L',
    properties: {
      modultyp: 'Pufferspeicher',
      hersteller: 'Roots Energy',
      volumen_liter: 500,
      abmessungen: '600 x 600 x 1800 mm',
      gewicht_kg: 120,
    },
    capabilities: {
      speicherkapazität_kwh: 29,
    },
    requirements: {
      wärmequelle_vorhanden: true,
      kellerfläche: true,
    },
  },
  {
    id: 'pufferspeicher-1000',
    type: 'module',
    name: 'Pufferspeicher 1000L',
    properties: {
      modultyp: 'Pufferspeicher',
      hersteller: 'Roots Energy',
      volumen_liter: 1000,
      abmessungen: '800 x 800 x 2000 mm',
      gewicht_kg: 210,
    },
    capabilities: {
      speicherkapazität_kwh: 58,
    },
    requirements: {
      wärmequelle_vorhanden: true,
      kellerfläche: true,
    },
  },
];

// Export initial modules for use in App component
// Module management is handled via React state in App.jsx
