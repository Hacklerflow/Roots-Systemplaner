# "Failed to fetch" Troubleshooting Guide

## Problem: "Failed to fetch" beim Speichern/Laden

### Schritt 1: Test-Seite verwenden

Öffnen Sie die Test-Seite, um das Problem zu lokalisieren:

**Option A - Datei direkt:**
```
file:///Users/florianhackl-kohlweiss/Roots-Systemplaner/test-connection.html
```

**Option B - HTTP Server:**
```
http://localhost:8080/test-connection.html
```

Die Test-Seite führt automatisch durch:
- ✅ Health Check
- ✅ User Registrierung
- ✅ Login
- ✅ Modul erstellen

**Ergebnis interpretieren:**
- ✅ Alle grün → Problem liegt im Frontend-Code
- ❌ Erster Test rot → Backend nicht erreichbar
- ⚠️ Nur Modul-Test rot → Auth/Token Problem

---

### Schritt 2: Browser DevTools prüfen

1. **Öffnen Sie http://localhost:5173**
2. **Drücken Sie F12** (DevTools öffnen)
3. **Gehen Sie zum "Console" Tab**
4. **Versuchen Sie die Aktion** (z.B. Modul speichern)
5. **Suchen Sie nach roten Fehlern**

#### Häufige Fehler-Muster:

**A) "Failed to fetch"**
```
Failed to fetch
```
**Ursache:** Backend nicht erreichbar
**Lösung:** Prüfen Sie ob Backend läuft: `curl http://localhost:3001/health`

**B) CORS Error**
```
Access to fetch at 'http://localhost:3001/api/...' from origin 'http://localhost:5173'
has been blocked by CORS policy
```
**Ursache:** CORS-Konfiguration falsch
**Lösung:** Backend CORS_ORIGIN prüfen (sollte http://localhost:5173 sein)

**C) 401 Unauthorized**
```
POST http://localhost:3001/api/catalogs/modules 401 (Unauthorized)
```
**Ursache:** Token fehlt oder ungültig
**Lösung:** Logout + neu Login

**D) Network Error / ERR_CONNECTION_REFUSED**
```
net::ERR_CONNECTION_REFUSED
```
**Ursache:** Backend läuft nicht
**Lösung:** Backend starten: `cd backend && npm start`

**E) 500 Internal Server Error**
```
POST http://localhost:3001/api/catalogs/modules 500 (Internal Server Error)
```
**Ursache:** Backend-Fehler (z.B. DB-Verbindung)
**Lösung:** Backend-Logs prüfen: `tail -f /tmp/backend.log`

---

### Schritt 3: Network Tab prüfen

1. **DevTools → "Network" Tab**
2. **Versuchen Sie die Aktion erneut**
3. **Prüfen Sie den gescheiterten Request**

**Klicken Sie auf den fehlgeschlagenen Request:**
- **Status**: Sollte 200, 201 sein (nicht 0, 404, 500)
- **Response**: Was antwortet das Backend?
- **Headers**: Ist Authorization Header vorhanden?

**Typische Probleme:**

**Status: (failed)**
→ Request erreicht Backend nicht
→ Backend läuft nicht oder falsche URL

**Status: 0**
→ CORS Problem oder Network Error
→ Browser blockt Request

**Status: 401**
→ Token fehlt oder ungültig
→ Logout + neu einloggen

**Status: 500**
→ Backend-Fehler
→ Backend-Logs prüfen

---

### Schritt 4: API-URL prüfen

**Im Browser (DevTools Console):**
```javascript
// Zeige aktuelle API URL
console.log(import.meta.env.VITE_API_URL);
```

**Sollte sein:** `http://localhost:3001`

**Falls undefined oder falsch:**
1. Prüfen Sie `.env` Datei im Root:
   ```
   VITE_API_URL=http://localhost:3001
   ```
