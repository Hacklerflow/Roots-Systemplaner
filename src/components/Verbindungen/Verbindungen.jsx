import { isJunction } from '../../data/types';
import { getConnectionTypeColor, formatConnectionType } from '../../data/compatibilityChecker';

export default function Verbindungen({ configuration, setConfiguration }) {
  const { building, modules, junctions, connections } = configuration;

  // Alle Elemente (Building, Module, Junctions) für Lookup
  const allElements = [
    building,
    ...modules,
    ...junctions,
  ].filter(Boolean);

  // Hilfsfunktion: Finde Element by ID
  const findElement = (id) => allElements.find(el => el.id === id);

  // Hilfsfunktion: Name des Elements
  const getElementName = (element) => {
    if (!element) return '?';
    if (isJunction(element)) return element.label || 'Knotenpunkt';
    return element.name || 'Unbekannt';
  };

  // Hilfsfunktion: Finde Output/Input Label
  const getHandleLabel = (element, handleId, isOutput) => {
    if (!element) return handleId;
    if (isJunction(element)) return handleId;

    const handles = isOutput ? element.outputs : element.inputs;
    const handle = handles?.find(h => h.id === handleId);
    return handle?.label || handleId;
  };

  // Verbindung löschen
  const handleDeleteConnection = (connectionId) => {
    if (confirm('Verbindung wirklich löschen?')) {
      setConfiguration({
        ...configuration,
        connections: connections.filter(c => c.id !== connectionId),
      });
    }
  };

  // Verbindung bearbeiten (Preis, Länge, etc.)
  const handleUpdateConnection = (connectionId, updates) => {
    setConfiguration({
      ...configuration,
      connections: connections.map(c =>
        c.id === connectionId ? { ...c, ...updates } : c
      ),
    });
  };

  if (!building) {
    return (
      <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>
        <h2 style={{ marginTop: 0 }}>Verbindungen</h2>
        <div style={{
          padding: '32px',
          background: 'var(--bg-secondary)',
          borderRadius: '8px',
          textAlign: 'center',
          color: 'var(--text-secondary)',
        }}>
          Bitte erstelle zuerst ein Gebäude im Konfigurator.
        </div>
      </div>
    );
  }

  if (connections.length === 0) {
    return (
      <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>
        <h2 style={{ marginTop: 0, marginBottom: '8px' }}>Verbindungen</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '14px' }}>
          Übersicht aller Verbindungen in der Konfiguration
        </p>
        <div style={{
          padding: '32px',
          background: 'var(--bg-secondary)',
          borderRadius: '8px',
          textAlign: 'center',
          color: 'var(--text-secondary)',
        }}>
          Keine Verbindungen vorhanden. Erstelle Verbindungen im Konfigurator.
        </div>
      </div>
    );
  }

  // Berechne Gesamtpreis pro Verbindung
  const getConnectionPrice = (conn) => {
    const length = conn.laenge_meter || 0;
    const pricePerMeter = conn.preis_pro_meter || 0;
    return length * pricePerMeter;
  };

  // Gesamtpreis aller Verbindungen
  const totalPrice = connections.reduce((sum, conn) => sum + getConnectionPrice(conn), 0);

  return (
    <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>
      <h2 style={{ marginTop: 0, marginBottom: '8px' }}>Verbindungen</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '14px' }}>
        Übersicht aller Verbindungen in der Konfiguration – {connections.length} Verbindung(en)
      </p>

      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
        background: 'var(--bg-secondary)',
        borderRadius: '8px',
        overflow: 'hidden',
      }}>
        <thead>
          <tr style={{ background: 'var(--bg-tertiary)', borderBottom: '2px solid var(--border)' }}>
            <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, fontSize: '13px' }}>Von</th>
            <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, fontSize: '13px' }}>Nach</th>
            <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, fontSize: '13px' }}>Typ</th>
            <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, fontSize: '13px' }}>Dimension</th>
            <th style={{ padding: '12px', textAlign: 'right', fontWeight: 600, fontSize: '13px' }}>Länge (m)</th>
            <th style={{ padding: '12px', textAlign: 'right', fontWeight: 600, fontSize: '13px' }}>€/m</th>
            <th style={{ padding: '12px', textAlign: 'right', fontWeight: 600, fontSize: '13px' }}>Gesamt (€)</th>
            <th style={{ padding: '12px', textAlign: 'right', fontWeight: 600, fontSize: '13px' }}>Aktionen</th>
          </tr>
        </thead>
        <tbody>
          {connections.map((conn) => {
            const sourceElement = findElement(conn.source);
            const targetElement = findElement(conn.target);
            const connectionPrice = getConnectionPrice(conn);

            return (
              <tr key={conn.id} style={{ borderBottom: '1px solid var(--border)' }}>
                {/* Von */}
                <td style={{ padding: '12px' }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '2px' }}>
                    {getElementName(sourceElement)}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                    {getHandleLabel(sourceElement, conn.sourceHandle, true)}
                  </div>
                </td>

                {/* Nach */}
                <td style={{ padding: '12px' }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '2px' }}>
                    {getElementName(targetElement)}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                    {getHandleLabel(targetElement, conn.targetHandle, false)}
                  </div>
                </td>

                {/* Typ */}
                <td style={{ padding: '12px' }}>
                  {conn.connectionType && (
                    <div style={{
                      display: 'inline-block',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 600,
                      background: getConnectionTypeColor(conn.connectionType) + '22',
                      color: getConnectionTypeColor(conn.connectionType),
                      border: `1px solid ${getConnectionTypeColor(conn.connectionType)}`,
                    }}>
                      {formatConnectionType(conn.connectionType)}
                    </div>
                  )}
                </td>

                {/* Dimension */}
                <td style={{ padding: '12px', fontSize: '14px' }}>
                  {conn.dimension || '—'}
                </td>

                {/* Länge */}
                <td style={{ padding: '12px', textAlign: 'right' }}>
                  <input
                    type="number"
                    step="0.1"
                    value={conn.laenge_meter ?? ''}
                    onChange={(e) => handleUpdateConnection(conn.id, {
                      laenge_meter: e.target.value ? parseFloat(e.target.value) : null
                    })}
                    placeholder="0"
                    style={{
                      width: '80px',
                      padding: '6px 8px',
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--border)',
                      borderRadius: '4px',
                      color: 'var(--text-primary)',
                      fontFamily: 'inherit',
                      fontSize: '13px',
                      textAlign: 'right',
                    }}
                  />
                </td>

                {/* Preis pro Meter */}
                <td style={{ padding: '12px', textAlign: 'right' }}>
                  <input
                    type="number"
                    step="0.01"
                    value={conn.preis_pro_meter ?? ''}
                    onChange={(e) => handleUpdateConnection(conn.id, {
                      preis_pro_meter: e.target.value ? parseFloat(e.target.value) : null
                    })}
                    placeholder="0"
                    style={{
                      width: '80px',
                      padding: '6px 8px',
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--border)',
                      borderRadius: '4px',
                      color: 'var(--text-primary)',
                      fontFamily: 'inherit',
                      fontSize: '13px',
                      textAlign: 'right',
                    }}
                  />
                </td>

                {/* Gesamtpreis */}
                <td style={{
                  padding: '12px',
                  textAlign: 'right',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: connectionPrice > 0 ? 'var(--success)' : 'var(--text-secondary)',
                }}>
                  {connectionPrice > 0 ? connectionPrice.toFixed(2) : '—'}
                </td>

                {/* Aktionen */}
                <td style={{ padding: '12px', textAlign: 'right' }}>
                  <button
                    onClick={() => handleDeleteConnection(conn.id)}
                    style={{
                      padding: '6px 12px',
                      background: 'var(--error)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: 600,
                    }}
                  >
                    Löschen
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>

        {/* Footer mit Gesamtsumme */}
        <tfoot>
          <tr style={{ background: 'var(--bg-tertiary)', borderTop: '2px solid var(--border)' }}>
            <td colSpan="6" style={{ padding: '12px', textAlign: 'right', fontWeight: 600 }}>
              Gesamtpreis:
            </td>
            <td style={{
              padding: '12px',
              textAlign: 'right',
              fontSize: '16px',
              fontWeight: 700,
              color: 'var(--accent)',
            }}>
              {totalPrice.toFixed(2)} €
            </td>
            <td></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
