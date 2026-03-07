# Test-Report: Phase 4.1 - Manuelle Tests
**Datum:** _________________
**Tester:** _________________
**System Version:** 1.0.0
**Branch:** main

---

## ✅ Automatische Fixes Implementiert

Die folgenden kritischen Issues wurden bereits behoben:

### 1. JWT_SECRET Sicherheit ✅
- **Status:** FIXED
- **Datei:** `backend/.env`
- **Änderung:** Sicherer JWT_SECRET generiert (64-Byte Hex)
- **Validierung:** `backend/src/middleware/auth.js` prüft jetzt Secret und warnt/stoppt bei unsicherem Wert
- **Production:** Server weigert sich zu starten ohne sicheren Secret

### 2. Rate-Limiting ✅
- **Status:** FIXED
- **Package:** `express-rate-limit` installiert
- **Konfiguration:**
  - Allgemeines Limit: 100 Requests / 15 Minuten
  - Auth-Limit: 10 Versuche / 15 Minuten
- **Dateien:** `backend/src/server.js`, `backend/.env`
- **Test:** Versuche 11x Login → Sollte "Too many authentication attempts" zurückgeben

### 3. GET /api/auth/me Endpoint ✅
- **Status:** FIXED
- **Datei:** `backend/src/routes/auth.js`
- **Funktionalität:** Vollständig implementiert mit `authenticateToken` Middleware
- **Response:** Gibt User-Daten zurück (id, email, name, role, created_at)
- **Test:** `curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3001/api/auth/me`

### 4. Dimensions Backend-Endpoints ✅
- **Status:** FIXED
- **Datei:** `backend/src/routes/catalogs.js`
- **Neue Endpoints:**
  - `POST /api/catalogs/dimensions` - Dimension erstellen
  - `PUT /api/catalogs/dimensions/:id` - Dimension aktualisieren
  - `DELETE /api/catalogs/dimensions/:id` - Dimension löschen
- **Hinweis:** Frontend muss noch angepasst werden, um diese Endpoints zu nutzen

---

## ⚠️ Bekannte Issues (noch nicht behoben)

### 5. Modultypen Frontend nutzt Backend nicht
- **Status:** OPEN (Niedrige Priorität)
- **Problem:**
  - Backend-Endpoints existieren bereits (`POST /api/catalogs/module-types`)
  - Frontend (`src/components/Modultypen/Modultypen.jsx`) nutzt nur lokalen State
  - Bei Reload gehen Änderungen verloren
- **Lösung:** Frontend anpassen, um Backend-API zu verwenden
- **Impact:** Medium - Modultypen müssen nach jedem Reload neu angelegt werden

### 6. Dimensionen Frontend nutzt Backend nicht
- **Status:** OPEN (Niedrige Priorität)
- **Problem:**
  - Backend-Endpoints jetzt verfügbar
  - Frontend (`src/components/Dimensionen/Dimensionen.jsx`) nutzt nur lokalen State
- **Lösung:** Frontend anpassen, um neue Backend-Endpoints zu verwenden
- **Impact:** Medium - Dimensionen gehen bei Reload verloren

### 7. Keine Projekt-Ownership Checks
- **Status:** OPEN (Design-Entscheidung)
- **Problem:**
  - Jeder User kann alle Projekte sehen, bearbeiten und löschen
  - Keine Prüfung ob `req.user.id === project.user_id`
- **Design-Frage:**
  - Ist das gewollt? (Team-Kollaboration)
  - Oder sollen User nur eigene Projekte ändern/löschen?
- **Impact:** Medium - Abhängig von Use-Case

### 8. Race Conditions bei paralleler Bearbeitung
- **Status:** OPEN (Bekannte Einschränkung)
- **Problem:**
  - Wenn 2 User gleiches Projekt öffnen und speichern
  - Last-Write-Wins, keine Merge-Logik
  - User A's Änderungen können von User B überschrieben werden
