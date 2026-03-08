# Roots-Systemplaner - Benutzerhandbuch

**Version 2.0** | Ihr Planungstool für Wärmepumpensysteme

---

## 🎯 Willkommen

### Was ist der Roots-Systemplaner?

Der Roots-Systemplaner ist Ihr digitales Werkzeug zur Planung von Wärmepumpensystemen. Mit diesem Tool können Sie:

✅ **Systeme visuell planen** - Ziehen Sie Module per Drag & Drop und verbinden Sie diese
✅ **Automatische Stücklisten** - Alle benötigten Komponenten werden automatisch erfasst
✅ **Professionelle Angebote** - Exportieren Sie Ihre Planung direkt als Excel oder JSON
✅ **Kataloge verwalten** - Passen Sie Module, Leitungen und Preise an Ihre Bedürfnisse an
✅ **Vorlagen nutzen** - Speichern Sie häufig genutzte Konfigurationen als System Sets

### Für wen ist dieses Tool?

- **Technische Planer**: Für die schnelle Erstellung von Systemlayouts
- **Vertriebsmitarbeiter**: Für die Angebotserstellung vor Ort
- **Projektleiter**: Für Projektdokumentation und -verwaltung
- **Installateure**: Zur Übersicht der benötigten Komponenten

---

## 🚀 Erste Schritte

### 1. Anmelden

Wenn Sie die Anwendung öffnen, werden Sie aufgefordert, sich anzumelden:

1. Geben Sie Ihre **E-Mail-Adresse** und Ihr **Passwort** ein
2. Klicken Sie auf **"Anmelden"**

💡 **Noch kein Konto?** Fragen Sie Ihren Administrator nach den Zugangsdaten oder wenden Sie sich an Ihren IT-Support.

### 2. Das Dashboard

Nach der Anmeldung sehen Sie das **Dashboard** mit:

- **Projektliste**: Alle Ihre gespeicherten Projekte
- **Neues Projekt erstellen**: Button zum Anlegen eines neuen Projekts
- **Suchfunktion**: Projekte nach Name, Kunde oder Standort durchsuchen
- **Abmelden**: Oben rechts zum Ausloggen

---

## 📁 Projekte verwalten

### Neues Projekt erstellen

1. Klicken Sie im Dashboard auf **"+ Neues Projekt"**
2. Füllen Sie die Projekt-Informationen aus:
   - **Projektname**: z.B. "Einfamilienhaus Müller"
   - **Kunde**: Name des Kunden
   - **Standort**: Adresse oder Ort
   - **Projektleiter**: Ihr Name
   - **Beschreibung**: Optional - zusätzliche Notizen
3. Klicken Sie auf **"Projekt erstellen"**

### Projekt öffnen

1. Klicken Sie in der Projektliste auf ein Projekt
2. Das Projekt öffnet sich im Konfigurator

### Projekt bearbeiten

1. Öffnen Sie das Projekt
2. Klicken Sie oben rechts auf das **Zahnrad-Symbol**
3. Bearbeiten Sie die Projektdaten
4. Klicken Sie auf **"Speichern"**

### Projekt löschen

1. Klicken Sie in der Projektliste auf das **Papierkorb-Symbol** neben dem Projekt
2. Bestätigen Sie die Löschung

⚠️ **Achtung**: Gelöschte Projekte können nicht wiederhergestellt werden!

### Projekt duplizieren

1. Klicken Sie in der Projektliste auf das **Kopier-Symbol**
2. Geben Sie einen neuen Namen ein
3. Das Projekt wird mit allen Komponenten und Verbindungen kopiert

💡 **Tipp**: Nutzen Sie diese Funktion für ähnliche Projekte, um Zeit zu sparen!

---

## 🎨 System planen (Konfigurator)

### Der Konfigurator im Überblick

Der Konfigurator ist Ihr Hauptwerkzeug zum Planen von Systemen. Er besteht aus:

**Tabs oben:**
- **Konfigurator**: Visueller Editor zum Planen
- **Listenansicht**: Tabellarische Übersicht aller Module
- **Stückliste**: Automatisch generierte Material-Liste
- **Pumpenanalyse**: Berechnung der Pumpenleistung
- **Moduldatenbank**: Verfügbare Komponenten verwalten
- **Einstellungen**: Kataloge und Vorlagen anpassen

