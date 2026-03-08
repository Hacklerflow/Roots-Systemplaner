# Roots-Systemplaner - Vollständiges Benutzerhandbuch

**Version 2.0** | Professionelles Planungstool für Roots Energy Wärmepumpensysteme

---

## 📑 Inhaltsverzeichnis

1. [Einführung](#einführung)
2. [Installation & Setup](#installation--setup)
3. [Erste Schritte](#erste-schritte)
4. [Hauptfunktionen](#hauptfunktionen)
5. [Katalog-Verwaltung](#katalog-verwaltung)
6. [System Sets](#system-sets)
7. [Export-Funktionen](#export-funktionen)
8. [Administration](#administration)
9. [Tipps & Best Practices](#tipps--best-practices)
10. [Troubleshooting](#troubleshooting)
11. [Geplante Features](#geplante-features)

---

## 🎯 Einführung

### Was ist der Roots-Systemplaner?

Der Roots-Systemplaner ist eine moderne, webbasierte Anwendung zur Planung und Konfiguration von Wärmepumpensystemen. Das Tool ermöglicht es, komplexe Hydrauliksysteme visuell zu planen, automatisch Stücklisten zu generieren und diese direkt für Angebote zu exportieren.

### Für wen ist dieses Tool?

- **Technische Planer**: Für die Erstellung von Systemlayouts
- **Vertriebsmitarbeiter**: Für schnelle Angebotserstellung
- **Projektleiter**: Für Projektdokumentation und -verwaltung

### Kernkonzept

Das Tool arbeitet mit einem **visuellen Node-Editor**, bei dem verschiedene Komponenten (Module) miteinander verbunden werden. Alle Verbindungen werden automatisch dokumentiert und in eine Stückliste übertragen.

---

## 🚀 Installation & Setup

### Systemanforderungen

**Hardware:**
- Mindestens 4 GB RAM
- Moderner Prozessor (Intel i5 oder vergleichbar)
- Stabile Internetverbindung

**Software:**
- Node.js 18+ und npm
- PostgreSQL 14+ (für Backend)
- Moderner Browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)

### Installation (Entwicklungsumgebung)

#### 1. Repository klonen

```bash
git clone https://github.com/Hacklerflow/Roots-Systemplaner.git
cd Roots-Systemplaner
```

#### 2. Frontend installieren

```bash
# Dependencies installieren
npm install

# Development Server starten
npm run dev
```

Das Frontend läuft dann auf `http://localhost:5173`

#### 3. Backend installieren

```bash
# In Backend-Verzeichnis wechseln
cd backend

# Dependencies installieren
npm install

# Umgebungsvariablen konfigurieren
cp .env.example .env
# .env Datei bearbeiten (siehe Backend-Konfiguration)

# Datenbank initialisieren
npm run init-db

# Backend Server starten
npm run dev
```

Das Backend läuft dann auf `http://localhost:3001`

### Backend-Konfiguration

Erstelle eine `.env` Datei im `backend/` Verzeichnis:

```env
# Server
PORT=3001
NODE_ENV=development

# Datenbank
DB_HOST=localhost
DB_PORT=5432
DB_NAME=roots_configurator
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your-secure-random-secret-here
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:5173
```

### Datenbank-Setup

#### PostgreSQL Installation

**macOS (Homebrew):**
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Windows:**
- PostgreSQL von https://www.postgresql.org/download/ herunterladen
- Installation durchführen
- Passwort für postgres-User setzen

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

#### Datenbank erstellen

```bash
# Als postgres-User anmelden
psql -U postgres

# Datenbank erstellen
CREATE DATABASE roots_configurator;

# User erstellen (optional)
CREATE USER roots_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE roots_configurator TO roots_user;
```

#### Schema initialisieren

```bash
cd backend
npm run init-db
```

Dies erstellt:
- Alle Tabellen (users, projects, configurations, catalog_*)
- Standard-Katalogdaten (Modultypen, Verbindungen, Dimensionen, Soles)
- Trigger und Indizes

### Production Build

```bash
# Frontend bauen
npm run build

# Preview testen
npm run preview

# Backend in Production-Modus
cd backend
NODE_ENV=production npm start
```

---

## 🎓 Erste Schritte

### 1. Registrierung & Login

#### Ersten Admin-Account erstellen

Nach der ersten Installation:

1. Öffne `http://localhost:5173`
2. Klicke auf **"Registrieren"**
3. Gib deine Daten ein:
   - E-Mail
   - Name
   - Passwort (mind. 8 Zeichen)
4. Der erste registrierte User wird automatisch Admin

#### Login

1. E-Mail und Passwort eingeben
2. **"Anmelden"** klicken
3. Du wirst zum Dashboard weitergeleitet

### 2. Dashboard-Übersicht

Das Dashboard zeigt:

- **Alle Projekte** in einer Kartenansicht
- **Projekt erstellen** Button (oben rechts)
- **Projekteinstellungen** (⚙️ Icon)
- **Suchfunktion** (bei vielen Projekten)

### 3. Erstes Projekt erstellen

1. Klicke auf **"+ Neues Projekt"**
2. Gib einen **Projektnamen** ein
3. Optional: Beschreibung und Tags hinzufügen
4. **"Erstellen"** klicken

Das Projekt wird erstellt und du wirst zum Konfigurator weitergeleitet.

### 4. Projekt-Metadaten bearbeiten

Über das ⚙️ Icon im Dashboard kannst du bearbeiten:

- **Projektname** und Beschreibung
- **Tags** für bessere Organisation
- **Gebäudeinformationen**:
  - Gebäudename
  - Baujahr
  - Adresse (Straße, Hausnummer)
  - Anzahl Stockwerke

Diese Daten werden später in Stücklisten und Exporten verwendet.

---

## 🏗️ Hauptfunktionen

### Visueller Konfigurator

Der Konfigurator ist das Herzstück des Tools. Hier planst du dein Wärmepumpensystem visuell.

#### Interface-Übersicht

**Canvas (Mitte):**
- Arbeitsfläche für Module und Verbindungen
- Zoom: Mausrad oder Pinch-Geste
- Pan: Rechtsklick + Ziehen oder Space + Ziehen

**Linke Sidebar (Moduldatenbank):**
- Alle verfügbaren Module
- Suche nach Modulnamen
- Drag & Drop auf Canvas

**Obere Navigation:**
- Konfigurator
- Listen-Ansicht
- Stückliste
- Pumpenanalyse
- Einstellungen
- Moduldatenbank

#### Module platzieren

**Methode 1: Drag & Drop**
1. Modul in linker Sidebar auswählen
2. Auf Canvas ziehen
3. Loslassen

**Methode 2: Doppelklick**
1. Modul in linker Sidebar doppelklicken
2. Modul erscheint in der Mitte des Canvas

#### Modul-Properties bearbeiten

1. Modul auf Canvas anklicken
2. Properties-Panel erscheint rechts
3. Bearbeitbar:
   - **Name**: Individuelle Bezeichnung
   - **Preis**: Überschreibt Katalogpreis
   - **Menge**: Bei "pro Einheit" Modultypen
   - **Notizen**: Zusätzliche Informationen

#### Verbindungen erstellen

**Verbindungsarten:**
- **Hydraulisch** (durchgezogene Linie): Wasser-/Sole-Leitungen
- **Elektrisch** (gestrichelte Linie): Stromversorgung
- **Steuerung** (gepunktete Linie): Bussysteme (Modbus, CAN, RS485)

**Verbindung erstellen:**
1. Ausgang (Handle rechts) eines Moduls anklicken
2. Zu Eingang (Handle links) eines anderen Moduls ziehen
3. Loslassen

**Kompatibilitätsprüfung:**
- ✅ **Grün**: Kompatibel (gleiche Verbindungsart)
- ⚠️ **Orange**: Warnung (unterschiedliche Dimensionen, aber möglich)
- ❌ **Rot**: Nicht kompatibel (verschiedene Verbindungsarten)

#### Verbindung konfigurieren

1. **Doppelklick** auf Verbindungslinie
2. **Connection Modal** öffnet sich:

   **Pflichtfelder:**
   - **Länge** (in Metern): Rohrlänge
   - **Leitungstyp**: Aus Leitungskatalog wählen
   - **Dimension**: DN-Wert oder Durchmesser

   **Automatisch:**
   - **Preis pro Meter**: Aus Leitungskatalog
   - **Gesamtpreis**: Länge × Preis/m
   - **Faktor**: Standard 1.4 (für Berechnungen)

   **Optional:**
   - **Notizen**: Zusätzliche Informationen

3. **"Speichern"** klicken

**Wichtig:** Nur konfigurierte Verbindungen erscheinen in der Stückliste!

#### Gebäude-Node (optional)

Für bessere Organisation:

1. **Gebäude-Node** platzieren (aus Sidebar)
2. Properties bearbeiten:
   - Name
   - Baujahr
   - Adresse
   - Anzahl Stockwerke
3. Ausgänge definieren mit Verbindungsarten

Das Gebäude dient als zentraler Knotenpunkt und Dokumentation.

#### Junction-Nodes (Verteiler)

Für Verzweigungen im System:

1. **Junction-Node** platzieren
2. Name vergeben (z.B. "Verteiler EG")
3. Als Verzweigungspunkt zwischen Modulen nutzen

### Listen-Ansicht

Die Listen-Ansicht zeigt alle Elemente tabellarisch:

**Module-Liste:**
- Alle platzierten Module
- Sortiert nach Modultyp
- Spalten: Name, Typ, Hersteller, Preis, Menge

**Verbindungen-Liste:**
- Alle Verbindungen
- Von → Zu
- Länge, Dimension, Typ, Preis

**Funktionen:**
- **Sortieren**: Nach beliebiger Spalte
- **Filtern**: Nach Modultyp oder Verbindungstyp
- **Bearbeiten**: Klick auf Zeile öffnet Edit-Modal

### Stückliste

Die Stückliste ist die automatisch generierte Zusammenfassung.

#### Komponenten-Tabelle

Zeigt alle Module mit:
- **Position**: Durchnummeriert
- **Name**: Modulname
- **Modultyp**: Kategorie
- **Hersteller**: Herstellername
- **Technische Daten**: Abmessungen, Gewicht, Leistung, Volumen
- **Berechnungsart**: Stück / Pro Einheit
- **Menge**: Anzahl oder Länge/Fläche
- **Preis**: Pro Einheit
- **Gesamtpreis**: Menge × Preis

**Summe Komponenten:** Wird automatisch berechnet

#### Leitungen-Tabelle

Zeigt alle konfigurierten Verbindungen:
- **Position**: Durchnummeriert
- **Von → Zu**: Quell- und Zielmodul
- **Verbindungstyp**: Hydraulisch/Elektrisch/Steuerung
- **Länge**: In Metern
- **Dimension**: DN-Wert
- **Preis/m**: Aus Katalog
- **Gesamtpreis**: Länge × Preis/m

**Summe Leitungen:** Wird automatisch berechnet

#### Gesamtsumme

**Gesamtsumme = Komponenten-Summe + Leitungen-Summe**

Wird prominent oben angezeigt.

#### Preise bearbeiten

Preise können direkt in der Stückliste angepasst werden:

1. In Preiszelle klicken
2. Neuen Wert eingeben
3. Enter drücken
4. Summen werden automatisch aktualisiert

**Hinweis:** Diese Preise überschreiben Katalogpreise nur für dieses Projekt.

### Pumpenanalyse

Die Pumpenanalyse berechnet Druckverluste und empfiehlt Pumpen.

#### Voraussetzungen

- **Aktive Formel**: Mind. 1 Formel muss als "aktiv" markiert sein
- **Konfigurierte Verbindungen**: Alle Verbindungen müssen Länge und Dimension haben
- **Sole definiert**: Für korrekte Faktor-Berechnung

#### Pumpenanalyse durchführen

1. Navigiere zu **"Pumpenanalyse"**
2. System analysiert automatisch:
   - Alle hydraulischen Pfade
   - Druckverluste pro Verbindung
   - Gesamtdruckverlust pro Pfad

#### Ergebnis-Interpretation

**Pfad-Tabelle:**
- **Pfad**: Start → Ende (z.B. "Wärmepumpe → Speicher → Gebäude")
- **Anzahl Verbindungen**: Rohrstrecken im Pfad
- **Gesamtlänge**: Summe aller Rohrlängen
- **Druckverlust**: Berechnet nach aktiver Formel
- **Status**: ✅ OK / ⚠️ Hoch / ❌ Kritisch

**Pumpen-Empfehlung:**
Basierend auf:
- Maximaler Druckverlust
- Fördermenge (aus Modulen)
- Förderhöhe (aus Druckverlust)

**Verfügbare Pumpen** werden mit Kompatibilität angezeigt:
- ✅ Geeignet
- ⚠️ Grenzwertig
- ❌ Nicht geeignet

#### Formel-Editor

**Aktive Formel ändern:**
1. Einstellungen → Formeln
2. Gewünschte Formel auswählen
3. Als "aktiv" markieren (Radio-Button)

**Neue Formel erstellen:**
1. Einstellungen → Formeln
2. **"Neue Formel hinzufügen"**
3. Eingeben:
   - **Name**: z.B. "Standard Druckverlust"
   - **Formel**: Mit Variablen (siehe unten)
   - **Beschreibung**: Optional

4. **"+ Hinzufügen"** klicken

**Verfügbare Variablen:**
- `{{Rohrlänge}}`: Länge in Metern
- `{{Rohrdimension}}`: DN-Wert
- `{{Faktor}}`: Standard-Faktor (1.4)
- `{{Sole-Name}}`: Jede Sole aus dem Katalog (z.B. `{{Glykol 30%}}`)

**Beispiel-Formeln:**
```
Standard:
({{Rohrlänge}} * 2.4) / {{Faktor}}

Mit Dimension:
({{Rohrlänge}} * 2.4 + {{Rohrdimension}} * 0.1) / {{Faktor}}

Mit Sole:
({{Rohrlänge}} * 2.4) / {{Glykol 30%}}
```

**Formel testen:**
Im Formular kannst du Test-Werte eingeben und das Ergebnis sofort sehen.

---

## 🗄️ Katalog-Verwaltung

Die Kataloge sind die Stammdaten des Systems. Hier werden alle verfügbaren Komponenten, Verbindungsarten und Materialien definiert.

### Modultypen

Modultypen definieren Kategorien von Komponenten.

#### Vorhandene Modultypen

Nach der Installation sind folgende Typen verfügbar:
- **Wärmepumpe** (Erzeugung, pro Stück)
- **Rückkühler** (Erzeugung, pro Stück)
- **Speicher** (Speicherung, pro Stück)
- **Verteiler** (Verteilung, pro Stück)
- **Erdwärmekollektor** (Quellsystem, pro m²)
- **Erdsonde** (Quellsystem, pro m)
- **Rohrleitung** (Installation, pro m)

#### Neuen Modultyp erstellen

1. **Einstellungen** → **Modultypen**
2. Neue Zeile ausfüllen:
   - **Name**: z.B. "Pufferspeicher"
   - **Kategorie**: z.B. "Speicherung"
   - **Berechnungsart**:
     - **Pro Stück**: Zählbare Komponenten (Preis × Anzahl)
     - **Pro Einheit**: Messbare Dinge (Preis × Länge/Fläche)
   - **Einheit**: Bei "Pro Einheit" → "m", "m²", "kg" etc.

3. **"+ Hinzufügen"** klicken

#### Modultyp bearbeiten

1. In der Tabelle auf die Zeile klicken
2. Werte ändern
3. Enter drücken zum Speichern

**Wichtig:** Änderungen wirken sich auf alle Module dieses Typs aus!

### Modul-Datenbank

Die Modul-Datenbank enthält alle verfügbaren Komponenten.

#### Module anzeigen

**Einstellungen** → **Moduldatenbank**

Die Datenbank zeigt:
- Alle Module alphabetisch sortiert nach Modultyp
- Thumbnail (wenn vorhanden)
- Name, Hersteller, Preis
- Technische Daten

#### Neues Modul erstellen

1. **"Neues Modul"** klicken
2. **Grunddaten** eingeben:
   - **Name**: Eindeutiger Name (Pflicht)
   - **Modultyp**: Aus Dropdown wählen
   - **Hersteller**: z.B. "NIBE"
   - **Abmessungen**: z.B. "600×600×2300"
   - **Gewicht (kg)**: Numerisch
   - **Leistung (kW)**: Numerisch
   - **Volumen (L)**: Numerisch
   - **Preis**: In Euro

3. **Eingänge definieren** (optional):
   Für jeden Eingang:
   - **Name**: z.B. "Vorlauf Quelle"
   - **Verbindungsart**: Aus Katalog wählen
   - **Dimension**: DN-Wert
   - **Typ**: Hydraulisch/Elektrisch/Steuerung
   - **Pumpe**: Optional Pumpe zuweisen
   - **In Stückliste**: Checkbox (Eingang in Stückliste zeigen?)

   **"+ Eingang hinzufügen"** klicken

4. **Ausgänge definieren** (optional):
   Analog zu Eingängen

5. **"Speichern"** klicken

**Beispiel:**
```
Name: NIBE F2120-16
Modultyp: Wärmepumpe
Hersteller: NIBE
Abmessungen: 600×600×2300
Gewicht: 195 kg
Leistung: 16 kW
Volumen: 50 L
Preis: 12500 €

Eingänge:
1. Vorlauf Quelle | Flansch DN32 | DN32 | Hydraulisch
2. Rücklauf Quelle | Flansch DN32 | DN32 | Hydraulisch

Ausgänge:
1. Vorlauf Heizkreis | Flansch DN32 | DN32 | Hydraulisch
2. Rücklauf Heizkreis | Flansch DN32 | DN32 | Hydraulisch
3. Stromversorgung | 400V | 5×2.5mm² | Elektrisch
```

#### Modul bearbeiten

1. Modul in Datenbank anklicken
2. Daten ändern
3. **"Speichern"** klicken

#### Modul löschen

1. Modul in Datenbank anklicken
2. **"Löschen"** klicken
3. Bestätigen

**Warnung:** Das Modul wird aus der Datenbank entfernt, aber bestehende Projekte, die dieses Modul verwenden, behalten es.

### Verbindungsarten

Verbindungsarten definieren, wie Module verbunden werden können.

#### Vorhandene Verbindungsarten

**Hydraulisch:**
- Flansch DN25, DN32, DN40, DN50, DN65, DN80
- Schweißring GW25

**Elektrisch:**
- 230V
- 400V
- Kälte 230V
- Kälte 400V

**Steuerung:**
- Modbus
- CAN
- RS485

#### Neue Verbindungsart erstellen

1. **Einstellungen** → **Verbindungen**
2. Formular ausfüllen:
   - **Name**: z.B. "Flansch DN100"
   - **Kürzel**: Max. 6 Zeichen, z.B. "FDN100"
   - **Typ**: Hydraulisch/Elektrisch/Steuerung
   - **Kompatible Leitungen**: Mehrfachauswahl

3. **"+ Hinzufügen"** klicken

**Kürzel** werden auf den Nodes im Konfigurator angezeigt, um Platz zu sparen.

#### Verbindungsart bearbeiten/löschen

Analog zu Modultypen.

### Leitungen

Leitungen definieren die verfügbaren Kabel und Rohre.

#### Neue Leitung erstellen

1. **Einstellungen** → **Leitungen**
2. Formular ausfüllen:
   - **Verbindungsart**: z.B. "Flansch DN32"
   - **Leitungstyp**: Material/Typ, z.B. "Stahlrohr verzinkt"
   - **Dimension**: z.B. "DN32" oder "5×2.5mm²"
   - **Preis pro Meter**: In Euro

3. **"+ Hinzufügen"** klicken

#### Leitung bearbeiten/löschen

Analog zu anderen Katalogen.

**Hinweis:** Leitungen können nur für Verbindungsarten erstellt werden, die bereits existieren.

### Dimensionen

Dimensionen sind Standard-Werte für Rohrdurchmesser und Kabelquerschnitte.

#### Neue Dimension hinzufügen

1. **Einstellungen** → **Dimensionen**
2. Formular ausfüllen:
   - **Name**: z.B. "DN100"
   - **Wert**: z.B. "DN100" (kann gleich sein)

3. **"+ Hinzufügen"** klicken

**Verwendung:** Dimensionen werden in Dropdown-Listen bei Modulen und Verbindungen angeboten.

### Pumpen

Pumpenkatalog für Pumpenanalyse und Modul-Zuordnung.

#### Neue Pumpe hinzufügen

1. **Einstellungen** → **Pumpen**
2. Formular ausfüllen:
   - **Name**: z.B. "Grundfos ALPHA2 25-60"
   - **Hersteller**: z.B. "Grundfos"
   - **Modell**: z.B. "ALPHA2"
   - **Fördermenge (m³/h)**: z.B. 2.5
   - **Förderhöhe (m)**: z.B. 6.0
   - **Leistung (kW)**: z.B. 0.045
   - **Spannung**: z.B. "230V"
   - **Anschlussgröße**: z.B. "Rp 1""
   - **Preis**: In Euro
   - **Notizen**: Optional

3. **"+ Hinzufügen"** klicken

#### Pumpen-Zuordnung zu Modulen

Pumpen können direkt Eingängen/Ausgängen von Modulen zugeordnet werden:

1. Modul bearbeiten
2. Bei Eingang/Ausgang → **"Pumpe"** Dropdown
3. Pumpe auswählen
4. **"In Stückliste"** aktivieren (Pumpe wird in Stückliste aufgeführt)

### Sole (Wärmeträgermedien)

Sole-Katalog für Wärmeträgerflüssigkeiten mit Berechnungsfaktoren.

#### Vorhandene Soles

Nach Installation:
- **Wasser** (Faktor: 1.0)
- **Glykol 25%** (Faktor: 1.08)
- **Glykol 30%** (Faktor: 1.10)
- **Glykol 35%** (Faktor: 1.13)

#### Neue Sole erstellen

1. **Einstellungen** → **Sole**
2. **"+ Neue Sole"** klicken
3. Formular ausfüllen:
   - **Name**: z.B. "Glykol 40%"
   - **Frostschutzmittel**: z.B. "Ethylenglykol"
   - **Faktor**: Numerisch (z.B. 1.15)
   - **Notiz**: z.B. "40% Glykol, Frostschutz bis -22°C"

4. **"Speichern"** klicken

#### Faktor-Bedeutung

Der Faktor berücksichtigt:
- Spezifische Wärmekapazität
- Dichte
- Viskosität

**Verwendung:** In Formeln können Sole-Namen als Variablen verwendet werden, z.B. `{{Glykol 30%}}`. Der Faktor-Wert wird automatisch eingesetzt.

#### Sole bearbeiten/löschen

1. Sole in Tabelle anklicken
2. **"Bearbeiten"** oder **"Löschen"**
3. Änderungen speichern oder Löschung bestätigen

---

## 💾 System Sets

System Sets sind Vorlagen für komplette Katalog-Konfigurationen.

### Was ist ein System Set?

Ein System Set speichert:
- **Moduldatenbank**: Alle Module
- **Modultypen**
- **Verbindungsarten**
- **Leitungen**
- **Dimensionen**
- **Formeln**
- **Pumpen**
- **Sole**

**Anwendungsfall:** Verschiedene Projekt-Typen benötigen unterschiedliche Kataloge. Beispiel:
- "Einfamilienhaus Standard"
- "Gewerbe 2024"
- "Neubau Komfort"

### System Set erstellen

1. **Einstellungen** → **System Sets**
2. **"+ Neues Set"** Button
3. **Name eingeben**: z.B. "Einfamilienhaus Standard 2024"
4. **"Erstellen"** klicken

Das aktuelle System Set (alle Kataloge) wird gespeichert.

**Hinweis:** Der Name wird automatisch mit dem aktuellen Datum ergänzt.

### System Set wechseln

1. **Einstellungen** → **System Sets**
2. Gewünschtes Set auswählen
3. **"Aktivieren"** klicken
4. **Bestätigen** (alle aktuellen Kataloge werden überschrieben!)

**Achtung:** Beim Wechseln gehen nicht gespeicherte Änderungen verloren!

### System Set exportieren

**Einzelnes Set:**
1. Set auswählen
2. **"📥 Set exportieren"** klicken
3. JSON-Datei wird heruntergeladen

**Alle Sets:**
1. **"📥 Alle Sets exportieren"** klicken
2. Alle Sets werden in einer JSON-Datei gespeichert

### System Set importieren

1. **"📂 Sets importieren"** klicken
2. JSON-Datei auswählen (einzelnes Set oder Collection)
3. Bei Duplikaten:
   - **Überschreiben**: Bestehende Sets werden ersetzt
   - **Abbrechen**: Keine Änderungen

**Format:** Die JSON-Datei muss das Roots System Set Format haben (wird automatisch beim Export erstellt).

### System Set löschen

1. Set auswählen (darf nicht aktiv sein!)
2. **"🗑️ Löschen"** klicken
3. Bestätigen

**Wichtig:** Das aktive Set kann nicht gelöscht werden!

---

## 📤 Export-Funktionen

### Excel-Export

Exportiert die Stückliste als Excel-Datei (.xlsx).

#### Excel exportieren

1. **Stückliste** öffnen
2. **"📥 Excel Export"** klicken
3. Datei wird heruntergeladen: `Roots_Stueckliste_[Projektname]_[Datum].xlsx`

#### Excel-Struktur

**Sheet 1: Komponenten**
- Spalten: Position, Name, Modultyp, Hersteller, Abmessungen, Gewicht, Leistung, Volumen, Menge, Einheit, Preis/Einheit, Gesamtpreis
- Summenzeile am Ende

**Sheet 2: Leitungen**
- Spalten: Position, Von Modul, Von Ausgang, Zu Modul, Zu Eingang, Verbindungstyp, Länge (m), Dimension, Preis/m, Gesamtpreis
- Summenzeile am Ende

**Sheet 3: Zusammenfassung**
- Projektnamen
- Gebäudedaten
- Komponenten-Summe
- Leitungen-Summe
- Gesamtsumme

### JSON-Export

Exportiert alle Projektdaten als strukturiertes JSON.

#### JSON exportieren

1. **Stückliste** öffnen
2. **"📄 JSON Export"** klicken
3. Datei wird heruntergeladen: `Roots_Stueckliste_[Projektname]_[Datum].json`

#### JSON-Struktur

```json
{
  "project": {
    "name": "Projektname",
    "description": "...",
    "tags": ["tag1", "tag2"]
  },
  "building": {
    "name": "Gebäudename",
    "year": 2024,
    "address": "...",
    "floors": 2
  },
  "components": [
    {
      "name": "...",
      "moduleType": "...",
      "manufacturer": "...",
      "price": 1000,
      "quantity": 1
    }
  ],
  "connections": [
    {
      "from": "...",
      "to": "...",
      "length": 10,
      "dimension": "DN32",
      "price": 25.50
    }
  ],
  "totals": {
    "components": 15000,
    "connections": 2500,
    "total": 17500
  }
}
```

**Verwendung:** Für externe Systeme, APIs oder Datenanalyse.

### Airtable-Export

Exportiert das Projekt direkt zu Airtable für Weiterverarbeitung.

#### Airtable-Setup (einmalig)

**1. Personal Access Token erstellen:**
1. Gehe zu https://airtable.com/create/tokens
2. **"Create new token"**
3. **Name**: z.B. "Roots Systemplaner"
4. **Scopes hinzufügen**:
   - `data.records:read`
   - `data.records:write`
5. **Access**: Base auswählen (wichtig!)
6. **"Create token"**
7. Token kopieren (wird nur einmal angezeigt!)

**2. Airtable Base erstellen:**
1. Neue Base erstellen: "Roots Projekte"
2. **Base ID** aus URL kopieren: `https://airtable.com/app...` → `app...` ist die Base ID

**3. Tabellen in Airtable erstellen:**

Erstelle **3 Tabellen** mit folgenden Feldern:

**Tabelle 1: "Projekte"**
- Projektname (Single line text)
- Exportdatum (Date with time)
- Gebaeude_Name (Single line text)
- Gebaeude_Baujahr (Number)
- Gebaeude_Strasse (Single line text)
- Gebaeude_Hausnummer (Single line text)
- Gebaeude_Stockwerke (Number)
- Komponenten_Summe (Currency - Euro)
- Leitungen_Summe (Currency - Euro)
- Gesamtsumme (Currency - Euro)
- Anzahl_Komponenten (Number)
- Anzahl_Leitungen (Number)

**Tabelle 2: "Komponenten"**
- **Projekt** (Link to another record → Projekte) ⚠️ WICHTIG!
- Position (Number)
- Name (Single line text)
- Modultyp (Single line text)
- Hersteller (Single line text)
- Abmessungen (Single line text)
- Gewicht_kg (Number)
- Leistung_kW (Number)
- Volumen_L (Number)
- Berechnungsart (Single line text)
- Einheit (Single line text)
- Menge (Number)
- Preis_pro_Einheit (Currency - Euro)
- Gesamtpreis (Currency - Euro)

**Tabelle 3: "Leitungen"**
- **Projekt** (Link to another record → Projekte) ⚠️ WICHTIG!
- Position (Number)
- Von_Modul (Single line text)
- Von_Ausgang (Single line text)
- Zu_Modul (Single line text)
- Zu_Eingang (Single line text)
- Verbindungstyp (Single line text)
- Laenge_m (Number)
- Dimension (Single line text)
- Preis_pro_m (Currency - Euro)
- Gesamtpreis (Currency - Euro)

**4. Roots Systemplaner konfigurieren:**
1. Im Systemplaner: **Stückliste** → **⚙️ Airtable Settings**
2. Eingeben:
   - **Personal Access Token**: Token von Schritt 1
   - **Base ID**: Base ID von Schritt 2
   - **Projekte Tabelle ID**: `Projekte`
   - **Komponenten Tabelle ID**: `Komponenten`
   - **Leitungen Tabelle ID**: `Leitungen`
3. **"💾 Speichern"**
4. **"🧪 Verbindung testen"** klicken

Bei Erfolg: ✅ "Verbindung erfolgreich!"
Bei Fehler: Fehlercode und Beschreibung werden angezeigt.

#### Projekt zu Airtable exportieren

1. **Stückliste** öffnen
2. **"📤 An Airtable senden"** klicken
3. Warten (Fortschrittsanzeige)
4. Bei Erfolg: Link zur Airtable-Base wird angezeigt

**Was passiert:**
1. Projekt-Record wird in "Projekte" erstellt
2. Komponenten-Records werden erstellt und mit Projekt verknüpft
3. Leitungen-Records werden erstellt und mit Projekt verknüpft

#### Troubleshooting Airtable

**Fehler: "Invalid token"**
- Token überprüfen (korrekt kopiert?)
- Scopes überprüfen (`data.records:read` + `write`)
- Base-Zugriff im Token aktiviert?

**Fehler: "Table not found"**
- Tabellen-IDs überprüfen (exakt "Projekte", "Komponenten", "Leitungen")
- Groß-/Kleinschreibung beachten!

**Fehler: "Field not found"**
- Feldnamen in Airtable exakt wie oben angegeben?
- Unterstriche, keine Leerzeichen!
- Linked Fields in Komponenten/Leitungen korrekt?

### docsautomator Integration

docsautomator generiert Word-Dokumente aus Airtable-Daten.

#### Setup

**1. Template hochladen:**
1. Datei `Roots_Stueckliste_Template.docx` aus dem Repository verwenden
2. Zu docsautomator hochladen
3. Template-ID notieren

**2. Data Source konfigurieren:**
1. **Primary Table**: "Projekte"
2. **Line Items 1**: "Komponenten"
   - Linked via: "Projekt"
3. **Line Items 2**: "Leitungen"
   - Linked via: "Projekt"

**3. Automation in Airtable:**

**Option A - Automatisch bei Export:**
```
Trigger: When record is created (Tabelle: Projekte)
Action: Send webhook
URL: [docsautomator Webhook URL]
Body: JSON mit Record ID
```

**Option B - Mit Button:**
```
1. Checkbox-Feld in Projekte: "Dokument generieren"
2. Trigger: When record matches conditions
   Condition: "Dokument generieren" is checked
3. Action 1: Send webhook to docsautomator
4. Action 2: Update record → "Dokument generieren" uncheck
```

#### Template-Variablen

Das Template verwendet folgende Platzhalter:

**Projekt-Daten:**
- `{{Projektname}}`
- `{{Exportdatum}}`
- `{{Gebaeude_Name}}`
- `{{Gebaeude_Baujahr}}`
- `{{Gebaeude_Strasse}}` {{Gebaeude_Hausnummer}}`
- `{{Gebaeude_Stockwerke}}`

**Summen:**
- `{{Komponenten_Summe}}`
- `{{Leitungen_Summe}}`
- `{{Gesamtsumme}}`

**Line Items 1 (Komponenten-Tabelle):**
```
#line_items_1
{{Position}} | {{Name}} | {{Modultyp}} | ... | {{Gesamtpreis}}
#end_line_items_1
```

**Line Items 2 (Leitungen-Tabelle):**
```
#line_items_2
{{Position}} | {{Von_Modul}} | ... | {{Gesamtpreis}}
#end_line_items_2
```

**Ergebnis:** Professionelles Word-Dokument mit allen Projektdaten.

---

## 👨‍💼 Administration

### Admin-Panel

Admins haben Zugriff auf erweiterte Funktionen.

#### Admin-Panel öffnen

1. Als Admin einloggen
2. **User-Icon** (oben rechts) → **"Admin"**
3. Oder direkt: `http://localhost:5173/admin`

### Benutzer-Verwaltung

**Alle Benutzer anzeigen:**
- Liste aller registrierten Benutzer
- E-Mail, Name, Rolle, Registrierungsdatum

**Benutzer-Rollen:**
- **Admin**: Voller Zugriff, kann andere Admins erstellen
- **User**: Standard-Zugriff, kann eigene Projekte verwalten

**Rolle ändern:** (Noch nicht implementiert)
Aktuell nur über Datenbank möglich:
```sql
UPDATE users SET role = 'admin' WHERE email = 'user@example.com';
```

### Katalog-Statistiken

Dashboard zeigt:
- Anzahl Module
- Anzahl Modultypen
- Anzahl Verbindungsarten
- Anzahl Leitungen
- Anzahl Dimensionen
- Anzahl Formeln
- Anzahl Pumpen
- Anzahl Soles

### Datenbank-Tools

#### Standard-Kataloge initialisieren

Setzt alle Kataloge auf Standardwerte zurück:

1. **"Initialize Defaults"** klicken
2. Bestätigen
3. Folgendes wird erstellt:
   - Standard-Modultypen
   - Standard-Verbindungsarten
   - Standard-Dimensionen
   - Standard-Soles

**Warnung:** Benutzerdefinierte Kataloge werden NICHT überschrieben, nur fehlende Einträge werden hinzugefügt.

#### Alle Kataloge löschen

**Achtung:** Löscht ALLE Katalogdaten!

1. **"⚠️ Reset All Catalogs"** klicken
2. Bestätigen (zweimal!)
3. Alle Tabellen werden geleert:
   - Module
   - Modultypen
   - Verbindungen
   - Leitungen
   - Dimensionen
   - Formeln
   - Pumpen
   - Soles

**Anschließend:** "Initialize Defaults" ausführen, um Grunddaten wieder herzustellen.

#### Default Catalog Set

**Aktuellen Stand als Standard speichern:**
1. **"Save Current as Default"** klicken
2. Alle aktuellen Kataloge werden als "Default Set" gespeichert
3. Kann später wiederhergestellt werden

**Default Set laden:**
1. **"Load Default Set"** klicken
2. Bestätigen
3. Alle Kataloge werden auf den gespeicherten Standard zurückgesetzt

**Anwendungsfall:** Nach Experimenten zu bekanntem Zustand zurückkehren.

**Default Set exportieren:**
JSON-Export des Default Sets für Backup oder Transfer.

**Default Set importieren:**
JSON-Import, um ein Default Set wiederherzustellen.

### Backup & Restore

#### Manuelles Backup

**Datenbank-Backup:**
```bash
pg_dump -U postgres roots_configurator > backup_$(date +%Y%m%d).sql
```

**Restore:**
```bash
psql -U postgres roots_configurator < backup_20240308.sql
```

#### Automatisches Backup (empfohlen)

Cronjob einrichten (Linux/Mac):
```bash
# Crontab bearbeiten
crontab -e

# Täglich um 2 Uhr nachts
0 2 * * * pg_dump -U postgres roots_configurator > /backup/roots_$(date +\%Y\%m\%d).sql
```

---

## 💡 Tipps & Best Practices

### Projekt-Organisation

**Naming Convention:**
- Projekte: `[Kunde]_[Standort]_[Datum]`
- Beispiel: `Meier_Muenchen_2024-03-08`

**Tags verwenden:**
- Projekttyp: `EFH`, `MFH`, `Gewerbe`
- Status: `Planung`, `Angebot`, `Umsetzung`
- Kunde: Kundenname

**Beschreibung ausfüllen:**
- Kurze Projektzusammenfassung
- Besonderheiten
- Ansprechpartner

### Modul-Datenbank pflegen

**Module benennen:**
- Format: `[Hersteller] [Modell] [Hauptmerkmal]`
- Beispiel: `NIBE F2120-16` oder `Wolf SPW-500L`

**Technische Daten vollständig:**
Alle verfügbaren Daten eintragen, auch wenn optional. Hilft bei späterer Suche und Dokumentation.

**Ein-/Ausgänge definieren:**
Vollständige Definition erleichtert die Verbindungserstellung enorm.

### Verbindungen strukturiert anlegen

**Benennung:**
Module im Konfigurator umbenennen für bessere Übersicht:
- "WP1" statt "NIBE F2120-16"
- "Speicher1", "Speicher2"

**Reihenfolge:**
Module von links (Quelle) nach rechts (Verbraucher) anordnen.

**Junction-Nodes:**
Für Verzweigungen verwenden, nicht direkt mehrfach verbinden.

### Preise aktuell halten

**Katalogpreise:**
Regelmäßig aktualisieren (alle 6 Monate).

**Projektpreise:**
In der Stückliste anpassen, wenn Sonderkonditionen gelten.

**Preis-Notizen:**
In Modul-Notizen Preis-Quelle/Datum notieren.

### System Sets strategisch nutzen

**Standard-Sets:**
- "Standard" - Allgemein verwendbar
- "Minimal" - Nur essenzielle Komponenten
- "Premium" - Hochwertige Komponenten

**Projekt-spezifische Sets:**
- "Kunde_XY_Standard" - Kundenpräferenzen
- "Neubau_2024" - Aktuelle Neubau-Standards

**Versions-Sets:**
- "Katalog_2024_Q1" - Zeitpunkt dokumentieren

### Formeln dokumentieren

**Name:**
Aussagekräftig, z.B. "VDI 2073 Druckverlust"

**Beschreibung:**
Quelle, Gültigkeitsbereich, Besonderheiten notieren.

**Testen:**
Vor Aktivierung mit bekannten Werten testen.

### Backup-Strategie

**Was sichern:**
- Datenbank (PostgreSQL Dump)
- System Sets (JSON Export)
- Default Catalog (JSON Export)

**Wann:**
- Täglich automatisch (Datenbank)
- Vor größeren Änderungen (Kataloge)
- Nach Projektabschluss (Projekt-JSON)

**Wo:**
- Lokal UND remote
- 3-2-1 Regel: 3 Kopien, 2 Medien, 1 offsite

---

## 🔧 Troubleshooting

### Frontend startet nicht

**Symptom:** `npm run dev` schlägt fehl

**Lösungen:**
```bash
# Dependencies neu installieren
rm -rf node_modules package-lock.json
npm install

# Port belegt?
lsof -ti:5173 | xargs kill -9  # macOS/Linux
netstat -ano | findstr :5173   # Windows

# Alternativer Port
npm run dev -- --port 5174
```

### Backend startet nicht

**Symptom:** `npm run dev` im backend/ Ordner schlägt fehl

**Lösungen:**

**Datenbank nicht erreichbar:**
```bash
# PostgreSQL läuft?
pg_isready -U postgres

# PostgreSQL starten
brew services start postgresql@14  # macOS
sudo systemctl start postgresql    # Linux
```

**Falsches Passwort:**
- `.env` Datei überprüfen
- `DB_PASSWORD` mit PostgreSQL-Passwort abgleichen

**Datenbank existiert nicht:**
```bash
psql -U postgres
CREATE DATABASE roots_configurator;
\q

cd backend
npm run init-db
```

### Login funktioniert nicht

**Symptom:** "Invalid credentials" trotz korrekter Daten

**Lösungen:**

**Benutzer existiert nicht:**
Registrierung nochmal durchführen.

**Backend läuft nicht:**
```bash
cd backend
npm run dev
```

**Falscher API_URL:**
Frontend `.env` prüfen:
```env
VITE_API_URL=http://localhost:3001
```

### Module verschwinden nach Reload

**Ursache:** Module werden nicht im Backend gespeichert

**Lösung:**
1. Modul-Datenbank öffnen
2. Modul auswählen
3. "Speichern" klicken
4. Backend-Console prüfen auf Errors

**Wenn Backend-Fehler:**
- PostgreSQL läuft?
- Tabelle `catalog_modules` existiert?
```bash
psql -U postgres -d roots_configurator
\dt catalog_modules
```

### Verbindungen können nicht gelöscht werden

**Symptom:** Verbindung bleibt nach Löschversuch

**Lösung:**
1. Edge **anklicken** (sollte orange werden)
2. **Entf** oder **Backspace** drücken
3. Oder: Rechtsklick → "Löschen"

**Wenn das nicht hilft:**
Canvas neu laden (F5).

### Airtable Export schlägt fehl

**Fehler: "Invalid token"**
1. Token neu erstellen
2. Scopes überprüfen: `data.records:read` + `write`
3. Base-Zugriff im Token aktiviert?

**Fehler: "Table not found"**
1. Tabellen-ID exakt prüfen: "Projekte" (nicht "projekte")
2. Tabelle in der ausgewählten Base vorhanden?

**Fehler: "Field not found"**
1. Alle Feldnamen gemäß Anleitung erstellt?
2. Typen korrekt? (Currency für Preise, Number für Zahlen)
3. Linked Fields in Komponenten/Leitungen → "Projekt"?

**Fehler: "Rate limit exceeded"**
Zu viele Anfragen. 1 Minute warten.

### Excel-Export fehlerhaft

**Symptom:** Excel-Datei kann nicht geöffnet werden

**Lösung:**
1. Browser-Console öffnen (F12)
2. Error-Message lesen
3. Häufig: Ungültige Zeichen in Daten
4. Modul-Namen mit Sonderzeichen prüfen

**Workaround:** JSON exportieren und manuell in Excel importieren.

### Pumpenanalyse zeigt keine Ergebnisse

**Mögliche Ursachen:**

**Keine aktive Formel:**
1. Einstellungen → Formeln
2. Eine Formel als "aktiv" markieren (Radio-Button)

**Verbindungen nicht konfiguriert:**
1. Alle Verbindungen müssen Länge haben
2. Doppelklick auf jede Verbindung
3. Länge eintragen

**Keine hydraulischen Verbindungen:**
Pumpenanalyse arbeitet nur mit hydraulischen Pfaden.

### Sole-Faktoren in Formeln funktionieren nicht

**Symptom:** Formel-Fehler bei Verwendung von Sole-Namen

**Lösung:**

**Variablen aktualisieren:**
1. Einstellungen → Formeln
2. **"🔄 Aktualisieren"** klicken
3. Sole-Namen erscheinen als verfügbare Variablen

**Syntax prüfen:**
- Exakte Schreibweise: `{{Glykol 30%}}` (mit Leerzeichen und %)
- Groß-/Kleinschreibung beachten

**Sole existiert:**
- Einstellungen → Sole
- Sole muss im Katalog vorhanden sein

### Performance-Probleme

**Canvas läuft langsam:**

**Zu viele Nodes:**
- Ab ~50 Nodes kann es langsamer werden
- Projekt aufteilen in Teil-Systeme

**Browser-Cache leeren:**
```
Chrome: Ctrl+Shift+Delete
Firefox: Ctrl+Shift+Delete
Safari: Cmd+Option+E
```

**Hardware-Beschleunigung aktivieren:**
Chrome: Settings → System → "Use hardware acceleration"

---

## 🚧 Geplante Features

Die folgenden Features sind konzeptionell angelegt oder teilweise implementiert, aber noch nicht vollständig funktionsfähig.

### 1. Erweiterte Benutzer-Verwaltung

**Status:** Grundgerüst vorhanden, UI fehlt

**Geplant:**
- **Team-Verwaltung:** Benutzer zu Teams zuordnen
- **Rollen-System:**
  - Admin: Voller Zugriff
  - Manager: Team-Verwaltung + Projektverwaltung
  - Planer: Projekt-Erstellung + Bearbeitung
  - Viewer: Nur Lesezugriff
- **Berechtigungen pro Projekt:**
  - Projekt-Owner
  - Shared Projects
  - Read-only Sharing
- **Aktivitäts-Log:**
  - Wer hat wann was geändert
  - Versionierung von Projekten

**Verwendung:** Über Admin-Panel UI (noch zu bauen)

### 2. Projekt-Versionierung

**Status:** Datenbank-Struktur vorbereitet, Feature nicht implementiert

**Geplant:**
- **Automatische Snapshots:**
  - Bei jedem Speichern Version erstellen
  - Konfigurierbare Snapshot-Intervalle
- **Version vergleichen:**
  - Diff-View zwischen zwei Versionen
  - Visuelle Hervorhebung von Änderungen
- **Version wiederherstellen:**
  - Rollback zu früherer Version
  - "Restore as copy" Option
- **Version-Kommentare:**
  - Notizen zu jeder Version
  - Milestone-Markierungen

**Verwendung:** Über Projekt-Menü (noch zu implementieren)

### 3. Erweiterte Stücklisten-Features

**Status:** Teilweise implementiert, erweiterbar

**Geplant:**
- **Stücklistenvorlagen:**
  - Vordefinierte Layouts
  - Firmenbezogene Templates
- **Gruppierung:**
  - Nach Kategorie
  - Nach Gewerk
  - Nach Raum/Bereich
- **Bedingte Formatierung:**
  - Farb-Coding nach Preis
  - Warnungen bei Grenzwerten
- **Zusatzpositionen:**
  - Manuelle Positionen ohne Modul
  - Pauschal-Positionen (z.B. "Montage")
- **Rabatte & Aufschläge:**
  - Prozentual oder absolut
  - Pro Position oder gesamt
- **Mehrwertsteuer:**
  - Netto/Brutto Ansicht
  - Konfigurierbare MwSt.-Sätze

**Verwendung:** Über Stücklisten-Ansicht (UI-Erweiterung nötig)

### 4. 3D-Visualisierung

**Status:** Konzept vorhanden, nicht implementiert

**Geplant:**
- **3D-Modus:**
  - Parallel zum 2D-Editor
  - Automatische Generierung aus 2D-Layout
- **Modul-Modelle:**
  - 3D-Repräsentationen der Module
  - Import von STEP/STL Dateien
- **Räumliche Planung:**
  - Höhe/Tiefe für Module
  - Kollisionserkennung
- **Virtuelle Begehung:**
  - First-Person View
  - Export für VR

**Technologie:** Three.js oder Babylon.js

**Verwendung:** Zusätzlicher Tab "3D-Ansicht"

### 5. Hydraulische Simulation

**Status:** Grundlagen vorhanden (Pumpenanalyse), erweiterbar

**Geplant:**
- **Vollständige Simulation:**
  - Druck an jedem Punkt
  - Durchfluss pro Leitung
  - Temperaturverläufe
- **Dynamische Simulation:**
  - Zeitbasiert (Tages-/Jahressimulation)
  - Lastprofile
  - Wetterdaten-Integration
- **Optimierungs-Vorschläge:**
  - Pumpen-Sizing
  - Rohrdimensionierung
  - Speicherauslegung
- **COP-Berechnung:**
  - Jahresarbeitszahl
  - Energieverbrauch
  - Kostenprognose

**Verwendung:** Erweiterung der Pumpenanalyse

### 6. KI-Assistierte Planung

**Status:** Nicht implementiert, Zukunftsvision

**Geplant:**
- **Auto-Layout:**
  - KI schlägt optimales Layout vor
  - Basierend auf Best Practices
- **Komponenten-Empfehlung:**
  - "Passendes Modul vorschlagen"
  - Basierend auf Projektdaten
- **Fehler-Erkennung:**
  - "System validieren"
  - Hinweise auf problematische Konfigurationen
- **Angebots-Texte:**
  - Automatische Beschreibungen
  - Technische Dokumentation

**Technologie:** Integration von OpenAI API oder lokales Modell

### 7. Mobile App

**Status:** Nicht implementiert, responsive Design teilweise vorhanden

**Geplant:**
- **iOS/Android App:**
  - Native Apps mit React Native
  - Oder Progressive Web App (PWA)
- **Offline-Modus:**
  - Lokale Datenhaltung
  - Sync bei Verbindung
- **Tablet-Optimierung:**
  - Touch-optimierte UI
  - Stift-Support für iPad/Surface
- **Foto-Integration:**
  - Fotos vor Ort aufnehmen
  - An Projekt/Module anhängen
- **QR-Code Scanning:**
  - Module per QR-Code hinzufügen
  - Seriennummern erfassen

**Verwendung:** Separate App / PWA

### 8. Reporting & Analytics

**Status:** Grunddaten vorhanden, Auswertung nicht implementiert

**Geplant:**
- **Projekt-Statistiken:**
  - Durchschnittliche Projektgröße
  - Häufigste Module
  - Preisentwicklung
- **Performance-Tracking:**
  - Angebots-Erfolgsrate
  - Durchlaufzeiten
  - Profitabilität
- **Dashboards:**
  - Management-Übersicht
  - Team-Performance
  - Ressourcen-Auslastung
- **Export für BI-Tools:**
  - Power BI
  - Tableau
  - Excel Pivot

**Verwendung:** Über Admin-Panel oder separates Reporting-Modul

### 9. Schnittstellen & Integrationen

**Status:** Teilweise implementiert (Airtable), erweiterbar

**Geplant:**
- **ERP-Integration:**
  - SAP
  - Microsoft Dynamics
  - Sage
- **CAD-Export:**
  - DXF/DWG Export
  - Import von Grundrissen
- **BIM-Integration:**
  - IFC Import/Export
  - Revit Plugin
- **Kalkulationssoftware:**
  - ORCA AVA
  - California
- **CRM-Integration:**
  - HubSpot
  - Salesforce
- **REST API:**
  - Öffentliche API für Integrationen
  - Webhook-Support
  - GraphQL Endpoint

**Verwendung:** Über Einstellungen → Integrationen

### 10. Erweiterte Formeln & Berechnungen

**Status:** Basis vorhanden, erweiterbar

**Geplant:**
- **Formel-Bibliothek:**
  - VDI-Normen
  - DIN-Normen
  - Herstellerspezifische Formeln
- **Multi-Step Berechnungen:**
  - Verkettete Formeln
  - Zwischenergebnisse
- **Conditional Logic:**
  - If/Then/Else in Formeln
  - Bereichsabhängige Berechnungen
- **Dimensionierung:**
  - Automatische Rohrdurchmesser-Berechnung
  - Pumpen-Auslegung
  - Speicher-Größe
- **Kosten-Nutzen-Analyse:**
  - ROI-Berechnung
  - Amortisationszeit
  - Fördermittel-Berücksichtigung

**Verwendung:** Erweiterte Formel-Editor

### 11. Dokumenten-Management

**Status:** Export-Funktionen vorhanden, DMS nicht implementiert

**Geplant:**
- **Datei-Anhänge:**
  - PDF, Bilder, CAD zu Projekten
  - Zu einzelnen Modulen
- **Versionierung:**
  - Dokumenten-Versionen
  - Änderungshistorie
- **Kategorisierung:**
  - Datenblätter
  - Handbücher
  - Zertifikate
  - Fotos
- **Volltextsuche:**
  - In PDFs
  - In Notizen
- **Automatische Ablage:**
  - Struktur nach Projekt
  - Namenskonventionen

**Verwendung:** Über Projekt-Detailansicht

### 12. Kollaborations-Features

**Status:** Nicht implementiert, Multi-User-Backend vorhanden

**Geplant:**
- **Echtzeit-Zusammenarbeit:**
  - Mehrere Benutzer gleichzeitig im Editor
  - Cursor/Auswahl anderer Benutzer sichtbar
  - Live-Updates
- **Kommentare:**
  - An Module
  - An Verbindungen
  - An beliebige Canvas-Positionen
  - @-Mentions
- **Aufgaben:**
  - To-Dos zu Projekten
  - Zuweisungen
  - Deadlines
- **Chat:**
  - Projekt-bezogener Chat
  - Team-Chat
- **Benachrichtigungen:**
  - E-Mail bei Änderungen
  - In-App Notifications
  - Digest (täglich/wöchentlich)

**Technologie:** WebSockets für Realtime

**Verwendung:** Automatisch bei Multi-User-Zugriff

---

## 📞 Support & Ressourcen

### Dokumentation

- **README.md**: Projekt-Übersicht und Quick Start
- **BENUTZERHANDBUCH.md**: Dieses Dokument
- **CHANGELOG.md**: Versions-Historie
- **API.md**: Backend-API Dokumentation (falls vorhanden)

### Code-Kommentare

Der Code ist gut kommentiert. Bei Fragen:
1. Relevante Komponente öffnen
2. Kommentare lesen
3. JSDoc-Beschreibungen beachten

### GitHub Issues

Für Bugs und Feature-Requests:
https://github.com/Hacklerflow/Roots-Systemplaner/issues

**Issue erstellen:**
1. **Bug Report**: Template verwenden
2. **Feature Request**: Detaillierte Beschreibung
3. **Screenshots** wenn relevant

### Community

- **Discussions**: Für Fragen und Austausch
- **Wiki**: Community-Beiträge und Tutorials

### Entwickler-Ressourcen

**Stack Overflow Tags:**
- `react`
- `react-flow`
- `vite`
- `postgresql`

**Offizielle Docs:**
- React: https://react.dev
- React Flow: https://reactflow.dev
- Vite: https://vitejs.dev
- PostgreSQL: https://www.postgresql.org/docs

---

## 📜 Lizenz & Nutzung

**Lizenz:** Private - Alle Rechte vorbehalten

**Entwickelt für:** Roots Energy

**Nutzungsbedingungen:**
- Nur für interne Nutzung bei Roots Energy
- Keine Weitergabe an Dritte ohne Genehmigung
- Keine kommerzielle Verwertung außerhalb von Roots Energy

---

## 🙏 Danksagungen

**Entwickelt mit:**
- Claude Sonnet 4.5 (Anthropic)
- React & Vite Community
- React Flow Team
- Open Source Community

**Besonderer Dank an:**
- Roots Energy Team für Feedback und Testing
- Beta-Tester für wertvollen Input

---

**Version:** 2.0
**Letzte Aktualisierung:** 2026-03-08
**Autor:** Claude Sonnet 4.5 (Anthropic)

---

**Made with ❤️ and ⚡ for Roots Energy**
