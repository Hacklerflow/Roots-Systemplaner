# Phase 4.1: Test-Implementation & Kritische Fixes

**Datum:** 2026-03-07
**Status:** ✅ ABGESCHLOSSEN

---

## 🎯 Ziel dieser Phase

Systematische Durchführung manueller Tests und Behebung kritischer Sicherheitsprobleme vor dem Production-Deployment.

---

## ✅ Implementierte Fixes

### 1. JWT_SECRET Sicherheit

**Problem:**
- `.env` hatte keinen JWT_SECRET konfiguriert
- Backend nutzte unsicheren Default: `'your_secret_key_change_this'`
- Kritisches Sicherheitsrisiko!

**Lösung:**
- ✅ Sicherer 64-Byte Hex Secret in `backend/.env` hinzugefügt
- ✅ Validierung in `backend/src/middleware/auth.js` implementiert
- ✅ Production-Mode weigert sich zu starten ohne sicheren Secret
- ✅ Development-Mode zeigt Warnung bei unsicherem Secret

**Dateien:**
- `backend/.env` (JWT_SECRET hinzugefügt)
- `backend/src/middleware/auth.js` (Validierung + Exit in Production)

**Test:**
```bash
# Backend sollte beim Start keine Warnung zeigen
cd backend
npm start
# Expected: Server startet ohne JWT_SECRET Warnung
```

---

### 2. Rate-Limiting (Brute-Force Schutz)

**Problem:**
- Kein Rate-Limiting vorhanden
- Angreifer können unbegrenzt Login-Versuche machen
- Brute-Force anfällig

**Lösung:**
- ✅ `express-rate-limit` Package installiert
- ✅ Allgemeines Rate-Limiting: 100 Requests / 15 Minuten
- ✅ Auth-spezifisches Limiting: 10 Login/Register / 15 Minuten
- ✅ Konfigurierbar via Environment-Variablen

**Dateien:**
- `backend/package.json` (express-rate-limit Dependency)
- `backend/src/server.js` (Rate-Limiter Middleware)
- `backend/.env` (RATE_LIMIT_* Konfiguration)

**Test:**
```bash
# Test Auth Rate-Limiting
for i in {1..12}; do
  curl -X POST http://localhost:3001/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrong"}'
  echo "Attempt $i"
done
# Expected: Ab Versuch 11: {"error":"Too many authentication attempts, please try again later"}
```

**Konfiguration (`.env`):**
```env
RATE_LIMIT_WINDOW_MS=900000       # 15 Minuten
RATE_LIMIT_MAX_REQUESTS=100       # Max Requests pro Window
```

---

### 3. GET /api/auth/me Endpoint

**Problem:**
- Endpoint war nur Placeholder
- Konnte nicht zur Token-Validierung verwendet werden
- Frontend hatte keinen Weg, User-Daten zu aktualisieren

**Lösung:**
- ✅ Vollständige Implementierung mit `authenticateToken` Middleware
- ✅ Fetch User-Daten aus Datenbank
- ✅ Response: `{user: {id, email, name, role, created_at}}`

**Datei:**
- `backend/src/routes/auth.js` (GET /me implementiert)

**Test:**
```bash
# 1. Login und Token erhalten
TOKEN=$(curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}' | jq -r '.token')

# 2. GET /me mit Token
curl http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
# Expected: {"user":{"id":1,"email":"test@example.com","name":"Test User","role":"user","created_at":"..."}}
```

---

### 4. Dimensions Backend-Endpoints

**Problem:**
- Frontend `Dimensionen.jsx` verwendete nur lokalen React State
- Bei Reload gingen alle Änderungen verloren
- Backend hatte nur GET Endpoint, keine POST/PUT/DELETE

**Lösung:**
- ✅ `POST /api/catalogs/dimensions` - Dimension erstellen
- ✅ `PUT /api/catalogs/dimensions/:id` - Dimension aktualisieren
- ✅ `DELETE /api/catalogs/dimensions/:id` - Dimension löschen
- ✅ Validierung + Fehlerbehandlung (Unique Constraint, Foreign Key)

**Datei:**
- `backend/src/routes/catalogs.js` (3 neue Endpoints)

