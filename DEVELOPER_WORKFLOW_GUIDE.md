# 👨‍💻 Developer Workflow Guide - For Dummies

**Der komplette Guide wie Sie entwickeln, testen und deployen - Schritt für Schritt**

Version: 1.0
Stand: 6. März 2026
Für: Roots Configurator Projekt

---

## 🎯 Übersicht: Ihr Arbeitsablauf

```
1. Lokal entwickeln (Ihr Mac)
   ↓
2. Zu GitHub pushen
   ↓
3. Pull Request zu staging
   ↓
4. 🤖 Automatisches Deployment auf Staging (Hetzner)
   ↓
5. Auf Staging testen (http://89.167.56.131)
   ↓
6. Pull Request zu main (Production)
   ↓
7. 🤖 Automatisches Deployment auf Production (Hostinger)
```

---

## 📚 Inhaltsverzeichnis

1. [Tägliche Arbeit: Neues Feature entwickeln](#1-tägliche-arbeit-neues-feature-entwickeln)
2. [Bug fixen](#2-bug-fixen)
3. [Auf Staging testen](#3-auf-staging-testen)
4. [Zu Production deployen](#4-zu-production-deployen)
5. [Troubleshooting](#5-troubleshooting)
6. [FAQs](#6-faqs)

---

## 1. Tägliche Arbeit: Neues Feature entwickeln

### Schritt 1: Terminal öffnen und ins Projekt-Verzeichnis

```bash
# Terminal öffnen (⌘ + Space → "Terminal")
cd /Users/florianhackl-kohlweiss/AI\ Workspace/roots-configurator
```

**Was passiert:** Sie wechseln in Ihr Projekt-Verzeichnis.

---

### Schritt 2: staging Branch aktualisieren

```bash
# Zu staging Branch wechseln
git checkout staging

# Neueste Änderungen von GitHub holen
git pull origin staging
```

**Was passiert:** Sie holen die neuesten Änderungen von anderen Entwicklern oder vom Staging-Server.

**Erwarteter Output:**
```
Already on 'staging'
Already up to date.
```

---

### Schritt 3: Feature-Branch erstellen

```bash
# Neuen Branch für Ihr Feature erstellen
git checkout -b feature/beschreibung-des-features
```

**Beispiele für Branch-Namen:**
- `feature/user-profile`
- `feature/export-pdf`
- `feature/neue-berechnung`

**Was passiert:** Sie erstellen einen neuen Branch, wo Sie Ihr Feature entwickeln.

**Erwarteter Output:**
```
Switched to a new branch 'feature/beschreibung-des-features'
```

---

### Schritt 4: Feature entwickeln

**Öffnen Sie Ihren Code-Editor (z.B. VS Code):**

```bash
code .
```

**Entwickeln Sie Ihr Feature:**
- Code ändern
- Neue Dateien erstellen
- Lokal testen

**Lokal testen (optional):**
```bash
# Frontend starten
npm run dev

# Im Browser öffnen: http://localhost:5173
```

---

### Schritt 5: Änderungen committen

```bash
# Status checken - was hat sich geändert?
git status

# ALLE Änderungen zum Commit hinzufügen
git add .

# ODER: Nur bestimmte Dateien
git add src/components/MeineKomponente.jsx

# Commit erstellen mit aussagekräftiger Message
git commit -m "feat: Beschreibung was Sie gemacht haben"
```

**Commit Message Beispiele:**
- `feat: Add PDF export functionality`
- `fix: Resolve calculation error in pressure loss`
- `style: Improve button styling`
- `refactor: Clean up ConfiguratorEditor code`

**Erwarteter Output:**
```
[feature/mein-feature abc1234] feat: Beschreibung
 3 files changed, 42 insertions(+), 5 deletions(-)
```

---

### Schritt 6: Zu GitHub pushen

```bash
git push origin feature/beschreibung-des-features
```

**Was passiert:** Ihr Code wird zu GitHub hochgeladen.

**Erwarteter Output:**
```
Enumerating objects: 15, done.
Counting objects: 100% (15/15), done.
...
To https://github.com/Hacklerflow/Roots-Systemplaner.git
 * [new branch]      feature/beschreibung → feature/beschreibung
```

---

### Schritt 7: Pull Request erstellen (auf GitHub)

1. **Öffnen Sie GitHub:**
   ```
   https://github.com/Hacklerflow/Roots-Systemplaner
   ```

2. **Sie sehen einen gelben Banner:**
   ```
   feature/beschreibung-des-features had recent pushes
   [Compare & pull request]
   ```

3. **Klicken Sie:** "Compare & pull request"

4. **Pull Request konfigurieren:**
   - **Base:** `staging` ← **Compare:** `feature/beschreibung-des-features`
   - **Title:** Automatisch gefüllt (Ihre Commit-Message)
   - **Description:** Beschreiben Sie was das Feature macht

5. **Klicken Sie:** "Create pull request"

**Was passiert:** Ein Pull Request wird erstellt. Andere können Ihren Code reviewen.

---

### Schritt 8: Pull Request mergen

**Wenn keine Review nötig:**

1. **Auf der Pull Request Seite**
2. **Klicken Sie:** "Merge pull request"
3. **Klicken Sie:** "Confirm merge"

**Was passiert:** Ihr Code wird in den `staging` Branch gemergt.

---

### Schritt 9: Automatisches Deployment! 🤖

**ACHTUNG: Das passiert jetzt automatisch!**

1. **GitHub Actions startet automatisch**
2. **Sie können es beobachten:**
   ```
   https://github.com/Hacklerflow/Roots-Systemplaner/actions
   ```

3. **Der Workflow macht:**
   - SSH zum Hetzner Server (89.167.56.131)
   - `git pull origin staging`
   - `docker compose up -d --build`
   - Health Check

4. **Nach 2-3 Minuten:** ✅ Deployment fertig!

**Sie bekommen eine Benachrichtigung:**
- ✅ Grünes Häkchen = Deployment erfolgreich
- ❌ Rotes X = Deployment fehlgeschlagen (siehe Logs)

---

### Schritt 10: Feature auf Staging testen

**Öffnen Sie im Browser:**
```
http://89.167.56.131
```

**Testen Sie Ihr Feature:**
- ✅ Funktioniert alles wie erwartet?
- ✅ Keine Fehler in der Browser-Console? (F12 → Console)
- ✅ Registrierung/Login funktioniert?

**Wenn Probleme:**
- Zurück zu Schritt 4 (Feature anpassen)
- Erneut committen und pushen

---

## 2. Bug fixen

### Wenn Sie einen Bug entdecken:

```bash
# Von staging aus starten
git checkout staging
git pull origin staging

# Bug-Fix Branch erstellen
git checkout -b fix/beschreibung-des-bugs
```

**Beispiele:**
- `fix/calculation-error`
- `fix/login-button-not-working`
- `fix/export-crash`

**Dann:**
1. Bug fixen
2. Committen: `git commit -m "fix: Beschreibung des Bugs"`
3. Pushen: `git push origin fix/beschreibung-des-bugs`
4. Pull Request zu `staging`
5. Mergen → Automatisches Deployment

**Gleicher Ablauf wie Feature-Entwicklung!**

---

## 3. Auf Staging testen

### Staging-Umgebung:

**URL:**
```
http://89.167.56.131
```

**Was ist Staging?**
- Kopie von Production
- Eigene Datenbank (separate Test-Daten)
- Zum Testen BEVOR es auf Production geht

### Test-Checkliste:

```
☐ Frontend lädt ohne Fehler
☐ Registrierung funktioniert
☐ Login funktioniert
☐ Neues Feature funktioniert
☐ Keine Fehler in Browser Console (F12)
☐ Kein weißer Bildschirm oder Crashes
☐ API-Calls funktionieren (Network Tab in DevTools)
```

### Logs checken (bei Problemen):

```bash
# SSH zum Staging-Server
ssh root@89.167.56.131

# Ins Projekt-Verzeichnis
cd ~/Roots-Systemplaner

# Container Status
docker compose ps

# Logs anschauen
docker compose logs backend --tail=50
docker compose logs frontend --tail=50

# Logout
exit
```

---

## 4. Zu Production deployen

### Wann zu Production deployen?

✅ Feature ist auf Staging getestet
✅ Keine Bugs gefunden
✅ Alles funktioniert einwandfrei
✅ Team hat abgenommen (falls nötig)

### Schritt 1: Pull Request von staging zu main

**Auf GitHub:**

1. **Gehen Sie zu:**
   ```
   https://github.com/Hacklerflow/Roots-Systemplaner/pulls
   ```

2. **Klicken Sie:** "New pull request"

3. **Konfigurieren:**
   - **Base:** `main` ← **Compare:** `staging`

4. **Titel:** z.B. "Release: [Beschreibung der Features]"

5. **Description:**
   ```markdown
   ## Changes
   - Feature 1: Beschreibung
   - Feature 2: Beschreibung
   - Bug Fix: Beschreibung

   ## Testing
   - Tested on staging: http://89.167.56.131
   - All tests passed ✅

   ## Deploy to Production
   Ready for production deployment.
   ```

6. **Klicken Sie:** "Create pull request"

---

### Schritt 2: Pull Request reviewen und mergen

1. **Review (optional):**
   - Code-Review durchführen
   - Team-Approval einholen

2. **Merge:**
   - **Klicken Sie:** "Merge pull request"
   - **Klicken Sie:** "Confirm merge"

**Was passiert:**
- Code wird in `main` Branch gemergt

---

### Schritt 3: Automatisches Production-Deployment! 🤖

**GitHub Actions deployed automatisch zu Hostinger:**

1. **Beobachten Sie:**
   ```
   https://github.com/Hacklerflow/Roots-Systemplaner/actions
   ```

2. **Der Workflow "Deploy to Hostinger" startet**

3. **Nach 2-3 Minuten:** ✅ Production ist live!

---

### Schritt 4: Production testen

**Öffnen Sie:**
```
http://72.60.37.185
```

**Schneller Test:**
- ✅ Site lädt?
- ✅ Login funktioniert?
- ✅ Neues Feature ist sichtbar?

**Bei Problemen:**
- Rollback durchführen (siehe Troubleshooting)

---

## 5. Troubleshooting

### Problem: "Mein lokaler Code ist durcheinander"

**Lösung: Frisch starten**

```bash
# Alle lokalen Änderungen verwerfen
git checkout staging
git reset --hard origin/staging

# Neueste Version holen
git pull origin staging
```

---

### Problem: "Merge Konflikt"

**Was ist ein Merge Konflikt?**
- Zwei Personen haben die gleiche Datei geändert
- Git weiß nicht, welche Version behalten werden soll

**Lösung:**

```bash
# Konflikt anzeigen
git status

# Datei öffnen und manuell fixen
# Suchen Sie nach:
<<<<<<< HEAD
Ihre Änderungen
=======
Andere Änderungen
>>>>>>> staging

# Entscheiden Sie, was behalten werden soll
# Löschen Sie die Konflikt-Marker (<<<<, ====, >>>>)

# Änderungen speichern und committen
git add <konflikt-datei>
git commit -m "fix: Resolve merge conflict"
```

---

### Problem: "Staging Deployment fehlgeschlagen"

**Wo sehen Sie das?**
```
https://github.com/Hacklerflow/Roots-Systemplaner/actions
```

**Rotes ❌ = Fehlgeschlagen**

**Was tun:**

1. **Klicken Sie auf den fehlgeschlagenen Workflow**
2. **Klicken Sie auf "Deploy to Hetzner Staging"**
3. **Lesen Sie die Fehler-Logs**

**Häufige Fehler:**

| Fehler | Ursache | Lösung |
|--------|---------|--------|
| `Health check failed` | Container laufen nicht | SSH zum Server, `docker compose logs` checken |
| `git pull failed` | Merge Konflikt auf Server | SSH zum Server, manuell git pull |
| `docker compose failed` | Build-Fehler | Code-Fehler fixen und erneut pushen |

**Manuell auf Server checken:**

```bash
ssh root@89.167.56.131
cd ~/Roots-Systemplaner
docker compose ps
docker compose logs --tail=100
```

---

### Problem: "Falscher Code auf Staging"

**Rollback durchführen:**

```bash
# Lokal
git checkout staging
git log --oneline
# Finden Sie den letzten guten Commit

# Zurücksetzen
git reset --hard <commit-hash>

# Force Push
git push --force origin staging

# Automatisches Deployment startet
```

**⚠️ VORSICHT: Force Push löscht neuere Commits!**

---

### Problem: "Production ist down"

**Schneller Rollback:**

```bash
# Lokal
git checkout main
git log --oneline

# Zu letztem funktionierenden Commit
git reset --hard <letzter-guter-commit>

# Force Push
git push --force origin main

# GitHub Actions deployed automatisch die alte Version
```

---

## 6. FAQs

### F: Wie oft soll ich committen?

**A:** So oft wie möglich! Nach jeder kleinen Änderung.

**Gut:**
- Kleine, fokussierte Commits
- Aussagekräftige Commit-Messages

**Schlecht:**
- Riesige Commits mit vielen Änderungen
- "WIP" oder "test" als Message

---

### F: Wann pushe ich zu GitHub?

**A:** Am Ende des Arbeitstages oder wenn ein Feature fertig ist.

---

### F: Kann ich direkt zu main pushen?

**A:** NEIN! ❌

**Immer:**
1. Feature-Branch
2. Push zu GitHub
3. Pull Request zu `staging`
4. Testen auf Staging
5. Pull Request zu `main`

---

### F: Wie lösche ich einen Branch?

```bash
# Lokal löschen
git branch -d feature/mein-branch

# Von GitHub löschen
git push origin --delete feature/mein-branch
```

---

### F: Wie sehe ich meine Branches?

```bash
# Lokale Branches
git branch

# Alle Branches (auch remote)
git branch -a
```

---

### F: Kann ich Staging überspringen?

**A:** NEIN! ❌

Staging ist zum Testen da. Immer über Staging gehen:
```
Feature → staging → main
```

---

### F: Was mache ich wenn Staging kaputt ist?

**A:** Rollback durchführen (siehe Troubleshooting) oder Bug fixen und erneut deployen.

---

### F: Wie sehe ich, wer was geändert hat?

```bash
# Git Logs
git log --oneline

# Wer hat eine Zeile geändert?
git blame <datei>

# Alle Änderungen einer Datei
git log -p <datei>
```

---

## 🎯 Cheat Sheet: Häufigste Befehle

```bash
# Status checken
git status

# Branch wechseln
git checkout <branch-name>

# Neuer Branch
git checkout -b feature/neues-feature

# Änderungen stagen
git add .

# Commit erstellen
git commit -m "feat: Beschreibung"

# Pushen
git push origin <branch-name>

# Aktualisieren
git pull origin staging

# Logs anzeigen
git log --oneline

# Container Status (auf Server)
docker compose ps

# Container Logs (auf Server)
docker compose logs -f
```

---

## 🔗 Wichtige Links

**GitHub Repository:**
```
https://github.com/Hacklerflow/Roots-Systemplaner
```

**GitHub Actions (Deployments):**
```
https://github.com/Hacklerflow/Roots-Systemplaner/actions
```

**Staging-Server:**
```
http://89.167.56.131
```

**Production-Server:**
```
http://72.60.37.185
```

**SSH zu Staging:**
```bash
ssh root@89.167.56.131
```

---

## 📖 Weitere Dokumentation

- `STAGING_SETUP_DOCUMENTATION.md` - Technische Details
- `STAGING_USAGE.md` - Team Workflow
- `README_DEPLOYMENT.md` - Production Deployment
- `README.md` - Projekt-Übersicht

---

**Bei Fragen oder Problemen: Logs checken und Troubleshooting-Sektion durchgehen!** 🚀

**Version:** 1.0
**Last Updated:** 6. März 2026
**Made with ❤️ for Roots Energy Development Team**