**Konfigurator-Ansicht:**
- **Linke Sidebar**: Verfügbare Module zum Hinzufügen
- **Arbeitsfläche**: Hier planen Sie Ihr System
- **Rechte Sidebar**: Details zum ausgewählten Modul

### Module hinzufügen

**Methode 1: Drag & Drop**
1. Wählen Sie ein Modul aus der linken Sidebar
2. Ziehen Sie es auf die Arbeitsfläche
3. Lassen Sie die Maustaste los, um es zu platzieren

**Methode 2: Doppelklick**
1. Doppelklicken Sie auf ein Modul in der Sidebar
2. Es erscheint automatisch auf der Arbeitsfläche

### Module verschieben

1. Klicken Sie auf ein Modul und halten Sie die Maustaste gedrückt
2. Ziehen Sie es an die gewünschte Position
3. Lassen Sie die Maustaste los

### Module verbinden

1. Bewegen Sie die Maus über einen **Ausgang** (rechte Seite eines Moduls)
2. Ein Verbindungspunkt wird sichtbar
3. Klicken Sie auf den Ausgang und ziehen Sie zur Zielposition
4. Lassen Sie die Maus über einem **Eingang** (linke Seite) los
5. Ein Dialog öffnet sich zur Konfiguration der Verbindung

### Verbindung konfigurieren

Im Verbindungsdialog können Sie festlegen:

**Verbindungsart**: z.B. "Vorlauf", "Rücklauf", "Solar"
**Leitungstyp**: Material der Leitung (z.B. "Kupfer", "Stahl")
**Dimension**: Rohrdurchmesser (z.B. "22mm", "28mm")
**Länge**: Rohrlänge in Metern
**Pumpe**: Optional eine Pumpe zuordnen
**Formel**: Optional Berechnungsformel anwenden

Klicken Sie auf **"Verbindung erstellen"** zum Speichern.

### Verbindung bearbeiten

1. Klicken Sie auf eine Verbindungslinie
2. Der Verbindungsdialog öffnet sich
3. Ändern Sie die gewünschten Werte
4. Klicken Sie auf **"Speichern"**

### Verbindung löschen

1. Klicken Sie auf eine Verbindungslinie
2. Klicken Sie im Dialog auf **"Löschen"**

### Module löschen

1. Klicken Sie auf ein Modul, um es auszuwählen
2. Drücken Sie die **Entf-Taste** oder **Backspace**
3. Bestätigen Sie die Löschung

⚠️ **Achtung**: Alle Verbindungen zu diesem Modul werden ebenfalls gelöscht!

### Modul-Details anzeigen

1. Klicken Sie auf ein Modul
2. Die rechte Sidebar zeigt Details:
   - Name und Typ
   - Hersteller
   - Technische Daten (Leistung, Volumen, Gewicht)
   - Preis
   - Ein- und Ausgänge
   - Zugeordnete Pumpen

### Ansicht anpassen

**Zoomen:**
- Scrollen Sie mit dem Mausrad
- Oder nutzen Sie die Zoom-Buttons unten rechts

**Verschieben:**
- Halten Sie die **Leertaste** gedrückt und ziehen Sie mit der Maus
- Oder ziehen Sie mit der mittleren Maustaste

**Ansicht zentrieren:**
- Klicken Sie auf den Button **"Fit View"** unten rechts

### Mini-Map

Die Mini-Map (unten links) zeigt:
- Übersicht über das gesamte System
- Ihre aktuelle Position (blauer Rahmen)
- Klicken Sie in die Mini-Map, um schnell zu navigieren

---

## 📊 Listenansicht

Die Listenansicht zeigt alle Module tabellarisch:

**Spalten:**
- **Name**: Modulbezeichnung
- **Typ**: Modultyp (z.B. "Wärmepumpe", "Pufferspeicher")
- **Hersteller**: Hersteller des Moduls
- **Leistung**: Leistung in kW (falls vorhanden)
- **Preis**: Preis pro Stück

**Funktionen:**
- **Sortieren**: Klicken Sie auf eine Spaltenüberschrift
- **Filtern**: Nutzen Sie das Suchfeld oben
- **Details**: Klicken Sie auf eine Zeile für Details

---

