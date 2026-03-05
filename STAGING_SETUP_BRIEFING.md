# 🎯 Staging-System Setup - Vollständiges Briefing

Dieses Dokument enthält ALLE notwendigen Informationen zum Aufbau eines professionellen Staging-Systems für den Roots Systemkonfigurator.

---

## 📊 Projekt-Übersicht

**Projekt:** Roots Systemkonfigurator
**Zweck:** Professionelles Planungstool für Roots Energy Wärmepumpensysteme
**Tech Stack:** React (Vite) + Node.js/Express + PostgreSQL
**Deployment:** Docker mit docker-compose

---

## 🔗 Repository & Zugänge

### GitHub Repository
```
URL: https://github.com/Hacklerflow/Roots-Systemplaner.git
Branch: main (Produktion)
```

**Branches-Strategie für Staging:**
- `main` → Produktion
- `staging` → Staging-Umgebung (neu zu erstellen)
- `develop` → Entwicklung (optional)

### Empfohlener Git-Workflow
```bash
# Staging Branch erstellen
git checkout -b staging
git push -u origin staging

# Für neue Features
git checkout -b feature/xyz staging
# Nach Testing: Merge in staging
# Nach Approval: Merge in main
```

---

## 🏗️ Aktuelle Infrastruktur-Architektur

### Docker-Setup (Production)

**3 Container:**
1. **PostgreSQL** (postgres:15-alpine)
   - Port: 5432
   - Volume: postgres-data
   - Auto-Init mit schema.sql und init-db.js

2. **Backend** (Node.js 18 Alpine)
   - Port: 3001
   - API: Express
   - Auth: JWT
   - Health: /health endpoint

3. **Frontend** (nginx:alpine)
   - Port: 80 (HTTP) / 443 (HTTPS)
   - Build: Vite → Static Files
   - Proxy: /api/ → backend:3001
   - Health: /health endpoint

### Netzwerk
- Docker Network: `roots-network` (bridge)
- Alle Container im gleichen Netzwerk
- Frontend → Backend via Service-Name `backend`

---

## 📦 Environment Variables

### Vollständige Liste (.env)

```bash
# === DATABASE ===
DB_NAME=roots_configurator
DB_USER=postgres
DB_PASSWORD=<STRONG_PASSWORD>  # Min. 32 Zeichen

# === JWT AUTHENTICATION ===
JWT_SECRET=<RANDOM_SECRET>      # Min. 32 Zeichen
JWT_EXPIRES_IN=7d               # Token Lifetime

# === SERVER CONFIG ===
NODE_ENV=production             # Für Staging: staging
PORT=80                         # Frontend Port

# === CORS (wichtig!) ===
CORS_ORIGIN=https://staging.yourdomain.com  # Staging Domain
# ODER für Testing:
# CORS_ORIGIN=*                 # Nur für Testing!

# === FRONTEND API URL ===
VITE_API_URL=https://staging.yourdomain.com/api
# ODER lokal:
# VITE_API_URL=http://localhost:3001
```

### Generierung von Secrets

```bash
# PostgreSQL Passwort
openssl rand -base64 32

# JWT Secret
openssl rand -base64 32

# Für Production UND Staging separate Secrets verwenden!
```

---

## 🗄️ Datenbank-Schema

### Automatische Initialisierung

**Dateien:**
- `backend/src/config/schema.sql` - DDL (CREATE TABLE)
- `backend/src/config/init-db.js` - Seed Data

**Tables:**
1. `users` - User Accounts mit bcrypt-Passwörtern
2. `projects` - Konfigurationsprojekte
3. `catalog_modules` - Modul-Katalog
4. `catalog_pipes` - Leitungs-Katalog
5. `catalog_connections` - Verbindungsarten
6. `catalog_dimensions` - Dimensionen (DN-Werte)
7. `catalog_moduletypes` - Modultypen
8. `catalog_formulas` - Druckverlust-Formeln

### Wichtige Constraints
- `catalog_formulas`: Unique constraint auf `is_active = true` (nur eine aktive Formel)
- `users`: Unique email
- `projects`: Foreign Key zu users