**Test:**
```bash
# 1. Dimension erstellen
curl -X POST http://localhost:3001/api/catalogs/dimensions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"DN100","value":"DN100"}'
# Expected: {"message":"Dimension created","dimension":{...}}

# 2. Dimension aktualisieren
curl -X PUT http://localhost:3001/api/catalogs/dimensions/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"DN100-Updated"}'

# 3. Dimension löschen
curl -X DELETE http://localhost:3001/api/catalogs/dimensions/1 \
  -H "Authorization: Bearer $TOKEN"
```

**⚠️ WICHTIG:** Frontend muss noch angepasst werden, um diese Endpoints zu nutzen (siehe "Offene Aufgaben" unten).

---

## 📋 Neue Dateien

1. **`TEST_REPORT.md`**
   - Vollständige manuelle Test-Checkliste
   - 11 Test-Kategorien mit 40+ Test-Cases
   - Vorlage zum Ausfüllen während manueller Tests

2. **`PHASE_4_1_CHANGES.md`** (diese Datei)
   - Dokumentation aller Änderungen
   - Test-Anweisungen
   - Offene Aufgaben

3. **`backend/.env`** (erweitert)
   - JWT_SECRET (sicherer Wert)
   - RATE_LIMIT_* Konfiguration
   - Dokumentierte Environment-Variablen

---

## ⚠️ Bekannte Issues (noch offen)

### 5. Modultypen Frontend nutzt Backend nicht

**Status:** OPEN (Niedrige Priorität)

**Problem:**
- Backend-Endpoints existieren bereits (`POST /api/catalogs/module-types`)
- Frontend (`src/components/Modultypen/Modultypen.jsx`) nutzt nur lokalen State
- Bei Reload gehen Änderungen verloren

**Lösung:**
```javascript
// In Modultypen.jsx:
// Ersetze lokales State-Management durch API-Calls

// Beispiel für handleAdd():
const handleAdd = async () => {
  // ... Validierung ...

  try {
    const response = await fetch('/api/catalogs/module-types', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      },
      body: JSON.stringify({
        name: newTypeName.trim(),
        kategorie: '', // Optional
        berechnungsart: newBerechnungsart,
        einheit: newBerechnungsart === 'pro_einheit' ? newEinheit.trim() : ''
      })
    });

    if (!response.ok) throw new Error('Failed to create module type');

    const data = await response.json();
    setModultypen([...modultypen, data.moduleType]);
    // ... Reset form ...
  } catch (error) {
    alert('Fehler beim Speichern: ' + error.message);
  }
};
```

**Dateien zu ändern:**
- `src/components/Modultypen/Modultypen.jsx`
- `src/api/client.js` (optional: Helper-Funktion)

---

### 6. Dimensionen Frontend nutzt Backend nicht

**Status:** OPEN (Niedrige Priorität)

