import { useState, useEffect } from 'react';

export default function ConnectionModal({ connection, sourceModule, targetModule, onClose, onSave, onDelete }) {
  const [formData, setFormData] = useState({
    laenge_meter: connection.laenge_meter || null,
    dimension: connection.dimension || '',
    anschluss_eingang: connection.anschluss_eingang || '',
    anschluss_ausgang: connection.anschluss_ausgang || '',
  });

  useEffect(() => {
    setFormData({
      laenge_meter: connection.laenge_meter || null,
      dimension: connection.dimension || '',
      anschluss_eingang: connection.anschluss_eingang || '',
      anschluss_ausgang: connection.anschluss_ausgang || '',
    });
  }, [connection]);

  if (!connection || !sourceModule || !targetModule) return null;

  const handleSave = () => {
    onSave({
      ...connection,
      ...formData,
    });
    onClose();
  };

  const handleDelete = () => {
    if (confirm('Verbindung wirklich löschen?')) {
      onDelete();
      onClose();
    }
  };

  // Finde die Output/Input Labels
  const output = sourceModule.outputs?.find(o => o.id === connection.sourceHandle);
  const input = targetModule.inputs?.find(i => i.id === connection.targetHandle);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--bg-secondary)',
          border: '2px solid var(--accent)',
          borderRadius: '8px',
          padding: '24px',
          maxWidth: '600px',
          width: '90%',
          maxHeight: '90vh',
          overflow: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ marginTop: 0, marginBottom: '24px', color: 'var(--accent)' }}>
          Verbindung bearbeiten
        </h2>

        {/* Verbindungs-Info */}
        <div style={{
          background: 'var(--bg-tertiary)',
          padding: '16px',
          borderRadius: '4px',
          marginBottom: '24px',
          border: '1px solid var(--border)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>
                {sourceModule.name}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                {output?.label || 'Ausgang'}
              </div>
            </div>
            <div style={{ fontSize: '20px', color: 'var(--accent)' }}>→</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>
                {targetModule.name}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                {input?.label || 'Eingang'}
              </div>
            </div>
          </div>
        </div>

        {/* Eigenschaften */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
          {/* Länge */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '13px' }}>
              Länge (Meter)
            </label>
            <input
              type="number"
              step="0.1"
              value={formData.laenge_meter ?? ''}
              onChange={(e) => setFormData({
                ...formData,
                laenge_meter: e.target.value ? parseFloat(e.target.value) : null
              })}
              placeholder="z.B. 5.5"
              style={{
                width: '100%',
                padding: '10px',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                color: 'var(--text-primary)',
                fontFamily: 'inherit',
                fontSize: '14px',
              }}
            />
          </div>

          {/* Dimension */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '13px' }}>
              Dimension
            </label>
            <input
              type="text"
              value={formData.dimension}
              onChange={(e) => setFormData({ ...formData, dimension: e.target.value })}
              placeholder="z.B. DN50, 3/4 Zoll"
              style={{
                width: '100%',
                padding: '10px',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                color: 'var(--text-primary)',
                fontFamily: 'inherit',
                fontSize: '14px',
              }}
            />
          </div>

          {/* Anschluss Ausgang */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '13px' }}>
              Anschluss Ausgang
            </label>
            <input
              type="text"
              value={formData.anschluss_ausgang}
              onChange={(e) => setFormData({ ...formData, anschluss_ausgang: e.target.value })}
              placeholder="z.B. AG, IG, Flansch"
              style={{
                width: '100%',
                padding: '10px',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                color: 'var(--text-primary)',
                fontFamily: 'inherit',
                fontSize: '14px',
              }}
            />
          </div>

          {/* Anschluss Eingang */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '13px' }}>
              Anschluss Eingang
            </label>
            <input
              type="text"
              value={formData.anschluss_eingang}
              onChange={(e) => setFormData({ ...formData, anschluss_eingang: e.target.value })}
              placeholder="z.B. AG, IG, Flansch"
              style={{
                width: '100%',
                padding: '10px',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                color: 'var(--text-primary)',
                fontFamily: 'inherit',
                fontSize: '14px',
              }}
            />
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={handleSave}
            style={{
              flex: 1,
              padding: '12px',
              background: 'var(--accent)',
              color: 'var(--bg-primary)',
              border: 'none',
              borderRadius: '4px',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: '14px',
            }}
          >
            Speichern
          </button>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '12px',
              background: 'var(--bg-tertiary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border)',
              borderRadius: '4px',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: '14px',
            }}
          >
            Abbrechen
          </button>
          <button
            onClick={handleDelete}
            style={{
              flex: 1,
              padding: '12px',
              background: 'var(--error)',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: '14px',
            }}
          >
            Löschen
          </button>
        </div>
      </div>
    </div>
  );
}