---

## 🐳 Docker-Konfiguration Details

### docker-compose.yml Struktur

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: roots-postgres-staging  # Anpassen!
    restart: unless-stopped
    environment:
      POSTGRES_DB: ${DB_NAME}
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres-data-staging:/var/lib/postgresql/data  # Anpassen!
      - ./backend/src/config/schema.sql:/docker-entrypoint-initdb.d/01-schema.sql
      - ./backend/src/config/init-db.js:/docker-entrypoint-initdb.d/02-init.js
    ports:
      - "5433:5432"  # Anderer Port für Staging!
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build: ./backend
    container_name: roots-backend-staging
    restart: unless-stopped
    environment:
      NODE_ENV: staging  # Wichtig!
      PORT: 3001
      DB_HOST: postgres
      DB_PORT: 5432
      DB_NAME: ${DB_NAME}
      DB_USER: ${DB_USER}
      DB_PASSWORD: ${DB_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
      JWT_EXPIRES_IN: ${JWT_EXPIRES_IN}
      CORS_ORIGIN: ${CORS_ORIGIN}
    depends_on:
      postgres:
        condition: service_healthy
    ports:
      - "3002:3001"  # Anderer Port für Staging!

  frontend:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        VITE_API_URL: ${VITE_API_URL}
    container_name: roots-frontend-staging
    restart: unless-stopped
    depends_on:
      - backend
    ports:
      - "8080:80"  # Anderer Port für Staging!
```

### Build-Prozess

**Frontend (Multi-Stage Build):**
1. Builder Stage: npm ci → npm run build (Vite)
2. Production Stage: nginx:alpine + dist/
3. Result: ~2 MB statische Files

**Backend:**
1. npm ci --only=production
2. Copy src/
3. CMD: npm start (node src/server.js)

**Wichtig:** Build-Zeit ca. 1-2 Minuten pro Service

---

## 🌐 Server-Infrastruktur

### Hetzner Server (Empfehlung)

**Bereits dokumentiert in README_DEPLOYMENT.md**

**Mindestanforderungen:**
- **Produktion:** CX21 (2 vCPU, 4 GB RAM, 40 GB SSD) - ~5€/Monat
- **Staging:** CX11 (1 vCPU, 2 GB RAM, 20 GB SSD) - ~3€/Monat
- OS: Ubuntu 22.04 LTS
- Location: Nürnberg (Deutschland)

**Firewall-Regeln:**
```bash
# SSH
22/tcp

# HTTP (Certbot + Fallback)
80/tcp

# HTTPS
443/tcp

# Optional: Custom Staging Ports (wenn kein Reverse Proxy)
8080/tcp  # Frontend Staging
3002/tcp  # Backend Staging (nur für Debugging)
```

### Hostinger (Falls genutzt)

**Hinweis:** Hostinger ist primär für Shared Hosting/Domains.
- **Für Domains nutzen:** Ja, DNS Management
- **Für Docker Hosting:** NEIN - keine VPS/Container-Unterstützung bei Standard-Plänen
- **Alternative:** Hostinger VPS Pläne (KVM 1: ~4€/Monat)

**Empfehlung:** Hetzner für Server + Hostinger nur für Domain-Verwaltung

---

## 🔄 Coolify Integration (Optional)

**Coolify** = Self-hosted Vercel/Netlify Alternative

### Was ist Coolify?

Open-Source PaaS (Platform as a Service) für:
- Docker-basierte Apps
- Automatische Deployments via Git
- SSL-Zertifikate (Let's Encrypt)
- Environment Variables Management
- Reverse Proxy (Traefik)
- Zero-Downtime Deployments

### Installation auf Hetzner

```bash
# Auf frischem Ubuntu 22.04 Server
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash

# Nach Installation:
# - Coolify läuft auf Port 8000
# - Zugriff: http://YOUR_SERVER_IP:8000
# - Initiales Setup durchführen
```

### Roots Configurator in Coolify deployen

**Schritt 1: Neue Resource**
- Type: Docker Compose
- Git Repository: https://github.com/Hacklerflow/Roots-Systemplaner.git
- Branch: staging

**Schritt 2: Environment Variables**
Alle Variablen aus .env.production in Coolify UI eingeben

**Schritt 3: Domain**
- Domain: staging.rootsenergy.com
- SSL: Auto (Let's Encrypt)

**Schritt 4: Deploy**
- Automatic Deployment: Bei Git Push
- Build & Start

**Vorteile Coolify:**
- ✅ GUI für Deployment
- ✅ Automatische SSL
- ✅ Git-basierte Deployments
- ✅ Logs & Monitoring
- ✅ Einfaches Rollback

**Nachteile:**
- ❌ Extra Komplexität
- ❌ ~500 MB RAM für Coolify selbst
- ❌ Learning Curve

**Empfehlung für Staging:**
✅ **MIT Coolify** - Einfacher für mehrere Umgebungen
⚠️ **OHNE Coolify** - Wenn nur 1-2 Umgebungen

---

## 🎨 Staging-System Architektur-Vorschlag

### Option A: Separater Staging-Server (Empfohlen)

```
Production Server (Hetzner CX21):
├── docker-compose.yml (production)
├── Port 80/443
└── Domain: app.rootsenergy.com

Staging Server (Hetzner CX11):
├── docker-compose.yml (staging)
├── Port 80/443
└── Domain: staging.rootsenergy.com
```

**Vorteile:**
- ✅ Komplette Isolation
- ✅ Keine Port-Konflikte
- ✅ Separate Ressourcen
- ✅ Produktions-Sicherheit

**Kosten:** ~8€/Monat (2 Server)

---

### Option B: Ein Server mit Port-Mapping

```
Server (Hetzner CX21):
├── Production (Port 80/443)
│   ├── postgres:5432
│   ├── backend:3001
│   └── frontend:80
│
└── Staging (Port 8080/8443)
    ├── postgres:5433
    ├── backend:3002
    └── frontend:8080
```

**Vorteile:**
- ✅ Nur ein Server (Kosten)
- ✅ Einfachere Verwaltung

**Nachteile:**
- ❌ Geteilte Ressourcen
- ❌ Komplexere nginx/Traefik Config
- ❌ Risiko für Production

**Kosten:** ~5€/Monat (1 Server)

---

### Option C: Coolify-basiert (Professionell)

```
Coolify Server (Hetzner CX31):
├── Coolify (Port 8000)
├── Traefik Reverse Proxy
│
├── Production App
│   └── staging.rootsenergy.com
│
└── Staging App
    └── staging.rootsenergy.com
```

**Vorteile:**
- ✅ GUI Management
- ✅ Automatische SSL
- ✅ Git-Deployments
- ✅ Rollbacks
- ✅ Logs & Monitoring

**Nachteile:**
- ❌ Mehr RAM benötigt (min. 4 GB)
- ❌ Komplexer

**Kosten:** ~10€/Monat (CX31 empfohlen)

---

## 🚀 Empfohlener Staging-Setup Workflow

### Phase 1: GitHub Vorbereitung

```bash
# 1. Staging Branch erstellen
git checkout -b staging
git push -u origin staging

# 2. GitHub Branch Protection Rules
# - Require PR for staging → main
# - Require review approval
# - Require status checks
```

### Phase 2: Staging-Server Setup

**Option A (Empfohlen): Separater Server**

```bash
# 1. Neuen Hetzner Server erstellen
# - CX11 (2 GB RAM)
# - Ubuntu 22.04 LTS
# - SSH Key hinterlegen

# 2. Docker installieren
ssh root@STAGING_SERVER_IP
curl -fsSL https://get.docker.com | sh
apt install docker-compose-plugin -y

# 3. Repository klonen
git clone -b staging https://github.com/Hacklerflow/Roots-Systemplaner.git
cd Roots-Systemplaner

# 4. Environment konfigurieren
cp .env.production .env
nano .env
# - DB_PASSWORD generieren
# - JWT_SECRET generieren
# - CORS_ORIGIN=https://staging.rootsenergy.com
# - VITE_API_URL=https://staging.rootsenergy.com/api

# 5. Build & Start
docker compose up -d --build

# 6. Logs prüfen
docker compose logs -f
```

### Phase 3: Domain & SSL

```bash
# 1. DNS A-Record erstellen (bei Hostinger/Domain-Provider)
# staging.rootsenergy.com → STAGING_SERVER_IP

# 2. SSL mit Certbot
apt install certbot python3-certbot-nginx -y
docker compose down
certbot certonly --standalone -d staging.rootsenergy.com
docker compose up -d

# 3. nginx für SSL konfigurieren (siehe nginx-ssl.conf Template)
```

### Phase 4: CI/CD Pipeline (Optional)

**GitHub Actions für automatisches Staging-Deployment:**

`.github/workflows/deploy-staging.yml`:
```yaml
name: Deploy to Staging

on:
  push:
    branches: [staging]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy via SSH
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.STAGING_HOST }}
          username: ${{ secrets.STAGING_USER }}
          key: ${{ secrets.STAGING_SSH_KEY }}
          script: |
            cd ~/Roots-Systemplaner
            git pull origin staging
            docker compose up -d --build
            docker system prune -af
