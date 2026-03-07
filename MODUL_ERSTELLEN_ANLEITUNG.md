# Anleitung: Module in der Moduldatenbank erstellen

## Problem gelöst ✅

Das Problem "Internal server error" beim Erstellen von Modulen wurde behoben.

### Was war das Problem?

Das `modultyp` Feld in der Modultabelle ist mit der `catalog_module_types` Tabelle verknüpft (Foreign Key). Wenn Sie ein Modul mit einem Modultyp erstellen, der noch nicht existiert, schlägt die Speicherung fehl.

### Was wurde geändert?

1. **Bessere Fehlermeldungen**: Statt "Internal server error" erhalten Sie jetzt eine klare Meldung:
   ```
   "Invalid modultyp. The module type does not exist in catalog_module_types.
    Please create the module type first."
   ```

2. **Leere Werte erlaubt**: Wenn Sie das Modultyp-Feld leer lassen, wird das Modul jetzt ohne Modultyp gespeichert (NULL).

3. **Automatische Bereinigung**: Leere Strings und undefined-Werte werden automatisch zu NULL konvertiert.

---

## Wie erstelle ich ein Modul? (2 Wege)

### ✅ Weg 1: Modul OHNE Modultyp erstellen (empfohlen für Tests)

1. Öffnen Sie die **Modul-Datenbank**
2. Klicken Sie **"Neues Modul"**
3. Füllen Sie aus:
   - **Name**: Pflichtfeld, z.B. "NIBE F2120-16"
   - **Modultyp**: **LEER LASSEN** oder "Keine Angabe"
   - **Hersteller**: Optional, z.B. "NIBE"
   - **Abmessungen**: Optional, z.B. "600x600x2300"
   - **Gewicht**: Optional, z.B. "195" (kg)
   - **Leistung**: Optional, z.B. "16" (kW)
   - **Volumen**: Optional, z.B. "50" (Liter)
   - **Preis**: Optional, z.B. "12500.00"
4. Klicken Sie **"Speichern"**
5. ✅ Modul wird erfolgreich erstellt (ohne Modultyp)

### ✅ Weg 2: Modultyp zuerst erstellen, dann Modul

#### Schritt 1: Modultyp erstellen

1. Öffnen Sie **"Modultypen"** im Menü
2. Geben Sie einen **Namen** ein, z.B. "Wärmepumpe"
3. Wählen Sie **Berechnungsart**:
   - "Pro Stück" (für zählbare Module)
   - "Pro Einheit" (für messbare Dinge wie Rohre)
