# PostgreSQL Setup & Troubleshooting

## Problem: "Internal server error" beim Speichern

**Ursache**: PostgreSQL Datenbank läuft nicht

**Symptom**: Backend-Logs zeigen:
```
Error: connect ECONNREFUSED ::1:5432
Error: connect ECONNREFUSED 127.0.0.1:5432
```

---

## Lösung: PostgreSQL starten

### Option 1: Homebrew (macOS - empfohlen)

#### Installation:
```bash
# PostgreSQL installieren
brew install postgresql@14

# Als Service registrieren (automatischer Start)
brew services start postgresql@14
```

#### Prüfen ob es läuft:
```bash
# Status prüfen
brew services list | grep postgres
# Sollte zeigen: postgresql@14  started

# Oder:
ps aux | grep postgres | grep -v grep
```

#### Stoppen/Neustarten:
```bash
# Stoppen
brew services stop postgresql@14

# Neustarten
brew services restart postgresql@14
```

---

### Option 2: Docker (alle Plattformen)

#### Container starten:
```bash
docker run --name roots-postgres \
  -e POSTGRES_DB=roots_configurator \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=local_dev_password_12345 \
  -p 5432:5432 \
  -v postgres-data:/var/lib/postgresql/data \
  -d postgres:14
```

#### Prüfen:
```bash
docker ps | grep postgres
# Sollte Container anzeigen

# Logs prüfen:
docker logs roots-postgres
```

#### Container-Management:
```bash
# Stoppen
docker stop roots-postgres

# Starten (nach Stopp)
docker start roots-postgres

# Entfernen (Daten bleiben erhalten durch Volume)
docker rm -f roots-postgres

# Komplett neu starten (Daten löschen):
docker rm -f roots-postgres
docker volume rm postgres-data
# Dann wieder Container starten (siehe oben)
```

---

### Option 3: Manueller Start (Unix-basiert)

```bash
# PostgreSQL Data Directory finden:
# Übliche Pfade:
# - macOS Homebrew: /usr/local/var/postgres oder /opt/homebrew/var/postgres
# - Linux: /var/lib/postgresql/14/main

# Starten:
pg_ctl -D /usr/local/var/postgres start

# Stoppen:
pg_ctl -D /usr/local/var/postgres stop

# Status:
pg_ctl -D /usr/local/var/postgres status
```

---

## Datenbank initialisieren

Nach dem ersten Start von PostgreSQL:

```bash
cd backend

# Datenbank-Schema und Tabellen erstellen
npm run init-db

# Expected Output:
# ✅ Database schema created successfully
# ✅ Tables: users, projects, configurations, catalog_*
```

**Wichtig**: `npm run init-db` **löscht alle existierenden Daten** (DROP TABLE). Nur beim ersten Setup oder für kompletten Reset verwenden!

---

## Verbindung testen

### Mit psql (PostgreSQL CLI):
```bash
# Verbinden:
psql -U postgres -d roots_configurator

# Sollte PostgreSQL Prompt zeigen: roots_configurator=#

# Tabellen auflisten:
\dt

# Expected Output:
#  catalog_connections
#  catalog_dimensions
#  catalog_modules
#  catalog_module_types
#  catalog_pipes
#  configurations
#  projects
#  users

# Beenden:
\q
```

### Mit curl (über Backend API):
```bash
# Backend muss laufen (npm start)

# Health Check:
curl http://localhost:3001/health
# Expected: {"status":"ok","timestamp":"...","uptime":123}

# Kataloge abrufen (erfordert Login):
# 1. Registrieren:
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","name":"Test User"}'

# 2. Login:
TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}' | jq -r '.token')

# 3. Katalog abrufen:
curl http://localhost:3001/api/catalogs/modules \
  -H "Authorization: Bearer $TOKEN"
# Expected: {"modules":[...]}
```

---

## Verbindungskonfiguration

Backend liest DB-Config aus `backend/.env`:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=roots_configurator
DB_USER=postgres
DB_PASSWORD=local_dev_password_12345
```

**Für Docker**: Passen Sie das Passwort an den Docker-Container an:
- Container-Umgebungsvariable: `POSTGRES_PASSWORD=local_dev_password_12345`
- `backend/.env`: `DB_PASSWORD=local_dev_password_12345`

**Für Homebrew**: Standard-User ist meist `postgres` ohne Passwort in Development.

---

## Troubleshooting

### Problem: "FATAL: role 'postgres' does not exist"

**Lösung**:
```bash
# User erstellen:
createuser -s postgres

# Oder mit anderem User:
createuser -s $USER
# Dann in backend/.env: DB_USER=$USER
```

### Problem: "FATAL: database 'roots_configurator' does not exist"

**Lösung**:
```bash
# Datenbank erstellen:
createdb roots_configurator