```

**GitHub Secrets einrichten:**
- `STAGING_HOST`: Server IP
- `STAGING_USER`: SSH User (root oder roots)
- `STAGING_SSH_KEY`: Private SSH Key

---

## 🔐 Sicherheits-Checkliste

### Staging-spezifische Security

1. **Separate Credentials**
   - [ ] Eigene DB_PASSWORD
   - [ ] Eigener JWT_SECRET
   - [ ] KEINE Production-Secrets wiederverwenden!

2. **Zugriffskontrolle**
   - [ ] HTTP Basic Auth für Staging (optional)
   - [ ] IP Whitelist (optional, für interne Teams)
   - [ ] robots.txt: Disallow all (SEO)

3. **Daten-Isolation**
   - [ ] Separate Datenbank
   - [ ] Keine Production-Daten in Staging
   - [ ] Anonymisierte Test-Daten verwenden

4. **SSL/TLS**
   - [ ] Let's Encrypt für staging.domain.com
   - [ ] HTTPS erzwingen (nginx redirect)

---

## 📊 Monitoring & Logs

### Staging-Monitoring Setup

**1. Health Checks**
```bash
# Backend Health
curl https://staging.rootsenergy.com/api/health

# Frontend Health
curl https://staging.rootsenergy.com/health

# Database
docker compose exec postgres pg_isready
```

**2. Logs**
```bash
# Live-Logs aller Services
docker compose logs -f

