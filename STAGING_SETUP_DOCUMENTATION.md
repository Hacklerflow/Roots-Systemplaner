# 🚀 Roots Configurator - Staging-System Dokumentation

**Version:** 1.0
**Datum:** 6. März 2026
**Status:** Live & Deployed

---

## 📊 System-Architektur

### Server-Übersicht

| Server | IP-Adresse | Zweck | Services |
|--------|------------|-------|----------|
| **Coolify Server** | `46.225.126.167` | Management & Monitoring | Coolify (Port 8000) |
| **Staging Server** | `89.167.56.131` | Staging-Umgebung | Docker Compose (postgres, backend, frontend) |
| **Production Server** | `72.60.37.185` | Production (Hostinger) | Production App |

### Staging-Setup (89.167.56.131)

```
Staging Server (89.167.56.131)
├── Docker Compose Stack
│   ├── postgres (Port 5432)
│   │   └── Database: roots_configurator_staging
│   ├── backend (Port 3001)
│   │   └── Node.js + Express API
│   └── frontend (Port 80)
│       └── nginx + React SPA
│
└── Git Repository
    └── Branch: staging
    └── Location: /root/Roots-Systemplaner
```

---

## 🔐 Zugangsdaten & Credentials

### SSH-Zugang

**Staging Server:**
```bash
ssh root@89.167.56.131
```

**Coolify Server:**
```bash
ssh root@46.225.126.167
```

### Environment Variables (Staging)

**Datei:** `/root/Roots-Systemplaner/.env`

```bash
# Database
DB_NAME=roots_configurator_staging
DB_USER=postgres
DB_PASSWORD=6NYNvGKLk93tvry9zZYKnN73lvQlGnOntn2N/xC6NF8=

# JWT Authentication
JWT_SECRET=vqr70V+6gasCckcanj00WQh0hEWCF6xVX+gi3x2zsBE=
JWT_EXPIRES_IN=7d

# Server Configuration
NODE_ENV=staging
PORT=80

# CORS & API
CORS_ORIGIN=http://89.167.56.131
VITE_API_URL=http://89.167.56.131/api
```

⚠️ **WICHTIG:** Diese Credentials sind NUR für Staging! Production verwendet separate Secrets.

---

## 🌐 URLs & Endpoints

### Staging-Umgebung

**Frontend (Haupt-URL):**
```
http://89.167.56.131
```

**Backend API:**
```
http://89.167.56.131/api
```

**Health Checks:**
```bash
# Frontend Health
curl http://89.167.56.131/health
# Response: {"status":"ok"}

# Backend Health (benötigt Auth)
curl http://89.167.56.131/api/health
```

**Coolify Management:**
```
http://46.225.126.167:8000
```

---

## 🐳 Docker Container

### Container-Status prüfen

```bash
# SSH zum Staging Server
ssh root@89.167.56.131

# Ins Projekt-Verzeichnis
cd ~/Roots-Systemplaner

# Container Status
docker compose ps

# Erwartete Ausgabe:
# roots-postgres   -> Up, healthy
# roots-backend    -> Up, healthy
# roots-frontend   -> Up, healthy
```

### Container verwalten

```bash
# Alle Container starten
docker compose up -d

# Container stoppen
docker compose down

# Container neu starten
docker compose restart

# Logs anzeigen
docker compose logs -f

# Nur Backend Logs
docker compose logs -f backend

# Nur letzte 50 Zeilen
docker compose logs --tail=50
```

---

## 📁 Verzeichnisstruktur auf dem Server

```
/root/Roots-Systemplaner/
├── .env                          # Environment Variables (nicht in Git!)
├── docker-compose.yml            # Docker Orchestrierung
├── Dockerfile                    # Frontend Build
├── nginx.conf                    # nginx Konfiguration
│
├── backend/
│   ├── Dockerfile                # Backend Container
│   ├── package.json
│   └── src/
│       ├── server.js             # Express Server
│       ├── routes/               # API Endpoints
│       └── config/
│           ├── schema.sql        # DB Schema
│           └── init-db.js        # DB Seed Data
│
├── src/                          # Frontend React Code
│   ├── main.jsx
│   ├── App.jsx
│   ├── ConfiguratorApp.jsx
│   └── components/
│
└── Dokumentation/
    ├── STAGING_SETUP_DOCUMENTATION.md  # Diese Datei
    ├── STAGING_USAGE.md                # Team Workflow
    ├── COOLIFY_SETUP_GUIDE.md          # Coolify Anleitung
    └── README_DEPLOYMENT.md            # Production Deployment
```

---

## 🔄 Deployment-Workflow

### Initialer Deployment (bereits durchgeführt)

✅ **Schritt 1:** Repository klonen
```bash
git clone -b staging https://github.com/Hacklerflow/Roots-Systemplaner.git
cd Roots-Systemplaner
```

