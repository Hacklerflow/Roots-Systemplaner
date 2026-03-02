# ⚡ Quick Start Deployment

Schnelle Anleitung für Deployment auf Hetzner Server.

---

## 🎯 In 10 Minuten live!

### 1️⃣ Server vorbereiten (einmalig)

```bash
# SSH zum Server
ssh root@your-server-ip

# Docker installieren
curl -fsSL https://get.docker.com | sh
apt install docker-compose-plugin -y

# Firewall
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

### 2️⃣ Code auf Server

```bash
# Projekt hochladen
cd /Users/florianhackl-kohlweiss/AI\ Workspace/
tar -czf roots-configurator.tar.gz roots-configurator/
scp roots-configurator.tar.gz root@your-server-ip:~/

# Auf Server entpacken
ssh root@your-server-ip
tar -xzf roots-configurator.tar.gz
cd roots-configurator
```

### 3️⃣ Konfigurieren

```bash
# .env erstellen
cp .env.production .env

# Secrets generieren
echo "DB_PASSWORD=$(openssl rand -base64 32)"
echo "JWT_SECRET=$(openssl rand -base64 32)"

# .env editieren mit generierten Werten
nano .env
```

### 4️⃣ Starten

```bash
# Mit Deploy-Script (empfohlen)
./deploy.sh

# ODER manuell:
docker compose up -d --build
docker compose exec backend npm run init-db
```

### 5️⃣ Testen

```bash
# Health Checks
curl http://localhost:3001/health  # Backend
curl http://localhost/health       # Frontend

# Im Browser öffnen
# http://your-server-ip
```

---

## 🌐 Optional: Domain & SSL

### Domain einrichten

1. Bei Domain-Provider A-Record erstellen:
   - Type: A
   - Host: @
   - Value: YOUR_SERVER_IP

2. SSL-Zertifikat (Let's Encrypt):

```bash
# Certbot installieren
apt install certbot python3-certbot-nginx -y

# Container kurz stoppen
docker compose down

# Zertifikat erstellen
certbot certonly --standalone -d yourdomain.com

# Container wieder starten
docker compose up -d
```

3. `.env` updaten:

```bash
CORS_ORIGIN=https://yourdomain.com
VITE_API_URL=https://yourdomain.com/api
```

4. Neu starten:

```bash
./deploy.sh
```

---

## 🔄 Updates deployen

```bash
# Code aktualisieren
cd ~/roots-configurator
# Neue Version hochladen oder git pull

# Neu starten
./deploy.sh
```

---

## 💾 Backup

```bash
# Manuelles Backup
docker compose exec postgres pg_dump -U postgres roots_configurator > backup.sql

# Automatisches Backup (täglich 2 Uhr)
crontab -e
# Hinzufügen:
0 2 * * * cd ~/roots-configurator && docker compose exec -T postgres pg_dump -U postgres roots_configurator > backup_$(date +\%Y\%m\%d).sql
```

---

## 🐛 Troubleshooting

```bash
# Logs anschauen
docker compose logs -f

# Container Status
docker compose ps

# Neu starten
docker compose restart

# Alles neu bauen
docker compose down
docker compose up -d --build
```

---

## ✅ Checkliste

- [ ] Server mit Docker setup
- [ ] Code hochgeladen
- [ ] `.env` konfiguriert (DB_PASSWORD, JWT_SECRET)
- [ ] `./deploy.sh` ausgeführt
- [ ] Health Checks OK
- [ ] Im Browser getestet
- [ ] Domain konfiguriert (optional)
- [ ] SSL aktiviert (optional)
- [ ] Backup eingerichtet

---

**Vollständige Anleitung:** Siehe `README_DEPLOYMENT.md`