# Nur Fehler
docker compose logs | grep ERROR

# Letzte 100 Zeilen Backend
docker compose logs --tail=100 backend
```

**3. Uptime Monitoring (Optional)**
- UptimeRobot (kostenlos): https://uptimerobot.com
- Endpoint: https://staging.rootsenergy.com/health
- Alert bei Down

**4. Error Tracking (Optional)**
- Sentry.io (kostenlos für kleine Projekte)
- Frontend + Backend Integration

---

## 🔄 Update & Rollback Strategie

### Staging Updates

```bash
# 1. Code aktualisieren
cd ~/Roots-Systemplaner
git pull origin staging

# 2. Rebuild (nur bei Dependency-Änderungen)
docker compose up -d --build

# 3. Restart (bei Code-Änderungen)
docker compose restart backend frontend

# 4. Prüfen
docker compose ps
docker compose logs -f
```

### Rollback bei Problemen

```bash
# 1. Zu vorherigem Commit zurück
git log --oneline  # Finde Hash
git checkout <commit-hash>

# 2. Rebuild
docker compose up -d --build

# 3. Oder: Volume Backup wiederherstellen
# Siehe Backup-Sektion
```

---

## 💾 Backup-Strategie für Staging

### Automatisches Datenbank-Backup

```bash
# Cron Job einrichten
crontab -e

