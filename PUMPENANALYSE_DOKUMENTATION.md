# Pumpenanalyse - Funktionsdokumentation

## Überblick

Die Pumpenanalyse ist eine vollständig implementierte hydraulische Analysekomponente, die automatisch alle Pumpen in der Konfiguration erkennt, Druckverluste berechnet und Pumpenauslastungen analysiert.

---

## Hauptfunktionalität

### 1. Automatische Pfaderkennung (BFS-Algorithmus)

Die Komponente verwendet einen **Breadth-First-Search (BFS)** Algorithmus zur Pfadfindung:

- ✅ Findet **alle Pumpen** in der Konfiguration (Ausgänge mit aktivierten Pumpen)
- ✅ Erkennt **alle möglichen Pfade** von jeder Pumpe zu Endpunkten
- ✅ Berücksichtigt Module, Junctions und Building-Anschlüsse
- ✅ Verhindert Zyklen durch Visited-Set
- ✅ Unterstützt mehrere Ausgänge pro Modul

**Technische Details:**
```javascript
// BFS-Queue mit State-Tracking
{
  currentModuleId: string,
  currentOutputId: string,
  path: Array<Connection>,
  visited: Set<string>
}
```

---

### 2. Druckverlustberechnung

Die Berechnung erfolgt über das **Formelkatalog-System**:

#### Eingabeparameter:
- **Rohrlänge** (m) - aus `connection.rohrlänge_m` oder `connection.laenge_meter`
- **Rohrdimension** (DN-Wert) - extrahiert aus String wie "DN50" → 50
- **Faktor** - Standard: 1.4, anpassbar pro Verbindung

#### Berechnungsformel:
```
Druckverlust pro Verbindung = evaluateFormula(activeFormula, {
  Rohrlänge: number,
  Rohrdimension: number,
  Faktor: number
})

Gesamtdruckverlust = Σ(Einzelverluste) × 2
```

**Wichtig:** Automatische Multiplikation mit **× 2** für Sole-Kreislauf (Vorlauf + Rücklauf)

#### Fehlerbehandlung:
- Fehlende Rohrlänge → Loss = 0, Error: "Rohrlänge fehlt"
- Fehlende Dimension → Dimension = 0 verwendet
- Formel-Fehler → Loss = 0, Error-Message gespeichert

---

### 3. Pumpenauslastung

#### Berechnung:
```
Auslastung (%) = (Gesamtdruckverlust / Pumpen-Förderhöhe) × 100
```

#### Status-Kategorisierung:

| Status | Bereich | Farbe | Bedeutung |
|--------|---------|-------|-----------|
| **OK** | 30-90% | Grün | Pumpe arbeitet im optimalen Bereich |
| **Warning** | 90-100% | Gelb | Nahe der Kapazitätsgrenze |
| **Overload** | >100% | Rot | Pumpe zu schwach - überlastet! |
| **Underutilized** | <30% | Blau | Pumpe zu stark dimensioniert |

---

### 4. Warnungen & Empfehlungen

Das System generiert automatisch Warnungen für:

#### Kritische Fehler (Severity: Error)
- ❌ **Überlastete Pumpen** (>100%)
  - Message: `"Pumpe "{name}" ist überlastet ({x}%)"`
  - Empfehlung: "Größere Pumpe wählen oder Druckverlust reduzieren"

#### Warnungen (Severity: Warning)
- ⚠️ **Nahe Kapazitätsgrenze** (90-100%)
  - Message: `"Pumpe "{name}" nahe der Kapazitätsgrenze ({x}%)"`

- ⚠️ **Fehlende Verbindungsdaten**
  - Message: `"{n} Verbindung(en) im Pfad haben fehlende Daten"`

#### Hinweise (Severity: Info)
- ℹ️ **Unterausgelastet** (<30%)
  - Message: `"Pumpe "{name}" ist unterdimensioniert genutzt ({x}%)"`

---

### 5. Detaillierte Ansicht

#### Summary-Level:
```
📊 Stat-Cards:
- Gesamtanzahl Pumpen
- Anzahl überlasteter Pumpen (rot)
- Anzahl unterausgelasteter Pumpen (blau)
```

#### Pumpen-Level:
Für jede Pumpe:
- Modulname + Output-Label
- Förderhöhe (m)
- **Maximale Auslastung** über alle Pfade
- Farbcodiertes Badge (Rot/Gelb/Blau/Grün)

#### Pfad-Level:
Für jeden Pfad von einer Pumpe:
- **Endpunkt-Modul** (Name)
- **Anzahl Verbindungen** im Pfad
- **Gesamtdruckverlust** (m)
- **Utilization Bar** (visuell, farbcodiert)
- **Status-Indikator** (OK/Warning/Overload/Underutilized)

#### Detail-Level (aufklappbar):
Einzelverbindungs-Details:
```
#1  10m • DN50 • Faktor 1.4  →  0.85 m
#2  15m • DN32 • Faktor 1.4  →  2.31 m
#3  8m  • DN25 • Faktor 1.4  →  2.10 m
```

Zeigt:
- Summe **vor** Multiplikator (× 2)
- Druckverlust **pro Verbindung**
- Fehlermeldungen bei unvollständigen Daten

---

## Technische Architektur

