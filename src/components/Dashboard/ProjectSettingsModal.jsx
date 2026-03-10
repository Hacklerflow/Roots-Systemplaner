import { useState, useEffect } from 'react';
import { projectsAPI } from '../../api/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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
    <Dialog open={!!project} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-background-secondary border-border max-w-[600px]">
        <DialogHeader className="border-b border-border pb-4">
          <DialogTitle className="text-xl font-semibold">Projekteinstellungen</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="py-6 space-y-5">
            <div className="space-y-1.5">
              <label htmlFor="beheizte_flaeche" className="block text-[13px] font-semibold">
                Beheizte Fläche (m²)
              </label>
              <Input
                type="number"
                id="beheizte_flaeche"
                step="0.01"
                value={formData.beheizte_flaeche}
                onChange={(e) => handleChange('beheizte_flaeche', e.target.value)}
                placeholder="z.B. 250.50"
                className="bg-background-tertiary border-border focus-visible:border-accent focus-visible:ring-accent/10"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="anzahl_wohnungen" className="block text-[13px] font-semibold">
                Anzahl der Wohnungen
              </label>
              <Input
                type="number"
                id="anzahl_wohnungen"
                value={formData.anzahl_wohnungen}
                onChange={(e) => handleChange('anzahl_wohnungen', e.target.value)}
                placeholder="z.B. 12"
                className="bg-background-tertiary border-border focus-visible:border-accent focus-visible:ring-accent/10"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="anzahl_stockwerke" className="block text-[13px] font-semibold">
                Anzahl der Stockwerke
              </label>
              <Input
                type="number"
                id="anzahl_stockwerke"
                value={formData.anzahl_stockwerke}
                onChange={(e) => handleChange('anzahl_stockwerke', e.target.value)}
                placeholder="z.B. 4"
                className="bg-background-tertiary border-border focus-visible:border-accent focus-visible:ring-accent/10"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="eigentuemer" className="block text-[13px] font-semibold">
                Eigentümer
              </label>
              <Input
                type="text"
                id="eigentuemer"
                value={formData.eigentuemer}
                onChange={(e) => handleChange('eigentuemer', e.target.value)}
                placeholder="Name des Eigentümers"
                className="bg-background-tertiary border-border focus-visible:border-accent focus-visible:ring-accent/10"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="odoo_kontakt_link" className="block text-[13px] font-semibold">
                Odoo Kontakt Link
              </label>
              <Input
                type="url"
                id="odoo_kontakt_link"
                value={formData.odoo_kontakt_link}
                onChange={(e) => handleChange('odoo_kontakt_link', e.target.value)}
                placeholder="https://..."
                className="bg-background-tertiary border-border focus-visible:border-accent focus-visible:ring-accent/10"
              />
            </div>

            {error && (
              <div className="mt-4 px-3 py-3 bg-destructive/10 border border-destructive rounded-md text-destructive text-[13px]">
                {error}
              </div>
            )}
          </div>

          <DialogFooter className="border-t border-border pt-4">
            <Button
              type="button"
              onClick={onClose}
              disabled={saving}
              variant="secondary"
              className="bg-background-tertiary hover:bg-border"
            >
              Abbrechen
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="bg-accent hover:bg-[#3ba958] text-background shadow-[0_2px_8px_rgba(46,160,67,0.3)]"
            >
              {saving ? 'Speichere...' : 'Speichern'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