# Tägliches Backup um 3 Uhr
0 3 * * * cd ~/Roots-Systemplaner && docker compose exec -T postgres pg_dump -U postgres roots_configurator > ~/backups/staging_$(date +\%Y\%m\%d).sql

# Backup-Ordner erstellen
mkdir -p ~/backups

# Alte Backups löschen (älter als 7 Tage)
0 4 * * * find ~/backups/staging_*.sql -mtime +7 -delete
```

### Restore

```bash
# Backup wiederherstellen
cat ~/backups/staging_20260305.sql | docker compose exec -T postgres psql -U postgres roots_configurator
```

---

## 🧪 Testing Workflow

### Empfohlener Workflow

1. **Development (lokal)**
   - Feature-Branch erstellen
   - Lokal entwickeln und testen
   - docker-compose.yml nutzen

2. **Staging (Server)**
   - PR zu `staging` Branch
   - Auto-Deploy (mit GitHub Actions)
   - Manuelles Testing auf staging.domain.com
   - QA Testing

3. **Production (Server)**
   - PR von `staging` zu `main`
   - Approval erforderlich
   - Deployment nach Merge
   - Monitoring

---

## 📁 Wichtige Dateien & Pfade

### Im Repository

```
roots-configurator/
├── .env.example              # Template für lokale Entwicklung
├── .env.production           # Template für Production/Staging
├── docker-compose.yml        # Container-Orchestrierung
├── Dockerfile                # Frontend Build
├── nginx.conf                # nginx Konfiguration
├── README.md                 # Projekt-Dokumentation
├── README_DEPLOYMENT.md      # Deployment-Guide
│
├── backend/
│   ├── Dockerfile            # Backend Container
│   ├── package.json          # Node.js Dependencies
│   └── src/
│       ├── server.js         # Express Server
│       ├── routes/           # API Endpoints
│       └── config/
│           ├── schema.sql    # DB Schema
│           └── init-db.js    # DB Initialisierung
│
├── src/                      # Frontend React Code
│   ├── main.jsx
│   ├── App.jsx
│   ├── ConfiguratorApp.jsx
│   ├── components/
│   ├── data/
│   └── utils/
│
└── package.json              # Frontend Dependencies
```

### Auf dem Server

```
~/Roots-Systemplaner/         # Git Repository
~/backups/                    # Datenbank-Backups
~/.env                        # Environment Variables (nicht in Git!)
```

---

## 🆘 Troubleshooting Guide

### Problem: Container startet nicht

```bash
# Logs checken
docker compose logs <service-name>

# Häufige Ursachen:
# 1. Port bereits belegt
sudo lsof -i :80
sudo lsof -i :3001

# 2. .env nicht korrekt
cat .env | grep -v '^#'

# 3. Build-Fehler
docker compose build --no-cache
```

### Problem: Frontend kann Backend nicht erreichen

```bash
# 1. Backend läuft?
curl http://localhost:3001/health

# 2. CORS-Settings
docker compose exec backend env | grep CORS

# 3. nginx Proxy Config
docker compose exec frontend cat /etc/nginx/conf.d/default.conf
```

### Problem: Datenbank-Verbindung fehlgeschlagen

```bash
# 1. PostgreSQL läuft?
docker compose exec postgres pg_isready

# 2. Credentials korrekt?
docker compose exec backend env | grep DB_

# 3. Manuell testen
docker compose exec postgres psql -U postgres roots_configurator
```

---

## 📞 Support & Kontakt

**Bei Problemen:**
1. Logs prüfen: `docker compose logs -f`
2. Health Checks: `curl https://staging.domain.com/health`
3. GitHub Issues: https://github.com/Hacklerflow/Roots-Systemplaner/issues

**Nützliche Commands:**
```bash
# Status aller Container
docker compose ps

# In Container einloggen
docker compose exec backend sh
docker compose exec frontend sh
docker compose exec postgres psql -U postgres

# Ressourcen-Nutzung
docker stats

# Alles neu bauen (Clean Slate)
docker compose down -v
docker compose up -d --build
```

---

## ✅ Staging-Setup Checkliste