- **Lösung:** Optimistic Locking oder Konflikte-Erkennung
- **Impact:** Medium - In Multi-User Umgebung

### 9. Token nicht invalidierbar bei Logout
- **Status:** OPEN (Architektur-Limitation)
- **Problem:**
  - JWT Token bleibt bis Expiry (7 Tage) gültig
  - Bei Logout wird nur localStorage geleert
  - Gestohlener Token kann weiter verwendet werden
- **Lösung:** Token-Blacklist in Redis/Database
- **Impact:** Low-Medium - Security-Risiko bei Token-Diebstahl

### 10. Keine Katalog-Rechte
- **Status:** OPEN (Design-Entscheidung)
- **Problem:**
  - Jeder authentifizierte User kann Kataloge ändern
  - Keine Admin-Prüfung für POST/PUT/DELETE Endpoints
- **Lösung:** `requireAdmin` Middleware zu Katalog-Mutations hinzufügen
- **Impact:** Medium - Normale User können globale Daten ändern

---

## 📋 Manuelle Test-Checkliste

Bitte folgende Tests manuell durchführen und Ergebnisse dokumentieren:

### 1️⃣ USER REGISTRATION

#### Test 1.1: Erfolgreiche Registrierung
- [ ] Öffne http://localhost:5173/register
- [ ] Fülle aus: Name, Email, Passwort (min. 6 Zeichen)
- [ ] Klicke "Registrieren"
- **Erwartet:** ✅ Redirect zu Dashboard, Token in localStorage
- **Ergebnis:** _________________
- **Status:** ☐ PASS  ☐ FAIL

#### Test 1.2: Duplikate Email
- [ ] Registriere mit bereits existierender Email
- **Erwartet:** ❌ Error "User with this email already exists", Status 409
- **Ergebnis:** _________________
- **Status:** ☐ PASS  ☐ FAIL

#### Test 1.3: Ungültige Eingaben
- [ ] Leeres Email → HTML5 verhindert Submit
- [ ] Ungültige Email (`test@`) → Frontend-Validierung oder 400
- [ ] Passwort < 6 Zeichen → Error-Message
- **Ergebnis:** _________________
- **Status:** ☐ PASS  ☐ FAIL

---

### 2️⃣ LOGIN & LOGOUT

#### Test 2.1: Erfolgreicher Login
- [ ] Öffne http://localhost:5173/login
- [ ] Email + Passwort eingeben
- [ ] Klicke "Anmelden"
- **Erwartet:** ✅ Redirect zu Dashboard, Token in localStorage
- **Ergebnis:** _________________
- **Status:** ☐ PASS  ☐ FAIL

#### Test 2.2: Falsches Passwort
- [ ] Login mit falschem Passwort
- **Erwartet:** ❌ Error "Invalid email or password", Status 401
- **Ergebnis:** _________________
- **Status:** ☐ PASS  ☐ FAIL

#### Test 2.3: Rate-Limiting Test (NEU!)
- [ ] Versuche 11x hintereinander Login (mit falschem Passwort)
- **Erwartet:** ❌ Ab Versuch 11: "Too many authentication attempts", Status 429
- **Ergebnis:** _________________
- **Status:** ☐ PASS  ☐ FAIL

#### Test 2.4: Logout
- [ ] Eingeloggt, klicke Logout
- **Erwartet:** ✅ localStorage geleert, Redirect zu /login
- **Ergebnis:** _________________
- **Status:** ☐ PASS  ☐ FAIL

---

### 3️⃣ PROTECTED ROUTES

#### Test 3.1: Unauthentifizierter Zugriff
- [ ] Logout, navigiere direkt zu `/dashboard`
- **Erwartet:** ❌ Redirect zu /login
- **Ergebnis:** _________________
- **Status:** ☐ PASS  ☐ FAIL