4. Falls "Pro Einheit": Einheit angeben, z.B. "m²", "m", "kg"
5. Klicken Sie **"+ Hinzufügen"**
6. ⚠️ **WICHTIG**: Seite NICHT neu laden! (Modultypen werden noch nicht im Backend gespeichert - siehe Known Issue #5)

#### Schritt 2: Modul mit Modultyp erstellen

1. Öffnen Sie **"Modul-Datenbank"**
2. Klicken Sie **"Neues Modul"**
3. Wählen Sie im **Modultyp-Dropdown** den gerade erstellten Typ (z.B. "Wärmepumpe")
4. Füllen Sie die restlichen Felder aus
5. Klicken Sie **"Speichern"**
6. ✅ Modul wird mit Modultyp gespeichert

---

## Verfügbare Standard-Modultypen

Nach der Initialisierung sind folgende Modultypen verfügbar:

- **Wärmepumpe** (Erzeugung)
- **Rückkühler** (Erzeugung)
- **Speicher** (Speicherung)
- **Verteiler** (Verteilung)
- **Erdwärmekollektor** (Quellsystem, pro m²)
- **Erdsonde** (Quellsystem, pro m)
- **Rohrleitung** (Installation, pro m)

### Modultypen prüfen/initialisieren

Wenn keine Modultypen vorhanden sind:

1. Login als **Admin**
2. Navigieren zu **Admin-Panel** (`/admin`)
3. Unter **Database Tools**:
   - Klicken Sie **"Initialize Defaults"**
   - ✅ Standard-Modultypen werden erstellt

---

## ⚠️ Bekannte Einschränkungen

### Problem: Modultypen gehen bei Reload verloren

**Status**: OPEN (Issue #5 aus PHASE_4_1_CHANGES.md)

**Symptom**:
- Sie erstellen einen neuen Modultyp in "Modultypen"
- Nach Seiten-Reload (F5) ist der Modultyp weg

**Ursache**:
- Das Frontend speichert Modultypen nur im React State (lokaler Speicher)
- Die Backend-Endpoints existieren bereits, werden aber nicht genutzt

**Workaround**:
1. **Option A**: Verwenden Sie nur die vorhandenen Standard-Modultypen
2. **Option B**: Erstellen Sie Module OHNE Modultyp (Feld leer lassen)
3. **Option C**: Erstellen Sie Modultypen UND Module in einer Session (ohne Reload)

**Permanente Lösung** (noch nicht implementiert):
- Frontend muss angepasst werden, um Backend-API zu nutzen
- Siehe `PHASE_4_1_CHANGES.md` Issue #5 für Details

---

## Fehlerbehebung

### Fehler: "Invalid modultyp"

**Ursache**: Der eingegebene Modultyp existiert nicht in der Datenbank.

**Lösung**:
1. Prüfen Sie, welche Modultypen verfügbar sind (siehe "Verfügbare Standard-Modultypen")
2. Erstellen Sie den Modultyp zuerst (siehe "Weg 2")
3. Oder: Lassen Sie das Modultyp-Feld leer

### Fehler: "Module with this name already exists"

**Ursache**: Ein Modul mit diesem Namen existiert bereits.

**Lösung**:
- Verwenden Sie einen anderen Namen
- Oder: Bearbeiten Sie das existierende Modul statt ein neues zu erstellen

### Fehler: "Name is required"

**Ursache**: Das Name-Feld ist leer.

**Lösung**:
- Geben Sie einen eindeutigen Namen ein

### Backend gibt immer noch "Internal server error"

**Lösung**:
1. Starten Sie den Backend-Server neu:
   ```bash
   cd backend
   npm start
   ```
2. Prüfen Sie die Browser-Console (F12 → Console) für detaillierte Fehler
3. Prüfen Sie die Backend-Console für Stack-Traces

---

## Beispiel: Vollständiges Modul erstellen

### Beispiel 1: Wärmepumpe NIBE F2120-16

```
Name: NIBE F2120-16
Modultyp: Wärmepumpe (oder leer lassen)
Hersteller: NIBE
Abmessungen: 600x600x2300
Gewicht: 195 kg
Leistung: 16 kW
Volumen: 50 L
Preis: 12500.00

Eingänge:
- Name: Vorlauf Quelle
  Verbindungsart: Flansch DN32
  Dimension: DN32
  Typ: Hydraulisch

- Name: Rücklauf Quelle
  Verbindungsart: Flansch DN32
  Dimension: DN32
  Typ: Hydraulisch

Ausgänge:
- Name: Vorlauf Heizkreis
  Verbindungsart: Flansch DN32
  Dimension: DN32
  Typ: Hydraulisch

- Name: Rücklauf Heizkreis
  Verbindungsart: Flansch DN32
  Dimension: DN32
  Typ: Hydraulisch

- Name: Stromversorgung
  Verbindungsart: 400V
  Dimension: 5x2.5mm²
  Typ: Elektrisch
```

### Beispiel 2: Pufferspeicher (ohne Modultyp)

```
Name: WOLF SPW-500L
Modultyp: (leer lassen)
Hersteller: WOLF
Abmessungen: Ø750x1900
Gewicht: 120 kg
Leistung: (leer)
Volumen: 500 L
Preis: 2800.00

Eingänge:
- Name: Oben Eingang
  Verbindungsart: Flansch DN40
  Dimension: DN40
  Typ: Hydraulisch

Ausgänge:
- Name: Oben Ausgang
  Verbindungsart: Flansch DN40
  Dimension: DN40
  Typ: Hydraulisch
```

---

## Technische Details

### Datenbank-Schema

```sql
CREATE TABLE catalog_modules (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  modultyp VARCHAR(255) REFERENCES catalog_module_types(name), -- Foreign Key!
  hersteller VARCHAR(255),
  abmessungen VARCHAR(255),
  gewicht_kg DECIMAL(10,2),
  leistung_kw DECIMAL(10,2),
  volumen_l DECIMAL(10,2),
  preis DECIMAL(10,2),
  eingaenge JSONB DEFAULT '[]',
  ausgaenge JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Wichtig**:
- `modultyp` ist ein Foreign Key → Muss in `catalog_module_types.name` existieren ODER NULL sein
- `name` ist UNIQUE → Doppelte Namen sind nicht erlaubt
- Alle anderen Felder sind optional (können NULL sein)

### API-Endpoint

```javascript
POST /api/catalogs/modules

// Request Body:
{
  "name": "NIBE F2120-16",              // Required
  "modultyp": "Wärmepumpe",             // Optional (NULL wenn leer/fehlt)
  "hersteller": "NIBE",                 // Optional
  "abmessungen": "600x600x2300",        // Optional
  "gewicht_kg": 195,                    // Optional (Number oder NULL)
  "leistung_kw": 16,                    // Optional (Number oder NULL)
  "volumen_l": 50,                      // Optional (Number oder NULL)
  "preis": 12500.00,                    // Optional (Number oder NULL)
  "eingaenge": [...],                   // Array (default: [])
  "ausgaenge": [...]                    // Array (default: [])
}

// Success Response (201):
{
  "message": "Module created",
  "module": { id: 1, name: "...", ... }
}

// Error Response (400):
{
  "error": "Invalid modultyp. The module type does not exist in catalog_module_types. Please create the module type first."
}

// Error Response (409):
{
  "error": "Module with this name already exists"
}
```

---

## Support

Bei weiteren Problemen:
1. Prüfen Sie `TEST_REPORT.md` für erwartetes Verhalten
2. Prüfen Sie Browser DevTools (F12 → Console + Network Tab)
3. Prüfen Sie Backend-Console für Fehler-Details
4. Siehe `PHASE_4_1_CHANGES.md` für bekannte Issues

**Fixes implementiert in**: backend/src/routes/catalogs.js (POST + PUT /api/catalogs/modules)
**Datum**: 2026-03-07