## 📝 Stückliste & Pumpenanalyse

### Stückliste

Die Stückliste wird **automatisch** aus Ihrem System generiert und enthält:

**Module:**
- Alle platzierten Module mit Stückzahl
- Einzelpreis und Gesamtpreis
- Hersteller und Artikelnummer

**Leitungen:**
- Alle Verbindungen gruppiert nach Material und Dimension
- Gesamtlänge in Metern
- Preis pro Meter und Gesamtpreis

**Pumpen:**
- Alle zugeordneten Pumpen
- Technische Daten
- Preis

**Zusammenfassung:**
- Gesamtanzahl der Module
- Gesamtlänge der Leitungen
- **Gesamtpreis** des Systems

### Pumpenanalyse

Die Pumpenanalyse hilft bei der Auswahl der richtigen Pumpe:

1. Wechseln Sie zum Tab **"Pumpenanalyse"**
2. Wählen Sie einen **Kreislauf** aus (z.B. "Heizkreis 1")
3. Das System berechnet automatisch:
   - **Volumenstrom** (l/h)
   - **Druckverlust** (mbar)
   - **Empfohlene Pumpenleistung**

4. Wählen Sie eine passende Pumpe aus der Liste
5. Ordnen Sie die Pumpe einer Verbindung zu

**Hinweise:**
- 🟢 Grün: Pumpe ist ausreichend dimensioniert
- 🟡 Gelb: Pumpe arbeitet am oberen Limit
- 🔴 Rot: Pumpe ist unterdimensioniert

---

## 🗂️ Kataloge anpassen

Im Tab **"Einstellungen"** können Sie Ihre Kataloge verwalten:

### Moduldatenbank

Hier verwalten Sie Ihre verfügbaren Module:

**Neues Modul hinzufügen:**
1. Klicken Sie auf **"+ Neues Modul"**
2. Füllen Sie die Felder aus:
   - **Name**: z.B. "Roots WP Maxi 12kW"
   - **Modultyp**: z.B. "Wärmepumpe"
   - **Hersteller**: z.B. "Roots Energy"
   - **Leistung**: z.B. "12" (kW)
   - **Volumen**: z.B. "150" (Liter)
   - **Gewicht**: z.B. "85" (kg)
   - **Preis**: z.B. "8500"
3. Konfigurieren Sie **Eingänge** und **Ausgänge**
4. Optional: Ordnen Sie Pumpen zu
5. Klicken Sie auf **"Speichern"**

**Modul bearbeiten:**
1. Klicken Sie auf ein Modul in der Liste
2. Ändern Sie die Werte
3. Klicken Sie auf **"Speichern"**

**Modul löschen:**
1. Klicken Sie auf ein Modul
2. Klicken Sie auf **"Löschen"**
3. Bestätigen Sie die Löschung

💡 **Tipp**: Module, die in Projekten verwendet werden, sollten nicht gelöscht werden!

### Modultypen

Definieren Sie Kategorien für Ihre Module:

**Beispiele:**
- Wärmepumpe
- Pufferspeicher
- Warmwasserspeicher
- Hydraulische Weiche
- Verteiler

**Neuer Modultyp:**
1. Geben Sie den Namen ein
2. Klicken Sie auf **"Hinzufügen"**

### Verbindungen

Definieren Sie Arten von Verbindungen:

**Beispiele:**
- Vorlauf (VL)
- Rücklauf (RL)
- Solar
- Trinkwasser

**Neue Verbindung:**
1. Name eingeben (z.B. "Vorlauf")
2. Kürzel eingeben (z.B. "VL")
3. Typ wählen (Heizung, Kühlung, Solar, etc.)
4. Kompatible Leitungen auswählen
5. Klicken Sie auf **"Hinzufügen"**

### Leitungen

Verwalten Sie verfügbare Rohrleitungen:

**Neue Leitung:**
1. Verbindungstyp wählen
2. Material eingeben (z.B. "Kupfer", "Stahl")
3. Dimension eingeben (z.B. "22mm", "28mm")
4. Preis pro Meter eingeben
5. Klicken Sie auf **"Hinzufügen"**

### Dimensionen

Definieren Sie Rohrdurchmesser:

**Beispiele:**
- 15mm
- 18mm
- 22mm
- 28mm
- 35mm

### Pumpen

