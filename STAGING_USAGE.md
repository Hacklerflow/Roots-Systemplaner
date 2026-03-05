# 🧪 Staging-Umgebung - Roots Configurator

Professionelles Staging-System für Testing und QA vor Production-Deployment.

---

## 📍 Zugriff

- **Frontend URL:** `http://YOUR_HETZNER_IP:PORT`
- **Backend API:** `http://YOUR_HETZNER_IP:PORT/api`
- **Backend Health:** `http://YOUR_HETZNER_IP:PORT/api/health`
- **Frontend Health:** `http://YOUR_HETZNER_IP:PORT/health`
- **Environment:** Staging (isolierte Datenbank, separate Credentials)
- **Deployment:** Automatisch via Coolify bei Push zu `staging` Branch

> **Hinweis:** Die IP-Adresse und Port werden nach Coolify-Deployment bereitgestellt.

---

## 🔄 Entwicklungs-Workflow

### 1. Feature entwickeln

```bash
# Vom staging Branch starten
git checkout staging
git pull origin staging

# Feature-Branch erstellen
git checkout -b feature/neue-funktion

# Entwickeln und lokal testen
npm run dev  # Frontend
# oder
docker compose up  # Lokal mit Docker

# Committen
git add .
git commit -m "feat: Neue Funktion implementiert"
git push origin feature/neue-funktion
```

### 2. Pull Request zu Staging

1. Öffne GitHub: https://github.com/Hacklerflow/Roots-Systemplaner
2. Erstelle Pull Request: `feature/neue-funktion` → `staging`
3. Review durchführen
4. Merge in `staging` Branch

**→ Automatisches Deployment startet!**

### 3. Testing auf Staging

Nach dem Merge:

1. **Deployment beobachten:**
   - Coolify UI öffnen
   - Logs-Tab → Live-Deployment-Logs
   - Warten bis "Deployment successful" (1-2 Minuten)

2. **Staging-URL öffnen:**
   ```
   http://YOUR_HETZNER_IP:PORT
   ```

3. **Feature testen:**
   - Funktionalität durchgehen
   - Edge Cases prüfen
   - Browser-Konsole checken
   - API-Calls validieren

4. **Bei Problemen:**
   - Logs in Coolify UI checken
   - Fix committen und pushen (auto-redeploy)
   - Oder Rollback durchführen (siehe unten)

### 4. Production-Deployment

Wenn Staging-Tests erfolgreich:

```bash
# Pull Request zu main erstellen
git checkout staging
git pull origin staging
# GitHub UI: staging → main PR erstellen

# Nach Review und Approval:
# - Merge in main
# - Production Deployment (manuell oder via Webhook)
```

---

## 🔍 Monitoring & Logs

### Deployment-Logs (Coolify)

1. Coolify UI öffnen: `http://HETZNER_IP:8000`
2. App auswählen: "Roots Configurator Staging"
3. Tab: **Logs**
4. Live-Stream oder historische Logs anschauen

### Container-Logs

```bash
# SSH zum Hetzner Server
ssh root@YOUR_HETZNER_IP

# Container finden
docker ps | grep roots

# Logs anschauen
docker logs -f <container_id>

# Alle Logs (postgres, backend, frontend)
docker compose logs -f
```

### Health Checks

```bash
# Backend Health Check
curl http://YOUR_HETZNER_IP:PORT/api/health

# Erwartete Response:
{
  "status": "healthy",
  "timestamp": "2026-03-05T...",
  "uptime": 12345,
  "database": "connected"
}

# Frontend Health Check
curl http://YOUR_HETZNER_IP:PORT/health

# Erwartete Response:
{"status":"ok"}
```

---

## ⏪ Rollback bei Problemen

### Option 1: Über Coolify UI (Schnell)

1. Coolify UI → "Roots Configurator Staging"
2. Tab: **Deployments**
3. Vorherige erfolgreiche Deployment auswählen
4. Button: **Redeploy**
5. Warten bis Rollback abgeschlossen

### Option 2: Git Revert (Permanent)

```bash
# Problematischen Commit finden
git log --oneline

# Commit rückgängig machen
git revert <commit-hash>
git push origin staging

# Coolify deployt automatisch den Revert
```

### Option 3: Force-Push zu vorherigem Stand (Vorsicht!)

```bash
# Nur in Notfällen!
git reset --hard <good-commit-hash>
git push --force origin staging

# Achtung: Commits gehen verloren!
```

---

## 🧪 Testing-Checkliste

Nach jedem Staging-Deployment:

### Basis-Funktionalität
- [ ] Frontend lädt ohne Fehler
- [ ] User-Registrierung funktioniert
- [ ] Login funktioniert
- [ ] Logout funktioniert

