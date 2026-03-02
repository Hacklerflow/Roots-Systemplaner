# 🚀 Roots Configurator - Multi-User Backend Migration

**Ziel:** Deployment-ready machen für Hetzner Server mit User-Management und Projekt-Liste

**Start:** 2026-03-02
**Status:** 🔄 In Progress

---

## 📋 Phase 1: Backend Setup

### 1.1 Projekt-Struktur
- [x] Backend-Ordner erstellen (`/backend`)
- [x] Package.json für Backend
- [x] Dependencies installieren (express, pg, jsonwebtoken, bcrypt, cors, dotenv)
- [x] Basic Express Server Setup

### 1.2 Datenbank Schema
- [x] PostgreSQL Schema Design
- [x] Tabellen erstellen:
  - [x] `users` - User-Accounts (id, email, password_hash, name, created_at)
  - [x] `projects` - Projekte (id, name, user_id, created_at, updated_at)
  - [x] `configurations` - JSON-Daten (id, project_id, nodes, edges, building)
  - [x] `catalogs` - Shared Kataloge (module_types, connection_types, pipes)
- [x] Migrations/Init SQL Script

### 1.3 Authentication
- [x] User Registration Endpoint (`POST /api/auth/register`)
- [x] Login Endpoint (`POST /api/auth/login`)
- [x] JWT Token Generation
- [x] JWT Middleware für Protected Routes
- [x] Password Hashing (bcrypt)

### 1.4 Projects API
- [x] `GET /api/projects` - Liste aller Projekte
- [x] `GET /api/projects/:id` - Einzelnes Projekt laden
- [x] `POST /api/projects` - Neues Projekt erstellen
- [x] `PUT /api/projects/:id` - Projekt aktualisieren
- [x] `DELETE /api/projects/:id` - Projekt löschen

### 1.5 Catalogs API
- [x] `GET /api/catalogs/module-types` - Modultypen laden
- [x] `GET /api/catalogs/modules` - Module-Datenbank laden
- [x] `GET /api/catalogs/connections` - Verbindungsarten laden
- [x] `GET /api/catalogs/pipes` - Leitungskatalog laden
- [x] `GET /api/catalogs/dimensions` - Dimensionskatalog laden
- [x] `PUT /api/catalogs/*` - Kataloge aktualisieren (später: nur Admin)

---

## 📋 Phase 2: Frontend Anpassungen

### 2.1 Authentication UI
- [x] Login-Seite erstellen (`/components/Auth/Login.jsx`)
- [x] Register-Seite erstellen (`/components/Auth/Register.jsx`)
- [x] Auth Context für globalen Auth-State
- [x] Protected Route Component
- [x] Logout Funktionalität
- [x] Token Storage (localStorage)

### 2.2 Projekt-Liste (Dashboard)
- [x] Dashboard-Komponente erstellen (`/components/Dashboard/Dashboard.jsx`)
- [x] Projekt-Karten mit Preview-Infos
- [x] "Neues Projekt" Button
- [x] Projekt öffnen (Navigate zu Configurator)
- [x] Projekt löschen (mit Bestätigung)
- [x] Projekt duplizieren
- [x] Such-/Filter-Funktion
- [x] Sortierung (Datum, Name)

### 2.3 API Integration
- [x] API Client Setup (fetch)
- [x] API Base URL konfigurierbar (.env)
- [x] Request Interceptor für JWT Token
- [x] Error Handling (401 → Logout, etc.)
- [x] Loading States für alle API Calls

### 2.4 Konfigurator Anpassungen
- [x] "Speichern" ruft Backend API statt localStorage
- [x] "Laden" holt Daten vom Backend
- [x] Auto-Save (alle 30s)
- [x] Projekt-Info im Header (Name, Last Saved)
- [x] "Zurück zur Projekt-Liste" Button

### 2.5 Katalog-Verwaltung
- [x] Kataloge vom Backend laden statt localStorage
- [x] Modul-Datenbank: Backend-Integration (Create, Update, Delete)
- [ ] Modultypen: Backend-Integration (später)
- [ ] Verbindungen: Backend-Integration (später)
- [ ] Leitungen: Backend-Integration (später)
- [ ] Dimensionen: Backend-Integration (später)
- [x] Shared Catalogs für alle User

---

## 📋 Phase 3: Deployment Setup

### 3.1 Docker Setup
- [x] Dockerfile für Backend
- [x] Dockerfile für Frontend (nginx)
- [x] docker-compose.yml:
  - [x] Frontend Service
  - [x] Backend Service
  - [x] PostgreSQL Service
- [x] .dockerignore Files
- [x] Environment Variables (.env.production)

