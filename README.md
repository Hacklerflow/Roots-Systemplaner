# Roots Systemkonfigurator

**Version 1.0.0** | Professionelles Planungstool für Roots Energy Wärmepumpensysteme

Ein modernes, browserbasiertes Konfigurations- und Planungstool zur Erstellung komplexer Wärmepumpensysteme mit integrierter Stücklisten-Generierung und Airtable-Export für automatisierte Angebotserstellung.

![Roots Systemkonfigurator](https://img.shields.io/badge/React-19.2-61DAFB?logo=react) ![Vite](https://img.shields.io/badge/Vite-7.3-646CFF?logo=vite) ![License](https://img.shields.io/badge/License-Private-red)

---

## 🎯 Features

### 🏗️ Visueller Konfigurator
- **Drag-and-Drop Interface** mit React Flow für intuitive Systemplanung
- **Node-basierte Architektur** für Module, Gebäude und Knotenpunkte
- **Dynamische Verbindungen** mit automatischer Kompatibilitätsprüfung
- **3 Verbindungstypen**: Hydraulisch (durchgezogen), Elektrisch (gestrichelt), Steuerung (gepunktet)
- **Intelligente Anschlüsse**: Bis zu 12 Eingänge und 36 Ausgänge pro Modul
- **Verbindungsarten-Katalog** mit Kürzeln (max. 6 Zeichen) für kompakte Darstellung

### 📋 Stücklisten-Management
- **Automatische Stücklisten-Generierung** aus der Konfiguration
- **Komponenten-Tabelle** mit Hersteller, Abmessungen, Preisen, Mengen
- **Leitungs-Tabelle** mit Längen, Dimensionen, Verbindungstypen
- **Flexible Preisberechnung**:
  - Pro Stück oder pro Einheit (m, m², m³)
  - Automatische Summenberechnung
- **Editierbare Preise** direkt in der Stückliste

### 🔄 Export & Integration

#### Excel Export
- Separate Sheets für Komponenten und Leitungen
- Fertig formatiert für Weiterbearbeitung

#### JSON Export
- Strukturierte Daten für externe Systeme
- Vollständige Projekt-, Gebäude- und Konfigurationsdaten

#### Airtable Integration
- **Direkter Export** zu Airtable mit 3-Tabellen-Struktur:
  - **Projekte**: Hauptdaten, Gebäudeinformationen, Summen
  - **Komponenten**: Verlinkte Module mit allen Properties
  - **Leitungen**: Verlinkte Verbindungen mit Längen und Preisen
- **Automatische Verknüpfung** der Records über Linked Fields
- **Test-Funktion** zur Validierung der Airtable-Konfiguration

#### docsautomator Integration
- **Word-Template** mit professionellem Layout
- **Line Items Syntax** für automatische Tabellengenerierung
- **Webhook-Ready** für Automation (Airtable → docsautomator)
- **PDF-Generierung** für fertige Angebote

### 🗄️ Katalog-Verwaltung

#### Modultypen
- Benutzerdefinierte Modultypen mit Eigenschaften
- Kategorien: Wärmepumpe, Rückkühler, Speicher, etc.
- Berechnungsarten: Stück oder pro Einheit

#### Module-Datenbank
- Vorkonfigurierte Module (Roots Hub, Speicher, etc.)
- Ein-/Ausgänge mit Verbindungsarten
- Technische Daten (Leistung, Volumen, Gewicht)

#### Verbindungsarten
- Hydraulische Anschlüsse (Flansch DN25-DN80, Schweißring)
- Elektrische Anschlüsse (230V, 400V, Kälte 230V/400V)
- Steuerungen (Modbus, CAN, RS485)
- Kürzeldefinition für kompakte Darstellung

#### Leitungskatalog
- Kompatible Leitungen pro Verbindungsart
- Dimensionen und Preise pro Meter
- Automatische Filterung im Connection Modal

---

## 🚀 Installation & Setup

### Voraussetzungen
- Node.js 18+ und npm
- Moderner Browser (Chrome, Firefox, Safari, Edge)

### Installation
```bash
# Repository klonen
git clone https://github.com/Hacklerflow/Roots-Systemplaner.git
cd roots-configurator

# Dependencies installieren
npm install

# Development Server starten
npm run dev
```

Die App läuft dann auf `http://localhost:5173`

### Build für Production
```bash
npm run build
npm run preview  # Build-Preview testen
```

---

## 📖 Verwendung

### 1. Projekt erstellen

1. **Gebäude erstellen**
   - Navigation: **Konfigurator** → Gebäude im Canvas platzieren
   - Eigenschaften: Name, Baujahr, Adresse, Stockwerke
   - Ausgänge definieren mit Verbindungsarten

2. **Module hinzufügen**
   - Aus Datenbank (linke Sidebar) auf Canvas ziehen
   - Oder neue Module in der Modul-Datenbank erstellen
   - Eigenschaften bearbeiten (Preise, Mengen, technische Daten)

3. **Verbindungen erstellen**
   - Anschlüsse (Handles) an Modulen verbinden
   - Kompatibilitätsprüfung erfolgt automatisch
   - ⚠️ Warnung bei nicht empfohlenen Verbindungen (trotzdem erlaubt)

4. **Verbindungen konfigurieren**
   - Doppelklick auf Verbindungslinie
   - Länge, Leitungstyp (aus Katalog), Dimension, Preis eintragen

### 2. Stückliste bearbeiten

Navigation: **Stückliste**

- **Preise anpassen**: Direkt in den Eingabefeldern
- **Mengen ändern**: Bei "pro Einheit" Modultypen
- **Summen**: Werden automatisch berechnet

### 3. Export

#### Excel Export
```
Stückliste → 📥 Excel Export
```
→ `Roots_Stueckliste_[Projektname]_[Datum].xlsx`

#### JSON Export
```
Stückliste → 📄 JSON Export
```
→ `Roots_Stueckliste_[Projektname]_[Datum].json`

#### Airtable Export

**Setup (einmalig):**
1. Airtable Settings öffnen (⚙️ Button)
2. **Personal Access Token** erstellen:
   - Airtable.com → Developer Hub → Create Token
   - Scopes: `data.records:read` + `data.records:write`
   - Base auswählen!
3. **Base ID** eintragen (aus URL: `app...`)
4. **3 Tabellen erstellen**:
   - `Projekte` (siehe Feldliste unten)
   - `Komponenten` (siehe Feldliste unten)
   - `Leitungen` (siehe Feldliste unten)
5. **Verbindung testen**

**Export durchführen:**
```
Stückliste → 📤 An Airtable senden
```

**Airtable Feldstruktur:**

**Tabelle: Projekte**
- Projektname (Text)
- Exportdatum (Date/Time)
- Gebaeude_Name (Text)
- Gebaeude_Baujahr (Number)
- Gebaeude_Strasse (Text)
- Gebaeude_Hausnummer (Text)
- Gebaeude_Stockwerke (Number)
- Komponenten_Summe (Number - Currency)
- Leitungen_Summe (Number - Currency)
- Gesamtsumme (Number - Currency)
- Anzahl_Komponenten (Number)
- Anzahl_Leitungen (Number)

**Tabelle: Komponenten**
- **Projekt** (Link to Projekte) ⚠️ Wichtig!
- Position (Number)
- Name (Text)
- Modultyp (Text)
- Hersteller (Text)
- Abmessungen (Text)
- Gewicht_kg (Number)
- Leistung_kW (Number)
- Volumen_L (Number)
- Berechnungsart (Text)
- Einheit (Text)
- Menge (Number)
- Preis_pro_Einheit (Number - Currency)
- Gesamtpreis (Number - Currency)

**Tabelle: Leitungen**
- **Projekt** (Link to Projekte) ⚠️ Wichtig!
- Position (Number)
- Von_Modul (Text)
- Von_Ausgang (Text)
- Zu_Modul (Text)
- Zu_Eingang (Text)
- Verbindungstyp (Text)
- Laenge_m (Number)
- Dimension (Text)
- Preis_pro_m (Number - Currency)
- Gesamtpreis (Number - Currency)

### 4. docsautomator Setup

**Template hochladen:**
1. Datei verwenden: `Roots_Stueckliste_Template.docx`
2. In docsautomator hochladen
3. **Data Source konfigurieren**:
   - Primary Table: **Projekte**
   - Line Items 1: **Komponenten** (via "Projekt" Link)
   - Line Items 2: **Leitungen** (via "Projekt" Link)

**Automation einrichten:**

**Option A - Automatisch:**
```
Airtable Automation:
Trigger: "When record created" (Tabelle: Projekte)
Action: "Send webhook" → docsautomator Webhook URL
```

**Option B - Mit Button:**
```
1. Checkbox-Feld in Projekte: "Dokument generieren"
2. Automation Trigger: "When record matches" → Checkbox = true
3. Action 1: Webhook to docsautomator
4. Action 2: Update record → Checkbox = false
```

---

## 🏗️ Projekt-Struktur

```
roots-configurator/
├── src/
│   ├── components/
│   │   ├── ConfiguratorEditor/    # Visueller Editor
│   │   │   ├── ConfiguratorEditor.jsx
│   │   │   ├── BuildingNode.jsx
│   │   │   ├── ModuleNode.jsx
│   │   │   ├── JunctionNode.jsx
│   │   │   ├── WarningEdge.jsx
│   │   │   ├── ConnectionModal.jsx
│   │   │   ├── ElementModal.jsx
│   │   │   └── InputOutputEditor.jsx
│   │   ├── Stueckliste/           # Stücklisten-View
│   │   │   └── Stueckliste.jsx
│   │   ├── ModuleDatabase/        # Katalog-Verwaltung
│   │   │   └── ModuleDatabase.jsx
│   │   ├── Kataloge/              # Stammdaten
│   │   │   ├── Modultypen.jsx
│   │   │   ├── Verbindungen.jsx
│   │   │   └── Leitungen.jsx
│   │   └── Settings/              # Einstellungen
│   │       └── AirtableSettings.jsx
│   ├── data/
│   │   ├── types.js               # Datenmodell & Factories
│   │   ├── compatibilityChecker.js
│   │   ├── moduleDatabase.js
│   │   ├── modultypen.js
│   │   ├── verbindungsartenkatalog.js
│   │   └── leitungskatalog.js
│   ├── App.jsx                    # Haupt-App mit Routing
│   ├── App.css                    # Styling & Theme
│   └── main.jsx
├── Roots_Stueckliste_Template.docx  # docsautomator Template
├── create_template.py               # Template-Generator
├── package.json
├── vite.config.js
└── README.md
```

---

## 🛠️ Technologie-Stack

- **Frontend Framework**: React 19.2
- **Build Tool**: Vite 7.3
- **Node-Editor**: @xyflow/react 12.10
- **Excel Export**: xlsx 0.18
- **Styling**: Custom CSS mit CSS Variables
- **State Management**: React Hooks + localStorage

### Browser-Kompatibilität
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

---

## 💾 Datenspeicherung

Die App nutzt den Browser `localStorage` für:
- Aktuelle Konfiguration
- Modul-Datenbank (benutzerdefiniert)
- Modultypen
- Verbindungsarten-Katalog
- Leitungskatalog
- Airtable-Einstellungen

**⚠️ Backup-Hinweis:** Nutze regelmäßig Excel/JSON Export als Backup!

---

## 🎨 Design & Benutzerführung

### Farb-Schema (Dark Mode)
- **Primary**: `#1a1a1a` (Hintergrund)
- **Secondary**: `#242424` (Cards/Panels)
- **Accent**: `#2ea043` (Roots Grün)
- **Success**: `#2ea043`
- **Error**: `#ef4444`
- **Text Primary**: `rgba(255, 255, 255, 0.87)`
- **Text Secondary**: `rgba(255, 255, 255, 0.6)`

### UX-Features
- **Click-Areas vergrößert** (50px) für einfacheres Anklicken von Verbindungen
- **Kürzel-Labels** (max 6 Zeichen) für kompakte Darstellung
- **Semi-transparente Hintergründe** für bessere Lesbarkeit
- **Monospace-Schrift** für technische Bezeichnungen
- **Hover-Effekte** und visuelle Feedback

---

## 🐛 Troubleshooting

### Airtable Export funktioniert nicht
1. **Token-Berechtigungen prüfen**:
   - `data.records:read` + `data.records:write` aktiviert?
   - Base in Token-Einstellungen ausgewählt?
2. **Feldnamen exakt übernehmen** (Groß-/Kleinschreibung, Unterstriche)
3. **Linked Fields** in Komponenten/Leitungen richtig konfiguriert?
4. Test-Funktion nutzen (⚙️ → Verbindung testen)

### docsautomator Template zeigt keine Daten
1. **Line Items Mapping prüfen**:
   - line_items_1 → Komponenten (Linked Field: "Projekt")
   - line_items_2 → Leitungen (Linked Field: "Projekt")
2. **View Selection**: Passende Views in Airtable gewählt?
3. **Feldnamen** müssen in Template UND Airtable identisch sein

### Module lassen sich nicht verbinden
- **Kompatibilität**: Warnung = OK, Verbindung trotzdem möglich
- **Handles**: Inputs (links) und Outputs (rechts) korrekt?
- **Verbindungstyp**: Muss übereinstimmen (hydraulisch/elektrisch/steuerung)

---

## 📝 Changelog

### Version 1.0.0 (2026-03-01)
- ✨ Initiales Release
- 🏗️ Visueller Node-Editor mit React Flow
- 📋 Stücklisten-Generierung
- 📤 Airtable-Integration (3-Tabellen-Struktur)
- 📄 Excel/JSON Export
- 🗄️ Katalog-Verwaltung (Modultypen, Verbindungen, Leitungen)
- 📝 docsautomator Word-Template
- 🔧 Verbindungsarten mit Kürzeln
- ⚙️ Airtable Settings mit Test-Funktion

---

## 👥 Team & Support

**Entwickelt für:** Roots Energy
**Repository:** [github.com/Hacklerflow/Roots-Systemplaner](https://github.com/Hacklerflow/Roots-Systemplaner)

### Support
Bei Fragen oder Problemen:
1. GitHub Issues nutzen
2. Dokumentation prüfen
3. Code-Kommentare lesen

---

## 📜 Lizenz

Private - Alle Rechte vorbehalten.

---

**Made with ❤️ and ⚡ by Claude Sonnet 4.5**