2. Frontend neu starten (Vite lädt .env nur beim Start)
3. Hard-Refresh im Browser (Cmd+Shift+R)

---

### Schritt 5: Services prüfen

```bash
# Alle Services prüfen
./quick-start.sh

# Oder manuell:

# 1. PostgreSQL
lsof -i :5432
# Sollte Prozess zeigen

# 2. Backend
curl http://localhost:3001/health
# Sollte {"status":"ok"} zeigen

# 3. Frontend
lsof -i :5173
# Sollte Prozess zeigen
```

---

### Schritt 6: Browser-Cache leeren

**Problem:** Browser hat alte Frontend-Version gecached

**Lösung:**
1. **Hard Refresh:** Cmd+Shift+R (Mac) oder Ctrl+Shift+R (Windows)
2. **Cache komplett leeren:**
   - Chrome: DevTools → Network Tab → "Disable cache" aktivieren
   - Oder: Settings → Privacy → Clear browsing data

---

### Schritt 7: Token-Problem

**Symptom:** Login funktioniert, aber andere Requests scheitern

**Lösung:**
```javascript
// Im Browser Console:
// 1. Aktuellen Token prüfen
console.log(localStorage.getItem('auth_token'));

// 2. Token löschen (dann neu einloggen)
localStorage.removeItem('auth_token');
localStorage.removeItem('auth_user');

// 3. Seite neu laden
location.reload();
```

---

### Schritt 8: Kompletter Neustart

```bash
# Alles stoppen
pkill -9 -f "node.*server"
pkill -9 -f "vite"
pkill -9 -f "postgres"

# PostgreSQL starten
brew services start postgresql@14

# Warten
sleep 5

# System neu starten
./quick-start.sh

# Im Browser:
# 1. Alle Tabs schließen
# 2. Neu öffnen: http://localhost:5173
# 3. Hard Refresh: Cmd+Shift+R
```

---

## Spezifische Szenarien

### Szenario A: "Failed to fetch" bei Registrierung

**Request:** `POST /api/auth/register`

**Checkliste:**
1. ✅ Backend läuft? → `curl http://localhost:3001/health`
2. ✅ PostgreSQL läuft? → `lsof -i :5432`
3. ✅ Datenbank initialisiert? → `cd backend && npm run init-db`
4. ✅ Backend-Logs? → `tail -f /tmp/backend.log`

**Häufige Fehler:**
- Database connection refused → PostgreSQL läuft nicht
- Column "role" does not exist → Datenbank nicht korrekt initialisiert

---

### Szenario B: "Failed to fetch" bei Login

**Request:** `POST /api/auth/login`

**Analog zu Szenario A**

---

### Szenario C: "Failed to fetch" bei Modul erstellen

**Request:** `POST /api/catalogs/modules`

**Checkliste:**
1. ✅ Token vorhanden? → Browser Console: `localStorage.getItem('auth_token')`
2. ✅ Authorization Header? → DevTools Network Tab
3. ✅ Backend-Logs zeigen Request? → `tail -f /tmp/backend.log`

**Häufige Fehler:**
- 401 Unauthorized → Token fehlt/ungültig, neu einloggen
- 400 Invalid modultyp → Foreign Key Constraint, Modultyp leer lassen
- 500 Internal Server Error → Backend-Logs prüfen

---

### Szenario D: "Failed to fetch" nach Reload

**Problem:** Nach Seiten-Reload funktioniert nichts mehr

**Ursachen:**
1. Backend ist abgestürzt → `curl http://localhost:3001/health`
2. Token ist abgelaufen → Logout + neu Login
3. Browser hat alte Version gecached → Hard Refresh

---

## Direkte API-Tests (ohne Frontend)

### Test 1: Health Check
```bash
curl http://localhost:3001/health
```
**Erwartete Antwort:** `{"status":"ok","timestamp":"...","uptime":123}`