✅ **Schritt 2:** Environment konfigurieren
```bash
# .env Datei erstellt mit allen Secrets
```

✅ **Schritt 3:** Docker Compose starten
```bash
docker compose up -d --build
```

✅ **Status:** Live seit 6. März 2026, 07:35 UTC

---

## 🔧 Updates & Maintenance

### Code-Updates deployen

**Wenn neue Änderungen im staging Branch gepusht wurden:**

```bash
# 1. SSH zum Server
ssh root@89.167.56.131

# 2. Ins Projekt-Verzeichnis
cd ~/Roots-Systemplaner

# 3. Aktuellen Status sichern (optional)
docker compose ps > deployment_backup_$(date +%Y%m%d_%H%M%S).txt

# 4. Code vom Git pullen
git pull origin staging

# 5. Container neu bauen und starten
docker compose up -d --build

# 6. Status prüfen
docker compose ps
docker compose logs --tail=50

# 7. Health Check
curl http://89.167.56.131/health
```

**Erwartete Downtime:** 1-2 Minuten während Rebuild

---

### Rollback bei Problemen

**Wenn ein Deployment fehlschlägt:**

```bash
# 1. Zu vorherigem Commit zurück
git log --oneline
git reset --hard <COMMIT_HASH>

# 2. Container neu starten
docker compose up -d --build

# 3. Prüfen
docker compose ps
```

**Oder: Spezifischen Commit deployen:**
```bash
git checkout <COMMIT_HASH>
docker compose up -d --build
```

---

## 📊 Monitoring & Logs

### Health Checks

**Automatisches Monitoring einrichten (optional):**
```bash
# Cron Job für Health Checks
crontab -e

# Füge hinzu:
*/5 * * * * curl -sf http://89.167.56.131/health || echo "Staging down!" | mail -s "Alert: Staging Health Check Failed" admin@rootsenergy.com
```

### Log-Management

**Live-Logs beobachten:**
```bash
# Alle Services
docker compose logs -f

# Nur Fehler
docker compose logs | grep -i error

# Nur bestimmten Service
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f postgres
```

**Logs speichern:**
```bash
# Logs in Datei schreiben
docker compose logs > logs_$(date +%Y%m%d_%H%M%S).txt
```

### Container-Ressourcen überwachen

```bash
# Echtzeit-Statistiken
docker stats

# Disk Usage
docker system df

# Container inspect
docker compose ps
docker inspect roots-backend
```

---

## 💾 Backup-Strategie

### Datenbank-Backup

**Manuelles Backup:**
```bash
# Backup erstellen
docker compose exec -T postgres pg_dump -U postgres roots_configurator_staging > backup_staging_$(date +%Y%m%d).sql

# Backup herunterladen (auf lokalem Rechner)
scp root@89.167.56.131:~/Roots-Systemplaner/backup_*.sql ./backups/
```

**Automatisches Backup (Cron):**
```bash
# Crontab editieren
crontab -e

# Tägliches Backup um 3 Uhr nachts
0 3 * * * cd /root/Roots-Systemplaner && docker compose exec -T postgres pg_dump -U postgres roots_configurator_staging > backup_staging_$(date +\%Y\%m\%d).sql

# Alte Backups löschen (älter als 7 Tage)
0 4 * * * find /root/Roots-Systemplaner/backup_*.sql -mtime +7 -delete
```

### Backup wiederherstellen

```bash
# Restore von Backup
cat backup_staging_20260306.sql | docker compose exec -T postgres psql -U postgres roots_configurator_staging
```

---

## 🔥 Troubleshooting

### Problem: Container startet nicht

**Diagnose:**
```bash
# Container Status
docker compose ps

# Logs checken
docker compose logs <service-name>

# Häufige Fehler:
# - Port bereits belegt: sudo lsof -i :80
# - Out of Memory: free -h
# - Disk voll: df -h
```

**Lösung:**
```bash
# Container neu starten
docker compose restart <service-name>

# Oder: Kompletter Neustart
docker compose down
docker compose up -d --build
```

---

### Problem: Frontend zeigt Fehler

**Diagnose:**
```bash
# Frontend Logs
docker compose logs frontend --tail=100

# nginx Konfiguration testen
docker compose exec frontend nginx -t

# Browser Console öffnen (F12) und Fehler checken
```

**Häufige Ursachen:**
- API-URL falsch (VITE_API_URL in .env prüfen)
- CORS-Problem (CORS_ORIGIN in .env prüfen)
- Build-Fehler (docker compose logs frontend)

---

### Problem: Backend antwortet nicht

**Diagnose:**
```bash
# Backend Logs
docker compose logs backend --tail=100

# Backend Health direkt im Container
docker compose exec backend curl http://localhost:3001/health

# Environment Variables prüfen
docker compose exec backend env | grep -E 'DB_|JWT_|CORS'
```