#### Test 3.2: GET /api/auth/me Test (NEU!)
- [ ] Eingeloggt, öffne DevTools Console
- [ ] `fetch('/api/auth/me', {headers: {'Authorization': 'Bearer ' + localStorage.getItem('auth_token')}}).then(r => r.json()).then(console.log)`
- **Erwartet:** ✅ User-Objekt mit {id, email, name, role, created_at}
- **Ergebnis:** _________________
- **Status:** ☐ PASS  ☐ FAIL

---

### 4️⃣ PROJEKT ERSTELLEN

#### Test 4.1: Neues Projekt erstellen
- [ ] Dashboard → "Neues Projekt"
- [ ] Name: `Test Projekt 1`, Beschreibung optional
- [ ] Klicke "Erstellen"
- **Erwartet:** ✅ Projekt erstellt, Redirect zu Konfigurator
- **Ergebnis:** _________________
- **Status:** ☐ PASS  ☐ FAIL

#### Test 4.2: Projekt ohne Namen
- [ ] "Neues Projekt" → Leerer Name
- **Erwartet:** ❌ HTML5 Validierung verhindert Submit
- **Ergebnis:** _________________
- **Status:** ☐ PASS  ☐ FAIL

---

### 5️⃣ PROJEKT LADEN

#### Test 5.1: Existierendes Projekt laden
- [ ] Dashboard → Klicke "Öffnen" auf Projekt
- **Erwartet:** ✅ Konfigurator lädt, Projekt-Name im Header
- **Ergebnis:** _________________
- **Status:** ☐ PASS  ☐ FAIL

#### Test 5.2: Nicht-existierendes Projekt
- [ ] Navigiere zu `/configurator/99999`
- **Erwartet:** ❌ Backend 404, Error-Anzeige
- **Ergebnis:** _________________
- **Status:** ☐ PASS  ☐ FAIL

---

### 6️⃣ PROJEKT SPEICHERN & AUTO-SAVE

#### Test 6.1: Manuelles Speichern
- [ ] Projekt öffnen, Building hinzufügen
- [ ] Klicke "💾 Speichern"
- **Erwartet:** ✅ Alert "Projekt erfolgreich gespeichert", Timestamp aktualisiert
- **Ergebnis:** _________________
- **Status:** ☐ PASS  ☐ FAIL

#### Test 6.2: Auto-Save (30s)
- [ ] Projekt öffnen, Modul hinzufügen
- [ ] Warte 30 Sekunden (NICHT manuell speichern)
- [ ] Prüfe Network Tab
- **Erwartet:** ✅ PUT /api/projects/:id automatisch nach 30s
- **Ergebnis:** _________________
- **Status:** ☐ PASS  ☐ FAIL

---

### 7️⃣ PROJEKT LÖSCHEN

#### Test 7.1: Projekt löschen
- [ ] Dashboard → 🗑️ auf Projekt
- [ ] Bestätige Dialog
- **Erwartet:** ✅ Projekt verschwindet aus Liste
- **Ergebnis:** _________________
- **Status:** ☐ PASS  ☐ FAIL

#### Test 7.2: Löschen abbrechen
- [ ] 🗑️ klicken → "Abbrechen"
- **Erwartet:** ❌ Kein API-Call, Projekt bleibt
- **Ergebnis:** _________________
- **Status:** ☐ PASS  ☐ FAIL

---

### 8️⃣ PROJEKT DUPLIZIEREN

#### Test 8.1: Projekt duplizieren
- [ ] Dashboard → 📋 auf Projekt
- **Erwartet:** ✅ Neues Projekt mit " (Kopie)" im Namen
- **Ergebnis:** _________________
- **Status:** ☐ PASS  ☐ FAIL

---

### 9️⃣ MULTI-USER SZENARIEN

