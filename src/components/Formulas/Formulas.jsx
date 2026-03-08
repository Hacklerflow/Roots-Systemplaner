import { useState } from 'react';
import { catalogsAPI } from '../../api/client';
import { evaluateFormula, validateFormula } from '../../utils/formulaEvaluator';

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
    <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>
      <h2 style={{ marginTop: 0, marginBottom: '8px' }}>Formelkatalog</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '14px' }}>
        Verwalte Druckverlust-Formeln für Rohrleitungsberechnungen. Verwende Platzhalter wie {'{{'} Rohrlänge {'}}'} für Variablen.
      </p>

      {/* Available Variables Help */}
      <div style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '24px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>
            Verfügbare Variablen
          </h3>
          <button
            onClick={handleRefreshVariables}
            style={{
              padding: '6px 12px',
              background: 'var(--accent)',
              color: 'var(--bg-primary)',
              border: 'none',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            🔄 Aktualisieren
          </button>
        </div>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '13px' }}>
          {availableVariables.map((varName) => (
            <code
              key={varName}
              style={{
                background: 'var(--bg-tertiary)',
                padding: '4px 8px',
                borderRadius: '4px',
                border: '1px solid var(--border)',
              }}
            >
              {'{{'} {varName} {'}}'}
            </code>
          ))}
        </div>
        <p style={{ margin: '12px 0 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
          💡 Beispiel: <code>(&#123;&#123;Rohrlänge&#125;&#125; * 2.4) / &#123;&#123;Glykol 30%&#125;&#125;</code>
        </p>
        <p style={{ margin: '8px 0 0 0', fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
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
      <div style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--accent)',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '24px',
      }}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600 }}>
          Formel testen
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px' }}>
              Rohrlänge (m)
            </label>
            <input
              type="number"
              step="0.1"
              value={testValues.Rohrlänge}
              onChange={(e) => setTestValues({ ...testValues, Rohrlänge: parseFloat(e.target.value) || 0 })}
              style={{
                width: '100%',
                padding: '8px',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                color: 'var(--text-primary)',
                fontSize: '13px',
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px' }}>
              Rohrdimension (DN)
            </label>
            <input
              type="number"
              value={testValues.Rohrdimension}
              onChange={(e) => setTestValues({ ...testValues, Rohrdimension: parseFloat(e.target.value) || 0 })}
              style={{
                width: '100%',
                padding: '8px',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                color: 'var(--text-primary)',
                fontSize: '13px',
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px' }}>
              Faktor
            </label>
            <input
              type="number"
              step="0.1"
              value={testValues.Faktor}
              onChange={(e) => setTestValues({ ...testValues, Faktor: parseFloat(e.target.value) || 1 })}
              style={{
                width: '100%',
                padding: '8px',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                color: 'var(--text-primary)',
                fontSize: '13px',
              }}
            />
          </div>
        </div>
        {testResult && (
          <div style={{
            padding: '12px',
            background: testResult.success ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            border: `1px solid ${testResult.success ? '#22c55e' : '#ef4444'}`,
            borderRadius: '4px',
            fontSize: '13px',
            color: testResult.success ? '#22c55e' : '#ef4444',
          }}>
            {testResult.success ? (
              <>Ergebnis: <strong>{testResult.value} m</strong> Druckverlust</>
            ) : (
              <>Fehler: {testResult.error}</>
            )}
          </div>
        )}
      </div>

      {/* Formulas List */}
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ marginBottom: '16px', color: 'var(--accent)' }}>Gespeicherte Formeln</h3>
        {formulaskatalog.length === 0 ? (
          <div style={{ padding: '16px', background: 'var(--bg-secondary)', borderRadius: '4px', color: 'var(--text-secondary)', fontSize: '13px' }}>
            Keine Formeln vorhanden
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', background: 'var(--bg-secondary)', borderRadius: '4px', overflow: 'hidden' }}>
            <thead>
              <tr style={{ background: 'var(--bg-tertiary)', borderBottom: '2px solid var(--border)' }}>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, fontSize: '13px', width: '40px' }}>Aktiv</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, fontSize: '13px' }}>Name</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, fontSize: '13px' }}>Formel</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, fontSize: '13px' }}>Beschreibung</th>
                <th style={{ padding: '12px', textAlign: 'right', fontWeight: 600, fontSize: '13px' }}>Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {formulaskatalog.map((formula) => (
                <tr key={formula.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <input
                      type="radio"
                      name="activeFormula"
                      checked={formula.is_active}
                      onChange={() => handleSetActive(formula.id)}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                  </td>
                  <td style={{ padding: '12px' }}>
                    {editingFormula === formula.id ? (
                      <input
                        type="text"
                        value={formula.name}
                        onChange={(e) => handleUpdate(formula.id, { name: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '6px 8px',
                          background: 'var(--bg-tertiary)',
                          border: '1px solid var(--border)',
                          borderRadius: '4px',
                          color: 'var(--text-primary)',
                          fontSize: '13px',
                        }}
                      />
                    ) : (
                      <span style={{ fontSize: '14px', fontWeight: 600 }}>{formula.name}</span>
                    )}
                  </td>
                  <td style={{ padding: '12px' }}>
                    {editingFormula === formula.id ? (
                      <input
                        type="text"
                        value={formula.formula}
                        onChange={(e) => handleUpdate(formula.id, { formula: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '6px 8px',
                          background: 'var(--bg-tertiary)',
                          border: '1px solid var(--border)',
                          borderRadius: '4px',
                          color: 'var(--text-primary)',
                          fontSize: '13px',
                          fontFamily: 'monospace',
                        }}
                      />
                    ) : (
                      <code style={{
                        fontSize: '13px',
                        background: 'var(--bg-tertiary)',
                        padding: '4px 8px',
                        borderRadius: '4px',
                      }}>
                        {formula.formula}
                      </code>
                    )}
                  </td>
                  <td style={{ padding: '12px' }}>
                    {editingFormula === formula.id ? (
                      <input
                        type="text"
                        value={formula.beschreibung || ''}
                        onChange={(e) => handleUpdate(formula.id, { beschreibung: e.target.value })}
                        placeholder="Beschreibung (optional)"
                        style={{
                          width: '100%',
                          padding: '6px 8px',
                          background: 'var(--bg-tertiary)',
                          border: '1px solid var(--border)',
                          borderRadius: '4px',
                          color: 'var(--text-primary)',
                          fontSize: '13px',
                        }}
                      />
                    ) : (
                      <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                        {formula.beschreibung || '—'}
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => handleTestFormula(formula.formula)}
                        style={{
                          padding: '6px 12px',
                          background: 'var(--accent)',
                          color: 'var(--bg-primary)',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: 600,
                        }}
                      >
                        Testen
                      </button>
                      {editingFormula === formula.id ? (
                        <button
                          onClick={() => setEditingFormula(null)}
                          style={{
                            padding: '6px 12px',
                            background: 'var(--success)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: 600,
                          }}
                        >
                          Fertig
                        </button>
                      ) : (
                        <button
                          onClick={() => setEditingFormula(formula.id)}
                          style={{
                            padding: '6px 12px',
                            background: 'var(--bg-tertiary)',
                            color: 'var(--text-primary)',
                            border: '1px solid var(--border)',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: 600,
                          }}
                        >
                          Bearbeiten
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(formula.id)}
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
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add New Formula */}
      <div
        style={{
          background: 'var(--bg-secondary)',
          border: '2px solid var(--accent)',
          borderRadius: '8px',
          padding: '24px',
        }}
      >
        <h3 style={{ marginTop: 0, marginBottom: '16px' }}>Neue Formel hinzufügen</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '13px' }}>
              Name
            </label>
            <input
              type="text"
              value={newFormula.name}
              onChange={(e) => setNewFormula({ ...newFormula, name: e.target.value })}
              placeholder="z.B. Standard Druckverlust"
              style={{
                width: '100%',
                padding: '10px',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                color: 'var(--text-primary)',
                fontSize: '14px',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '13px' }}>
              Formel
            </label>
            <input
              type="text"
              value={newFormula.formula}
              onChange={(e) => setNewFormula({ ...newFormula, formula: e.target.value })}
              placeholder="({{Rohrlänge}} * 2.4) / {{Faktor}}"
              style={{
                width: '100%',
                padding: '10px',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                color: 'var(--text-primary)',
                fontSize: '14px',
                fontFamily: 'monospace',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '13px' }}>
              Beschreibung (optional)
            </label>
            <input
              type="text"
              value={newFormula.beschreibung}
              onChange={(e) => setNewFormula({ ...newFormula, beschreibung: e.target.value })}
              placeholder="Kurze Beschreibung der Formel"
              style={{
                width: '100%',
                padding: '10px',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                color: 'var(--text-primary)',
                fontSize: '14px',
              }}
            />
          </div>

          <button
            onClick={handleAdd}
            style={{
              padding: '10px 16px',
              background: 'var(--accent)',
              color: 'var(--bg-primary)',
              border: 'none',
              borderRadius: '4px',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            + Hinzufügen
          </button>
        </div>
      </div>
    </div>
  );
}
