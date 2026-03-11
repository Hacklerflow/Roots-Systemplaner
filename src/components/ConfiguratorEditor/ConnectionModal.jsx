import { useState, useEffect } from 'react';
import { isJunction } from '../../data/types';
import { evaluateFormula, evaluateAdvancedPressureDrop, canUseAdvancedCalculation } from '../../utils/formulaEvaluator';
import { catalogsAPI } from '../../api/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function ConnectionModal({ connection, sourceModule, targetModule, leitungskatalog = [], verbindungsartenkatalog = [], formulaskatalog = [], soleCatalog = [], onClose, onSave, onDelete }) {
  const [formData, setFormData] = useState({
    laenge_meter: connection.laenge_meter || connection.rohrlänge_m || null,
    dimension: connection.dimension || connection.rohrdimension || '',
    preis_pro_meter: connection.preis_pro_meter || null,
    leitungskatalog_id: connection.leitungskatalog_id || '',
    faktor: connection.faktor || 1.4,
  });

  const [calculatedLoss, setCalculatedLoss] = useState(null);
  const [calculationError, setCalculationError] = useState(null);
  const [advancedDetails, setAdvancedDetails] = useState(null);
  const [calculationMethods, setCalculationMethods] = useState([]);
  const [activeMethod, setActiveMethod] = useState(null);

  useEffect(() => {
    setFormData({
      laenge_meter: connection.laenge_meter || connection.rohrlänge_m || null,
      dimension: connection.dimension || connection.rohrdimension || '',
      preis_pro_meter: connection.preis_pro_meter || null,
      leitungskatalog_id: connection.leitungskatalog_id || '',
      faktor: connection.faktor || 1.4,
    });
  }, [connection]);

  // Fetch calculation methods on mount
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

  // Aktive Formel finden (fallback for formula-based calculation)
  const activeFormula = formulaskatalog.find(f => f.is_active);

  // Berechne Druckverlust wenn sich Werte ändern
  useEffect(() => {
    // Check if we have a calculation method
    if (!activeMethod && !activeFormula) {
      setCalculationError(null);
      setCalculatedLoss(null);
      setAdvancedDetails(null);
      return;
    }

    // Prüfe ob alle benötigten Werte vorhanden sind
    if (!formData.laenge_meter) {
      setCalculatedLoss(null);
      setCalculationError(null);
      setAdvancedDetails(null);
      return;
    }

    try {
      // ADVANCED CALCULATION (Haaland, Colebrook-White, etc.)
      if (activeMethod && activeMethod.algorithmus !== 'formula') {
        // Find pipe in catalog
        const pipe = leitungskatalog.find(p => p.id === formData.leitungskatalog_id);

        if (!pipe) {
          setCalculatedLoss(null);
          setCalculationError('Bitte wählen Sie einen Leitungstyp aus dem Katalog');
          setAdvancedDetails(null);
          return;
        }

        // Find fluid (use first one if not specified)
        const fluid = soleCatalog.length > 0 ? soleCatalog[0] : null;

        if (!fluid) {
          setCalculatedLoss(null);
          setCalculationError('Kein Wärmeträger (Sole) im Katalog gefunden');
          setAdvancedDetails(null);
          return;
        }

        // Check if advanced calculation is possible
        const canCalculate = canUseAdvancedCalculation(pipe, fluid);
        if (!canCalculate.possible) {
          setCalculatedLoss(null);
          setCalculationError(`Fehlende Eigenschaften: ${canCalculate.missingFields.join(', ')}`);
          setAdvancedDetails(null);
          return;
        }

        // Prepare connection data
        const connectionData = {
          laenge_meter: formData.laenge_meter,
          volumenstrom_m3s: 0.0001, // Default small flow for preview
          // User could add more fields later (heating power, etc.)
        };

        // Execute advanced calculation
        const result = evaluateAdvancedPressureDrop(
          connectionData,
          activeMethod.algorithmus,
          fluid,
          pipe
        );

        setCalculatedLoss(result.pressureDrop_m);
        setAdvancedDetails(result);
        setCalculationError(null);
        return;
      }

      // SIMPLE FORMULA CALCULATION (backward compatible)
      if (activeFormula) {
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
        setAdvancedDetails(null);
        setCalculationError(null);
      }
    } catch (error) {
      setCalculatedLoss(null);
      setAdvancedDetails(null);
      setCalculationError(error.message);
    }
  }, [formData, activeFormula, activeMethod, leitungskatalog, soleCatalog]);

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
    <Dialog open={!!connection && !!sourceModule && !!targetModule} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-background-secondary border-accent max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-accent">
            Verbindung bearbeiten
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Verbindungs-Info */}
          <div className="bg-background-tertiary border border-border rounded-md p-4">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <div className="text-[13px] font-semibold mb-1">
                  {sourceName}
                </div>
                <div className="text-[11px] text-text-secondary">
                  {output?.label || (isJunction(sourceModule) ? connection.sourceHandle : 'Ausgang')}
                </div>
              </div>
              <div className="text-xl text-accent">→</div>
              <div className="flex-1">
                <div className="text-[13px] font-semibold mb-1">
                  {targetName}
                </div>
                <div className="text-[11px] text-text-secondary">
                  {input?.label || (isJunction(targetModule) ? connection.targetHandle : 'Eingang')}
                </div>
              </div>
            </div>
          </div>

          {/* Aktive Berechnungsmethode Info */}
          {activeMethod && (
            <div className="bg-background-tertiary border border-border rounded-md p-3 text-xs">
              <div className="font-semibold mb-1 text-accent">
                📐 Berechnungsmethode: {activeMethod.name}
              </div>
              <div className="text-[11px] text-text-secondary">
                {activeMethod.beschreibung}
              </div>
              {activeMethod.genauigkeit && (
                <div className="text-[10px] text-accent mt-1">
                  Genauigkeit: {activeMethod.genauigkeit}
                </div>
              )}
            </div>
          )}

          {/* Fallback: Aktive Formel Info */}
          {!activeMethod && activeFormula && (
            <div className="bg-background-tertiary border border-border rounded-md p-3 text-xs">
              <div className="font-semibold mb-1 text-accent">
                📐 Aktive Formel: {activeFormula.name}
              </div>
              <code className="text-[11px] text-text-secondary">
                {activeFormula.formula}
              </code>
            </div>
          )}

          {/* Eigenschaften */}
          <div className="space-y-4">
            {/* Länge */}
            <div className="space-y-2">
              <label htmlFor="laenge" className="block text-[13px] font-semibold">
                Länge (Meter)
              </label>
              <Input
                id="laenge"
                type="number"
                step="0.1"
                value={formData.laenge_meter ?? ''}
                onChange={(e) => setFormData({
                  ...formData,
                  laenge_meter: e.target.value ? parseFloat(e.target.value) : null
                })}
                placeholder="z.B. 5.5"
                className="bg-background-tertiary border-border focus-visible:border-accent focus-visible:ring-accent/10"
              />
            </div>

            {/* Leitungstyp aus Katalog */}
            <div className="space-y-2">
              <label htmlFor="leitung" className="block text-[13px] font-semibold">
                Leitungstyp
              </label>
              <Select
                value={formData.leitungskatalog_id}
                onValueChange={(value) => handleLeitungSelect(value)}
              >
                <SelectTrigger className="bg-background-tertiary border-border focus:ring-accent">
                  <SelectValue placeholder="Benutzerdefiniert" />
                </SelectTrigger>
                <SelectContent className="bg-background-secondary border-border">
                  <SelectItem value="">Benutzerdefiniert</SelectItem>
                  {getCompatibleLeitungen().map((leitung) => (
                    <SelectItem key={leitung.id} value={leitung.id}>
                      {leitung.dimension} ({leitung.preis_pro_meter ? `${leitung.preis_pro_meter} €/m` : 'kein Preis'})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Dimension (automatisch oder manuell) */}
            <div className="space-y-2">
              <label htmlFor="dimension" className="block text-[13px] font-semibold">
                Dimension
              </label>
              <Input
                id="dimension"
                type="text"
                value={formData.dimension}
                onChange={(e) => setFormData({ ...formData, dimension: e.target.value })}
                placeholder="z.B. DN50, 3/4 Zoll"
                disabled={!!formData.leitungskatalog_id}
                className="bg-background-tertiary border-border focus-visible:border-accent focus-visible:ring-accent/10 disabled:bg-background-secondary disabled:opacity-70 disabled:cursor-not-allowed"
              />
            </div>

            {/* Preis pro Meter (automatisch oder manuell) */}
            <div className="space-y-2">
              <label htmlFor="preis" className="block text-[13px] font-semibold">
                Preis pro Meter (€)
              </label>
              <Input
                id="preis"
                type="number"
                step="0.01"
                value={formData.preis_pro_meter ?? ''}
                onChange={(e) => setFormData({
                  ...formData,
                  preis_pro_meter: e.target.value ? parseFloat(e.target.value) : null
                })}
                placeholder="z.B. 15.50"
                disabled={!!formData.leitungskatalog_id}
                className="bg-background-tertiary border-border focus-visible:border-accent focus-visible:ring-accent/10 disabled:bg-background-secondary disabled:opacity-70 disabled:cursor-not-allowed"
              />
            </div>

            {/* Faktor (für Druckverlust-Berechnung) */}
            <div className="space-y-2">
              <label htmlFor="faktor" className="block text-[13px] font-semibold">
                Faktor (für Druckverlust)
              </label>
              <Input
                id="faktor"
                type="number"
                step="0.1"
                min="0.1"
                value={formData.faktor ?? 1.4}
                onChange={(e) => setFormData({
                  ...formData,
                  faktor: e.target.value ? parseFloat(e.target.value) : 1.4
                })}
                className="bg-background-tertiary border-border focus-visible:border-accent focus-visible:ring-accent/10"
              />
              <div className="text-[11px] text-text-secondary">
                Standard: 1.4 (für Sole-Kreisläufe)
              </div>
            </div>
          </div>

          {/* Berechneter Druckverlust */}
          {(activeMethod || activeFormula) && (
            <div className={`rounded-md p-4 border ${
              calculatedLoss !== null
                ? 'bg-success/10 border-success'
                : calculationError
                  ? 'bg-warning/10 border-warning'
                  : 'bg-background-tertiary border-border'
            }`}>
              <div className={`font-semibold mb-2 text-[13px] ${
                calculatedLoss !== null ? 'text-success' : 'text-text-primary'
              }`}>
                {calculatedLoss !== null ? '✓ Druckverlust berechnet' : 'Druckverlust'}
              </div>
              {calculatedLoss !== null ? (
                <>
                  <div className="text-2xl font-bold text-success mb-3">
                    {calculatedLoss.toFixed(2)} m
                  </div>

                  {/* Erweiterte Details (nur bei advanced methods) */}
                  {advancedDetails && (
                    <div className="bg-background-secondary rounded-md p-3 space-y-1 text-xs border border-success/20">
                      <div className="font-semibold text-accent mb-2">Berechnungsdetails</div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-text-secondary">Geschwindigkeit:</span>
                          <span className="ml-2 font-mono">{advancedDetails.velocity_ms.toFixed(3)} m/s</span>
                        </div>
                        <div>
                          <span className="text-text-secondary">Reynolds-Zahl:</span>
                          <span className="ml-2 font-mono">{advancedDetails.reynolds.toFixed(0)}</span>
                        </div>
                        <div>
                          <span className="text-text-secondary">Strömung:</span>
                          <span className="ml-2 capitalize">{advancedDetails.flowRegime}</span>
                        </div>
                        <div>
                          <span className="text-text-secondary">Reibungskoeff. λ:</span>
                          <span className="ml-2 font-mono">{advancedDetails.frictionFactor.toFixed(4)}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-text-secondary">Druckverlust:</span>
                          <span className="ml-2 font-mono">{advancedDetails.pressureDrop_pa.toFixed(0)} Pa</span>
                        </div>
                      </div>
                      <div className="text-[10px] text-text-secondary mt-2 italic">
                        Basierend auf Standard-Volumenstrom von 0.1 l/s für Vorschau
                      </div>
                    </div>
                  )}
                </>
              ) : calculationError ? (
                <div className="text-xs text-warning">
                  ⚠️ {calculationError}
                </div>
              ) : (
                <div className="text-xs text-text-secondary">
                  Länge eingeben für automatische Berechnung
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="mt-6">
          <Button
            type="button"
            onClick={onClose}
            variant="secondary"
            className="bg-background-tertiary hover:bg-border"
          >
            Abbrechen
          </Button>
          <Button
            type="button"
            onClick={handleDelete}
            variant="destructive"
            className="bg-destructive hover:bg-destructive/90"
          >
            Löschen
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            className="bg-accent hover:bg-[#3ba958] text-background shadow-[0_2px_8px_rgba(46,160,67,0.3)]"
          >
            Speichern
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
