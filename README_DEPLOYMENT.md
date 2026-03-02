# 🚀 Deployment Guide - Roots Configurator

Komplette Anleitung für das Deployment auf einem Hetzner Server mit Docker.

---

## 📋 Voraussetzungen

### Auf deinem Hetzner Server:
- Ubuntu 22.04 LTS (empfohlen)
- Root-Zugriff oder sudo
- Mindestens 2GB RAM
- 20GB Speicher

### Auf deinem lokalen Rechner:
- Git
- SSH-Zugriff zum Server

---

## 🔧 1. Server Setup

### 1.1 SSH-Verbindung herstellen

```bash
ssh root@your-server-ip
```

### 1.2 System aktualisieren

```bash
apt update && apt upgrade -y
```

### 1.3 Docker installieren

```bash
# Docker installieren
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Docker Compose installieren
apt install docker-compose-plugin -y

# Prüfen
docker --version
docker compose version
```

### 1.4 Non-root User erstellen (optional, empfohlen)

```bash
# User erstellen
adduser roots

# Zu sudo-Gruppe hinzufügen
usermod -aG sudo roots
usermod -aG docker roots

# Zu diesem User wechseln
su - roots
```

---

## 📦 2. Code auf Server deployen

### 2.1 Repository klonen

```bash
cd ~
git clone https://github.com/YourUsername/roots-configurator.git
cd roots-configurator
```

**Oder:** Code per SCP hochladen:

```bash
# Auf lokalem Rechner:
cd /Users/florianhackl-kohlweiss/AI\ Workspace/
tar -czf roots-configurator.tar.gz roots-configurator/
scp roots-configurator.tar.gz root@your-server-ip:~/

# Auf Server:
tar -xzf roots-configurator.tar.gz
cd roots-configurator
```

### 2.2 Environment Variables konfigurieren

```bash
# Production .env erstellen
cp .env.production .env

# Editieren
nano .env
```

**Wichtig:** Setze folgende Werte:

```bash
# Starkes Passwort generieren
DB_PASSWORD=$(openssl rand -base64 32)

# JWT Secret generieren
JWT_SECRET=$(openssl rand -base64 32)

# Domain setzen (später mit SSL)
CORS_ORIGIN=https://yourdomain.com
VITE_API_URL=https://yourdomain.com/api
```

Speichern: `Ctrl+O`, `Enter`, `Ctrl+X`

---

## 🐳 3. Docker Container starten

### 3.1 Build & Start

```bash
# Alle Container bauen und starten
docker compose up -d --build
```

Das startet:
- PostgreSQL Datenbank
- Backend API
- Frontend (nginx)

### 3.2 Status prüfen

```bash
# Container-Status
docker compose ps

# Logs anschauen
docker compose logs -f

# Nur Backend-Logs
docker compose logs -f backend

# Nur Frontend-Logs
docker compose logs -f frontend
```

### 3.3 Datenbank initialisieren

```bash
# In Backend-Container einloggen
docker compose exec backend sh

# Datenbank initialisieren (falls nicht automatisch passiert)
npm run init-db

# Container verlassen
exit
```

---

## 🌐 4. Domain & SSL Setup

### 4.1 Domain konfigurieren

**Bei deinem Domain-Provider (z.B. Namecheap, GoDaddy):**

Erstelle einen A-Record:
```
Type: A
Host: @ (oder www)
Value: YOUR_SERVER_IP
TTL: Auto
```

Warte ~10 Minuten für DNS-Propagierung.

### 4.2 Firewall konfigurieren

```bash
# UFW Firewall aktivieren
sudo ufw allow 22/tcp     # SSH
sudo ufw allow 80/tcp     # HTTP
sudo ufw allow 443/tcp    # HTTPS
sudo ufw enable

# Status prüfen
sudo ufw status
```

### 4.3 SSL mit Let's Encrypt

```bash
# Certbot installieren
sudo apt install certbot python3-certbot-nginx -y

# Container stoppen (kurz, für Certbot)
docker compose down

# SSL-Zertifikat erstellen
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Container wieder starten
docker compose up -d
```

### 4.4 nginx für SSL konfigurieren

Erstelle `nginx-ssl.conf`:

```bash
nano nginx-ssl.conf
```

Inhalt:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    root /usr/share/nginx/html;
    index index.html;

    # ... rest of your nginx.conf
}
```

**docker-compose.yml updaten** für SSL:

```yaml
  frontend:
    # ... existing config
    volumes:
      - ./nginx-ssl.conf:/etc/nginx/conf.d/default.conf
      - /etc/letsencrypt:/etc/letsencrypt:ro
    ports:
      - "80:80"
      - "443:443"
```

Neu starten:

```bash
docker compose down
docker compose up -d
```

---

## 🧪 5. Testen

### 5.1 Health Checks

```bash
# Backend Health
curl http://localhost:3001/health

# Frontend Health
curl http://localhost/health
```

### 5.2 Im Browser

1. Öffne `https://yourdomain.com`
2. Registriere einen User
3. Erstelle ein Projekt
4. Teste den Konfigurator

---

## 🔄 6. Updates deployen

### 6.1 Code aktualisieren

```bash
cd ~/roots-configurator

# Code pullen
git pull origin main

# Oder: Neue Version hochladen
# scp roots-configurator.tar.gz root@server:~/
# tar -xzf roots-configurator.tar.gz
```

