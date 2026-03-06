export default function BuildingNode({ data }) {
  const { name, properties = {}, onClick } = data;

  // Wichtige Infos für Quick-View
  const stockwerke = properties.stockwerke;
  const einheiten = properties.anzahl_einheiten;
  const heizlastNorm = properties.heizlast_norm_kw;
  const heizlastAuslegung = properties.auslegungsheizlast_kw;
  const adresse = [properties.strasse, properties.hausnummer, properties.ort]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className="building-node"
      onClick={onClick}
      style={{
        background: 'var(--bg-secondary)',
        border: '2px solid var(--accent)',
        borderRadius: '8px',
        padding: '16px',
        minWidth: '240px',
        minHeight: '100px',
        cursor: 'pointer',
        position: 'relative',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: '8px' }}>
        <div style={{ fontWeight: 600, fontSize: '16px', marginBottom: '2px' }}>
          {name}
        </div>
        <div style={{ fontSize: '10px', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
          🏢 Gebäude
        </div>
      </div>

      {/* Adresse */}
      {adresse && (
        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
          📍 {adresse}
        </div>
      )}

      {/* Gebäudedaten */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', fontSize: '11px' }}>
        {stockwerke && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Stockwerke:</span>
            <span style={{ fontWeight: 600 }}>{stockwerke}</span>
          </div>
        )}
        {einheiten && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Einheiten:</span>
            <span style={{ fontWeight: 600 }}>{einheiten}</span>
          </div>
        )}
      </div>

      {/* Heizlast */}
      {(heizlastNorm || heizlastAuslegung) && (
        <div style={{
          marginTop: '8px',
          paddingTop: '8px',
          borderTop: '1px solid var(--border)',
          fontSize: '11px',
        }}>
          {heizlastNorm && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Heizlast Norm:</span>
              <span style={{ fontWeight: 600, color: 'var(--accent)' }}>{heizlastNorm} kW</span>
            </div>
          )}
          {heizlastAuslegung && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Auslegung:</span>
              <span style={{ fontWeight: 600, color: 'var(--accent)' }}>{heizlastAuslegung} kW</span>
            </div>
          )}
        </div>
      )}

      {/* Gebäude hat keine Ein-/Ausgänge - ist nur Info-Container */}
    </div>
  );
}