Verwalten Sie Ihren Pumpen-Katalog:

**Neue Pumpe:**
1. Name eingeben (z.B. "Grundfos UPS 25-60")
2. Hersteller eingeben
3. Max. Fördermenge (l/h)
4. Max. Förderhöhe (m)
5. Leistungsaufnahme (W)
6. Preis
7. Klicken Sie auf **"Hinzufügen"**

### Sole

Verwalten Sie Wärmeträgermedien:

**Neue Sole:**
1. Name eingeben (z.B. "Glykol 30%")
2. Frostschutzmittel angeben
3. Notiz hinzufügen (optional)
4. Faktor eingeben (für Berechnungen)
5. Klicken Sie auf **"Hinzufügen"**

### Formeln

Erstellen Sie Berechnungsformeln für automatische Werte:

**Neue Formel:**
1. Name eingeben (z.B. "Rohrlänge Berechnung")
2. Formel eingeben mit Variablen: `{{Variable}} * Faktor`
3. Beschreibung hinzufügen
4. Verfügbare Variablen anzeigen lassen
5. Formel testen
6. Klicken Sie auf **"Speichern"**

**Variablen:**
- `{{Rohrlänge}}`: Länge der Verbindung
- `{{Rohrdimension}}`: Durchmesser
- `{{Faktor}}`: Benutzerdefinierter Faktor
- `{{Sole-Name}}`: Faktor der ausgewählten Sole

---

## 💾 System Sets

System Sets sind **Vorlagen** für Ihre Kataloge. Sie ermöglichen es, verschiedene Konfigurationen zu speichern und schnell zu wechseln.

### Was wird in einem System Set gespeichert?

Ein System Set enthält:
- ✅ Alle Module aus der Moduldatenbank
- ✅ Alle Modultypen
- ✅ Alle Verbindungsarten
- ✅ Alle Leitungen
- ✅ Alle Dimensionen
- ✅ Alle Formeln
- ✅ Alle Pumpen
- ✅ Alle Solen

❌ **Nicht** enthalten: Ihre Projekte und deren Konfigurationen

### Wann sind System Sets nützlich?

**Beispiele:**
- **Regional**: "Wien Standard", "Salzburg Standard"
- **Projekttyp**: "Einfamilienhaus", "Gewerbe", "Mehrfamilienhaus"
- **Hersteller**: "Roots Only", "Multi-Brand"
- **Saison**: "Katalog 2024", "Katalog 2025"

### Neues System Set erstellen

1. Gehen Sie zu **Einstellungen → System Sets**
2. Klicken Sie auf **"+ Aktuellen Stand als neues Set speichern"**
3. Geben Sie einen Namen ein (z.B. "Wien Standard 2024")
4. Klicken Sie auf **"Speichern"**

💡 Der aktuelle Stand aller Kataloge wird gespeichert!

### System Set aktivieren

1. Gehen Sie zu **Einstellungen → System Sets**
2. Klicken Sie bei einem Set auf **"Aktivieren"**
3. Bestätigen Sie den Wechsel

⚠️ **Achtung**: Alle aktuellen Kataloge werden durch das ausgewählte Set ersetzt!

### System Set exportieren

**Einzelnes Set:**
1. Klicken Sie auf **"💾 Export"** neben einem Set
2. Die Datei wird als JSON heruntergeladen

**Alle Sets:**
1. Klicken Sie oben auf **"📥 Alle Sets exportieren"**
2. Alle Sets werden in einer Datei gespeichert

### System Set importieren

1. Klicken Sie auf **"📂 Sets importieren"**
2. Wählen Sie eine JSON-Datei aus
3. Die Sets werden zur Liste hinzugefügt

**Bei Duplikaten:**
- Sie werden gefragt, ob Sie überschreiben oder neue IDs vergeben möchten

### System Set löschen

1. Klicken Sie auf **"Löschen"** neben einem Set
2. Bestätigen Sie die Löschung

❌ **Das aktive Set kann nicht gelöscht werden!**

---

## 📤 Export-Funktionen

### Excel-Export

Exportieren Sie Ihre Stückliste als Excel-Datei:

1. Wechseln Sie zum Tab **"Stückliste"**
2. Klicken Sie auf **"📊 Excel Export"**
3. Die Datei wird heruntergeladen

