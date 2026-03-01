# Changelog

Alle wichtigen Änderungen am Roots Systemkonfigurator werden in dieser Datei dokumentiert.

Das Format basiert auf [Keep a Changelog](https://keepachangelog.com/de/1.0.0/),
und dieses Projekt folgt [Semantic Versioning](https://semver.org/lang/de/).

---

## [1.0.0] - 2026-03-01

### 🎉 Initial Release

Erste vollständige Version des Roots Systemkonfigurators mit allen Core-Features.

### ✨ Features

#### Visueller Konfigurator
- Node-basierter Editor mit React Flow
- Drag-and-Drop Interface für Module und Verbindungen
- Gebäude als Startpunkt mit konfigurierbaren Ausgängen
- Module mit bis zu 12 Eingängen und 36 Ausgängen
- 3 Verbindungstypen:
  - Hydraulisch (durchgezogene Linie)
  - Elektrisch (gestrichelte Linie)
  - Steuerung (gepunktete Linie)
- Knotenpunkte (Junctions) für verzweigte Systeme
- Dynamische Handle-Positionierung basierend auf Anzahl
- Kompatibilitätsprüfung mit Warnungen (nicht blockierend)
- Kürzellabels (max 6 Zeichen) für kompakte Darstellung
- Semi-transparente Hintergründe für bessere Lesbarkeit
- Vergrößerte Click-Areas (50px) für einfachere Bedienung

#### Stücklisten-Management
- Automatische Generierung aus Konfiguration
- Komponenten-Tabelle mit:
  - Position, Name, Modultyp
  - Hersteller, Abmessungen
  - Menge, Preis pro Einheit, Gesamtpreis
- Leitungs-Tabelle mit:
  - Von/Zu Module mit Anschlussbezeichnungen
  - Verbindungstyp, Länge, Dimension
  - Preis pro Meter, Gesamtpreis
- Editierbare Preise und Mengen direkt in der Liste
- Automatische Summenberechnung
- Flexible Berechnungsarten (pro Stück oder pro Einheit)

#### Export-Funktionen
- **Excel Export**:
  - Separate Sheets für Komponenten und Leitungen
  - Formatiert und ready-to-use
- **JSON Export**:
  - Vollständige Projektdaten
  - Strukturiert für externe Systeme
- **Airtable Integration**:
  - 3-Tabellen-Struktur (Projekte, Komponenten, Leitungen)
  - Automatische Verknüpfung über Linked Fields
  - Personal Access Token Authentifizierung
  - Test-Funktion für Verbindungsprüfung
  - Batch-Upload (max 10 Records/Request)
- **docsautomator Integration**:
  - Word-Template mit Line Items Syntax
  - Professionelles Layout matching App-Design
  - Webhook-ready für Automation
  - Automatische PDF-Generierung

#### Katalog-Verwaltung
- **Modultypen**:
  - Benutzerdefinierte Typen
  - Kategorien (Wärmepumpe, Rückkühler, Speicher, etc.)
  - Berechnungsarten (Stück / pro Einheit)
  - Einheiten (m, m², m³, Stk)
- **Module-Datenbank**:
  - CRUD-Operationen
  - Vorkonfigurierte Roots Module
  - Ein-/Ausgänge mit Verbindungsarten
  - Technische Properties (Leistung, Volumen, Gewicht, Preis)
- **Verbindungsarten-Katalog**:
  - Hydraulisch: Flansch DN25-DN80, Schweißring GW25
  - Elektrisch: 230V, 400V, Kälte 230V/400V
  - Steuerung: Modbus, CAN, RS485
  - Kürzeldefinition (max 6 Zeichen)
  - Kompatible Leitungen pro Verbindungsart
- **Leitungskatalog**:
  - Dimensionen und Preise pro Meter
  - Verbindungstyp-Zuordnung
  - Kompatibilitätszuordnung zu Verbindungsarten

#### Settings & Konfiguration
- Airtable Settings Modal:
  - Personal Access Token Eingabe
  - Base ID Konfiguration
  - Test-Funktion für alle 3 Tabellen
  - localStorage Persistenz
  - Anleitung für Token-Erstellung
  - Clear-Funktion

### 🛠️ Technische Details
- React 19.2 mit funktionalen Komponenten und Hooks
- Vite 7.3 für schnelles HMR
- @xyflow/react 12.10 für Node-Editor
- xlsx 0.18 für Excel-Export
- Dark Mode Design mit CSS Variables
- localStorage für Datenpersistenz
- ESLint Konfiguration

### 📁 Projekt-Struktur
- Modular aufgebaut mit klarer Trennung:
  - `/components` - UI Komponenten
  - `/data` - Datenmodelle und Kataloge
  - Separate Komponenten für Editor, Stückliste, Kataloge
- Python Script zur Template-Generierung
- Word Template für docsautomator

### 🎨 Design
- Dark Mode mit Roots Energy Branding
- Farben: Grün (#2ea043) als Accent
- Monospace Font für technische Bezeichnungen
- Responsive Layout
- Intuitive Benutzerführung

### 📚 Dokumentation
- Umfassendes README mit:
  - Feature-Übersicht
  - Installation & Setup
  - Verwendungsanleitung
  - Export-Workflows
  - Airtable Feld-Definitionen
  - docsautomator Setup
  - Troubleshooting
- Inline Code-Kommentare
- JSDoc für komplexe Funktionen

---

## [Unreleased]

Geplante Features für zukünftige Versionen:

### Geplant für 1.1.0
- [ ] Import von Excel/JSON Konfigurationen
- [ ] Projekt-Templates
- [ ] Benutzerdefinierte Modultyp-Icons
- [ ] Erweiterte Kompatibilitätsregeln
- [ ] Undo/Redo Funktionalität
- [ ] Zoom-Controls für Canvas

### Ideen für 2.0.0
- [ ] Multi-Projekt-Management
- [ ] Cloud-Sync (Backend)
- [ ] Kollaborations-Features
- [ ] Erweiterte Reporting-Optionen
- [ ] PDF-Export direkt aus App
- [ ] Modul-Bibliothek mit Bildern

---

## Version History

- **1.0.0** (2026-03-01) - Initial Release mit allen Core-Features

---

**Entwickelt mit ❤️ für Roots Energy**