### Komponenten-Hierarchie:
```
PumpAnalysis (Main)
  ├─ Summary Header
  │   ├─ Active Formula Display
  │   └─ Stat Cards Grid
  ├─ Warnings Section
  │   └─ Warning Cards (Error/Warning/Info)
  └─ Pumps List
      └─ PumpCard (pro Pumpe)
          ├─ Pump Header (Name, Förderhöhe, Max. Auslastung)
          └─ Paths List
              └─ PathCard (pro Pfad)
                  ├─ Path Header (Endpunkt, Länge, Druckverlust)
                  ├─ Utilization Bar
                  └─ Details (expandable)
                      └─ Connection Rows
```

### Datenfluss:
```
Configuration → findPumps() → pumps[]
                    ↓
pumps[] → findPathsFromPump() → paths[]
                    ↓
paths[] → calculatePathLoss() → { total, details, errors }
                    ↓
{ total, pump.förderhoehe_m } → calculatePumpUtilization() → { percentage, status }
                    ↓
All Results → getPressureLossSummary() → { warnings, recommendations }
```

---

## Verwendete Utility-Funktionen

### pathCalculator.js

#### `findPumps(configuration)`
Findet alle Module mit aktivierten Pumpen.

**Return:**
```javascript
[{
  moduleId: string,
  moduleName: string,
  outputId: string,
  outputLabel: string,
  pump: { enabled: true, förderhoehe_m: number }
}]
```

#### `findPathsFromPump(startModuleId, startOutputId, configuration)`
BFS-basierte Pfadfindung von Pumpe zu allen Endpunkten.

**Return:**
```javascript
[{
  connections: Array<Connection>,
  endpointModuleId: string,
  endpointModuleName: string,
  length: number
}]
```

#### `calculatePathLoss(connections, activeFormula, includeBrineCircuit)`
Berechnet Gesamtdruckverlust für einen Pfad.

**Parameters:**
- `includeBrineCircuit` (default: true) - Multipliziert mit 2 für Sole-Kreislauf

**Return:**
```javascript
{
  total: number,                    // Gesamtverlust (mit × 2)
  totalBeforeMultiplier: number,    // Summe vor × 2
  details: Array<ConnectionDetail>,
  errors: Array<Error>,
  multiplier: number                // 2 oder 1
}
```

#### `calculatePumpUtilization(totalLoss, pumpCapacity)`
Berechnet Auslastungsprozentsatz und Status.

**Return:**
```javascript
{
  percentage: number,  // Gerundet auf 1 Dezimalstelle
  status: 'ok' | 'warning' | 'overload' | 'underutilized' | 'unknown'
}
```

#### `calculateAllPumpPaths(configuration, activeFormula)`
Hauptfunktion - Berechnet alle Pumpen-Analysen.

**Return:**
```javascript
[{
  pump: PumpInfo,
  paths: Array<PathAnalysis>,
  maxUtilization: number  // Maximum über alle Pfade
}]
```

#### `getPressureLossSummary(configuration, activeFormula)`
Erzeugt Zusammenfassung mit Warnungen.

**Return:**
```javascript
{
  totalPumps: number,
  overloadedPumps: number,
  underutilizedPumps: number,
  warnings: Array<Warning>,
  recommendations: Array<Recommendation>,
  pumpAnalysis: Array<Analysis>
}
```

---

## Voraussetzungen für korrekte Funktion

### 1. Formelkatalog
✅ Mindestens **eine aktive Formel** muss im Formelkatalog existieren
- Setzen in: Einstellungen → Formeln → "Aktiv" aktivieren

### 2. Pumpen-Konfiguration
✅ Pumpen müssen bei **hydraulischen Ausgängen** aktiviert sein
- In Moduldatenbank: Ausgänge → Verbindungstyp "Hydraulisch"
- Pumpe aktivieren + Förderhöhe (m) eingeben

### 3. Verbindungsdaten
Für präzise Berechnungen benötigt:
- ✅ **Rohrlänge** (m) - zwingend erforderlich
- ✅ **Rohrdimension** (z.B. "DN50") - empfohlen
- ⚠️ **Faktor** - optional, Standard: 1.4

**Hinweis:** Fehlende Daten werden als Fehler geloggt, blockieren aber nicht die Berechnung.

---

## Zukünftige Erweiterungsmöglichkeiten

### Mögliche Features:
1. **Export-Funktion**
   - PDF-Report mit allen Analysen
   - Excel-Export der Druckverlust-Tabellen

2. **Grafische Visualisierung**
   - Flow-Diagramme mit Druckverlust-Heatmap
   - Sankey-Diagramm für Druckverlust-Verteilung

3. **Optimierungsvorschläge**
   - Automatische Empfehlung für optimale Pumpen
   - Dimensionsoptimierung (DN-Größe-Vorschläge)

4. **Vergleichsanalyse**
   - Mehrere Formeln parallel vergleichen
   - Szenario-Vergleich (Was-wäre-wenn-Analyse)

5. **Historische Daten**
   - Tracking von Änderungen über Zeit
   - Versions-Vergleich

---

## Status

🟢 **Produktionsreif** - Vollständig implementiert und einsatzbereit

Die Pumpenanalyse bietet professionelle hydraulische Analyse mit automatischer Pfaderkennung, präziser Druckverlustberechnung und intelligenten Warnungen für optimale Pumpenauslegung.
