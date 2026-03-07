#!/bin/bash

echo "╔════════════════════════════════════════════════╗"
echo "║  🚀 Roots Systemplaner - System Start         ║"
echo "╚════════════════════════════════════════════════╝"
echo ""

# Check PostgreSQL
echo "1️⃣  Prüfe PostgreSQL..."
if lsof -i :5432 > /dev/null 2>&1; then
    echo "   ✅ PostgreSQL läuft bereits"
else
    echo "   ❌ PostgreSQL läuft nicht!"
    echo ""
    echo "   Bitte installieren/starten Sie PostgreSQL:"
    echo ""
    echo "   Homebrew:"
    echo "   $ brew install postgresql@14"
    echo "   $ brew services start postgresql@14"
    echo ""
    echo "   Docker:"
    echo "   $ docker run --name roots-postgres \\"
    echo "     -e POSTGRES_DB=roots_configurator \\"
    echo "     -e POSTGRES_PASSWORD=local_dev_password_12345 \\"
    echo "     -p 5432:5432 -d postgres:14"
    echo ""
    echo "   Dann erneut ./start-system.sh ausführen"
    exit 1
fi

# Check Backend
echo ""
echo "2️⃣  Prüfe Backend..."
if curl -s http://localhost:3001/health > /dev/null 2>&1; then
    echo "   ✅ Backend läuft bereits"
else
    echo "   ⚠️  Backend nicht erreichbar - starte neu..."
    cd backend
    pkill -9 -f "node.*server" 2>/dev/null
    nohup npm start > /tmp/backend.log 2>&1 &
    cd ..
    sleep 3
    if curl -s http://localhost:3001/health > /dev/null 2>&1; then
        echo "   ✅ Backend gestartet"
    else
        echo "   ❌ Backend konnte nicht gestartet werden"
        echo "   Logs: tail -f /tmp/backend.log"
        exit 1
    fi
fi

# Check Frontend
echo ""
echo "3️⃣  Prüfe Frontend..."
if lsof -i :5173 > /dev/null 2>&1; then
    echo "   ✅ Frontend läuft bereits"
else
    echo "   ⚠️  Frontend nicht gestartet - starte..."
    nohup npm run dev > /tmp/frontend.log 2>&1 &
    sleep 3
    if lsof -i :5173 > /dev/null 2>&1; then
        echo "   ✅ Frontend gestartet"
    else
        echo "   ❌ Frontend konnte nicht gestartet werden"
        echo "   Logs: tail -f /tmp/frontend.log"
        exit 1
    fi
fi

echo ""
echo "╔════════════════════════════════════════════════╗"
echo "║  ✅ System läuft!                              ║"
echo "╠════════════════════════════════════════════════╣"
echo "║  Backend:  http://localhost:3001               ║"
echo "║  Frontend: http://localhost:5173               ║"
echo "║                                                ║"
echo "║  Logs:                                         ║"
echo "║  Backend:  tail -f /tmp/backend.log            ║"
echo "║  Frontend: tail -f /tmp/frontend.log           ║"
echo "╚════════════════════════════════════════════════╝"
