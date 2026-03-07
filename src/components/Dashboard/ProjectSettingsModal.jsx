import { useState, useEffect } from 'react';
import { projectsAPI } from '../../api/client';
import './ProjectSettingsModal.css';

export default function ProjectSettingsModal({ project, onClose, onSave }) {
  const [formData, setFormData] = useState({
    beheizte_flaeche: '',
    anzahl_wohnungen: '',
    anzahl_stockwerke: '',
    eigentuemer: '',
    odoo_kontakt_link: '',
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (project) {
      setFormData({
        beheizte_flaeche: project.beheizte_flaeche || '',
        anzahl_wohnungen: project.anzahl_wohnungen || '',
        anzahl_stockwerke: project.anzahl_stockwerke || '',
        eigentuemer: project.eigentuemer || '',
        odoo_kontakt_link: project.odoo_kontakt_link || '',
      });
    }
  }, [project]);

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      // Convert empty strings to null for numeric fields
      const dataToSave = {
        beheizte_flaeche: formData.beheizte_flaeche === '' ? null : parseFloat(formData.beheizte_flaeche),
        anzahl_wohnungen: formData.anzahl_wohnungen === '' ? null : parseInt(formData.anzahl_wohnungen),
        anzahl_stockwerke: formData.anzahl_stockwerke === '' ? null : parseInt(formData.anzahl_stockwerke),
        eigentuemer: formData.eigentuemer || null,
        odoo_kontakt_link: formData.odoo_kontakt_link || null,
      };

      await projectsAPI.update(project.id, dataToSave);

      if (onSave) {
        onSave();
      }

      onClose();
    } catch (err) {
      setError('Fehler beim Speichern: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!project) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content project-settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Projekteinstellungen</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-field">
              <label htmlFor="beheizte_flaeche">Beheizte Fläche (m²)</label>
              <input
                type="number"
                id="beheizte_flaeche"
                step="0.01"
                value={formData.beheizte_flaeche}
                onChange={(e) => handleChange('beheizte_flaeche', e.target.value)}
                placeholder="z.B. 250.50"
              />
            </div>

            <div className="form-field">
              <label htmlFor="anzahl_wohnungen">Anzahl der Wohnungen</label>
              <input
                type="number"
                id="anzahl_wohnungen"
                value={formData.anzahl_wohnungen}
                onChange={(e) => handleChange('anzahl_wohnungen', e.target.value)}
                placeholder="z.B. 12"
              />
            </div>

            <div className="form-field">
              <label htmlFor="anzahl_stockwerke">Anzahl der Stockwerke</label>
              <input
                type="number"
                id="anzahl_stockwerke"
                value={formData.anzahl_stockwerke}
                onChange={(e) => handleChange('anzahl_stockwerke', e.target.value)}
                placeholder="z.B. 4"
              />
            </div>

            <div className="form-field">
              <label htmlFor="eigentuemer">Eigentümer</label>
              <input
                type="text"
                id="eigentuemer"
                value={formData.eigentuemer}
                onChange={(e) => handleChange('eigentuemer', e.target.value)}
                placeholder="Name des Eigentümers"
              />
            </div>

            <div className="form-field">
              <label htmlFor="odoo_kontakt_link">Odoo Kontakt Link</label>
              <input
                type="url"
                id="odoo_kontakt_link"
                value={formData.odoo_kontakt_link}
                onChange={(e) => handleChange('odoo_kontakt_link', e.target.value)}
                placeholder="https://..."
              />
            </div>

            {error && <div className="error-message">{error}</div>}
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="cancel-button" disabled={saving}>
              Abbrechen
            </button>
            <button type="submit" className="save-button" disabled={saving}>
              {saving ? 'Speichere...' : 'Speichern'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
