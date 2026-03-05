import { useState, useEffect } from 'react';
import { isJunction } from '../../data/types';
import { evaluateFormula } from '../../utils/formulaEvaluator';

export default function ConnectionModal({ connection, sourceModule, targetModule, leitungskatalog = [], verbindungsartenkatalog = [], formulaskatalog = [], onClose, onSave, onDelete }) {
  const [formData, setFormData] = useState({
    laenge_meter: connection.laenge_meter || connection.rohrlänge_m || null,
    dimension: connection.dimension || connection.rohrdimension || '',
    preis_pro_meter: connection.preis_pro_meter || null,
    leitungskatalog_id: connection.leitungskatalog_id || '',
    faktor: connection.faktor || 1.4,
  });

  const [calculatedLoss, setCalculatedLoss] = useState(null);
  const [calculationError, setCalculationError] = useState(null);

  useEffect(() => {
    setFormData({
      laenge_meter: connection.laenge_meter || connection.rohrlänge_m || null,
      dimension: connection.dimension || connection.rohrdimension || '',
      preis_pro_meter: connection.preis_pro_meter || null,
      leitungskatalog_id: connection.leitungskatalog_id || '',
      faktor: connection.faktor || 1.4,
    });
  }, [connection]);

  // Aktive Formel finden
  const activeFormula = formulaskatalog.find(f => f.is_active);

  // Berechne Druckverlust wenn sich Werte ändern
  useEffect(() => {
    if (!activeFormula) {
      setCalculationError(null);
      setCalculatedLoss(null);
      return;
    }

    // Prüfe ob alle benötigten Werte vorhanden sind
    if (!formData.laenge_meter) {
      setCalculatedLoss(null);
      setCalculationError(null);
      return;
    }

    try {
      // Extrahiere DN-Wert aus Dimension (z.B. "DN50" -> 50)
      let dimensionValue = 0;
      if (formData.dimension) {
        const match = formData.dimension.match(/\d+/);
        dimensionValue = match ? parseFloat(match[0]) : 0;
      }

      // Prepare data für Formula Evaluator
      const data = {
        Rohrlänge: parseFloat(formData.laenge_meter) || 0,
        Rohrdimension: dimensionValue,
        Faktor: parseFloat(formData.faktor) || 1.4,
      };

      const loss = evaluateFormula(activeFormula.formula, data);
      setCalculatedLoss(loss);
      setCalculationError(null);
    } catch (error) {
      setCalculatedLoss(null);
      setCalculationError(error.message);
    }
  }, [formData, activeFormula]);

  // Handler für Leitungsauswahl aus Katalog
  const handleLeitungSelect = (leitungId) => {
    if (!leitungId) {
      // "Benutzerdefiniert" gewählt
      setFormData({
        ...formData,
        leitungskatalog_id: '',
        dimension: '',
        preis_pro_meter: null,
      });
      return;
    }

    const leitung = leitungskatalog.find(l => l.id === leitungId);
    if (leitung) {
      setFormData({
        ...formData,
        leitungskatalog_id: leitungId,
        dimension: leitung.dimension,
        preis_pro_meter: leitung.preis_pro_meter,
      });
    }
  };

  // Filtere Leitungen basierend auf Kompatibilität mit beiden Modulen
  const getCompatibleLeitungen = () => {
    // Finde Output und Input
    const output = sourceModule.outputs?.find(o => o.id === connection.sourceHandle);
    const input = targetModule.inputs?.find(i => i.id === connection.targetHandle);

    if (!output || !input) {
      // Fallback: Zeige alle Leitungen des ConnectionTypes
      return leitungskatalog.filter(l => l.connectionType === connection.connectionType);
    }

    // Finde Verbindungsarten basierend auf Kürzel (label)
    const outputVerbindungsart = verbindungsartenkatalog.find(v => v.kuerzel === output.label);
    const inputVerbindungsart = verbindungsartenkatalog.find(v => v.kuerzel === input.label);

    // Sammle alle kompatiblen Leitungs-IDs
    const compatibleIds = new Set();

    if (outputVerbindungsart?.kompatible_leitungen) {
      outputVerbindungsart.kompatible_leitungen.forEach(id => compatibleIds.add(id));
    }

    if (inputVerbindungsart?.kompatible_leitungen) {
      inputVerbindungsart.kompatible_leitungen.forEach(id => compatibleIds.add(id));
    }

    // Wenn keine Verbindungsarten gefunden: Zeige alle Leitungen des ConnectionTypes
    if (compatibleIds.size === 0) {
      return leitungskatalog.filter(l => l.connectionType === connection.connectionType);
    }

    // Filtere Leitungen, die in den kompatiblen Listen vorkommen
    return leitungskatalog.filter(l => compatibleIds.has(l.id));
  };

  if (!connection || !sourceModule || !targetModule) return null;

  const handleSave = () => {
    onSave({
      ...connection,
      ...formData,
      // Alias neue Feldnamen für Druckverlust-Berechnung
      rohrlänge_m: formData.laenge_meter,
      rohrdimension: formData.dimension,
      druckverlust_m: calculatedLoss,
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

  // Namen für Source/Target (Junction hat nur label, Module haben name)
  const sourceName = isJunction(sourceModule)
    ? (sourceModule.label || 'Knotenpunkt')
    : sourceModule.name;

  const targetName = isJunction(targetModule)
    ? (targetModule.label || 'Knotenpunkt')
    : targetModule.name;

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
                {sourceName}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                {output?.label || (isJunction(sourceModule) ? connection.sourceHandle : 'Ausgang')}
              </div>
            </div>
            <div style={{ fontSize: '20px', color: 'var(--accent)' }}>→</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>
                {targetName}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                {input?.label || (isJunction(targetModule) ? connection.targetHandle : 'Eingang')}
              </div>
            </div>
          </div>
        </div>

        {/* Aktive Formel Info */}
        {activeFormula && (
          <div style={{
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border)',
            borderRadius: '4px',
            padding: '12px',
            marginBottom: '16px',
            fontSize: '12px',
          }}>
            <div style={{ fontWeight: 600, marginBottom: '4px', color: 'var(--accent)' }}>
              📐 Aktive Formel: {activeFormula.name}
            </div>
            <code style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              {activeFormula.formula}
            </code>
          </div>
        )}

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

          {/* Leitungstyp aus Katalog */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '13px' }}>
              Leitungstyp
            </label>
            <select
              value={formData.leitungskatalog_id}
              onChange={(e) => handleLeitungSelect(e.target.value)}
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
            >
              <option value="">Benutzerdefiniert</option>
              {getCompatibleLeitungen().map((leitung) => (
                <option key={leitung.id} value={leitung.id}>
                  {leitung.dimension} ({leitung.preis_pro_meter ? `${leitung.preis_pro_meter} €/m` : 'kein Preis'})
                </option>
              ))}
            </select>
          </div>

          {/* Dimension (automatisch oder manuell) */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '13px' }}>
              Dimension
            </label>
            <input
              type="text"
              value={formData.dimension}
              onChange={(e) => setFormData({ ...formData, dimension: e.target.value })}
              placeholder="z.B. DN50, 3/4 Zoll"
              disabled={!!formData.leitungskatalog_id}
              style={{
                width: '100%',
                padding: '10px',
                background: formData.leitungskatalog_id ? 'var(--bg-secondary)' : 'var(--bg-tertiary)',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                color: 'var(--text-primary)',
                fontFamily: 'inherit',
                fontSize: '14px',
                opacity: formData.leitungskatalog_id ? 0.7 : 1,
                cursor: formData.leitungskatalog_id ? 'not-allowed' : 'text',
              }}
            />
          </div>

          {/* Preis pro Meter (automatisch oder manuell) */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '13px' }}>
              Preis pro Meter (€)
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.preis_pro_meter ?? ''}
              onChange={(e) => setFormData({
                ...formData,
                preis_pro_meter: e.target.value ? parseFloat(e.target.value) : null
              })}
              placeholder="z.B. 15.50"
              disabled={!!formData.leitungskatalog_id}
              style={{
                width: '100%',
                padding: '10px',
                background: formData.leitungskatalog_id ? 'var(--bg-secondary)' : 'var(--bg-tertiary)',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                color: 'var(--text-primary)',
                fontFamily: 'inherit',
                fontSize: '14px',
                opacity: formData.leitungskatalog_id ? 0.7 : 1,
                cursor: formData.leitungskatalog_id ? 'not-allowed' : 'text',
              }}
            />
          </div>

          {/* Faktor (für Druckverlust-Berechnung) */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '13px' }}>
              Faktor (für Druckverlust)
            </label>
            <input
              type="number"
              step="0.1"
              min="0.1"
              value={formData.faktor ?? 1.4}
              onChange={(e) => setFormData({
                ...formData,
                faktor: e.target.value ? parseFloat(e.target.value) : 1.4
              })}
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
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Standard: 1.4 (für Sole-Kreisläufe)
            </div>
          </div>
        </div>

        {/* Berechneter Druckverlust */}
        {activeFormula && (
          <div style={{
            background: calculatedLoss !== null
              ? 'rgba(34, 197, 94, 0.1)'
              : calculationError
                ? 'rgba(239, 160, 68, 0.1)'
                : 'var(--bg-tertiary)',
            border: `1px solid ${calculatedLoss !== null
              ? '#22c55e'
              : calculationError
                ? '#ef9444'
                : 'var(--border)'}`,
            borderRadius: '4px',
            padding: '16px',
            marginBottom: '24px',
          }}>
            <div style={{
              fontWeight: 600,
              marginBottom: '8px',
              fontSize: '13px',
              color: calculatedLoss !== null ? '#22c55e' : 'var(--text-primary)',
            }}>
              {calculatedLoss !== null ? '✓ Druckverlust berechnet' : 'Druckverlust'}
            </div>
            {calculatedLoss !== null ? (
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#22c55e' }}>
                {calculatedLoss.toFixed(2)} m
              </div>
            ) : calculationError ? (
              <div style={{ fontSize: '12px', color: '#ef9444' }}>
                ⚠️ {calculationError}
              </div>
            ) : (
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Länge eingeben für automatische Berechnung
              </div>
            )}
          </div>
        )}

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
