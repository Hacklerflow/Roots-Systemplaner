# 🚀 Coolify Setup-Anleitung - Roots Configurator Staging

Diese Anleitung führt Sie Schritt-für-Schritt durch die Konfiguration des Staging-Systems in Coolify.

---

## ✅ Voraussetzungen

Bevor Sie beginnen, stellen Sie sicher:

- [x] Coolify ist auf Ihrem Hetzner Server installiert
- [x] Sie haben Zugriff zur Coolify UI: `http://HETZNER_IP:8000`
- [x] Staging Branch wurde zu GitHub gepusht
- [x] `.env.staging` Datei mit generierten Secrets liegt vor

---

## 📋 Schritt-für-Schritt Setup

### Schritt 1: Coolify UI öffnen

1. Browser öffnen: `http://YOUR_HETZNER_IP:8000`
2. Mit Ihren Coolify-Credentials einloggen
3. Zum Dashboard navigieren

---

### Schritt 2: Neue Resource erstellen

1. **Klicken Sie auf:** `+ New Resource`
2. **Wählen Sie:** `Docker Compose`
3. **Name eingeben:** `Roots Configurator Staging`
4. **Klicken Sie:** `Continue`

---

### Schritt 3: Git Source konfigurieren

#### Git Repository verbinden:

1. **Source Type:** `Git`
2. **Git Provider:** `GitHub`
3. **Repository URL:**
   ```
   https://github.com/Hacklerflow/Roots-Systemplaner.git
   ```

4. **Branch:** `staging`
5. **Auto-Deploy:** ✅ **ENABLED** (Haken setzen!)
   - Das aktiviert automatisches Deployment bei Git Push

6. **Docker Compose Location:**
   ```
   docker-compose.yml
   ```
   (Root-Verzeichnis, Standard-Name)

7. **Klicken Sie:** `Save`

---

### Schritt 4: Environment Variables konfigurieren

**Wichtig:** Kopieren Sie die Werte aus Ihrer `.env.staging` Datei!

1. **Navigieren Sie zu:** `Settings` → `Environment Variables`
2. **Klicken Sie:** `+ Add Variable`
3. **Tragen Sie JEDE Variable einzeln ein:**

#### Datenbank-Variablen:
```
Name: DB_NAME
Value: roots_configurator_staging
```

```
Name: DB_USER
Value: postgres
```

```
Name: DB_PASSWORD
Value: [IHR_GENERIERTES_PASSWORT_AUS_.env.staging]
```

#### JWT-Variablen:
```
Name: JWT_SECRET
Value: [IHR_GENERIERTES_SECRET_AUS_.env.staging]
```

```
Name: JWT_EXPIRES_IN
Value: 7d
```

#### Server-Variablen:
```
Name: NODE_ENV
Value: staging
```

```
Name: PORT
Value: 80
```

#### CORS & Frontend:
```
Name: CORS_ORIGIN
Value: http://YOUR_HETZNER_IP
```
**→ WICHTIG:** Ersetzen Sie `YOUR_HETZNER_IP` mit Ihrer echten IP!

```
Name: VITE_API_URL
Value: http://YOUR_HETZNER_IP/api
```
**→ WICHTIG:** Ersetzen Sie `YOUR_HETZNER_IP` mit Ihrer echten IP!

4. **Klicken Sie:** `Save` nach jeder Variable

---

### Schritt 5: Network & Ports konfigurieren

1. **Navigieren Sie zu:** `Settings` → `Domains & Ports`

2. **Port Configuration:**
   - **Type:** `Port` (nicht Domain, da Sie keine Domain verwenden)
   - **Container Port:** `80`
   - **Published Port:** `8080` (oder ein anderer freier Port)
   - **Public:** ✅ Enabled

3. **SSL/TLS:** ❌ **DISABLED** (da keine Domain)

4. **Klicken Sie:** `Save`

> **Hinweis:** Nach dem Setup ist Ihre App erreichbar unter:
> `http://YOUR_HETZNER_IP:8080`

---

### Schritt 6: Health Checks konfigurieren (Optional)

1. **Navigieren Sie zu:** `Settings` → `Health Checks`

2. **Frontend Health Check:**
   - **Endpoint:** `/health`
   - **Expected Status:** `200`
   - **Interval:** `30s`

3. **Backend Health Check:**
   - **Endpoint:** `/api/health`
   - **Expected Status:** `200`
   - **Interval:** `30s`

4. **Klicken Sie:** `Save`

---

### Schritt 7: Erstes Deployment starten

1. **Navigieren Sie zu:** `Deployments` Tab
2. **Klicken Sie:** `Deploy`
3. **Logs beobachten:**
   - Coolify zeigt Live-Logs
   - Docker Compose wird ausgeführt
   - Container werden gebaut und gestartet

**Erwartete Build-Zeit:** 2-4 Minuten

**Erfolgreiche Deployment-Logs sollten zeigen:**
```
✓ postgres container started
✓ backend container started
✓ frontend container started
✓ All health checks passed
✓ Deployment successful
```

---

### Schritt 8: Deployment verifizieren

#### 1. Container Status prüfen:
In Coolify UI → Tab: **Containers**
- [ ] `postgres` - Status: Running (healthy)
- [ ] `backend` - Status: Running (healthy)
- [ ] `frontend` - Status: Running (healthy)

#### 2. Frontend testen:
```bash
# Im Browser öffnen:
http://YOUR_HETZNER_IP:8080
```
✅ Frontend sollte laden

