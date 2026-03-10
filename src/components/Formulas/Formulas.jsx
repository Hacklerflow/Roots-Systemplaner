import { useState } from 'react';
import { catalogsAPI } from '../../api/client';
import { evaluateFormula, validateFormula } from '../../utils/formulaEvaluator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function Formulas({ formulaskatalog, setFormulaskatalog }) {
  const [editingFormula, setEditingFormula] = useState(null);
  const [testValues, setTestValues] = useState({
    Rohrlänge: 10,
    Rohrdimension: 50,
    Faktor: 1.4,
  });
  const [testResult, setTestResult] = useState(null);
  const [newFormula, setNewFormula] = useState({
    name: '',
    formula: '',
    beschreibung: '',
    variablen: [],
  });
  const [availableVariables, setAvailableVariables] = useState([
    'Rohrlänge',
    'Rohrdimension',
    'Faktor',
  ]);

  const handleAdd = async () => {
    if (!newFormula.name) {
      alert('Bitte Namen eingeben!');
      return;
    }

    if (!newFormula.formula) {
      alert('Bitte Formel eingeben!');
      return;
    }

    // Validate formula
    const validation = validateFormula(newFormula.formula);
    if (!validation.valid) {
      alert(`Ungültige Formel: ${validation.error}`);
      return;
    }

    try {
      const response = await catalogsAPI.addFormula({
        name: newFormula.name,
        formula: newFormula.formula,
        beschreibung: newFormula.beschreibung,
        variablen: validation.variables,
        is_active: formulaskatalog.length === 0, // First formula is active by default
      });

      const formula = {
        id: response.formula.id,
        name: response.formula.name,
        formula: response.formula.formula,
        beschreibung: response.formula.beschreibung,
        variablen: Array.isArray(response.formula.variablen)
          ? response.formula.variablen
          : JSON.parse(response.formula.variablen || '[]'),
        is_active: response.formula.is_active,
      };

      setFormulaskatalog([...formulaskatalog, formula]);
      setNewFormula({
        name: '',
        formula: '',
        beschreibung: '',
        variablen: [],
      });
    } catch (error) {
      alert(`Fehler beim Speichern: ${error.message}`);
    }
  };

  const handleUpdate = async (id, updates) => {
    try {
      await catalogsAPI.updateFormula(id, updates);
      setFormulaskatalog(
        formulaskatalog.map(f => f.id === id ? { ...f, ...updates } : f)
      );
    } catch (error) {
      alert(`Fehler beim Aktualisieren: ${error.message}`);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Formel wirklich löschen?')) {
      try {
        await catalogsAPI.deleteFormula(id);
        setFormulaskatalog(formulaskatalog.filter(f => f.id !== id));
      } catch (error) {
        alert(`Fehler beim Löschen: ${error.message}`);
      }
    }
  };

  const handleSetActive = async (id) => {
    try {
      // Deactivate all others
      await catalogsAPI.updateFormula(id, { is_active: true });

      // Update local state
      setFormulaskatalog(
        formulaskatalog.map(f => ({ ...f, is_active: f.id === id }))
      );
    } catch (error) {
      alert(`Fehler beim Aktivieren: ${error.message}`);
    }
  };

  const handleTestFormula = (formula) => {
    try {
      const result = evaluateFormula(formula, testValues);
      setTestResult({ success: true, value: result.toFixed(2) });
    } catch (error) {
      setTestResult({ success: false, error: error.message });
    }
  };

  const handleRefreshVariables = async () => {
    try {
      // Standard-Variablen die in Verbindungen verfügbar sind
      const standardVars = [
        'Rohrlänge',       // connection.rohrlänge_m oder connection.laenge_meter
        'Rohrdimension',   // connection.dimension (z.B. "DN50" -> 50)
        'Faktor',          // connection.faktor (Standard: 1.4)
      ];

      // Lade Sole-Faktoren vom Backend
      const solesResponse = await catalogsAPI.getSoles();
      const soleFactors = solesResponse.soles || [];

      // Füge jeden Sole-Faktor als Variable hinzu
      const soleVars = soleFactors.map(sole => sole.name);

      // Kombiniere alle Variablen
      const allVars = [...standardVars, ...soleVars];

      setAvailableVariables(allVars);
      alert(`Variablen aktualisiert! ${soleVars.length} Sole-Faktoren gefunden.`);
    } catch (error) {
      console.error('Fehler beim Laden der Variablen:', error);
      alert('Fehler beim Laden der Variablen: ' + error.message);
    }
  };

  return (
    <div className="p-8 max-w-[1400px] mx-auto">
      <h2 className="mt-0 mb-2">Formelkatalog</h2>
      <p className="text-foreground-secondary mb-8 text-sm">
        Verwalte Druckverlust-Formeln für Rohrleitungsberechnungen. Verwende Platzhalter wie {'{{ Rohrlänge }}'} für Variablen.
      </p>

      {/* Available Variables Help */}
      <div className="bg-background-secondary border border-border rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="m-0 text-sm font-semibold">
            Verfügbare Variablen
          </h3>
          <Button
            onClick={handleRefreshVariables}
            className="bg-accent hover:bg-accent/90 text-background text-xs px-3 py-1.5 h-auto"
          >
            Aktualisieren
          </Button>
        </div>
        <div className="flex gap-4 flex-wrap text-[13px]">
          {availableVariables.map((varName) => (
            <code
              key={varName}
              className="bg-background-tertiary px-2 py-1 rounded border border-border"
            >
              {'{{ ' + varName + ' }}'}
            </code>
          ))}
        </div>
        <p className="m-0 mt-3 text-xs text-foreground-secondary">
          Beispiel: <code>(&#123;&#123;Rohrlänge&#125;&#125; * 2.4) / &#123;&#123;Glykol 30%&#125;&#125;</code>
        </p>
        <p className="m-0 mt-2 text-[11px] text-foreground-secondary leading-relaxed">
          <strong>Standard-Variablen:</strong><br/>
          • <strong>Rohrlänge:</strong> Aus connection.rohrlänge_m oder connection.laenge_meter<br/>
          • <strong>Rohrdimension:</strong> Aus connection.dimension (z.B. "DN50" → 50)<br/>
          • <strong>Faktor:</strong> Aus connection.faktor (Standard: 1.4)<br/>
          <br/>
          <strong>Sole-Faktoren:</strong><br/>
          • Jede Sole aus dem Sole-Katalog kann verwendet werden (z.B. "Wasser", "Glykol 30%")<br/>
          • Der Faktor-Wert der Sole wird automatisch in die Formel eingesetzt<br/>
          • Klicke "Aktualisieren" um die neuesten Sole-Daten zu laden
        </p>
      </div>

      {/* Formula Test Section */}
      <div className="bg-background-secondary border border-accent rounded-lg p-4 mb-6">
        <h3 className="m-0 mb-3 text-sm font-semibold">
          Formel testen
        </h3>
        <div className="grid grid-cols-3 gap-3 mb-3">
          <div>
            <label className="block mb-1 text-xs">
              Rohrlänge (m)
            </label>
            <Input
              type="number"
              step="0.1"
              value={testValues.Rohrlänge}
              onChange={(e) => setTestValues({ ...testValues, Rohrlänge: parseFloat(e.target.value) || 0 })}
              className="bg-background-tertiary border-border text-[13px]"
            />
          </div>
          <div>
            <label className="block mb-1 text-xs">
              Rohrdimension (DN)
            </label>
            <Input
              type="number"
              value={testValues.Rohrdimension}
              onChange={(e) => setTestValues({ ...testValues, Rohrdimension: parseFloat(e.target.value) || 0 })}
              className="bg-background-tertiary border-border text-[13px]"
            />
          </div>
          <div>
            <label className="block mb-1 text-xs">
              Faktor
            </label>
            <Input
              type="number"
              step="0.1"
              value={testValues.Faktor}
              onChange={(e) => setTestValues({ ...testValues, Faktor: parseFloat(e.target.value) || 1 })}
              className="bg-background-tertiary border-border text-[13px]"
            />
          </div>
        </div>
        {testResult && (
          <div className={`p-3 rounded border text-[13px] ${
            testResult.success
              ? 'bg-success/10 border-success text-success'
              : 'bg-destructive/10 border-destructive text-destructive'
          }`}>
            {testResult.success ? (
              <>Ergebnis: <strong>{testResult.value} m</strong> Druckverlust</>
            ) : (
              <>Fehler: {testResult.error}</>
            )}
          </div>
        )}
      </div>

      {/* Formulas List */}
      <div className="mb-8">
        <h3 className="mb-4 text-accent">Gespeicherte Formeln</h3>
        {formulaskatalog.length === 0 ? (
          <div className="p-4 bg-background-secondary rounded text-foreground-secondary text-[13px]">
            Keine Formeln vorhanden
          </div>
        ) : (
          <div className="bg-background-secondary rounded-lg overflow-hidden">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-background-tertiary border-b-2 border-border">
                  <th className="p-3 text-left font-semibold text-[13px] w-[40px]">Aktiv</th>
                  <th className="p-3 text-left font-semibold text-[13px]">Name</th>
                  <th className="p-3 text-left font-semibold text-[13px]">Formel</th>
                  <th className="p-3 text-left font-semibold text-[13px]">Beschreibung</th>
                  <th className="p-3 text-right font-semibold text-[13px]">Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {formulaskatalog.map((formula) => (
                  <tr key={formula.id} className="border-b border-border">
                    <td className="p-3 text-center">
                      <input
                        type="radio"
                        name="activeFormula"
                        checked={formula.is_active}
                        onChange={() => handleSetActive(formula.id)}
                        className="w-[18px] h-[18px] cursor-pointer"
                      />
                    </td>
                    <td className="p-3">
                      {editingFormula === formula.id ? (
                        <Input
                          type="text"
                          value={formula.name}
                          onChange={(e) => handleUpdate(formula.id, { name: e.target.value })}
                          className="bg-background-tertiary border-border text-[13px]"
                        />
                      ) : (
                        <span className="text-sm font-semibold">{formula.name}</span>
                      )}
                    </td>
                    <td className="p-3">
                      {editingFormula === formula.id ? (
                        <Input
                          type="text"
                          value={formula.formula}
                          onChange={(e) => handleUpdate(formula.id, { formula: e.target.value })}
                          className="bg-background-tertiary border-border text-[13px] font-mono"
                        />
                      ) : (
                        <code className="text-[13px] bg-background-tertiary px-2 py-1 rounded">
                          {formula.formula}
                        </code>
                      )}
                    </td>
                    <td className="p-3">
                      {editingFormula === formula.id ? (
                        <Input
                          type="text"
                          value={formula.beschreibung || ''}
                          onChange={(e) => handleUpdate(formula.id, { beschreibung: e.target.value })}
                          placeholder="Beschreibung (optional)"
                          className="bg-background-tertiary border-border text-[13px]"
                        />
                      ) : (
                        <span className="text-[13px] text-foreground-secondary">
                          {formula.beschreibung || '—'}
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          onClick={() => handleTestFormula(formula.formula)}
                          className="bg-accent hover:bg-accent/90 text-background text-xs"
                          size="sm"
                        >
                          Testen
                        </Button>
                        {editingFormula === formula.id ? (
                          <Button
                            onClick={() => setEditingFormula(null)}
                            className="bg-success hover:bg-success/90 text-white text-xs"
                            size="sm"
                          >
                            Fertig
                          </Button>
                        ) : (
                          <Button
                            onClick={() => setEditingFormula(formula.id)}
                            variant="secondary"
                            className="bg-background-tertiary border-border text-xs"
                            size="sm"
                          >
                            Bearbeiten
                          </Button>
                        )}
                        <Button
                          onClick={() => handleDelete(formula.id)}
                          variant="destructive"
                          className="bg-destructive hover:bg-destructive/90 text-xs"
                          size="sm"
                        >
                          Löschen
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add New Formula */}
      <div className="bg-background-secondary border-2 border-accent rounded-lg p-6">
        <h3 className="mt-0 mb-4">Neue Formel hinzufügen</h3>
        <div className="flex flex-col gap-3">
          <div>
            <label className="block mb-2 font-semibold text-[13px]">
              Name
            </label>
            <Input
              type="text"
              value={newFormula.name}
              onChange={(e) => setNewFormula({ ...newFormula, name: e.target.value })}
              placeholder="z.B. Standard Druckverlust"
              className="bg-background-tertiary border-border"
            />
          </div>

          <div>
            <label className="block mb-2 font-semibold text-[13px]">
              Formel
            </label>
            <Input
              type="text"
              value={newFormula.formula}
              onChange={(e) => setNewFormula({ ...newFormula, formula: e.target.value })}
              placeholder="({{Rohrlänge}} * 2.4) / {{Faktor}}"
              className="bg-background-tertiary border-border font-mono"
            />
          </div>

          <div>
            <label className="block mb-2 font-semibold text-[13px]">
              Beschreibung (optional)
            </label>
            <Input
              type="text"
              value={newFormula.beschreibung}
              onChange={(e) => setNewFormula({ ...newFormula, beschreibung: e.target.value })}
              placeholder="Kurze Beschreibung der Formel"
              className="bg-background-tertiary border-border"
            />
          </div>

          <Button
            onClick={handleAdd}
            className="bg-accent hover:bg-accent/90 text-background"
          >
            + Hinzufügen
          </Button>
        </div>
      </div>
    </div>
  );
}
