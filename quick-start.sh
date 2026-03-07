#!/bin/bash

# Roots Systemplaner - Quick Start Script
# Startet alle benötigten Services

echo "╔════════════════════════════════════════════════╗"
echo "║  🚀 Roots Systemplaner - Quick Start          ║"
echo "╚════════════════════════════════════════════════╝"
echo ""

# Farben für Output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. PostgreSQL prüfen/starten
echo "1️⃣  PostgreSQL..."
if lsof -i :5432 > /dev/null 2>&1; then
    echo -e "   ${GREEN}✅ PostgreSQL läuft bereits${NC}"
else
    echo -e "   ${YELLOW}⚠️  PostgreSQL läuft nicht - starte...${NC}"
    brew services start postgresql@14 > /dev/null 2>&1
    sleep 3

    if lsof -i :5432 > /dev/null 2>&1; then
        echo -e "   ${GREEN}✅ PostgreSQL gestartet${NC}"
    else
        echo -e "   ${RED}❌ PostgreSQL konnte nicht gestartet werden${NC}"
        echo "      Versuchen Sie manuell: brew services start postgresql@14"
        exit 1
    fi
fi

# 2. Backend prüfen/starten
echo ""
echo "2️⃣  Backend (Port 3001)..."
if curl -s http://localhost:3001/health > /dev/null 2>&1; then
    echo -e "   ${GREEN}✅ Backend läuft bereits${NC}"
else
    echo -e "   ${YELLOW}⚠️  Backend läuft nicht - starte...${NC}"

    # Alte Prozesse beenden
    pkill -9 -f "node.*server" 2>/dev/null

    # Backend starten
    cd backend
    nohup npm start > /tmp/backend.log 2>&1 &
    cd ..

    sleep 4

    if curl -s http://localhost:3001/health > /dev/null 2>&1; then
        echo -e "   ${GREEN}✅ Backend gestartet${NC}"
    else
        echo -e "   ${RED}❌ Backend konnte nicht gestartet werden${NC}"
        echo "      Logs: tail -f /tmp/backend.log"
        exit 1
    fi
fi

# 3. Frontend prüfen/starten
echo ""
echo "3️⃣  Frontend (Port 5173)..."
if lsof -i :5173 > /dev/null 2>&1; then
    echo -e "   ${GREEN}✅ Frontend läuft bereits${NC}"
else
    echo -e "   ${YELLOW}⚠️  Frontend läuft nicht - starte...${NC}"

    nohup npm run dev > /tmp/frontend.log 2>&1 &

    sleep 4

    if lsof -i :5173 > /dev/null 2>&1; then
        echo -e "   ${GREEN}✅ Frontend gestartet${NC}"
    else
        echo -e "   ${RED}❌ Frontend konnte nicht gestartet werden${NC}"
        echo "      Logs: tail -f /tmp/frontend.log"
        exit 1
    fi
fi

# Zusammenfassung
echo ""
echo "╔════════════════════════════════════════════════╗"
echo "║  ✅ ALLE SERVICES LAUFEN!                      ║"
echo "╠════════════════════════════════════════════════╣"
echo "║                                                ║"
echo "║  🌐 Frontend:  http://localhost:5173          ║"
echo "║  🔧 Backend:   http://localhost:3001          ║"
echo "║  🗄️  Database:  PostgreSQL (Port 5432)        ║"
echo "║                                                ║"
echo "║  📄 Logs:                                      ║"
echo "║     Backend:   tail -f /tmp/backend.log       ║"
echo "║     Frontend:  tail -f /tmp/frontend.log      ║"
echo "║                                                ║"
echo "╚════════════════════════════════════════════════╝"
echo ""
echo "Öffnen Sie http://localhost:5173 im Browser!"
echo ""

# Optional: Browser automatisch öffnen
# Entfernen Sie das # um diese Funktion zu aktivieren
# open http://localhost:5173