### Konfigurator
- [ ] Neues Projekt erstellen
- [ ] Projekt bearbeiten
- [ ] Projekt laden
- [ ] Projekt löschen
- [ ] Module hinzufügen
- [ ] Leitungen konfigurieren
- [ ] Druckverlust-Berechnung

### API
- [ ] `/api/health` → 200 OK
- [ ] `/api/auth/login` → JWT Token
- [ ] `/api/projects` → Projektliste
- [ ] CORS funktioniert (keine Browser-Errors)

### Performance
- [ ] Initial Load < 3 Sekunden
- [ ] API Response < 500ms
- [ ] Keine Memory Leaks (nach längerem Nutzen)

---

## 🔐 Test-Credentials

**Standard Test-User:**
```
Email: test@staging.local
Password: staging123
```

> **Wichtig:** Passwort nach erstem Login ändern!

**Neuen Test-User erstellen:**
```bash
# Via Registrierungs-Formular oder direkt in DB:
docker compose exec postgres psql -U postgres roots_configurator_staging

INSERT INTO users (email, password_hash, created_at)
VALUES ('test2@staging.local', '$2b$10$...', NOW());
```

---

## 🐛 Troubleshooting

### Problem: "Cannot connect to backend"

**Lösung:**
```bash
# 1. Backend läuft?
curl http://YOUR_HETZNER_IP:PORT/api/health

# 2. CORS richtig konfiguriert?
# In Coolify UI: Environment Variables → CORS_ORIGIN prüfen

# 3. Backend-Logs checken
# Coolify UI → Logs → Backend Container
```

### Problem: "Database connection failed"

**Lösung:**
```bash
# 1. PostgreSQL Container läuft?
docker ps | grep postgres

# 2. DB Credentials korrekt?
# Coolify UI → Environment Variables prüfen

# 3. In DB einloggen testen
docker compose exec postgres psql -U postgres roots_configurator_staging
```

### Problem: "Container restart loop"

**Lösung:**
```bash
# 1. Logs checken für Fehler
docker logs <container-id>

# 2. Health Check Timeout?
# docker-compose.yml → healthcheck interval/timeout prüfen

# 3. Rebuild mit Clean Slate
# Coolify UI → Rebuild
```

### Problem: "Deployment stuck"

**Lösung:**
```bash
# 1. Coolify Logs checken
# UI → Logs → Deployment Logs

# 2. Server-Ressourcen prüfen
ssh root@HETZNER_IP
docker stats  # RAM/CPU Nutzung
df -h         # Disk Space

# 3. Deployment abbrechen und neu starten
# Coolify UI → Cancel → Redeploy
```

---

## 📊 Unterschiede Staging vs. Production

| Aspekt | Production | Staging |
|--------|-----------|---------|
| **Server** | Hostinger (72.60.37.185) | Hetzner (Coolify) |
| **Branch** | `main` | `staging` |
| **Deployment** | Manuell (GitHub Actions) | Automatisch (Coolify Webhook) |
| **URL** | Domain mit HTTPS | IP-Adresse (HTTP) |
| **Datenbank** | `roots_configurator` | `roots_configurator_staging` |
| **Secrets** | Production-Credentials | Separate Staging-Credentials |
| **Testing** | End-Users | Entwickler/QA |
| **Downtime** | Kritisch vermeiden | OK für Testing |

---

## 🚀 Erweiterte Features

### Automatische E2E Tests (Zukünftig)

```yaml
# .github/workflows/staging-tests.yml
name: Staging E2E Tests

on:
  push:
    branches: [staging]

jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install Dependencies
        run: npm ci
      - name: Run Playwright Tests
        run: npm run test:e2e
        env:
          BASE_URL: http://YOUR_HETZNER_IP:PORT
```

### Slack-Benachrichtigungen

Coolify kann Webhooks zu Slack senden:
1. Coolify UI → Settings → Notifications
2. Slack Webhook URL eintragen
3. Events auswählen: Deployment Success/Failure

---

## 📞 Support & Kontakt

**Bei Problemen:**
1. Logs checken (Coolify UI)
2. Health Checks durchführen
3. Troubleshooting-Sektion durchgehen
4. Team-Chat (Slack/Discord/etc.)
5. GitHub Issue erstellen

**Nützliche Links:**
- GitHub Repository: https://github.com/Hacklerflow/Roots-Systemplaner
- Coolify Docs: https://coolify.io/docs
- Production Deployment Guide: `README_DEPLOYMENT.md`

---

**Made with ❤️ for Roots Energy Development Team**

**Version:** 1.0
**Last Updated:** März 2026
**Maintainer:** Roots Development Team
