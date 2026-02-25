# Roots Systemkonfigurator

Internes Planungstool für Roots Energy Techniker zur visuellen Planung von modularen Wärmepumpen-Systemketten für städtische Mehrfamilienhäuser.

![Roots Systemkonfigurator](https://img.shields.io/badge/React-19.2-blue) ![Vite](https://img.shields.io/badge/Vite-7.3-purple) ![React Flow](https://img.shields.io/badge/React_Flow-12.10-green)

## 🎯 Zweck

Das Tool ermöglicht die Verkettung von Gebäuden mit Roots-Modulen und prüft automatisch die Kompatibilität basierend auf Leistungen und Voraussetzungen. Techniker können damit:

- Gebäude mit ihren Parametern erfassen
- Module zu einer Systemkette hinzufügen
- Automatische Kompatibilitätsprüfung durchführen
- Visuelle Darstellung der Systemkette sehen
- Module in der Datenbank verwalten

## ✨ Features

### 🔧 Konfigurator
- **Visueller Node-Editor** mit React Flow
- **Gebäude als Startpunkt** der Kette mit Parametern wie:
  - Heizlast (kW)
  - Tiefenbohrung vorhanden
  - Keller- und Dachfläche verfügbar
- **Modul-Verkettung**: Gebäude → Modul A → Modul B → ...
- **Intelligente Filterung**: Nur kompatible Module werden zum Hinzufügen angeboten
- **Inkompatibilitäts-Anzeige**: Nicht passende Module werden ausgegraut mit Grund
- **Bearbeitungsmodus**: Klick auf Node öffnet Modal zur Parameteranpassung

### 📋 Listenansicht
- **Hierarchische Darstellung** der gesamten Systemkette
- **Kompatibilitätsstatus** zwischen Verbindungen (✓ kompatibel / ✗ + Grund)
- **Aufklappbare Elemente** mit drei Sektionen:
  - **Eigenschaften**: Beschreibende Kennwerte (Baujahr, Abmessungen, etc.)
  - **Leistungen**: Was das Element bereitstellt (Tiefenbohrung, Leistung kW)
  - **Voraussetzungen**: Was das Element benötigt (nur bei Modulen)

### 🗄️ Moduldatenbank
- **CRUD-Operationen**: Module erstellen, bearbeiten, löschen
- **Vorkonfigurierte Module**:
  - Roots Hub 12 (12 kW, max 15 kW Heizlast)
  - Roots Hub 20 (20 kW, max 25 kW Heizlast)
  - Roots Hub 35 (35 kW, max 40 kW Heizlast)
  - Solarthermie-Modul (8 kW, benötigt Dachfläche)
  - Pufferspeicher 500L
  - Pufferspeicher 1000L
- **Persistenz**: Module werden in localStorage gespeichert

## 🧮 Kompatibilitätslogik

### Datenmodell
Jedes Element (Gebäude oder Modul) hat drei Attributtypen:

1. **Eigenschaften** – Beschreibende Kennwerte, keine Kompatibilitätslogik
   Beispiel: `baujahr`, `modultyp`, `abmessungen`

2. **Leistungen** – Was dieses Element bereitstellt
   Beispiel: `tiefenbohrung_vorhanden: true`, `verfuegbare_leistung_kw: 40`

3. **Voraussetzungen** – Was das vorherige Element liefern muss
   Beispiel: `tiefenbohrung_required: true`, `max_heizlast_kw: 15`

### Kompatibilitätsprüfung
Ein Modul ist mit seinem Vorgänger kompatibel, wenn:

1. ✅ **Alle Flag-Voraussetzungen** beim Vorgänger `true` sind
2. ✅ **Numerische Voraussetzungen** erfüllt sind:
   - `max_heizlast_kw`: Heizlast des Gebäudes darf nicht überschritten werden
   - `min_leistung_kw`: Vorgänger muss mindestens diese Leistung liefern

Das **Gebäude** ist immer Startpunkt – es hat Leistungen aber keine Voraussetzungen.

## 🎨 Design

- **Dark Theme**: Technisches, professionelles Design
- **Font**: IBM Plex Mono für monospace-typischen Look
- **Farbschema**:
  - Hintergrund: #0a0a0a (Primär), #1a1a1a (Sekundär)
  - Accent: #00d9ff (Cyan)
  - Success: #00ff88 (Grün)
  - Error: #ff4444 (Rot)

## 🚀 Installation & Start

### Voraussetzungen
- Node.js (v18+)
- npm

### Setup
```bash
# Repository klonen
git clone https://github.com/Hacklerflow/Roots-Systemplaner.git
cd Roots-Systemplaner

# Dependencies installieren
npm install

# Development Server starten
npm run dev
```

Die App läuft dann unter `http://localhost:5173/`

### Build für Produktion
```bash
npm run build
npm run preview
```

## 🛠️ Tech Stack

- **React 19.2** – UI Framework
- **Vite 7.3** – Build Tool & Dev Server
- **@xyflow/react 12.10** – Node-basierter visueller Editor
- **localStorage** – Session-Persistenz (kein Backend)

## 📁 Projektstruktur

```
src/
├── App.jsx                          # Haupt-App mit Tab-Navigation
├── data/
│   ├── types.js                     # Datentypen und Factory-Funktionen
│   ├── moduleDatabase.js            # Initial-Module
│   └── compatibilityChecker.js      # Kompatibilitätslogik
├── components/
│   ├── ConfiguratorEditor/
│   │   ├── ConfiguratorEditor.jsx   # Hauptkomponente mit React Flow
│   │   ├── BuildingNode.jsx         # Custom Node für Gebäude
│   │   ├── ModuleNode.jsx           # Custom Node für Module
│   │   └── ElementModal.jsx         # Modal für Parameter-Bearbeitung
│   ├── ListView/
│   │   └── ListView.jsx             # Hierarchische Listenansicht
│   └── ModuleDatabase/
│       └── ModuleDatabase.jsx       # Datenbank-Editor (CRUD)
└── styles/
    └── theme.css                    # Globales Dark Theme
```

## 🧪 Verwendung

### 1. Gebäude erstellen
1. Im **Konfigurator**-Tab auf "Neues Gebäude" klicken
2. Auf den Gebäude-Node klicken und Parameter eintragen:
   - Heizlast (kW)
   - Tiefenbohrung vorhanden
   - Kellerfläche/Dachfläche verfügbar

### 2. Module hinzufügen
1. In der rechten Sidebar werden nur **kompatible Module** grün angezeigt
2. Inkompatible Module sind rot und ausgegraut mit Begründung
3. Auf "Hinzufügen" bei einem kompatiblen Modul klicken
4. Modul erscheint in der Kette

### 3. Kette prüfen
- **Konfigurator**: Visuelle Darstellung mit React Flow
- **Listenansicht**: Detaillierte hierarchische Liste mit Kompatibilitätsstatus

### 4. Eigene Module erstellen
1. Im **Moduldatenbank**-Tab auf "+ Neues Modul"
2. Formular ausfüllen:
   - Eigenschaften (Name, Typ, Abmessungen)
   - Leistungen (was es bereitstellt)
   - Voraussetzungen (was es benötigt)
3. Modul ist sofort im Konfigurator verfügbar

## 📝 Systemanforderungen-Beispiel

**Szenario**: Altbau mit 30 kW Heizlast, Tiefenbohrung und Keller vorhanden

✅ **Kompatibel**:
- Roots Hub 35 (max 40 kW Heizlast, benötigt Tiefenbohrung + Keller)

✅ **Dann hinzufügbar**:
- Pufferspeicher 1000L (benötigt Wärmequelle + Keller)

❌ **Nicht kompatibel**:
- Roots Hub 12 (max 15 kW – Heizlast zu hoch)
- Solarthermie-Modul (benötigt Dachfläche, nicht vorhanden)

## 🔒 Datenpersistenz

- **localStorage** wird verwendet für:
  - Aktuelle Konfiguration (Gebäude + Kette)
  - Moduldatenbank (inkl. selbst erstellter Module)
- Kein Backend notwendig
- Daten bleiben im Browser gespeichert

## 🎯 Zielgruppe

Internes Tool für **Roots Energy Techniker** zur Systemplanung. Nicht für Consumer-Nutzung gedacht.

## 📄 Lizenz

Proprietär – Roots Energy internes Tool

## 🤝 Entwicklung

Entwickelt mit Claude Code (Anthropic) für Roots Energy.

---

**Roots Energy** – Modulare Wärmepumpen-Lösungen für die Stadt