### 6.2 Rebuild & Restart

```bash
# Neu bauen und starten
docker compose up -d --build

# Alte Images aufräumen
docker system prune -a
```

---

## 💾 7. Backup & Restore

### 7.1 Datenbank Backup

```bash
# Backup erstellen
docker compose exec postgres pg_dump -U postgres roots_configurator > backup_$(date +%Y%m%d).sql

# Auf lokalen Rechner kopieren
scp root@server:~/roots-configurator/backup_*.sql ./backups/
```

**Automatisches Backup (Cron):**

```bash
# Crontab editieren
crontab -e

# Tägliches Backup um 2 Uhr nachts
0 2 * * * cd ~/roots-configurator && docker compose exec -T postgres pg_dump -U postgres roots_configurator > backup_$(date +\%Y\%m\%d).sql
```

### 7.2 Restore

```bash
# Backup einspielen
cat backup_20260302.sql | docker compose exec -T postgres psql -U postgres roots_configurator
```

---

## 🔍 8. Monitoring & Logs

### 8.1 Container Logs

```bash
# Alle Logs live
docker compose logs -f

# Nur letzte 100 Zeilen
docker compose logs --tail=100

# Nur Backend Errors
docker compose logs backend | grep ERROR
```

### 8.2 Resource Usage

```bash
# Container Stats
docker stats

# Disk Usage
docker system df
```

### 8.3 Health Checks

```bash
# Alle Container Health
docker compose ps

# Automatisches Monitoring (optional)
# -> Uptime Kuma installieren
# -> Prometheus + Grafana
```

---

## 🛡️ 9. Security Best Practices

### 9.1 Firewall

```bash
# Nur notwendige Ports offen
sudo ufw status
```

### 9.2 Fail2Ban (SSH-Schutz)

```bash
sudo apt install fail2ban -y
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 9.3 Regelmäßige Updates

```bash
# System Updates
sudo apt update && sudo apt upgrade -y

# Docker Images updaten
docker compose pull
docker compose up -d
```

### 9.4 Sichere Secrets

- **Niemals** `.env` in Git committen
- Starke Passwörter verwenden (min. 32 Zeichen)
- JWT_SECRET regelmäßig rotieren

---

## 🐛 10. Troubleshooting

### Container startet nicht

```bash
# Logs checken
docker compose logs backend

# Container Status
docker compose ps

# Manuell starten für Debugging
docker compose up backend
```

### Datenbank-Verbindung fehlgeschlagen

```bash
# PostgreSQL läuft?
docker compose ps postgres

# In DB einloggen
docker compose exec postgres psql -U postgres roots_configurator

# Connection testen
docker compose exec backend node -e "require('./src/config/database.js')"
```

### Frontend zeigt "API Error"

```bash
# Backend erreichbar?
curl http://localhost:3001/health

# nginx Config testen
docker compose exec frontend nginx -t

# CORS-Einstellungen prüfen
echo $CORS_ORIGIN
```

### Port bereits belegt

```bash
# Welcher Prozess nutzt Port 80?
sudo lsof -i :80

# Prozess beenden
sudo kill -9 PID
```

### SSL-Zertifikat erneuern

```bash
# Certbot Dry-Run
sudo certbot renew --dry-run

# Automatische Erneuerung (Cron)
0 0 1 * * sudo certbot renew --quiet && docker compose restart frontend
```

---

## 📊 11. Performance Tuning

### 11.1 PostgreSQL Tuning

```bash
# In docker-compose.yml unter postgres:
environment:
  POSTGRES_SHARED_BUFFERS: 256MB
  POSTGRES_MAX_CONNECTIONS: 100
```

### 11.2 nginx Caching

Bereits in `nginx.conf` konfiguriert:
- Static Assets: 1 Jahr Cache
- Gzip Compression: aktiv

### 11.3 Node.js PM2 (optional)

Für mehr Stabilität:

```dockerfile
# In backend/Dockerfile
RUN npm install -g pm2
CMD ["pm2-runtime", "start", "src/server.js"]
```

---

## 🎯 12. Next Steps

Nach erfolgreichem Deployment:

1. **Monitoring einrichten**
   - Uptime Kuma
   - Sentry für Error Tracking
   - Google Analytics (optional)

2. **Backup-Strategie**
   - Tägliche DB-Backups
   - Offsite Storage (S3, Backblaze)

3. **CI/CD** (optional)
   - GitHub Actions für automatisches Deployment
   - Webhook bei Push

4. **Skalierung** (bei Bedarf)
   - Load Balancer
   - Mehrere Backend-Instanzen
   - Read Replicas für DB

---

## 📞 Support

Bei Problemen:
1. Logs checken: `docker compose logs -f`
2. Health Checks: `curl http://localhost:3001/health`
3. GitHub Issues erstellen

---

**Made with ❤️ for Roots Energy**

**Deployment Checkliste:**
- [ ] Server mit Docker setup
- [ ] Code deployed
- [ ] .env konfiguriert
- [ ] Container laufen
- [ ] Domain konfiguriert
- [ ] SSL aktiviert
- [ ] Backup eingerichtet
- [ ] Monitoring setup
- [ ] Erster User registriert
- [ ] Erstes Projekt erstellt ✅
