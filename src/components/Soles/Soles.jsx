import { useState } from 'react';
import { catalogsAPI } from '../../api/client';

export default function Soles({ soleskatalog = [], onReload }) {
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    frostschutzmittel: '',
    notiz: '',
    faktor: '1.0',
  });
  const [isCreating, setIsCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleStartCreate = () => {
    setFormData({
      name: '',
      frostschutzmittel: '',
      notiz: '',
      faktor: '1.0',
    });
    setIsCreating(true);
    setEditingId(null);
    setError('');
  };

  const handleStartEdit = (sole) => {
    setFormData({
      name: sole.name || '',
      frostschutzmittel: sole.frostschutzmittel || '',
      notiz: sole.notiz || '',
      faktor: String(sole.faktor || '1.0'),
    });
    setEditingId(sole.id);
    setIsCreating(false);
    setError('');
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsCreating(false);
    setFormData({
      name: '',
      frostschutzmittel: '',
      notiz: '',
      faktor: '1.0',
    });
    setError('');
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setError('Name ist erforderlich');
      return;
    }

    const faktorNum = parseFloat(formData.faktor);
    if (isNaN(faktorNum)) {
      setError('Faktor muss eine Zahl sein');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const payload = {
        name: formData.name.trim(),
        frostschutzmittel: formData.frostschutzmittel.trim() || null,
        notiz: formData.notiz.trim() || null,
        faktor: faktorNum,
      };

      if (isCreating) {
        await catalogsAPI.addSole(payload);
      } else {
        await catalogsAPI.updateSole(editingId, payload);
      }

      handleCancel();
      if (onReload) {
        await onReload();
      }
    } catch (err) {
      console.error('Fehler beim Speichern:', err);
      setError('Fehler beim Speichern: ' + (err.response?.data?.error || err.message));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Sole wirklich löschen?')) return;

    setSaving(true);
    setError('');

    try {
      await catalogsAPI.deleteSole(id);
      if (onReload) {
        await onReload();
      }
    } catch (err) {
      console.error('Fehler beim Löschen:', err);
      setError('Fehler beim Löschen: ' + (err.response?.data?.error || err.message));
    } finally {
      setSaving(false);
    }
  };

  const isEditing = isCreating || editingId !== null;

  return (
    <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ marginTop: 0, marginBottom: '8px' }}>Sole-Verwaltung</h2>
          <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '14px' }}>
            Verwalte Wärmeträgermedien mit Berechnungsfaktoren für hydraulische Formeln
          </p>
        </div>
        {!isEditing && (
          <button
            onClick={handleStartCreate}
            style={{
              padding: '10px 20px',
              backgroundColor: 'var(--accent)',
              color: 'var(--bg-primary)',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            + Neue Sole
          </button>
        )}
      </div>

      {error && (
        <div style={{
          padding: '12px',
          marginBottom: '20px',
          backgroundColor: 'var(--error-bg)',
          color: 'var(--error-text)',
          borderRadius: '4px',
          fontSize: '14px',
        }}>
          {error}
        </div>
      )}

      {isEditing && (
        <div style={{
          marginBottom: '24px',
          padding: '24px',
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: '8px',
          border: '1px solid var(--border)',
        }}>
          <h3 style={{ marginTop: 0, marginBottom: '20px', color: 'var(--text-primary)' }}>
            {isCreating ? 'Neue Sole erstellen' : 'Sole bearbeiten'}
          </h3>

          <div style={{ display: 'grid', gap: '16px' }}>
            <div>
              <label style={{
                display: 'block',
                marginBottom: '6px',
                fontWeight: 500,
                fontSize: '13px',
                color: 'var(--text-primary)',
              }}>
                Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid var(--border)',
                  borderRadius: '4px',
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                }}
                placeholder="z.B. Glykol 30%"
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                marginBottom: '6px',
                fontWeight: 500,
                fontSize: '13px',
                color: 'var(--text-primary)',
              }}>
                Frostschutzmittel
              </label>
              <input
                type="text"
                value={formData.frostschutzmittel}
                onChange={(e) => setFormData({ ...formData, frostschutzmittel: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid var(--border)',
                  borderRadius: '4px',
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                }}
                placeholder="z.B. Ethylenglykol"
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                marginBottom: '6px',
                fontWeight: 500,
                fontSize: '13px',
                color: 'var(--text-primary)',
              }}>
                Faktor *
              </label>
              <input
                type="number"
                step="0.0001"
                value={formData.faktor}
                onChange={(e) => setFormData({ ...formData, faktor: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid var(--border)',
                  borderRadius: '4px',
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                }}
                placeholder="z.B. 1.10"
              />
              <small style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                Korrekturfaktor für Berechnungen (z.B. spezifische Wärmekapazität-Faktor)
              </small>
            </div>

            <div>
              <label style={{
                display: 'block',
                marginBottom: '6px',
                fontWeight: 500,
                fontSize: '13px',
                color: 'var(--text-primary)',
              }}>
                Notiz
              </label>
              <textarea
                value={formData.notiz}
                onChange={(e) => setFormData({ ...formData, notiz: e.target.value })}
                rows={3}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid var(--border)',
                  borderRadius: '4px',
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  fontFamily: 'inherit',
                  fontSize: '14px',
                  resize: 'vertical',
                }}
                placeholder="z.B. 30% Glykol-Wasser-Gemisch, Frostschutz bis -15°C"
              />
            </div>
          </div>

          <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                padding: '10px 20px',
                backgroundColor: 'var(--accent)',
                color: 'var(--bg-primary)',
                border: 'none',
                borderRadius: '4px',
                cursor: saving ? 'not-allowed' : 'pointer',
                fontWeight: 500,
                fontSize: '14px',
                opacity: saving ? 0.6 : 1,
              }}
            >
              {saving ? 'Speichern...' : 'Speichern'}
            </button>
            <button
              onClick={handleCancel}
              disabled={saving}
              style={{
                padding: '10px 20px',
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                cursor: saving ? 'not-allowed' : 'pointer',
                fontWeight: 500,
                fontSize: '14px',
                opacity: saving ? 0.6 : 1,
              }}
            >
              Abbrechen
            </button>
          </div>
        </div>
      )}

      <div style={{
        backgroundColor: 'var(--bg-secondary)',
        borderRadius: '8px',
        overflow: 'hidden',
        border: '1px solid var(--border)',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--bg-tertiary)' }}>
              <th style={{
                padding: '12px 16px',
                textAlign: 'left',
                borderBottom: '1px solid var(--border)',
                fontWeight: 600,
                fontSize: '13px',
                color: 'var(--text-secondary)',
              }}>Name</th>
              <th style={{
                padding: '12px 16px',
                textAlign: 'left',
                borderBottom: '1px solid var(--border)',
                fontWeight: 600,
                fontSize: '13px',
                color: 'var(--text-secondary)',
              }}>Frostschutzmittel</th>
              <th style={{
                padding: '12px 16px',
                textAlign: 'left',
                borderBottom: '1px solid var(--border)',
                fontWeight: 600,
                fontSize: '13px',
                color: 'var(--text-secondary)',
              }}>Faktor</th>
              <th style={{
                padding: '12px 16px',
                textAlign: 'left',
                borderBottom: '1px solid var(--border)',
                fontWeight: 600,
                fontSize: '13px',
                color: 'var(--text-secondary)',
              }}>Notiz</th>
              <th style={{
                padding: '12px 16px',
                textAlign: 'right',
                borderBottom: '1px solid var(--border)',
                fontWeight: 600,
                fontSize: '13px',
                color: 'var(--text-secondary)',
              }}>Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {soleskatalog.length === 0 ? (
              <tr>
                <td colSpan={5} style={{
                  padding: '32px 20px',
                  textAlign: 'center',
                  color: 'var(--text-secondary)',
                  fontSize: '14px',
                }}>
                  Keine Soles vorhanden. Erstelle eine neue Sole, um zu beginnen.
                </td>
              </tr>
            ) : (
              soleskatalog.map((sole) => (
                <tr key={sole.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{
                    padding: '12px 16px',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                  }}>{sole.name}</td>
                  <td style={{
                    padding: '12px 16px',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                  }}>{sole.frostschutzmittel || '-'}</td>
                  <td style={{
                    padding: '12px 16px',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                  }}>{sole.faktor}</td>
                  <td style={{
                    padding: '12px 16px',
                    maxWidth: '300px',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                  }}>
                    {sole.notiz ? (
                      <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                        {sole.notiz}
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-secondary)' }}>-</span>
                    )}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <button
                      onClick={() => handleStartEdit(sole)}
                      disabled={isEditing || saving}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: 'var(--accent)',
                        color: 'var(--bg-primary)',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: (isEditing || saving) ? 'not-allowed' : 'pointer',
                        marginRight: '8px',
                        fontSize: '13px',
                        fontWeight: 500,
                        opacity: (isEditing || saving) ? 0.5 : 1,
                      }}
                    >
                      Bearbeiten
                    </button>
                    <button
                      onClick={() => handleDelete(sole.id)}
                      disabled={isEditing || saving}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: 'var(--error)',
                        color: 'var(--bg-primary)',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: (isEditing || saving) ? 'not-allowed' : 'pointer',
                        fontSize: '13px',
                        fontWeight: 500,
                        opacity: (isEditing || saving) ? 0.5 : 1,
                      }}
                    >
                      Löschen
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div style={{
        marginTop: '24px',
        padding: '16px',
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
      }}>
        <h4 style={{
          margin: '0 0 8px 0',
          fontSize: '14px',
          fontWeight: 600,
          color: 'var(--text-primary)',
        }}>ℹ️ Hinweis</h4>
        <p style={{
          margin: 0,
          fontSize: '13px',
          lineHeight: '1.5',
          color: 'var(--text-secondary)',
        }}>
          Der <strong>Faktor</strong> wird in hydraulischen Berechnungen verwendet und berücksichtigt
          die unterschiedlichen thermodynamischen Eigenschaften verschiedener Wärmeträgermedien
          (z.B. spezifische Wärmekapazität, Dichte, Viskosität). Wasser hat typischerweise einen
          Faktor von 1.0, Glykol-Gemische haben höhere Werte.
        </p>
      </div>
    </div>
  );
}