**Inhalt:**
- **Blatt 1 - Module**: Alle Module mit Details
- **Blatt 2 - Leitungen**: Alle Leitungen gruppiert
- **Blatt 3 - Pumpen**: Alle Pumpen
- **Blatt 4 - Zusammenfassung**: Gesamtübersicht mit Preisen

### JSON-Export

Exportieren Sie das komplette Projekt als JSON:

1. Klicken Sie oben rechts auf **"Exportieren"**
2. Wählen Sie **"JSON Export"**
3. Die Datei enthält alle Projektdaten

💡 **Verwendung**: Import in andere Systeme oder Backup

### Airtable-Export

**Voraussetzung**: Airtable API-Key und Base-ID müssen konfiguriert sein.

1. Klicken Sie auf **"Airtable Export"**
2. Das Projekt wird direkt zu Airtable hochgeladen
3. Sie erhalten eine Bestätigung

### docsautomator-Export

**Voraussetzung**: docsautomator Integration muss eingerichtet sein.

1. Klicken Sie auf **"docsautomator Export"**
2. Wählen Sie eine Vorlage
3. Das Dokument wird generiert und heruntergeladen

---

## 💡 Tipps & Tricks

### Effizienter arbeiten

**1. Nutzen Sie Tastenkombinationen:**
- `Entf` oder `Backspace`: Modul löschen
- `Leertaste + Ziehen`: Ansicht verschieben
- `Strg/Cmd + S`: Automatisches Speichern (läuft automatisch alle 30 Sekunden)

**2. Organisieren Sie Ihre Module:**
- Benennen Sie Module eindeutig (z.B. "WP Erdgeschoss" statt nur "WP")
- Nutzen Sie Modultypen zur Kategorisierung
- Löschen Sie ungenutzte Module aus dem Katalog

**3. Arbeiten Sie mit System Sets:**
- Erstellen Sie Sets für verschiedene Szenarien
- Exportieren Sie Sets als Backup
- Teilen Sie Sets mit Kollegen

**4. Nutzen Sie die Suchfunktion:**
- Im Dashboard: Projekte schnell finden
- In der Moduldatenbank: Module filtern
- Im Manual: Hilfe zu Funktionen finden

**5. Regelmäßige Backups:**
- Exportieren Sie wichtige Projekte als JSON
- Exportieren Sie Ihre System Sets
- Archivieren Sie abgeschlossene Projekte

### Häufige Arbeitsabläufe

**Neues Projekt erstellen:**
1. Dashboard → Neues Projekt
2. Projektdaten eingeben
3. Module auf Arbeitsfläche ziehen
4. Module verbinden und konfigurieren
5. Stückliste prüfen
6. Excel-Export für Angebot

**Bestehendes Projekt anpassen:**
1. Projekt öffnen
2. Module hinzufügen/entfernen
3. Verbindungen anpassen
4. Speichern (automatisch)
5. Neue Stückliste exportieren

**Katalog aktualisieren:**
1. Einstellungen → Moduldatenbank
2. Preise/Daten aktualisieren
3. Als neues System Set speichern
4. Datum im Namen vermerken

---

## ❓ Häufige Fragen

### Allgemein

**Wie oft sollte ich speichern?**
Die Anwendung speichert automatisch alle 30 Sekunden. Sie müssen nicht manuell speichern!

**Kann ich offline arbeiten?**
Nein, die Anwendung benötigt eine Internetverbindung zur Datenbank.

**Können mehrere Personen gleichzeitig an einem Projekt arbeiten?**
Aktuell ist dies nicht empfohlen, da Änderungen sich überschreiben können.

### Projekte

**Warum sehe ich nicht alle Projekte?**
Sie sehen nur Ihre eigenen Projekte. Administratoren können alle Projekte sehen.

**Kann ich ein Projekt mit Kollegen teilen?**
Aktuell ist kein integriertes Teilen möglich. Nutzen Sie den JSON-Export und Import.

**Was passiert, wenn ich ein Projekt lösche?**
Das Projekt wird dauerhaft gelöscht und kann nicht wiederhergestellt werden. Erstellen Sie vorher einen Export!

### Konfigurator