#### 3. Backend Health Check:
```bash
curl http://YOUR_HETZNER_IP:8080/api/health
```
✅ Erwartete Response:
```json
{
  "status": "healthy",
  "timestamp": "2026-03-05T...",
  "uptime": 123,
  "database": "connected"
}
```

#### 4. Datenbank testen:
In Coolify UI → Container Terminal (postgres):
```bash
psql -U postgres roots_configurator_staging -c "\dt"
```
✅ Sollte alle Tables zeigen

---

### Schritt 9: GitHub Webhook aktivieren

Coolify generiert automatisch einen Webhook für Git-Deployments.

#### 1. Webhook URL kopieren:
1. Coolify UI → `Settings` → `Webhooks`
2. **Webhook URL kopieren**, z.B.:
   ```
   https://coolify.yourdomain.com/webhooks/abc123def456
   ```

#### 2. GitHub Webhook einrichten:
1. Öffnen Sie: https://github.com/Hacklerflow/Roots-Systemplaner/settings/hooks
2. Klicken Sie: `Add webhook`
3. **Payload URL:** [Ihre kopierte Webhook URL]
4. **Content type:** `application/json`
5. **Which events:** `Just the push event`
6. **Active:** ✅ Enabled
7. Klicken Sie: `Add webhook`

#### 3. Webhook testen:
```bash
# Kleine Änderung im staging Branch:
echo "# Test" >> README.md
git add README.md
git commit -m "test: Webhook test"
git push origin staging

# Coolify sollte automatisch neu deployen!
```

---

## 🎯 Fertig! Zusammenfassung

Sie haben erfolgreich konfiguriert:

- ✅ Coolify Resource "Roots Configurator Staging"
- ✅ Git Repository (staging Branch) verbunden
- ✅ Environment Variables gesetzt
- ✅ Ports/Netzwerk konfiguriert
- ✅ Erstes Deployment durchgeführt
- ✅ GitHub Webhook für Auto-Deployment

**Ihre Staging-Umgebung ist jetzt live:**
```
Frontend: http://YOUR_HETZNER_IP:8080
API:      http://YOUR_HETZNER_IP:8080/api
Health:   http://YOUR_HETZNER_IP:8080/health
```

---

## 🔄 Täglicher Workflow

### Entwicklung → Staging:

```bash
# 1. Feature entwickeln
git checkout -b feature/xyz staging
# ... Code ändern ...
git push origin feature/xyz

# 2. PR zu staging erstellen (GitHub UI)
# 3. Nach Merge: Coolify deployt automatisch!
# 4. Staging testen
# 5. Bei Erfolg: PR zu main (Production)
```

### Logs anschauen:
- Coolify UI → `Logs` Tab → Live-Stream

### Deployment Rollback:
- Coolify UI → `Deployments` → Vorherige Version auswählen → `Redeploy`

---

## 🛠️ Erweiterte Konfiguration (Optional)

### Notifications einrichten:

1. Coolify UI → `Settings` → `Notifications`
2. **Slack Webhook** (für Team-Benachrichtigungen):
   - Webhook URL von Slack eintragen
   - Events auswählen:
     - ✅ Deployment Started
     - ✅ Deployment Succeeded
     - ✅ Deployment Failed
3. Save

### Backup-Strategie:

1. **Automatische DB-Backups:**
   - Coolify UI → `Backups`
   - Schedule: `Daily at 02:00`
   - Retention: `7 days`
   - Destination: S3/Local

2. **Manuelles Backup:**
   ```bash
   # In Container Terminal:
   pg_dump -U postgres roots_configurator_staging > backup.sql
   ```

### Resource Limits setzen (für Shared Server):

1. Coolify UI → `Settings` → `Resources`
2. **Limits:**
   - postgres: 512MB RAM, 0.5 CPU
   - backend: 256MB RAM, 0.5 CPU
   - frontend: 128MB RAM, 0.25 CPU
3. Save

---

## 🐛 Häufige Probleme & Lösungen

### Problem: Build schlägt fehl

**Lösung:**
```
1. Logs checken: Coolify UI → Logs
2. Häufige Ursachen:
   - npm install fehler → package.json prüfen
   - Docker build timeout → Server-Ressourcen prüfen
   - Git clone fehler → Repository-Zugriff prüfen
3. Rebuild mit Clean Cache:
   Coolify UI → Force Rebuild (ohne Cache)
```

### Problem: Container startet nicht

**Lösung:**
```
1. Container Logs: Coolify UI → Logs → [Service auswählen]
2. Häufige Ursachen:
   - Port bereits belegt → Port ändern
   - Environment Variable fehlt → Settings prüfen
   - Health Check schlägt fehl → Timeout erhöhen
3. Container neu starten:
   Coolify UI → Restart Container
```

### Problem: Webhook funktioniert nicht

**Lösung:**
```
1. GitHub Webhook Deliveries prüfen:
   GitHub → Settings → Webhooks → Recent Deliveries
2. Coolify Webhook Logs:
   Coolify UI → Settings → Webhooks → Logs
3. Webhook URL neu generieren:
   Coolify UI → Settings → Webhooks → Regenerate
```

---

## 📞 Support

**Coolify Dokumentation:**
- Offizielle Docs: https://coolify.io/docs
- GitHub: https://github.com/coollabsio/coolify
- Discord Community: https://coolify.io/discord

**Projekt-spezifisch:**
- STAGING_USAGE.md - Team-Workflow-Dokumentation
- README_DEPLOYMENT.md - Production Deployment
- STAGING_SETUP_BRIEFING.md - Technische Details

---

**Viel Erfolg mit Ihrer Staging-Umgebung! 🚀**

**Version:** 1.0
**Datum:** März 2026
**Autor:** Roots Development Team