**Häufige Ursachen:**
- Datenbank-Verbindung (DB_PASSWORD falsch)
- JWT_SECRET fehlt
- Port 3001 blockiert

---

### Problem: Datenbank-Verbindung fehlgeschlagen

**Diagnose:**
```bash
# PostgreSQL Status
docker compose ps postgres

# In DB einloggen
docker compose exec postgres psql -U postgres roots_configurator_staging

# Tables anzeigen
\dt

# Connection von Backend testen
docker compose exec backend node -e "console.log(process.env.DB_PASSWORD)"
```

**Lösung:**
```bash
# Database neu initialisieren (VORSICHT: Löscht Daten!)
docker compose down -v
docker compose up -d --build
```

---

## 🔒 Security Best Practices

### ✅ Bereits implementiert:

- ✅ Separate Credentials für Staging (nicht Production)
- ✅ Strong Secrets (32+ Zeichen)
- ✅ .env nicht in Git committed (.gitignore)
- ✅ Isolierter Server (separates Staging-System)
- ✅ Health Checks aktiviert
- ✅ Container mit Restart-Policy

### 🔐 Zusätzliche Empfehlungen:

**Firewall konfigurieren:**
```bash
# UFW Firewall
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw enable
sudo ufw status
```

**Fail2Ban für SSH-Schutz:**
```bash
sudo apt install fail2ban -y
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

**SSL/HTTPS (falls Domain vorhanden):**
```bash
# Let's Encrypt
sudo apt install certbot -y
sudo certbot certonly --standalone -d staging.yourdomain.com
```

---

## 🚀 Performance-Optimierung

### Container-Ressourcen limitieren

**docker-compose.yml anpassen:**
```yaml
services:
  postgres:
    # ... existing config
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 1G

  backend:
    # ... existing config
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M

  frontend:
    # ... existing config
    deploy:
      resources:
        limits:
          cpus: '0.25'
          memory: 256M
```

### nginx Caching optimieren

Bereits in `nginx.conf` konfiguriert:
- Gzip Compression ✓
- Static Assets Caching (1 Jahr) ✓
- Security Headers ✓

---

## 📈 Nächste Schritte

### Empfohlene Verbesserungen:

1. **CI/CD Pipeline**
   - GitHub Actions Workflow für automatisches Deployment
   - Webhook von GitHub zu Server
   - Automatische Tests vor Deployment

2. **Monitoring**
   - Uptime Monitoring (UptimeRobot)
   - Error Tracking (Sentry.io)
   - Log Aggregation (Loki + Grafana)

3. **Backups**
   - Automatische tägliche DB-Backups
   - Offsite-Storage (S3, Backblaze)
   - Backup-Restore-Tests

4. **Domain & SSL**
   - Subdomain einrichten: staging.rootsenergy.com
   - Let's Encrypt SSL-Zertifikat
   - HTTPS erzwingen

5. **Load Testing**
   - Performance-Tests mit k6 oder Artillery
   - Identifizierung von Bottlenecks

---

## 🆘 Support & Kontakt

**Bei Problemen:**
1. Logs checken: `docker compose logs -f`
2. Health Checks: `curl http://89.167.56.131/health`
3. Container Status: `docker compose ps`
4. Diese Dokumentation konsultieren

**Ressourcen:**
- GitHub Repository: https://github.com/Hacklerflow/Roots-Systemplaner
- Branch: staging
- Docker Docs: https://docs.docker.com
- Docker Compose: https://docs.docker.com/compose/

---

## 📝 Changelog

### 2026-03-06 - Initial Staging Setup
- ✅ Staging Branch erstellt
- ✅ Environment Variables konfiguriert
- ✅ Docker Compose auf Server deployed (89.167.56.131)
- ✅ Alle Container laufen (postgres, backend, frontend)
- ✅ Health Checks erfolgreich
- ✅ Dokumentation erstellt

### Offene Punkte
- ⏳ "Endpoint not found" Fehler im Frontend debuggen
- ⏳ CORS/API-Konfiguration final prüfen
- ⏳ Erste funktionale Tests durchführen

---

## 🎯 Quick Reference

**Staging URLs:**
```
Frontend:    http://89.167.56.131
API:         http://89.167.56.131/api
Health:      http://89.167.56.131/health
```

**SSH:**
```bash
ssh root@89.167.56.131
cd ~/Roots-Systemplaner
```

**Docker Commands:**
```bash
docker compose ps              # Status
docker compose logs -f         # Logs
docker compose restart         # Restart
docker compose up -d --build   # Rebuild & Start
```

**Update Workflow:**
```bash
git pull origin staging
docker compose up -d --build
docker compose logs --tail=50
```

---

**Made with ❤️ for Roots Energy**
**Deployment Status:** 🟢 Live
**Last Updated:** 6. März 2026