**Warum kann ich zwei Module nicht verbinden?**
- Prüfen Sie, ob der Ausgang mit dem Eingang kompatibel ist
- Manche Verbindungsarten erlauben nur bestimmte Kombinationen
- Ein Ausgang kann nur mit einem Eingang verbunden werden

**Die Verbindungslinie verschwindet - warum?**
Stellen Sie sicher, dass Sie vom Ausgang (rechts) zum Eingang (links) ziehen, nicht umgekehrt.

**Kann ich Verbindungen nachträglich ändern?**
Ja, klicken Sie auf die Verbindungslinie und bearbeiten Sie die Werte.

### Stückliste

**Die Stückliste ist leer - warum?**
- Prüfen Sie, ob Module platziert sind
- Prüfen Sie, ob Verbindungen existieren
- Aktualisieren Sie die Seite (F5)

**Preise werden nicht angezeigt - warum?**
- Prüfen Sie, ob die Module Preise haben (Moduldatenbank)
- Prüfen Sie, ob die Leitungen Preise haben (Einstellungen → Leitungen)

**Wie ändere ich einen Preis?**
1. Gehen Sie zu **Moduldatenbank** oder **Einstellungen → Leitungen**
2. Bearbeiten Sie den Preis
3. Die Stückliste aktualisiert sich automatisch

### Kataloge

**Ich habe ein Modul gelöscht, aber es ist noch in Projekten - was nun?**
Gelöschte Module bleiben in bestehenden Projekten erhalten. Sie können sie nur dort nicht mehr neu hinzufügen.

**Kann ich Kataloge mit Kollegen teilen?**
Ja! Nutzen Sie **System Sets**:
1. Erstellen Sie ein System Set
2. Exportieren Sie es
3. Kollegen können es importieren

**Wie setze ich Kataloge auf Standard zurück?**
Kontaktieren Sie Ihren Administrator. Es gibt ein Admin-Tool zum Zurücksetzen.

### Export

**Excel-Export funktioniert nicht - was tun?**
- Prüfen Sie, ob Ihr Browser Downloads erlaubt
- Versuchen Sie einen anderen Browser
- Prüfen Sie die Browser-Konsole auf Fehler (F12)

**Kann ich das Excel-Format anpassen?**
Das Standard-Format ist festgelegt. Sie können die heruntergeladene Datei aber in Excel weiter anpassen.

### System Sets

**Was ist der Unterschied zwischen "Modul löschen" und "System Set wechseln"?**
- **Modul löschen**: Entfernt nur ein einzelnes Modul aus dem Katalog
- **System Set wechseln**: Ersetzt ALLE Kataloge mit dem gespeicherten Stand

**Werden meine Projekte gelöscht, wenn ich das System Set wechsle?**
Nein! Projekte sind unabhängig von System Sets. Nur die Kataloge (verfügbare Module, Leitungen, etc.) werden geändert.

---

## 🆘 Hilfe benötigt?

### Support kontaktieren

**Bei technischen Problemen:**
- Wenden Sie sich an Ihren IT-Support
- Oder an: support@rootsenergy.com

**Bei Fragen zur Anwendung:**
- Nutzen Sie die Suchfunktion in diesem Handbuch
- Fragen Sie einen erfahrenen Kollegen
- Kontaktieren Sie den Anwendungs-Administrator

### Fehler melden

Wenn Sie einen Fehler entdecken:

1. Notieren Sie, was Sie getan haben
2. Machen Sie einen Screenshot (falls möglich)
3. Öffnen Sie die Browser-Konsole (F12) und kopieren Sie eventuelle Fehlermeldungen
4. Senden Sie diese Informationen an den Support

### Verbesserungsvorschläge

Haben Sie Ideen zur Verbesserung? Wir freuen uns über Feedback!

Senden Sie Ihre Vorschläge an: feedback@rootsenergy.com

---

## 📖 Version & Updates

**Aktuelle Version**: 2.0

**Änderungshistorie:**
- v2.0: Pumpenanalyse, Sole-Verwaltung, System Sets Export/Import
- v1.5: Formeln, erweiterte Kataloge
- v1.0: Erste Version mit Konfigurator und Stückliste

---

**© 2024 Roots Energy | Alle Rechte vorbehalten**

*Dieses Handbuch wurde erstellt für Version 2.0 des Roots-Systemaners. Änderungen vorbehalten.*