### Server-Setup
- [ ] Hetzner Server erstellt (CX11 min.)
- [ ] Ubuntu 22.04 LTS installiert
- [ ] SSH-Zugriff konfiguriert
- [ ] Docker & Docker Compose installiert
- [ ] Firewall (UFW) konfiguriert

### Code & Environment
- [ ] Staging Branch erstellt
- [ ] Repository auf Server geklont
- [ ] .env konfiguriert (separate Secrets!)
- [ ] Secrets generiert (DB_PASSWORD, JWT_SECRET)

### Docker
- [ ] docker-compose.yml angepasst (Container-Namen, Ports)
- [ ] Build erfolgreich: `docker compose build`
- [ ] Container laufen: `docker compose up -d`
- [ ] Health Checks grün: `docker compose ps`

### Netzwerk & Domain
- [ ] DNS A-Record erstellt (staging.domain.com)
- [ ] SSL-Zertifikat via Certbot
- [ ] nginx SSL-Config
- [ ] HTTPS erzwungen

### Datenbank
- [ ] PostgreSQL läuft
- [ ] Schema automatisch initialisiert
- [ ] Test-User erstellt
- [ ] Backup-Cron eingerichtet

### CI/CD (Optional)
- [ ] GitHub Actions Workflow erstellt
- [ ] GitHub Secrets konfiguriert
- [ ] Auto-Deploy bei Push zu staging

### Testing & Monitoring
- [ ] Frontend erreichbar: https://staging.domain.com
- [ ] Backend erreichbar: https://staging.domain.com/api/health
- [ ] Login funktioniert
- [ ] Projekt erstellen funktioniert
- [ ] Uptime Monitor eingerichtet (optional)

### Dokumentation
- [ ] Team über Staging-URL informiert
- [ ] Login-Credentials geteilt
- [ ] Update-Prozess dokumentiert

---

## 🎓 Zusätzliche Ressourcen

**Docker:**
- Offizielle Docs: https://docs.docker.com
- Compose Reference: https://docs.docker.com/compose/compose-file/

**Hetzner:**
- Server Management: https://console.hetzner.cloud
- Cloud Docs: https://docs.hetzner.com

**Coolify:**
- Offizielle Docs: https://coolify.io/docs
- GitHub: https://github.com/coollabsio/coolify

**SSL/Let's Encrypt:**
- Certbot Guide: https://certbot.eff.org
- SSL Config Generator: https://ssl-config.mozilla.org

**PostgreSQL:**
- Backup Best Practices: https://www.postgresql.org/docs/current/backup.html
- Performance Tuning: https://wiki.postgresql.org/wiki/Tuning_Your_PostgreSQL_Server

---

## 🎯 Zusammenfassung für schnellen Start

**Minimaler Staging-Setup (30 Minuten):**

```bash
# 1. Server (Hetzner CX11, 3€/Monat)
# → Ubuntu 22.04 LTS auswählen

# 2. SSH einloggen
ssh root@YOUR_SERVER_IP

# 3. Docker installieren
curl -fsSL https://get.docker.com | sh
apt install docker-compose-plugin -y

# 4. Code deployen
git clone -b staging https://github.com/Hacklerflow/Roots-Systemplaner.git
cd Roots-Systemplaner

# 5. Environment konfigurieren
cp .env.production .env
# Editiere .env:
# - DB_PASSWORD=$(openssl rand -base64 32)
# - JWT_SECRET=$(openssl rand -base64 32)
# - CORS_ORIGIN=https://staging.yourdomain.com
# - VITE_API_URL=https://staging.yourdomain.com/api

# 6. Container starten
docker compose up -d --build

# 7. Prüfen
docker compose ps
curl http://localhost:3001/health

# ✅ Staging läuft auf Port 80!
```

**Für Production-Grade:**
- Domain konfigurieren (DNS A-Record)
- SSL mit Certbot
- CI/CD mit GitHub Actions
- Monitoring mit UptimeRobot
- Automatische Backups

---

**Made with ❤️ for Roots Energy**
**Version:** 1.0
**Datum:** März 2026
**Autor:** Roots Development Team