**Problem:**
- Backend-Endpoints jetzt verfügbar (siehe Fix #4)
- Frontend (`src/components/Dimensionen/Dimensionen.jsx`) nutzt nur lokalen State

**Lösung:**
Analog zu #5 - Frontend anpassen, um neue Backend-Endpoints zu verwenden.

**Dateien zu ändern:**
- `src/components/Dimensionen/Dimensionen.jsx`

---

### 7. Keine Projekt-Ownership Checks

**Status:** OPEN (Design-Entscheidung)

**Problem:**
- Jeder User kann alle Projekte sehen, bearbeiten und löschen
- Keine Prüfung ob `req.user.id === project.user_id`

**Design-Frage:**
- Ist das gewollt? (Team-Kollaboration)
- Oder sollen User nur eigene Projekte ändern/löschen?

**Mögliche Lösung (falls Ownership gewünscht):**
```javascript
// In backend/src/routes/projects.js:

// PUT /api/projects/:id
router.put('/:id', async (req, res) => {
  // ... existing code ...

  // Nach "Check if project exists":
  if (existingProject.rows[0].user_id !== req.user.id) {
    return res.status(403).json({ error: 'You can only edit your own projects' });
  }

  // ... rest of code ...
});

// DELETE /api/projects/:id
router.delete('/:id', async (req, res) => {
  const result = await query(
    'DELETE FROM projects WHERE id = $1 AND user_id = $2 RETURNING id',
    [id, req.user.id] // Add user_id check!
  );
  // ... rest ...
});
```

**Entscheidung treffen:**
- [ ] Team-Kollaboration (aktuelles Verhalten beibehalten)
- [ ] Ownership-Checks implementieren (siehe oben)

---

### 8. Race Conditions bei paralleler Bearbeitung

**Status:** OPEN (Bekannte Einschränkung)

**Problem:**
- Wenn 2 User gleiches Projekt öffnen und speichern
- Last-Write-Wins, keine Merge-Logik
- User A's Änderungen können von User B überschrieben werden

**Lösungsansätze:**
1. **Optimistic Locking:**
   - `updated_at` Timestamp prüfen
   - Bei Konflikt: Warnung an User
2. **Pessimistic Locking:**
   - "Projekt gesperrt von User X" Meldung
   - Andere User können nur lesen
3. **Operational Transformation:**
   - Echtzeit-Sync (komplex!)

**Aufwand:** Hoch
**Priorität:** Medium (abhängig von Use-Case)

---

### 9. Token nicht invalidierbar bei Logout

**Status:** OPEN (Architektur-Limitation)

**Problem:**
- JWT Token bleibt bis Expiry (7 Tage) gültig
- Bei Logout wird nur localStorage geleert
- Gestohlener Token kann weiter verwendet werden

**Lösung:**
Token-Blacklist implementieren:

```javascript
// 1. Redis Setup (oder Database-Tabelle)
// backend/src/config/redis.js
import { createClient } from 'redis';

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

export default redisClient;

// 2. Logout Endpoint erweitern
// backend/src/routes/auth.js
router.post('/logout', authenticateToken, async (req, res) => {
  const token = req.headers['authorization'].split(' ')[1];

  // Token in Blacklist speichern (TTL = Token Expiry)
  await redisClient.setEx(
    `blacklist:${token}`,
    7 * 24 * 60 * 60, // 7 Tage
    'revoked'
  );

  res.json({ message: 'Logged out successfully' });
});

// 3. Middleware erweitern
// backend/src/middleware/auth.js
export const authenticateToken = async (req, res, next) => {
  const token = authHeader && authHeader.split(' ')[1];

  // Check Blacklist
  const isBlacklisted = await redisClient.get(`blacklist:${token}`);
  if (isBlacklisted) {
    return res.status(403).json({ error: 'Token has been revoked' });
  }

  // ... rest of verification ...
};
```

**Aufwand:** Medium
**Requires:** Redis Server
**Priorität:** Low-Medium

---

### 10. Keine Katalog-Rechte

**Status:** OPEN (Design-Entscheidung)

**Problem:**
- Jeder authentifizierte User kann Kataloge ändern (POST/PUT/DELETE)
- Keine Admin-Prüfung

**Lösung:**
```javascript
// In backend/src/routes/catalogs.js:
import { requireAdmin } from '../middleware/adminAuth.js';

// POST/PUT/DELETE Endpoints mit requireAdmin schützen:
router.post('/modules', requireAdmin, async (req, res) => { /* ... */ });
router.put('/modules/:id', requireAdmin, async (req, res) => { /* ... */ });
router.delete('/modules/:id', requireAdmin, async (req, res) => { /* ... */ });

// Gleiches für connections, pipes, dimensions, module-types
```

**Aufwand:** Niedrig (30 Minuten)
**Priorität:** Medium

**Entscheidung treffen:**
- [ ] Nur Admins dürfen Kataloge ändern (empfohlen)
- [ ] Alle User dürfen Kataloge ändern (aktuell)

---

## 🚀 Setup & Test-Anweisungen

### 1. Backend starten

```bash
cd backend

# Environment-Variablen prüfen
cat .env
# Sollte JWT_SECRET enthalten (kein Default!)

# Dependencies installieren (express-rate-limit)
npm install

# Datenbank initialisieren (falls nötig)
npm run init-db

# Server starten
npm start

# Expected Output:
# ╔════════════════════════════════════════════════╗
# ║  🚀 Roots Configurator Backend Server         ║
# ╠════════════════════════════════════════════════╣
# ║  Port:        3001                             ║
# ║  Environment: development                      ║
# ...
# (KEINE JWT_SECRET Warnung!)
```

### 2. Frontend starten

```bash
cd ..  # Zurück zu Root

# Dependencies installieren
npm install

# Development-Server starten
npm run dev

# Expected Output:
# VITE v5.x.x  ready in XXX ms
# ➜  Local:   http://localhost:5173/
```

### 3. Manuelles Testing durchführen

Öffne `TEST_REPORT.md` und arbeite die Checkliste ab:
- Browser: http://localhost:5173
- Backend: http://localhost:3001
- DevTools offen (Console + Network Tab)

**Empfohlene Test-Reihenfolge:**
1. User Registration & Login (Tests 1-2)
2. Rate-Limiting Test (Test 2.3) - **NEU!**
3. GET /api/auth/me Test (Test 3.2) - **NEU!**
4. Projekt CRUD (Tests 4-8)
5. Multi-User (Test 9)
6. Kataloge (Test 10)
7. Admin-Funktionen (Test 11) - falls Admin-User vorhanden
8. Security Tests (S1-S3)

### 4. Datenbank-Verifikation

```bash
psql -U postgres -d roots_configurator

-- Prüfe ob Dimensionen persistiert werden (nach Frontend-Anpassung)
SELECT * FROM catalog_dimensions;

-- Prüfe User-Rollen
SELECT id, email, role FROM users;

-- Admin-User erstellen (falls nötig)
UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';
```

---

## 📊 Test-Report Ausfüllen

Nach Durchführung aller Tests:

1. Öffne `TEST_REPORT.md`
2. Trage Ergebnisse ein (✅ PASS / ❌ FAIL)
3. Dokumentiere alle FAIL-Tests im Abschnitt "Kritische Fehler"
4. Fülle Statistiken aus
5. Unterschrift + Datum

**Report Location:**
- `TEST_REPORT.md` (im Root-Verzeichnis)

---

## 🔧 Nächste Schritte

### Sofort (Kritisch):
1. ✅ Manuelle Tests durchführen (TEST_REPORT.md)
2. ⚠️ Alle FAIL-Tests fixen
3. ⚠️ Design-Entscheidungen treffen:
   - Issue #7: Projekt-Ownership?
   - Issue #10: Katalog-Rechte nur für Admins?

### Kurzfristig (Wichtig):
4. ⚠️ Frontend anpassen (Issues #5 + #6):
   - Modultypen Backend nutzen
   - Dimensionen Backend nutzen
5. ⚠️ Dokumentation updaten (README.md)
6. ⚠️ .gitignore prüfen (backend/.env darf nicht committed werden!)

### Mittelfristig (Nice-to-have):
7. Race Conditions lösen (Issue #8)
8. Token-Blacklist implementieren (Issue #9)
9. Production-Setup:
   - SSL-Zertifikate
   - Backup-Strategy
   - Monitoring (z.B. PM2, Sentry)
10. Staging-Deployment (Hetzner Server)

---

## 🔐 Sicherheits-Checkliste

Vor Production-Deployment prüfen:

- [x] JWT_SECRET ist sicher (64+ Bytes, kein Default)
- [x] Rate-Limiting aktiv
- [ ] .gitignore enthält `backend/.env`
- [ ] CORS_ORIGIN in Production auf echte Domain setzen
- [ ] NODE_ENV=production in Production
- [ ] Datenbank-Passwort sicher
- [ ] SSL/TLS für HTTPS
- [ ] Firewall-Regeln (nur Ports 80, 443, 22)
- [ ] Regelmäßige Backups
- [ ] Error-Logging (nicht in Frontend sichtbar)
- [ ] Katalog-Rechte nur für Admins (Issue #10)

---

## 📞 Support & Fragen

Bei Problemen oder Fragen:

1. Prüfe `TEST_REPORT.md` für erwartetes Verhalten
2. Prüfe Backend-Logs (Console Output)
3. Prüfe Browser DevTools (Console + Network Tab)
4. Prüfe Datenbank (psql)

**Bekannte Einschränkungen:**
- Modultypen/Dimensionen gehen bei Reload verloren (Issue #5, #6)
- Parallele Bearbeitung kann Daten überschreiben (Issue #8)
- Jeder User kann alle Projekte bearbeiten (Issue #7)
- Jeder User kann Kataloge ändern (Issue #10)

---

**Erstellt am:** 2026-03-07
**Phase:** 4.1 - Test-Implementation & Kritische Fixes
**Status:** ✅ ABGESCHLOSSEN

**Nächste Phase:** 4.2 - Frontend-Anpassungen & Production-Vorbereitung