#### Test 9.1: Zwei User parallel
- [ ] Browser 1: Login als User A
- [ ] Browser 2 (Incognito): Login als User B
- [ ] User A erstellt Projekt → User B sieht es im Dashboard (nach Reload)
- **Erwartet:** ✅ Beide sehen alle Projekte
- **Ergebnis:** _________________
- **Status:** ☐ PASS  ☐ FAIL

#### Test 9.2: Parallele Bearbeitung (Race Condition)
- [ ] User A + User B öffnen gleiches Projekt
- [ ] User A fügt Modul hinzu → Speichert
- [ ] User B fügt anderes Modul hinzu → Speichert
- [ ] User A lädt Seite neu
- **Erwartet:** ⚠️ Last-Write-Wins: Nur Modul von User B vorhanden
- **Ergebnis:** _________________
- **Status:** ☐ PASS  ☐ FAIL  (EXPECTED LIMITATION)

---

### 🔟 KATALOG-ÄNDERUNGEN

#### Test 10.1: Modul zur Datenbank hinzufügen
- [ ] "Modul-Datenbank" → "Neues Modul"
- [ ] Fülle aus: Name, Modultyp, Hersteller, etc.
- [ ] Speichern
- **Erwartet:** ✅ Backend POST /api/catalogs/modules, Status 201
- **Ergebnis:** _________________
- **Status:** ☐ PASS  ☐ FAIL

#### Test 10.2: Verbindungsart hinzufügen
- [ ] "Verbindungen" → Neue Verbindung
- [ ] Name, Kürzel (max. 6 Zeichen), Typ
- [ ] Speichern
- **Erwartet:** ✅ Backend POST /api/catalogs/connections
- **Ergebnis:** _________________
- **Status:** ☐ PASS  ☐ FAIL

#### Test 10.3: Leitung hinzufügen
- [ ] "Leitungen" → Neue Leitung
- [ ] Verbindungsart, Material, Dimension, Preis
- **Erwartet:** ✅ Backend POST /api/catalogs/pipes
- **Ergebnis:** _________________
- **Status:** ☐ PASS  ☐ FAIL

