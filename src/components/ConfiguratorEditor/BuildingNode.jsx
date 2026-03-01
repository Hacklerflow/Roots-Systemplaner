export default function BuildingNode({ data }) {
  const { name, onClick } = data;

  return (
    <div
      className="building-node"
      onClick={onClick}
      style={{
        background: 'var(--bg-secondary)',
        border: '2px solid var(--accent)',
        borderRadius: '8px',
        padding: '16px',
        minWidth: '200px',
        minHeight: '100px',
        cursor: 'pointer',
        position: 'relative',
      }}
    >
      <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>
        {name}
      </div>
      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
        Gebäude
      </div>
      {/* Gebäude hat keine Ein-/Ausgänge - ist nur Info-Container */}
    </div>
  );
}
