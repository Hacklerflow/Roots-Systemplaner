import { useState } from 'react';
import { utils, writeFile } from 'xlsx';
import { CONNECTION_TYPE_LABELS } from '../../data/types';
import AirtableSettings from '../Settings/AirtableSettings';

export default function Stueckliste({ configuration, setConfiguration, modultypen = [], project = null }) {
  const { modules = [], connections = [] } = configuration || {};
  const [showAirtableSettings, setShowAirtableSettings] = useState(false);
  const [isSendingToAirtable, setIsSendingToAirtable] = useState(false);

  // Handler für Preis-Änderungen bei Modulen
  const handleModulePriceChange = (moduleId, newPrice) => {
    setConfiguration({
      ...configuration,
      modules: modules.map(m =>
        m.id === moduleId
          ? { ...m, properties: { ...m.properties, preis_euro: newPrice ? parseFloat(newPrice) : null } }
          : m
      ),
    });
  };

  // Handler für Mengen-Änderungen bei Modulen
  const handleModuleMengeChange = (moduleId, newMenge) => {
    setConfiguration({
      ...configuration,
      modules: modules.map(m =>
        m.id === moduleId
          ? { ...m, properties: { ...m.properties, menge: newMenge ? parseFloat(newMenge) : null } }
          : m
      ),
    });
  };

  // Handler für Preis-pro-Meter-Änderungen bei Verbindungen
  const handleConnectionPriceChange = (connectionId, newPrice) => {
    setConfiguration({
      ...configuration,
      connections: connections.map(c =>
        c.id === connectionId
          ? { ...c, preis_pro_meter: newPrice ? parseFloat(newPrice) : null }
          : c
      ),
    });
  };

  const handleSendToAirtable = async () => {
    // Lade Airtable-Einstellungen
    const savedSettings = localStorage.getItem('airtable_settings');
    if (!savedSettings) {
      alert('Bitte konfiguriere zuerst die Airtable-Einstellungen!');
      setShowAirtableSettings(true);
      return;
    }

    const settings = JSON.parse(savedSettings);
    const { personalAccessToken, baseId } = settings;

    if (!personalAccessToken || !baseId) {
      alert('Airtable-Einstellungen sind unvollständig!');
      setShowAirtableSettings(true);
      return;
    }

    setIsSendingToAirtable(true);

    try {
      // Erstelle Airtable-Record
      const exportData = {
        // Metadaten
        exportDatum: new Date().toISOString(),
        projektName: project?.name || 'Unbenanntes Projekt',

        // Projekt-Informationen
        projekt: project ? {
          name: project.name || '',
          adresse: project.building_address || '',
          baujahr: project.building_year || '',
          beheizte_flaeche_m2: project.beheizte_flaeche || '',
          anzahl_wohnungen: project.anzahl_wohnungen || '',
          anzahl_stockwerke: project.anzahl_stockwerke || '',
          eigentuemer: project.eigentuemer || '',
        } : null,

        // Komponenten/Module
        komponenten: modules.map((module, index) => {
          const moduleTypeInfo = modultypen?.find(t => t.name === module.moduleType);
          const isProEinheit = moduleTypeInfo?.berechnungsart === 'pro_einheit';
          const einheit = moduleTypeInfo?.einheit || '';
          const menge = module.properties?.menge || null;
          const preisEuro = module.properties?.preis_euro || null;
          const gesamtpreis = isProEinheit && menge && preisEuro ? (menge * preisEuro) : preisEuro;

          return {
            position: index + 1,
            name: module.name || '',
            modultyp: module.moduleType || '',
            hersteller: module.properties?.hersteller || '',
            abmessungen: module.properties?.abmessungen || '',
            gewicht_kg: module.properties?.gewicht_kg || null,
            leistung_nominal_kw: module.properties?.leistung_nominal_kw || null,
            volumen_liter: module.properties?.volumen_liter || null,
            ...(isProEinheit ? {
              berechnungsart: 'pro_einheit',
              einheit: einheit,
              menge: menge,
              preis_pro_einheit_euro: preisEuro,
              gesamtpreis_euro: gesamtpreis,
            } : {
              berechnungsart: 'stueck',
              preis_euro: preisEuro,
            }),
          };
        }),

        // Leitungen/Verbindungen
        leitungen: connections.map((conn, index) => {
          const sourceModule = modules.find(m => m.id === conn.source);
          const targetModule = modules.find(m => m.id === conn.target);
          const output = sourceModule?.outputs?.find(o => o.id === conn.sourceHandle);
          const input = targetModule?.inputs?.find(i => i.id === conn.targetHandle);
          const gesamtpreis = conn.preis_pro_meter && conn.laenge_meter
            ? (conn.preis_pro_meter * conn.laenge_meter)
            : null;

          return {
            position: index + 1,
            von_modul: sourceModule?.name || '',
            von_ausgang: output?.label || '',
            zu_modul: targetModule?.name || '',
            zu_eingang: input?.label || '',
            verbindungstyp: CONNECTION_TYPE_LABELS[output?.connectionType] || '',
            laenge_meter: conn.laenge_meter || null,
            dimension: conn.dimension || '',
            preis_pro_meter_euro: conn.preis_pro_meter || null,
            gesamtpreis_euro: gesamtpreis,
          };
        }),

        // Summen
        summen: {
          komponenten_summe_euro: moduleSumme,
          leitungen_summe_euro: leitungenSumme,
          gesamtsumme_euro: gesamtsumme,
          anzahl_komponenten: modules.length,
          anzahl_leitungen: connections.length,
        }
      };

      // SCHRITT 1: Erstelle Projekt-Record in "Projekte" Tabelle
      const projektResponse = await fetch(`https://api.airtable.com/v0/${baseId}/Projekte`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${personalAccessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fields: {
            'Projektname': exportData.projektName,
            'Exportdatum': exportData.exportDatum,
            'Gebaeude_Name': project?.name || '',
            'Gebaeude_Baujahr': project?.building_year || '',
            'Gebaeude_Strasse': project?.building_address || '',
            'Gebaeude_Hausnummer': '',
            'Gebaeude_Stockwerke': project?.anzahl_stockwerke || '',
            'Komponenten_Summe': exportData.summen.komponenten_summe_euro,
            'Leitungen_Summe': exportData.summen.leitungen_summe_euro,
            'Gesamtsumme': exportData.summen.gesamtsumme_euro,
            'Anzahl_Komponenten': exportData.summen.anzahl_komponenten,
            'Anzahl_Leitungen': exportData.summen.anzahl_leitungen,
          }
        })
      });

      if (!projektResponse.ok) {
        const error = await projektResponse.json();
        throw new Error(`Fehler beim Erstellen des Projekts: ${error.error?.message || 'Unbekannter Fehler'}`);
      }

      const projektData = await projektResponse.json();
      const projektRecordId = projektData.id;

      // SCHRITT 2: Erstelle Komponenten-Records in "Komponenten" Tabelle
      if (exportData.komponenten.length > 0) {
        const komponentenRecords = exportData.komponenten.map(komp => ({
          fields: {
            'Projekt': [projektRecordId], // Linked Record
            'Position': komp.position,
            'Name': komp.name,
            'Modultyp': komp.modultyp,
            'Hersteller': komp.hersteller,
            'Abmessungen': komp.abmessungen,
            'Gewicht_kg': komp.gewicht_kg || 0,
            'Leistung_kW': komp.leistung_nominal_kw || 0,
            'Volumen_L': komp.volumen_liter || 0,
            'Berechnungsart': komp.berechnungsart,
            'Einheit': komp.einheit || '',
            'Menge': komp.menge || 1,
            'Preis_pro_Einheit': komp.preis_pro_einheit_euro || komp.preis_euro || 0,
            'Gesamtpreis': komp.gesamtpreis_euro || komp.preis_euro || 0,
          }
        }));

        // Batch-Upload (max 10 pro Request)
        const batchSize = 10;
        for (let i = 0; i < komponentenRecords.length; i += batchSize) {
          const batch = komponentenRecords.slice(i, i + batchSize);

          const response = await fetch(`https://api.airtable.com/v0/${baseId}/Komponenten`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${personalAccessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ records: batch })
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(`Fehler beim Erstellen der Komponenten: ${error.error?.message || 'Unbekannter Fehler'}`);
          }
        }
      }

      // SCHRITT 3: Erstelle Leitungen-Records in "Leitungen" Tabelle
      if (exportData.leitungen.length > 0) {
        const leitungenRecords = exportData.leitungen.map(leitung => ({
          fields: {
            'Projekt': [projektRecordId], // Linked Record
            'Position': leitung.position,
            'Von_Modul': leitung.von_modul,
            'Von_Ausgang': leitung.von_ausgang,
            'Zu_Modul': leitung.zu_modul,
            'Zu_Eingang': leitung.zu_eingang,
            'Verbindungstyp': leitung.verbindungstyp,
            'Laenge_m': leitung.laenge_meter || 0,
            'Dimension': leitung.dimension,
            'Preis_pro_m': leitung.preis_pro_meter_euro || 0,
            'Gesamtpreis': leitung.gesamtpreis_euro || 0,
          }
        }));

        // Batch-Upload (max 10 pro Request)
        const batchSize = 10;
        for (let i = 0; i < leitungenRecords.length; i += batchSize) {
          const batch = leitungenRecords.slice(i, i + batchSize);

          const response = await fetch(`https://api.airtable.com/v0/${baseId}/Leitungen`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${personalAccessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ records: batch })
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(`Fehler beim Erstellen der Leitungen: ${error.error?.message || 'Unbekannter Fehler'}`);
          }
        }
      }

      alert(`✅ Erfolgreich an Airtable gesendet!\n\n• 1 Projekt\n• ${exportData.komponenten.length} Komponenten\n• ${exportData.leitungen.length} Leitungen\n\nAlle Records sind verknüpft!`);
    } catch (error) {
      console.error('Fehler beim Senden an Airtable:', error);
      alert(`❌ Fehler: ${error.message}\n\nBitte prüfe deine Airtable-Einstellungen.`);
    } finally {
      setIsSendingToAirtable(false);
    }
  };

  const handleExportJSON = () => {
    // Erstelle strukturierte JSON-Daten für docsautomator
    const exportData = {
      // Metadaten
      exportDatum: new Date().toISOString(),
      projektName: project?.name || 'Unbenanntes Projekt',

      // Gebäude-Informationen
      gebaeude: building ? {
        name: building.name || '',
        baujahr: building.properties?.baujahr || '',
        strasse: building.properties?.strasse || '',
        hausnummer: building.properties?.hausnummer || '',
        stockwerke: building.properties?.stockwerke || '',
      } : null,

      // Komponenten/Module
      komponenten: modules.map((module, index) => {
        const moduleTypeInfo = modultypen?.find(t => t.name === module.moduleType);
        const isProEinheit = moduleTypeInfo?.berechnungsart === 'pro_einheit';
        const einheit = moduleTypeInfo?.einheit || '';
        const menge = module.properties?.menge || null;
        const preisEuro = module.properties?.preis_euro || null;
        const gesamtpreis = isProEinheit && menge && preisEuro ? (menge * preisEuro) : preisEuro;

        return {
          position: index + 1,
          name: module.name || '',
          modultyp: module.moduleType || '',
          hersteller: module.properties?.hersteller || '',
          abmessungen: module.properties?.abmessungen || '',
          gewicht_kg: module.properties?.gewicht_kg || null,
          leistung_nominal_kw: module.properties?.leistung_nominal_kw || null,
          volumen_liter: module.properties?.volumen_liter || null,
          ...(isProEinheit ? {
            berechnungsart: 'pro_einheit',
            einheit: einheit,
            menge: menge,
            preis_pro_einheit_euro: preisEuro,
            gesamtpreis_euro: gesamtpreis,
          } : {
            berechnungsart: 'stueck',
            preis_euro: preisEuro,
          }),
        };
      }),

      // Leitungen/Verbindungen
      leitungen: connections.map((conn, index) => {
        const sourceModule = modules.find(m => m.id === conn.source);
        const targetModule = modules.find(m => m.id === conn.target);
        const output = sourceModule?.outputs?.find(o => o.id === conn.sourceHandle);
        const input = targetModule?.inputs?.find(i => i.id === conn.targetHandle);
        const gesamtpreis = conn.preis_pro_meter && conn.laenge_meter
          ? (conn.preis_pro_meter * conn.laenge_meter)
          : null;

        return {
          position: index + 1,
          von_modul: sourceModule?.name || '',
          von_ausgang: output?.label || '',
          zu_modul: targetModule?.name || '',
          zu_eingang: input?.label || '',
          verbindungstyp: CONNECTION_TYPE_LABELS[output?.connectionType] || '',
          laenge_meter: conn.laenge_meter || null,
          dimension: conn.dimension || '',
          preis_pro_meter_euro: conn.preis_pro_meter || null,
          gesamtpreis_euro: gesamtpreis,
        };
      }),

      // Summen
      summen: {
        komponenten_summe_euro: moduleSumme,
        leitungen_summe_euro: leitungenSumme,
        gesamtsumme_euro: gesamtsumme,
        anzahl_komponenten: modules.length,
        anzahl_leitungen: connections.length,
      }
    };

    // JSON-String erstellen (formatiert für bessere Lesbarkeit)
    const jsonString = JSON.stringify(exportData, null, 2);

    // Download als JSON-Datei
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `Roots_Stueckliste_${project?.name || 'Projekt'}_${timestamp}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportExcel = () => {
    // Erstelle Arbeitsblätter
    const wb = utils.book_new();

    // Sheet 1: Module/Komponenten (ohne Gebäude)
    const moduleData = modules.map((module, index) => {
      const moduleTypeInfo = modultypen?.find(t => t.name === module.moduleType);
      const isProEinheit = moduleTypeInfo?.berechnungsart === 'pro_einheit';
      const einheit = moduleTypeInfo?.einheit || '';
      const menge = module.properties?.menge || '';
      const preisEuro = module.properties?.preis_euro || '';
      const gesamtpreis = isProEinheit && menge && preisEuro ? (menge * preisEuro).toFixed(2) : '';

      return {
        'Pos.': index + 1,
        'Name': module.name || '',
        'Modultyp': module.moduleType || '',
        'Hersteller': module.properties?.hersteller || '',
        'Abmessungen': module.properties?.abmessungen || '',
        ...(isProEinheit ? {
          [`Menge (${einheit})`]: menge,
          [`Preis pro ${einheit} (€)`]: preisEuro,
          'Gesamtpreis (€)': gesamtpreis,
        } : {
          'Preis (€)': preisEuro,
        }),
      };
    });

    const ws1 = utils.json_to_sheet(moduleData);
    utils.book_append_sheet(wb, ws1, 'Komponenten');

    // Sheet 2: Verbindungen/Leitungen
    const connectionData = connections.map((conn, index) => {
      const sourceModule = modules.find(m => m.id === conn.source);
      const targetModule = modules.find(m => m.id === conn.target);
      const output = sourceModule?.outputs?.find(o => o.id === conn.sourceHandle);
      const input = targetModule?.inputs?.find(i => i.id === conn.targetHandle);

      return {
        'Pos.': index + 1,
        'Von Modul': sourceModule?.name || '',
        'Von Ausgang': output?.label || '',
        'Zu Modul': targetModule?.name || '',
        'Zu Eingang': input?.label || '',
        'Verbindungstyp': CONNECTION_TYPE_LABELS[output?.connectionType] || '',
        'Länge (m)': conn.laenge_meter || '',
        'Dimension': conn.dimension || '',
        'Preis/m (€)': conn.preis_pro_meter || '',
        'Gesamtpreis (€)': conn.preis_pro_meter && conn.laenge_meter
          ? (conn.preis_pro_meter * conn.laenge_meter).toFixed(2)
          : '',
        'Anschluss Ausgang': conn.anschluss_ausgang || '',
        'Anschluss Eingang': conn.anschluss_eingang || '',
      };
    });

    const ws2 = utils.json_to_sheet(connectionData);
    utils.book_append_sheet(wb, ws2, 'Leitungen');

    // Dateiname mit Timestamp
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `Roots_Stueckliste_${project?.name || 'Projekt'}_${timestamp}.xlsx`;

    // Download
    writeFile(wb, filename);
  };

  // Berechne Summen
  const moduleSumme = modules.reduce((sum, module) => {
    const moduleTypeInfo = modultypen?.find(t => t.name === module.moduleType);
    const isProEinheit = moduleTypeInfo?.berechnungsart === 'pro_einheit';
    const menge = module.properties?.menge || null;
    const preisEuro = module.properties?.preis_euro || null;

    if (!preisEuro) return sum;

    const itemTotal = isProEinheit && menge ? menge * preisEuro : preisEuro;
    return sum + itemTotal;
  }, 0);

  const leitungenSumme = connections.reduce((sum, conn) => {
    if (conn.preis_pro_meter && conn.laenge_meter) {
      return sum + (conn.preis_pro_meter * conn.laenge_meter);
    }
    return sum;
  }, 0);

  const gesamtsumme = moduleSumme + leitungenSumme;

  if (modules.length === 0) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        Keine Konfiguration vorhanden. Erstelle zuerst Module im Konfigurator.
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header mit Projekteckdaten */}
      {project && (
        <div style={{
          background: 'var(--bg-secondary)',
          border: '2px solid var(--accent)',
          borderRadius: '8px',
          padding: '24px',
          marginBottom: '32px'
        }}>
          <h2 style={{ margin: 0, marginBottom: '16px', color: 'var(--accent)' }}>
            {project.name || 'Projekt'}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', fontSize: '13px' }}>
            {project.building_address && (
              <div><span style={{ color: 'var(--text-secondary)' }}>Adresse:</span> <strong>{project.building_address}</strong></div>
            )}
            {project.beheizte_flaeche && (
              <div><span style={{ color: 'var(--text-secondary)' }}>Beheizte Fläche:</span> <strong>{project.beheizte_flaeche} m²</strong></div>
            )}
            {project.anzahl_wohnungen && (
              <div><span style={{ color: 'var(--text-secondary)' }}>Anzahl Wohnungen:</span> <strong>{project.anzahl_wohnungen}</strong></div>
            )}
            {project.anzahl_stockwerke && (
              <div><span style={{ color: 'var(--text-secondary)' }}>Anzahl Stockwerke:</span> <strong>{project.anzahl_stockwerke}</strong></div>
            )}
            {project.eigentuemer && (
              <div><span style={{ color: 'var(--text-secondary)' }}>Eigentümer:</span> <strong>{project.eigentuemer}</strong></div>
            )}
            {project.building_year && (
              <div><span style={{ color: 'var(--text-secondary)' }}>Baujahr:</span> <strong>{project.building_year}</strong></div>
            )}
          </div>
        </div>
      )}

      {/* Export-Buttons und Zusammenfassung */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h3 style={{ margin: 0, marginBottom: '8px' }}>Stückliste</h3>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            {modules.length} Komponenten • {connections.length} Leitungen
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => setShowAirtableSettings(true)}
            style={{
              padding: '12px 16px',
              background: 'var(--bg-tertiary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border)',
              borderRadius: '4px',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: '14px',
            }}
            title="Airtable-Einstellungen"
          >
            ⚙️
          </button>
          <button
            onClick={handleSendToAirtable}
            disabled={modules.length === 0 && connections.length === 0 || isSendingToAirtable}
            style={{
              padding: '12px 24px',
              background: 'var(--accent)',
              color: 'var(--bg-primary)',
              border: 'none',
              borderRadius: '4px',
              fontWeight: 600,
              cursor: modules.length === 0 && connections.length === 0 || isSendingToAirtable ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
              fontSize: '14px',
              opacity: modules.length === 0 && connections.length === 0 || isSendingToAirtable ? 0.5 : 1,
            }}
          >
            {isSendingToAirtable ? '⏳ Sende...' : '📤 An Airtable senden'}
          </button>
          <button
            onClick={handleExportJSON}
            disabled={modules.length === 0 && connections.length === 0}
            style={{
              padding: '12px 24px',
              background: 'var(--bg-tertiary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border)',
              borderRadius: '4px',
              fontWeight: 600,
              cursor: modules.length === 0 && connections.length === 0 ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
              fontSize: '14px',
              opacity: modules.length === 0 && connections.length === 0 ? 0.5 : 1,
            }}
          >
            JSON Export
          </button>
          <button
            onClick={handleExportExcel}
            disabled={modules.length === 0 && connections.length === 0}
            style={{
              padding: '12px 24px',
              background: 'var(--success)',
              color: 'var(--bg-primary)',
              border: 'none',
              borderRadius: '4px',
              fontWeight: 600,
              cursor: modules.length === 0 && connections.length === 0 ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
              fontSize: '14px',
              opacity: modules.length === 0 && connections.length === 0 ? 0.5 : 1,
            }}
          >
            Excel Export
          </button>
        </div>
      </div>

      {/* Komponenten */}
      <Section title="Komponenten">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg-secondary)', borderBottom: '2px solid var(--border)' }}>
              <th style={tableHeaderStyle}>Pos.</th>
              <th style={tableHeaderStyle}>Name</th>
              <th style={tableHeaderStyle}>Modultyp</th>
              <th style={tableHeaderStyle}>Hersteller</th>
              <th style={tableHeaderStyle}>Abmessungen</th>
              <th style={tableHeaderStyle}>Menge</th>
              <th style={tableHeaderStyle}>Preis</th>
              <th style={tableHeaderStyle}>Gesamt (€)</th>
            </tr>
          </thead>
          <tbody>
            {modules.map((module, index) => {
              const moduleTypeInfo = modultypen?.find(t => t.name === module.moduleType);
              const isProEinheit = moduleTypeInfo?.berechnungsart === 'pro_einheit';
              const einheit = moduleTypeInfo?.einheit || '';
              const menge = module.properties?.menge || null;
              const preisEuro = module.properties?.preis_euro || null;
              const gesamtpreis = isProEinheit && menge && preisEuro ? (menge * preisEuro).toFixed(2) : (preisEuro || '—');

              return (
                <tr
                  key={module.id}
                  style={{
                    background: index % 2 === 0 ? 'var(--bg-secondary)' : 'var(--bg-tertiary)',
                    borderBottom: '1px solid var(--border)',
                  }}
                >
                  <td style={tableCellStyle}>{index + 1}</td>
                  <td style={{ ...tableCellStyle, fontWeight: 600 }}>{module.name}</td>
                  <td style={tableCellStyle}>{module.moduleType}</td>
                  <td style={tableCellStyle}>{module.properties?.hersteller || '—'}</td>
                  <td style={tableCellStyle}>{module.properties?.abmessungen || '—'}</td>
                  <td style={tableCellStyle}>
                    {isProEinheit ? (
                      <input
                        type="number"
                        step="0.01"
                        value={menge ?? ''}
                        onChange={(e) => handleModuleMengeChange(module.id, e.target.value)}
                        placeholder="—"
                        style={{
                          width: '80px',
                          padding: '4px 8px',
                          background: 'var(--bg-tertiary)',
                          border: '1px solid var(--border)',
                          borderRadius: '4px',
                          color: 'var(--text-primary)',
                          fontFamily: 'inherit',
                          fontSize: '13px',
                        }}
                      />
                    ) : (
                      '1'
                    )}
                    {isProEinheit && <span style={{ marginLeft: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>{einheit}</span>}
                  </td>
                  <td style={tableCellStyle}>
                    <input
                      type="number"
                      step="0.01"
                      value={preisEuro ?? ''}
                      onChange={(e) => handleModulePriceChange(module.id, e.target.value)}
                      placeholder="—"
                      style={{
                        width: '80px',
                        padding: '4px 8px',
                        background: 'var(--bg-tertiary)',
                        border: '1px solid var(--border)',
                        borderRadius: '4px',
                        color: 'var(--text-primary)',
                        fontFamily: 'inherit',
                        fontSize: '13px',
                      }}
                    />
                    {isProEinheit && <span style={{ marginLeft: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>€/{einheit}</span>}
                  </td>
                  <td style={{ ...tableCellStyle, fontWeight: 600, color: 'var(--accent)' }}>
                    {gesamtpreis}
                  </td>
                </tr>
              );
            })}
            {/* Zwischensumme Komponenten */}
            <tr style={{ background: 'var(--accent)', borderTop: '2px solid var(--border)' }}>
              <td colSpan="7" style={{ ...tableCellStyle, fontWeight: 700, color: 'var(--bg-primary)', textAlign: 'right', padding: '16px' }}>
                Zwischensumme Komponenten:
              </td>
              <td style={{ ...tableCellStyle, fontWeight: 700, fontSize: '15px', color: 'var(--bg-primary)', padding: '16px' }}>
                {moduleSumme.toFixed(2)} €
              </td>
            </tr>
          </tbody>
        </table>
      </Section>

      {/* Leitungen */}
      <Section title="Leitungen (Rohre & Kabel)">
        {connections.length === 0 ? (
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', padding: '16px' }}>
            Keine Verbindungen vorhanden
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg-secondary)', borderBottom: '2px solid var(--border)' }}>
                <th style={tableHeaderStyle}>Pos.</th>
                <th style={tableHeaderStyle}>Von</th>
                <th style={tableHeaderStyle}>Zu</th>
                <th style={tableHeaderStyle}>Typ</th>
                <th style={tableHeaderStyle}>Länge</th>
                <th style={tableHeaderStyle}>Dimension</th>
                <th style={tableHeaderStyle}>Preis/m (€)</th>
                <th style={tableHeaderStyle}>Gesamtpreis (€)</th>
                <th style={tableHeaderStyle}>Anschluss Aus</th>
                <th style={tableHeaderStyle}>Anschluss Ein</th>
              </tr>
            </thead>
            <tbody>
              {connections.map((conn, index) => {
                const sourceModule = modules.find(m => m.id === conn.source);
                const targetModule = modules.find(m => m.id === conn.target);
                const output = sourceModule?.outputs?.find(o => o.id === conn.sourceHandle);
                const input = targetModule?.inputs?.find(i => i.id === conn.targetHandle);

                return (
                  <tr
                    key={conn.id || index}
                    style={{
                      background: index % 2 === 0 ? 'var(--bg-secondary)' : 'var(--bg-tertiary)',
                      borderBottom: '1px solid var(--border)',
                    }}
                  >
                    <td style={tableCellStyle}>{index + 1}</td>
                    <td style={tableCellStyle}>
                      <div style={{ fontWeight: 600, marginBottom: '2px' }}>{sourceModule?.name || '—'}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                        {output?.label || 'Ausgang'}
                      </div>
                    </td>
                    <td style={tableCellStyle}>
                      <div style={{ fontWeight: 600, marginBottom: '2px' }}>{targetModule?.name || '—'}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                        {input?.label || 'Eingang'}
                      </div>
                    </td>
                    <td style={tableCellStyle}>{CONNECTION_TYPE_LABELS[output?.connectionType] || '—'}</td>
                    <td style={tableCellStyle}>{conn.laenge_meter ? `${conn.laenge_meter} m` : '—'}</td>
                    <td style={tableCellStyle}>{conn.dimension || '—'}</td>
                    <td style={tableCellStyle}>
                      <input
                        type="number"
                        step="0.01"
                        value={conn.preis_pro_meter ?? ''}
                        onChange={(e) => handleConnectionPriceChange(conn.id, e.target.value)}
                        placeholder="—"
                        style={{
                          width: '80px',
                          padding: '4px 8px',
                          background: 'var(--bg-tertiary)',
                          border: '1px solid var(--border)',
                          borderRadius: '4px',
                          color: 'var(--text-primary)',
                          fontFamily: 'inherit',
                          fontSize: '13px',
                        }}
                      />
                    </td>
                    <td style={tableCellStyle}>
                      {conn.preis_pro_meter && conn.laenge_meter
                        ? (conn.preis_pro_meter * conn.laenge_meter).toFixed(2)
                        : '—'}
                    </td>
                    <td style={tableCellStyle}>{conn.anschluss_ausgang || '—'}</td>
                    <td style={tableCellStyle}>{conn.anschluss_eingang || '—'}</td>
                  </tr>
                );
              })}
              {/* Zwischensumme Leitungen */}
              {connections.length > 0 && (
                <tr style={{ background: 'var(--accent)', borderTop: '2px solid var(--border)' }}>
                  <td colSpan="7" style={{ ...tableCellStyle, fontWeight: 700, color: 'var(--bg-primary)', textAlign: 'right', padding: '16px' }}>
                    Zwischensumme Leitungen:
                  </td>
                  <td style={{ ...tableCellStyle, fontWeight: 700, fontSize: '15px', color: 'var(--bg-primary)', padding: '16px' }}>
                    {leitungenSumme.toFixed(2)} €
                  </td>
                  <td colSpan="2"></td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </Section>

      {/* Gesamtsumme */}
      <div style={{
        background: 'var(--bg-secondary)',
        border: '3px solid var(--accent)',
        borderRadius: '8px',
        padding: '24px',
        marginTop: '32px',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div style={{
            fontSize: '20px',
            fontWeight: 700,
            color: 'var(--accent)',
            textTransform: 'uppercase',
            letterSpacing: '1px',
          }}>
            Gesamtsumme
          </div>
          <div style={{
            fontSize: '28px',
            fontWeight: 700,
            color: 'var(--accent)',
          }}>
            {gesamtsumme.toFixed(2)} €
          </div>
        </div>
        <div style={{
          marginTop: '12px',
          fontSize: '13px',
          color: 'var(--text-secondary)',
          display: 'flex',
          gap: '24px',
        }}>
          <span>Komponenten: {moduleSumme.toFixed(2)} €</span>
          <span>Leitungen: {leitungenSumme.toFixed(2)} €</span>
        </div>
      </div>

      {/* Airtable Settings Modal */}
      {showAirtableSettings && (
        <AirtableSettings onClose={() => setShowAirtableSettings(false)} />
      )}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: '48px' }}>
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
      <div
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          overflow: 'hidden',
        }}
      >
        {children}
      </div>
    </div>
  );
}

const tableHeaderStyle = {
  padding: '12px 16px',
  textAlign: 'left',
  fontSize: '12px',
  fontWeight: 600,
  color: 'var(--accent)',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
};

const tableCellStyle = {
  padding: '12px 16px',
  fontSize: '13px',
  color: 'var(--text-primary)',
};