### 3.2 Build & Deployment
- [x] Frontend Build-Script (in Dockerfile)
- [x] nginx Konfiguration (mit SSL-Vorbereitung)
- [x] PostgreSQL Init-Script (in docker-compose)
- [x] Health Check Endpoints (alle Services)
- [x] Deployment Dokumentation (README_DEPLOYMENT.md)
- [x] Quick Start Guide (QUICKSTART_DEPLOYMENT.md)
- [x] Deployment Script (deploy.sh)

### 3.3 Hetzner Deployment
- [x] SSH Setup Anleitung
- [x] Docker Installation Anleitung
- [x] Domain/SSL Setup (Let's Encrypt)
- [x] Deployment Script
- [x] Backup-Strategie für DB
- [x] Monitoring Guide
- [x] Troubleshooting Guide

---

## 📋 Phase 4: Testing & Polish

### 4.1 Testing
- [ ] Backend API Tests (optional)
- [ ] Frontend E2E Tests (optional)
- [ ] Manuelle Test-Checkliste:
  - [ ] User Registration
  - [ ] Login/Logout
  - [ ] Projekt erstellen
  - [ ] Projekt laden
  - [ ] Projekt speichern
  - [ ] Projekt löschen
  - [ ] Mehrere User testen
  - [ ] Katalog-Änderungen

### 4.2 Dokumentation
- [ ] API Dokumentation
- [ ] User-Guide Update
- [ ] Admin-Guide für Server-Management
- [ ] Changelog updaten

### 4.3 Nice-to-Have Features
- [ ] Passwort-Reset (Email)
- [ ] User-Profil Seite
- [ ] Admin Panel (User-Verwaltung)
- [ ] Projekt-Tags/Labels
- [ ] Projekt-Export (Bulk)
- [ ] Activity Log
- [ ] Real-time Collaboration (später)

---

## 🎯 Offene Entscheidungen

### Zu klären:
1. **Datenbank:** PostgreSQL oder SQLite?
   - **Entscheidung:** _TBD_

2. **Passwort-Reset:** Mit Email-Versand?
   - **Entscheidung:** _TBD_

3. **User-Rollen:** Admin vs. Normal User?
   - **Entscheidung:** _TBD_

4. **Projekt-Rechte:** Jeder kann alles löschen oder nur Owner?
   - **Entscheidung:** _Vorerst: Jeder kann alles (kleines Team)_

5. **Auto-Save:** Ja/Nein? Intervall?
   - **Entscheidung:** _TBD_

---

## 📝 Notizen

### Technologie-Stack
- **Frontend:** React 19.2 + Vite (bestehend)
- **Backend:** Node.js + Express
- **Datenbank:** PostgreSQL (oder SQLite)
- **Auth:** JWT (JSON Web Tokens)
- **Deployment:** Docker + Docker Compose
- **Server:** Hetzner VPS
- **Web Server:** nginx (für Frontend)

### Migration-Strategie
- localStorage wird **nicht** gelöscht (als Fallback)
- Alte Daten können manuell importiert werden (späteres Feature)
- Kataloge werden einmalig in DB initialisiert

---

## ✅ Completed

### 2026-03-02
- ✅ **Phase 1 Backend Setup - KOMPLETT!**
  - Backend-Ordner und Struktur erstellt
  - PostgreSQL Schema mit allen Tabellen
  - Authentication (Register, Login, JWT)
  - Projects API (CRUD + Duplicate)
  - Catalogs API (GET + POST + UPDATE)
  - Init DB Script
  - Dependencies installiert

- ✅ **Phase 2 Frontend Anpassungen - KOMPLETT!**
  - Login/Register UI mit schönem Design
  - AuthContext für globalen State
  - Protected Routes
  - Dashboard mit Projekt-Karten, Suche, Sortierung
  - API Client mit Token-Handling
  - ConfiguratorWrapper für Backend-Integration
  - Auto-Save alle 30s
  - "Zurück zur Dashboard" Button
  - React Router Integration
  - Katalog-Migration zum Backend (Hauptfunktionalität)

- ✅ **Phase 2.5 Katalog-Backend-Integration - KOMPLETT!**
  - Alle Kataloge werden vom Backend geladen
  - Modul-Datenbank: Volle Backend-Integration (Create, Update, Delete)
  - Fallback auf Initial-Daten bei Backend-Fehler
  - Loading States und Error Handling
  - Automatisches Neuladen nach Änderungen

- ✅ **Phase 3 Docker & Deployment - KOMPLETT!**
  - Multi-stage Docker Builds für optimierte Images
  - docker-compose.yml mit allen Services
  - PostgreSQL mit automatischer Initialisierung
  - nginx mit Gzip, Caching, Security Headers
  - Health Checks für alle Container
  - Vollständige Deployment-Dokumentation
  - Quick-Start Guide
  - Automatisches Deployment-Script
  - SSL/Let's Encrypt Anleitung
  - Backup & Monitoring Strategie
  - Troubleshooting Guide

---

**Letzte Aktualisierung:** 2026-03-02 18:15
