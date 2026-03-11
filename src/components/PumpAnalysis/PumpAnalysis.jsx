/**
 * Pump Analysis Component
 *
 * Displays pressure loss calculations for all pump paths in the configuration.
 * Shows pump utilization, warnings, and recommendations.
 */

import { useMemo, useState, useEffect } from 'react';
import {
  calculateAllPumpPaths,
  getPressureLossSummary,
} from '../../utils/pathCalculator';
import { catalogsAPI } from '../../api/client';

export default function PumpAnalysis({ configuration, formulaskatalog, pipeCatalog = [], soleCatalog = [] }) {
  const [calculationMethods, setCalculationMethods] = useState([]);
  const [activeMethod, setActiveMethod] = useState(null);

  // Fetch calculation methods
  useEffect(() => {
    const fetchMethods = async () => {
      try {
        const result = await catalogsAPI.getCalculationMethods();
        const methods = result.calculationMethods || [];
        setCalculationMethods(methods);
        const active = methods.find(m => m.is_active);
        setActiveMethod(active);
      } catch (error) {
        console.error('Failed to fetch calculation methods:', error);
      }
    };
    fetchMethods();
  }, []);

  // Find active formula (fallback)
  const activeFormula = useMemo(() => {
    return formulaskatalog?.find(f => f.is_active);
  }, [formulaskatalog]);

  // Determine which method to use
  const calculationMethod = activeMethod || activeFormula;

  // Calculate all pump paths
  const pumpAnalysis = useMemo(() => {
    if (!calculationMethod) return [];
    return calculateAllPumpPaths(configuration, calculationMethod, pipeCatalog, soleCatalog);
  }, [configuration, calculationMethod, pipeCatalog, soleCatalog]);

  // Get summary with warnings
  const summary = useMemo(() => {
    if (!calculationMethod) return null;
    return getPressureLossSummary(configuration, calculationMethod, pipeCatalog, soleCatalog);
  }, [configuration, calculationMethod, pipeCatalog, soleCatalog]);

  if (!calculationMethod) {
    return (
      <div style={styles.container}>
        <div style={styles.warning}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>⚠️</div>
          <div style={{ fontWeight: 600, marginBottom: '4px' }}>
            Keine aktive Berechnungsmethode
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Bitte aktivieren Sie eine Druckverlust-Berechnungsmethode in den Einstellungen
          </div>
        </div>
      </div>
    );
  }

  if (pumpAnalysis.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.info}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>💡</div>
          <div style={{ fontWeight: 600, marginBottom: '4px' }}>
            Keine Pumpen definiert
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Fügen Sie Pumpen zu hydraulischen Ausgängen hinzu, um Druckverluste zu berechnen
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Summary Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>Pumpenanalyse</h2>
        <div style={styles.formulaInfo}>
          <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
            Berechnungsmethode:
          </span>
          <span style={{ fontWeight: 600, fontSize: '13px', marginLeft: '8px' }}>
            {calculationMethod.name}
          </span>
          {calculationMethod.genauigkeit && (
            <span style={{ color: 'var(--accent)', fontSize: '11px', marginLeft: '8px' }}>
              ({calculationMethod.genauigkeit})
            </span>
          )}
        </div>
        {calculationMethod.beschreibung && (
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {calculationMethod.beschreibung}
          </div>
        )}
      </div>

      {/* Summary Stats */}
      {summary && (
        <div style={styles.summaryGrid}>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{summary.totalPumps}</div>
            <div style={styles.statLabel}>Pumpen</div>
          </div>
          {summary.overloadedPumps > 0 && (
            <div style={{ ...styles.statCard, borderLeft: '3px solid var(--error)' }}>
              <div style={{ ...styles.statValue, color: 'var(--error)' }}>
                {summary.overloadedPumps}
              </div>
              <div style={styles.statLabel}>Überlastet</div>
            </div>
          )}
          {summary.underutilizedPumps > 0 && (
            <div style={{ ...styles.statCard, borderLeft: '3px solid var(--warning)' }}>
              <div style={{ ...styles.statValue, color: 'var(--warning)' }}>
                {summary.underutilizedPumps}
              </div>
              <div style={styles.statLabel}>Unterausgelastet</div>
            </div>
          )}
        </div>
      )}

      {/* Warnings */}
      {summary?.warnings && summary.warnings.length > 0 && (
        <div style={styles.warningsSection}>
          {summary.warnings.map((warning, idx) => (
            <div
              key={idx}
              style={{
                ...styles.warningCard,
                borderLeftColor:
                  warning.severity === 'error' ? 'var(--error)' :
                  warning.severity === 'warning' ? 'var(--warning)' :
                  'var(--info)',
              }}
            >
              <div style={styles.warningIcon}>
                {warning.severity === 'error' ? '❌' :
                 warning.severity === 'warning' ? '⚠️' : 'ℹ️'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={styles.warningMessage}>{warning.message}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pump Details */}
      <div style={styles.pumpsList}>
        {pumpAnalysis.map((analysis, idx) => (
          <PumpCard key={idx} analysis={analysis} />
        ))}
      </div>
    </div>
  );
}

function PumpCard({ analysis }) {
  const { pump, paths, maxUtilization } = analysis;

  const utilizationColor =
    maxUtilization > 100 ? 'var(--error)' :
    maxUtilization > 90 ? 'var(--warning)' :
    maxUtilization < 30 ? 'var(--info)' :
    'var(--success)';

  return (
    <div style={styles.pumpCard}>
      {/* Pump Header */}
      <div style={styles.pumpHeader}>
        <div style={{ flex: 1 }}>
          <div style={styles.pumpName}>{pump.moduleName}</div>
          <div style={styles.pumpOutput}>
            {pump.outputLabel} • Förderhöhe: {pump.pump.förderhoehe_m} m
          </div>
        </div>
        <div style={{
          ...styles.utilizationBadge,
          backgroundColor: utilizationColor,
        }}>
          {maxUtilization.toFixed(1)}%
        </div>
      </div>

      {/* Paths */}
      <div style={styles.pathsList}>
        {paths.length === 0 ? (
          <div style={styles.noPaths}>
            Keine Endpunkte erreichbar
          </div>
        ) : (
          paths.map((path, idx) => (
            <PathCard key={idx} path={path} />
          ))
        )}
      </div>
    </div>
  );
}

function PathCard({ path }) {
  const hasErrors = path.errors && path.errors.length > 0;

  return (
    <div style={styles.pathCard}>
      <div style={styles.pathHeader}>
        <div style={{ flex: 1 }}>
          <div style={styles.pathEndpoint}>
            → {path.endpointModuleName || `Modul ${path.endpointModuleId}`}
          </div>
          <div style={styles.pathMeta}>
            {path.connectionCount} Verbindung(en)
            {hasErrors && (
              <span style={{ color: 'var(--warning)', marginLeft: '8px' }}>
                • {path.errors.length} Fehler
              </span>
            )}
          </div>
        </div>
        <div style={styles.pathLoss}>
          {path.totalLoss.toFixed(2)} m
        </div>
      </div>

      {/* Utilization Bar */}
      <div style={styles.utilizationBar}>
        <div
          style={{
            ...styles.utilizationFill,
            width: `${Math.min(path.utilization, 100)}%`,
            backgroundColor:
              path.utilizationStatus === 'overload' ? 'var(--error)' :
              path.utilizationStatus === 'warning' ? 'var(--warning)' :
              path.utilizationStatus === 'underutilized' ? 'var(--info)' :
              'var(--success)',
          }}
        />
      </div>

      {/* Details Toggle (expandable) */}
      {path.details && path.details.length > 0 && (
        <details style={styles.details}>
          <summary style={styles.detailsSummary}>
            Details anzeigen ({path.details.length} Verbindungen)
          </summary>
          <div style={styles.detailsContent}>
            <div style={styles.detailsNote}>
              Summe vor Multiplikator (× 2): {path.totalBeforeMultiplier.toFixed(2)} m
            </div>
            {path.details.map((detail, idx) => (
              <div key={idx} style={styles.detailRow}>
                <div style={styles.detailIndex}>#{idx + 1}</div>
                <div style={styles.detailData}>
                  {detail.rohrlänge_m}m • {detail.rohrdimension || 'keine DN'} • Faktor {detail.faktor}
                </div>
                <div style={styles.detailLoss}>
                  {detail.error ? (
                    <span style={{ color: 'var(--error)', fontSize: '11px' }}>
                      {detail.error}
                    </span>
                  ) : (
                    `${detail.loss.toFixed(2)} m`
                  )}
                </div>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '24px',
    background: 'var(--bg-primary)',
    minHeight: '100%',
  },
  header: {
    marginBottom: '24px',
  },
  title: {
    margin: '0 0 8px 0',
    fontSize: '20px',
    fontWeight: 600,
  },
  formulaInfo: {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 12px',
    background: 'var(--bg-secondary)',
    borderRadius: '4px',
    border: '1px solid var(--border)',
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '16px',
    marginBottom: '24px',
  },
  statCard: {
    padding: '16px',
    background: 'var(--bg-secondary)',
    borderRadius: '6px',
    border: '1px solid var(--border)',
    borderLeft: '3px solid var(--accent)',
  },
  statValue: {
    fontSize: '32px',
    fontWeight: 700,
    lineHeight: 1,
    marginBottom: '4px',
  },
  statLabel: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  warningsSection: {
    marginBottom: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  warningCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    background: 'var(--bg-secondary)',
    borderRadius: '4px',
    border: '1px solid var(--border)',
    borderLeft: '3px solid var(--warning)',
  },
  warningIcon: {
    fontSize: '20px',
  },
  warningMessage: {
    fontSize: '13px',
    fontWeight: 500,
  },
  warning: {
    padding: '32px',
    textAlign: 'center',
    background: 'var(--bg-secondary)',
    borderRadius: '8px',
    border: '1px solid var(--border)',
  },
  info: {
    padding: '32px',
    textAlign: 'center',
    background: 'var(--bg-secondary)',
    borderRadius: '8px',
    border: '1px solid var(--border)',
  },
  pumpsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  pumpCard: {
    background: 'var(--bg-secondary)',
    borderRadius: '8px',
    border: '1px solid var(--border)',
    overflow: 'hidden',
  },
  pumpHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '16px',
    background: 'var(--bg-tertiary)',
    borderBottom: '1px solid var(--border)',
  },
  pumpName: {
    fontSize: '16px',
    fontWeight: 600,
    marginBottom: '4px',
  },
  pumpOutput: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
  },
  utilizationBadge: {
    padding: '8px 16px',
    borderRadius: '20px',
    fontSize: '18px',
    fontWeight: 700,
    color: 'white',
  },
  pathsList: {
    padding: '8px',
  },
  noPaths: {
    padding: '24px',
    textAlign: 'center',
    color: 'var(--text-secondary)',
    fontSize: '13px',
  },
  pathCard: {
    padding: '12px',
    background: 'var(--bg-primary)',
    borderRadius: '6px',
    marginBottom: '8px',
  },
  pathHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '8px',
  },
  pathEndpoint: {
    fontSize: '14px',
    fontWeight: 600,
    marginBottom: '2px',
  },
  pathMeta: {
    fontSize: '11px',
    color: 'var(--text-secondary)',
  },
  pathLoss: {
    fontSize: '18px',
    fontWeight: 700,
    fontFamily: 'monospace',
    color: 'var(--accent)',
  },
  utilizationBar: {
    height: '6px',
    background: 'var(--bg-tertiary)',
    borderRadius: '3px',
    overflow: 'hidden',
    marginBottom: '8px',
  },
  utilizationFill: {
    height: '100%',
    transition: 'width 0.3s ease',
  },
  details: {
    marginTop: '8px',
  },
  detailsSummary: {
    fontSize: '11px',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    userSelect: 'none',
    padding: '4px 0',
  },
  detailsContent: {
    marginTop: '8px',
    paddingTop: '8px',
    borderTop: '1px solid var(--border)',
  },
  detailsNote: {
    fontSize: '11px',
    color: 'var(--text-secondary)',
    marginBottom: '8px',
    fontStyle: 'italic',
  },
  detailRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 8px',
    background: 'var(--bg-secondary)',
    borderRadius: '4px',
    marginBottom: '4px',
    fontSize: '12px',
  },
  detailIndex: {
    width: '28px',
    fontSize: '10px',
    color: 'var(--text-secondary)',
    fontWeight: 600,
  },
  detailData: {
    flex: 1,
    fontFamily: 'monospace',
  },
  detailLoss: {
    fontWeight: 600,
    fontFamily: 'monospace',
    color: 'var(--accent)',
  },
};