# Dann Schema initialisieren:
cd backend
npm run init-db
```

### Problem: Port 5432 bereits belegt

**Prüfen**:
```bash
lsof -i :5432
# Zeigt welcher Prozess Port 5432 nutzt
```

**Lösung**:
- Stoppen Sie die andere PostgreSQL-Instanz
- Oder: Ändern Sie den Port in `backend/.env` und Docker/PostgreSQL Config

### Problem: "Connection timeout" (nicht ECONNREFUSED)

**Mögliche Ursachen**:
1. Firewall blockiert Port 5432
2. PostgreSQL hört nur auf IPv4 oder IPv6 (nicht beide)
3. PostgreSQL-Config erlaubt keine lokalen Verbindungen

**Lösung**:
```bash
# PostgreSQL Config prüfen:
# Datei: /usr/local/var/postgres/postgresql.conf (oder ähnlich)

# Zeile finden und setzen:
listen_addresses = 'localhost'  # oder '*' für alle

# Datei: /usr/local/var/postgres/pg_hba.conf
# Zeile hinzufügen:
host    all             all             127.0.0.1/32            trust

# PostgreSQL neu starten
brew services restart postgresql@14
```

### Problem: Backend-Logs zeigen weiterhin ECONNREFUSED

**Checkliste**:
1. ✅ PostgreSQL läuft? → `ps aux | grep postgres`
2. ✅ Port 5432 offen? → `lsof -i :5432`
3. ✅ Backend `.env` korrekt? → `cat backend/.env`
4. ✅ Backend neu gestartet nach `.env` Änderung?

**Backend neu starten**:
```bash
# Alle node Prozesse stoppen:
pkill -9 -f "node.*server"

# Backend neu starten:
cd backend
npm start

# Logs prüfen (sollte KEINE ECONNREFUSED Fehler zeigen):
tail -f /tmp/backend-new.log
```

---

## Vollständiger Setup-Workflow

Für einen kompletten Neustart:

```bash
# 1. PostgreSQL starten
brew services start postgresql@14
# ODER
docker run --name roots-postgres \
  -e POSTGRES_DB=roots_configurator \
  -e POSTGRES_PASSWORD=local_dev_password_12345 \
  -p 5432:5432 -d postgres:14

# 2. Datenbank initialisieren
cd backend
npm run init-db

# 3. Backend starten
npm start

# 4. In neuem Terminal: Frontend starten
cd ..
npm run dev

# 5. Browser öffnen: http://localhost:5173
```

---

## Nützliche Commands

```bash
# PostgreSQL Version prüfen
psql --version

# Alle Datenbanken auflisten
psql -U postgres -l

# In Datenbank connecten
psql -U postgres -d roots_configurator

# SQL aus Datei ausführen
psql -U postgres -d roots_configurator -f backend/src/config/schema.sql

# Backup erstellen
pg_dump -U postgres roots_configurator > backup.sql

# Backup wiederherstellen
psql -U postgres -d roots_configurator < backup.sql

# Alle Connections zur DB schließen (nützlich vor DROP DATABASE)
psql -U postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname='roots_configurator';"
```

---

## Status-Check Script

Speichern als `check-db.sh` und ausführbar machen (`chmod +x check-db.sh`):

```bash
#!/bin/bash

echo "=== PostgreSQL Status Check ==="
echo ""

# Check if postgres is running
if pgrep -x postgres > /dev/null; then
    echo "✅ PostgreSQL is running"

    # Check if port 5432 is open
    if lsof -i :5432 > /dev/null 2>&1; then
        echo "✅ Port 5432 is open"
    else
        echo "❌ Port 5432 is not open"
    fi

    # Try to connect
    if psql -U postgres -c "\q" > /dev/null 2>&1; then
        echo "✅ Can connect to PostgreSQL"

        # Check if database exists
        if psql -U postgres -lqt | cut -d \| -f 1 | grep -qw roots_configurator; then
            echo "✅ Database 'roots_configurator' exists"

            # Check table count
            TABLE_COUNT=$(psql -U postgres -d roots_configurator -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public';")
            echo "✅ Tables in database: $TABLE_COUNT"

            if [ "$TABLE_COUNT" -eq "0" ]; then
                echo "⚠️  No tables found. Run: cd backend && npm run init-db"
            fi
        else
            echo "❌ Database 'roots_configurator' does not exist"
            echo "   Run: createdb roots_configurator && cd backend && npm run init-db"
        fi
    else
        echo "❌ Cannot connect to PostgreSQL"
    fi
else
    echo "❌ PostgreSQL is not running"
    echo "   Start with: brew services start postgresql@14"
fi

echo ""
echo "=== Backend Status ==="
if pgrep -f "node.*server.js" > /dev/null; then
    echo "✅ Backend is running"
else
    echo "❌ Backend is not running"
    echo "   Start with: cd backend && npm start"
fi
```

---

**Nach PostgreSQL Start sollte das Modul-Speichern funktionieren!** 🎉