#### Test 10.4: Modultyp hinzufügen ⚠️
- [ ] "Modultypen" → Neuer Typ
- [ ] Reload Seite (Strg+R)
- **Erwartet:** ⚠️ Modultyp ist weg (nur React State, nicht persistiert)
- **Ergebnis:** _________________
- **Status:** ☐ PASS  ☐ FAIL  (EXPECTED - KNOWN ISSUE #5)

#### Test 10.5: Dimension hinzufügen ⚠️
- [ ] "Dimensionen" → Neue Dimension
- [ ] Reload Seite
- **Erwartet:** ⚠️ Dimension ist weg (nur React State, nicht persistiert)
- **Ergebnis:** _________________
- **Status:** ☐ PASS  ☐ FAIL  (EXPECTED - KNOWN ISSUE #6)

---

### 1️⃣1️⃣ ADMIN-FUNKTIONEN

**Voraussetzung:** Admin-User in Datenbank (role='admin')

```sql
-- Admin-User erstellen (falls nötig)
UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';
```

#### Test 11.1: Admin Dashboard Zugriff
- [ ] Login als Admin
- [ ] Dashboard → "Admin" Button sichtbar?
- [ ] Navigiere zu `/admin`
- **Erwartet:** ✅ Admin Dashboard lädt, User-Liste sichtbar
- **Ergebnis:** _________________
- **Status:** ☐ PASS  ☐ FAIL

#### Test 11.2: Non-Admin Zugriff
- [ ] Login als normaler User
- [ ] Versuche zu navigieren: `/admin`
- **Erwartet:** ❌ Backend 403 Forbidden (requireAdmin Middleware)
- **Ergebnis:** _________________
- **Status:** ☐ PASS  ☐ FAIL

#### Test 11.3: User-Rolle ändern
- [ ] Als Admin, User auswählen
- [ ] Rolle ändern: `user` → `admin`
- **Erwartet:** ✅ Backend PUT /api/admin/users/:id/role, Status 200
- **Ergebnis:** _________________
- **Status:** ☐ PASS  ☐ FAIL

#### Test 11.4: User löschen
- [ ] User auswählen (NICHT eigener Account)
- [ ] Löschen
- **Erwartet:** ✅ Backend DELETE /api/admin/users/:id, User verschwindet
- **Ergebnis:** _________________
- **Status:** ☐ PASS  ☐ FAIL

#### Test 11.5: Selbst-Löschung verhindern
- [ ] Als Admin, versuche eigenen Account zu löschen
- **Erwartet:** ❌ Error "Cannot delete your own account"
- **Ergebnis:** _________________
- **Status:** ☐ PASS  ☐ FAIL

#### Test 11.6: Kataloge zurücksetzen
- [ ] Admin → Database Tools → "Kataloge zurücksetzen"
- **Erwartet:** ✅ Backend DELETE /api/admin/database/clear-catalogs
- **Ergebnis:** _________________
- **Status:** ☐ PASS  ☐ FAIL
- **⚠️ ACHTUNG:** Unwiderruflich! Nur in Test-Umgebung!

#### Test 11.7: Default-Daten initialisieren
- [ ] Nach Test 11.6: "Defaults initialisieren"
- **Erwartet:** ✅ Standard-Katalogdaten wieder vorhanden
- **Ergebnis:** _________________
- **Status:** ☐ PASS  ☐ FAIL

---

### 🔒 SECURITY TESTS

#### S1: XSS in Projekt-Namen
- [ ] Erstelle Projekt mit Namen: `<script>alert('XSS')</script>`
- **Erwartet:** ✅ Kein Alert, React escaped automatisch
- **Ergebnis:** _________________
- **Status:** ☐ PASS  ☐ FAIL

#### S2: SQL-Injection
- [ ] Projekt-Name: `'; DROP TABLE projects; --`
- **Erwartet:** ✅ Backend verwendet Parameterized Queries, keine Injection
- **Ergebnis:** _________________
- **Status:** ☐ PASS  ☐ FAIL

#### S3: Sehr lange Eingaben
- [ ] Projekt-Name: 10.000 Zeichen
- **Erwartet:** ⚠️ Backend sollte validieren (max. Länge)
- **Ergebnis:** _________________
- **Status:** ☐ PASS  ☐ FAIL

---

## 📊 Test-Zusammenfassung

### Statistiken
- **Gesamt-Tests:** ___ / ___
- **Erfolgreich (PASS):** ___
- **Fehlgeschlagen (FAIL):** ___
- **Bekannte Einschränkungen:** 4 (Issues #5, #6, #7, #8)
- **Kritische Fehler:** ___

### Kritische Fehler (BLOCKER)
Bitte hier alle Tests auflisten, die FAILED sind und das System unbenutzbar machen:

1. _________________
2. _________________

### Medium Issues (WICHTIG)
Fehler die behoben werden sollten, aber System ist nutzbar:

1. _________________
2. _________________

### Low Priority Issues
Kleinere Probleme, können später behoben werden:

1. _________________
2. _________________

---

## 🔄 Nächste Schritte

Nach Durchführung aller Tests:

1. **Kritische Issues fixen** (BLOCKER)
2. **Frontend anpassen** (Issue #5 + #6: Modultypen/Dimensionen Backend nutzen)
3. **Design-Entscheidungen treffen** (Issue #7: Projekt-Ownership?)
4. **Security-Audit** (Issue #9: Token-Blacklist?)
5. **Dokumentation updaten** (basierend auf Test-Ergebnissen)
6. **Staging-Deployment** (Hetzner Server)
7. **Production-Readiness** (SSL, Backups, Monitoring)

---

## 📝 Notizen & Bemerkungen

_________________
_________________
_________________

---

**Report erstellt am:** _________________
**Unterschrift Tester:** _________________
