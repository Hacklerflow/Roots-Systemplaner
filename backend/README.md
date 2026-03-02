# Roots Configurator Backend

REST API Backend für den Roots Systemkonfigurator.

## 🚀 Quick Start

### 1. PostgreSQL Setup

**Option A - Lokale PostgreSQL Installation:**
```bash
# macOS (mit Homebrew)
brew install postgresql@15
brew services start postgresql@15

# Datenbank erstellen
createdb roots_configurator

# Oder manuell:
psql postgres
CREATE DATABASE roots_configurator;
\q
```

**Option B - Docker PostgreSQL:**
```bash
docker run --name roots-postgres \
  -e POSTGRES_DB=roots_configurator \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=yourpassword \
  -p 5432:5432 \
  -d postgres:15
```

### 2. Environment Setup

```bash
# .env Datei erstellen
cp .env.example .env

# .env bearbeiten mit deinen Daten:
# - DB_PASSWORD setzen
# - JWT_SECRET ändern (wichtig für Production!)
```

### 3. Datenbank initialisieren

```bash
npm run init-db
```

Das erstellt alle Tabellen und fügt Standard-Katalogdaten ein.

### 4. Server starten

**Development (mit Auto-Reload):**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

Server läuft auf: `http://localhost:3001`

---

## 📡 API Endpoints

### Authentication

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepass123",
  "name": "Max Mustermann"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "Max Mustermann",
    "created_at": "2026-03-02T15:30:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepass123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "Max Mustermann"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Projects (Require Authentication)

**Alle geschützten Endpoints benötigen Header:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Get All Projects
```http
GET /api/projects
Authorization: Bearer YOUR_TOKEN
```

#### Get Single Project
```http
GET /api/projects/1
Authorization: Bearer YOUR_TOKEN
```

#### Create Project
```http
POST /api/projects
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "name": "Haus Mustermann",
  "description": "Einfamilienhaus mit Wärmepumpe",
  "tags": ["einfamilienhaus", "neubau"],
  "building": {
    "id": "building-1",
    "type": "building",
    "data": {
      "name": "Haus Mustermann",
      "baujahr": 2024,
      "strasse": "Musterstraße",
      "hausnummer": "42",
      "stockwerke": 2
    }
  }
}
```

#### Update Project
```http
PUT /api/projects/1
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "name": "Haus Mustermann (geändert)",
  "nodes": [...],
  "edges": [...],
  "building": {...},
  "viewport": {"x": 0, "y": 0, "zoom": 1}
}
```

#### Delete Project
```http
DELETE /api/projects/1
Authorization: Bearer YOUR_TOKEN
```

#### Duplicate Project
```http
POST /api/projects/1/duplicate
Authorization: Bearer YOUR_TOKEN
```

### Catalogs

#### Get Module Types
```http
GET /api/catalogs/module-types
Authorization: Bearer YOUR_TOKEN
```

#### Get Modules
```http
GET /api/catalogs/modules
Authorization: Bearer YOUR_TOKEN
```

#### Get Connections
```http
GET /api/catalogs/connections
Authorization: Bearer YOUR_TOKEN
```

#### Get Pipes
```http
GET /api/catalogs/pipes
Authorization: Bearer YOUR_TOKEN
```

#### Get Dimensions
```http
GET /api/catalogs/dimensions
Authorization: Bearer YOUR_TOKEN
```

#### Add Module
```http
POST /api/catalogs/modules
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "name": "Roots Hub 25kW",
  "modultyp": "Wärmepumpe",
  "hersteller": "Roots Energy",
  "abmessungen": "1200x800x600",
  "gewicht_kg": 450,
  "leistung_kw": 25,
  "volumen_l": 200,
  "preis": 15000,
  "eingaenge": [
    {"id": "in-1", "name": "Quelle Eingang", "verbindungsart": "Flansch DN32"}
  ],
  "ausgaenge": [
    {"id": "out-1", "name": "Heizkreis", "verbindungsart": "Flansch DN32"}
  ]
}
```

---

## 🗄️ Datenbank Schema

### Tables

- **users** - User-Accounts
- **projects** - Projekt-Metadaten
- **configurations** - Projekt-Konfigurationen (JSON)
- **catalog_module_types** - Modultypen-Katalog
- **catalog_modules** - Module-Datenbank
- **catalog_connections** - Verbindungsarten-Katalog
- **catalog_pipes** - Leitungskatalog
- **catalog_dimensions** - Dimensionskatalog

Siehe `src/config/schema.sql` für Details.

---

## 🧪 Testing

### Mit cURL

**Register:**
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123","name":"Test User"}'
```

**Login:**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'
```

**Get Projects (mit Token):**
```bash
TOKEN="your_jwt_token_here"

curl http://localhost:3001/api/projects \
  -H "Authorization: Bearer $TOKEN"
```

### Mit Postman/Insomnia

1. **Register/Login** → Token kopieren
2. In allen weiteren Requests:
   - Header hinzufügen: `Authorization: Bearer YOUR_TOKEN`

---

## 🐛 Troubleshooting

### Datenbank-Verbindungsfehler
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
→ PostgreSQL läuft nicht. Starten mit `brew services start postgresql@15`

### Schema-Fehler
```
Error: relation "users" does not exist
```
→ Datenbank nicht initialisiert: `npm run init-db`

### Token-Fehler
```
{"error":"Access token required"}
```
→ Authorization Header fehlt oder falsch formatiert

### Port bereits belegt
```
Error: listen EADDRINUSE: address already in use :::3001
```
→ Port 3001 bereits verwendet. In `.env` PORT ändern oder Prozess beenden

---

## 📝 Environment Variables

```bash
# Server
PORT=3001
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=roots_configurator
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=change_this_in_production
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:5173
```

---

## 🔒 Security Notes

- **JWT_SECRET**: In Production einen langen, zufälligen String verwenden!
- **Passwords**: Werden mit bcrypt gehasht (10 Saltrunden)
- **CORS**: In Production nur vertrauenswürdige Origins erlauben
- **SQL Injection**: Alle Queries verwenden Parameterized Statements

---

## 📦 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js      # DB Connection Pool
│   │   ├── schema.sql       # DB Schema
│   │   └── init-db.js       # Init Script
│   ├── middleware/
│   │   └── auth.js          # JWT Middleware
│   ├── routes/
│   │   ├── auth.js          # Auth Routes
│   │   ├── projects.js      # Projects Routes
│   │   └── catalogs.js      # Catalogs Routes
│   ├── utils/
│   │   └── validation.js    # Input Validation
│   └── server.js            # Main Server
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

**Made with ❤️ for Roots Energy**