### Test 2: Registrierung
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","name":"Test User"}'
```
**Erwartete Antwort:** `{"message":"User registered successfully","user":{...},"token":"..."}`

### Test 3: Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```
**Erwartete Antwort:** `{"message":"Login successful","user":{...},"token":"..."}`

### Test 4: Modul erstellen (mit Token)
```bash
# Erst Token holen (aus Login Response)
TOKEN="your-token-here"

curl -X POST http://localhost:3001/api/catalogs/modules \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Test Modul","hersteller":"Test AG","preis":1000}'
```
**Erwartete Antwort:** `{"message":"Module created","module":{...}}`

---

## Logs analysieren

### Backend-Logs
```bash
# Letzte 50 Zeilen
tail -50 /tmp/backend.log

# Live-Ansicht
tail -f /tmp/backend.log

# Nur Fehler
grep -i error /tmp/backend.log | tail -20
```

### Frontend-Logs
```bash
# Letzte 50 Zeilen
tail -50 /tmp/frontend.log

# Live-Ansicht
tail -f /tmp/frontend.log
```

### PostgreSQL-Logs (Homebrew)
```bash
tail -50 /opt/homebrew/var/log/postgresql@14.log
```

---

## Schnelle Diagnose-Commands

```bash
# Alle Services auf einen Blick
echo "PostgreSQL:" && lsof -i :5432 > /dev/null 2>&1 && echo "✅ läuft" || echo "❌ läuft nicht"
echo "Backend:" && curl -s http://localhost:3001/health > /dev/null 2>&1 && echo "✅ läuft" || echo "❌ läuft nicht"
echo "Frontend:" && lsof -i :5173 > /dev/null 2>&1 && echo "✅ läuft" || echo "❌ läuft nicht"

# Backend Prozesse
ps aux | grep "node.*server" | grep -v grep

# Frontend Prozesse
ps aux | grep "vite" | grep -v grep

# PostgreSQL Prozesse
ps aux | grep postgres | grep -v grep | head -5
```

---

## Häufigste Lösungen (Quick Fixes)

### Fix 1: Alles neu starten
```bash
./quick-start.sh
```

### Fix 2: Nur Backend neu starten
```bash
pkill -9 -f "node.*server"
cd backend && npm start
```

### Fix 3: Nur Frontend neu starten
```bash
pkill -9 -f "vite"
npm run dev
```

### Fix 4: Browser Cache leeren
- Cmd+Shift+R (Hard Refresh)
- Oder DevTools → Network → Disable cache

### Fix 5: Token zurücksetzen
```javascript
// Browser Console:
localStorage.clear();
location.reload();
```

### Fix 6: Datenbank neu initialisieren
```bash
cd backend
npm run init-db
```

---

## Support-Informationen sammeln

Wenn das Problem weiterhin besteht, sammeln Sie diese Informationen:

```bash
# System-Info erstellen
cat > /tmp/debug-info.txt << 'EOF'
=== System Status ===
EOF

echo "Date: $(date)" >> /tmp/debug-info.txt
echo "" >> /tmp/debug-info.txt

echo "PostgreSQL:" >> /tmp/debug-info.txt
lsof -i :5432 >> /tmp/debug-info.txt 2>&1
echo "" >> /tmp/debug-info.txt

echo "Backend Health:" >> /tmp/debug-info.txt
curl -s http://localhost:3001/health >> /tmp/debug-info.txt 2>&1
echo "" >> /tmp/debug-info.txt

echo "Backend Logs (last 50):" >> /tmp/debug-info.txt
tail -50 /tmp/backend.log >> /tmp/debug-info.txt 2>&1
echo "" >> /tmp/debug-info.txt

echo "Frontend Port:" >> /tmp/debug-info.txt
lsof -i :5173 >> /tmp/debug-info.txt 2>&1

cat /tmp/debug-info.txt
```

---

**Nach Durchführung dieser Schritte sollte das Problem identifiziert und gelöst sein!**
