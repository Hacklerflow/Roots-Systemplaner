import { utils, writeFile } from 'xlsx';
import { isBuilding, CONNECTION_TYPE_LABELS } from '../../data/types';

export default function Stueckliste({ configuration }) {
  const { building, modules = [], connections = [] } = configuration || {};

  const allModules = building ? [building, ...modules] : modules;

  const handleExportExcel = () => {
    // Erstelle Arbeitsblätter
    const wb = utils.book_new();

    // Sheet 1: Module/Komponenten
    const moduleData = allModules.map((module, index) => ({
      'Pos.': index + 1,
      'Typ': isBuilding(module) ? 'Gebäude' : 'Modul',
      'Name': module.name || '',
      'Modultyp': module.moduleType || '',
      'Hersteller': module.properties?.hersteller || '',
      'Leistung (kW)': module.properties?.leistung_nominal_kw || '',
      'Volumen (L)': module.properties?.volumen_liter || '',
      'Abmessungen': module.properties?.abmessungen || '',
      'Gewicht (kg)': module.properties?.gewicht_kg || '',
      'Eingänge': module.inputs?.length || 0,
      'Ausgänge': module.outputs?.length || 0,
    }));

    const ws1 = utils.json_to_sheet(moduleData);
    utils.book_append_sheet(wb, ws1, 'Komponenten');

    // Sheet 2: Verbindungen/Leitungen
    const connectionData = connections.map((conn, index) => {
      const sourceModule = allModules.find(m => m.id === conn.source);
      const targetModule = allModules.find(m => m.id === conn.target);
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
        'Anschluss Ausgang': conn.anschluss_ausgang || '',
        'Anschluss Eingang': conn.anschluss_eingang || '',
      };
    });

    const ws2 = utils.json_to_sheet(connectionData);
    utils.book_append_sheet(wb, ws2, 'Leitungen');

    // Dateiname mit Timestamp
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `Roots_Stueckliste_${building?.name || 'System'}_${timestamp}.xlsx`;

    // Download
    writeFile(wb, filename);
  };

  if (!building && modules.length === 0) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        Keine Konfiguration vorhanden. Erstelle zuerst ein System im Konfigurator.
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header mit Export-Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h2 style={{ margin: 0, marginBottom: '8px' }}>Stückliste</h2>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            {building?.name || 'System'} • {allModules.length} Komponenten • {connections.length} Leitungen
          </div>
        </div>
        <button
          onClick={handleExportExcel}
          disabled={allModules.length === 0 && connections.length === 0}
          style={{
            padding: '12px 24px',
            background: 'var(--success)',
            color: 'var(--bg-primary)',
            border: 'none',
            borderRadius: '4px',
            fontWeight: 600,
            cursor: allModules.length === 0 && connections.length === 0 ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit',
            fontSize: '14px',
            opacity: allModules.length === 0 && connections.length === 0 ? 0.5 : 1,
          }}
        >
          📥 Excel Export
        </button>
      </div>

      {/* Komponenten */}
      <Section title="Komponenten">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg-secondary)', borderBottom: '2px solid var(--border)' }}>
              <th style={tableHeaderStyle}>Pos.</th>
              <th style={tableHeaderStyle}>Typ</th>
              <th style={tableHeaderStyle}>Name</th>
              <th style={tableHeaderStyle}>Modultyp</th>
              <th style={tableHeaderStyle}>Hersteller</th>
              <th style={tableHeaderStyle}>Leistung</th>
              <th style={tableHeaderStyle}>Volumen</th>
              <th style={tableHeaderStyle}>Abmessungen</th>
              <th style={tableHeaderStyle}>Gewicht</th>
              <th style={tableHeaderStyle}>Ein/Aus</th>
            </tr>
          </thead>
          <tbody>
            {allModules.map((module, index) => (
              <tr
                key={module.id}
                style={{
                  background: index % 2 === 0 ? 'var(--bg-secondary)' : 'var(--bg-tertiary)',
                  borderBottom: '1px solid var(--border)',
                }}
              >
                <td style={tableCellStyle}>{index + 1}</td>
                <td style={tableCellStyle}>{isBuilding(module) ? 'Gebäude' : 'Modul'}</td>
                <td style={{ ...tableCellStyle, fontWeight: 600 }}>{module.name}</td>
                <td style={tableCellStyle}>{module.moduleType}</td>
                <td style={tableCellStyle}>{module.properties?.hersteller || '—'}</td>
                <td style={tableCellStyle}>
                  {module.properties?.leistung_nominal_kw ? `${module.properties.leistung_nominal_kw} kW` : '—'}
                </td>
                <td style={tableCellStyle}>
                  {module.properties?.volumen_liter ? `${module.properties.volumen_liter} L` : '—'}
                </td>
                <td style={tableCellStyle}>{module.properties?.abmessungen || '—'}</td>
                <td style={tableCellStyle}>
                  {module.properties?.gewicht_kg ? `${module.properties.gewicht_kg} kg` : '—'}
                </td>
                <td style={tableCellStyle}>
                  {module.inputs?.length || 0} / {module.outputs?.length || 0}
                </td>
              </tr>
            ))}
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
                <th style={tableHeaderStyle}>Anschluss Aus</th>
                <th style={tableHeaderStyle}>Anschluss Ein</th>
              </tr>
            </thead>
            <tbody>
              {connections.map((conn, index) => {
                const sourceModule = allModules.find(m => m.id === conn.source);
                const targetModule = allModules.find(m => m.id === conn.target);
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
                    <td style={tableCellStyle}>{conn.anschluss_ausgang || '—'}</td>
                    <td style={tableCellStyle}>{conn.anschluss_eingang || '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Section>
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
