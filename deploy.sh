#!/bin/bash
# Roots Configurator Deployment Script

set -e

echo "🚀 Roots Configurator Deployment"
echo "================================="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found!"
    echo "Creating from .env.production template..."
    cp .env.production .env
    echo "✅ .env created. Please edit it with your values:"
    echo "   nano .env"
    echo ""
    echo "Then run this script again."
    exit 1
fi

# Check if required vars are set
source .env

if [ -z "$DB_PASSWORD" ] || [ "$DB_PASSWORD" = "CHANGE_THIS_STRONG_PASSWORD" ]; then
    echo "❌ DB_PASSWORD not set in .env"
    echo "Generate one with: openssl rand -base64 32"
    exit 1
fi

if [ -z "$JWT_SECRET" ] || [ "$JWT_SECRET" = "CHANGE_THIS_TO_A_RANDOM_SECRET_KEY" ]; then
    echo "❌ JWT_SECRET not set in .env"
    echo "Generate one with: openssl rand -base64 32"
    exit 1
fi

echo "✅ Environment variables validated"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker not found. Please install Docker first."
    exit 1
fi

if ! command -v docker compose &> /dev/null; then
    echo "❌ Docker Compose not found. Please install Docker Compose first."
    exit 1
fi

echo "✅ Docker is installed"
echo ""

# Pull latest code (if git repo)
if [ -d .git ]; then
    echo "📥 Pulling latest code..."
    git pull origin main || echo "⚠️  Git pull failed (continuing anyway)"
    echo ""
fi

# Build and start containers
echo "🐳 Building and starting Docker containers..."
docker compose down
docker compose up -d --build

echo ""
echo "⏳ Waiting for services to be healthy..."
sleep 10

# Check if containers are running
if ! docker compose ps | grep -q "Up"; then
    echo "❌ Containers failed to start. Check logs:"
    echo "   docker compose logs"
    exit 1
fi

echo "✅ All containers are running"
echo ""

# Initialize database (if needed)
echo "🗄️  Initializing database..."
docker compose exec -T backend npm run init-db || echo "⚠️  Database already initialized"

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📊 Service Status:"
docker compose ps
echo ""
echo "🌐 Access your application:"
echo "   Frontend: http://localhost:${PORT:-80}"
echo "   Backend:  http://localhost:3001/health"
echo ""
echo "📝 Useful commands:"
echo "   View logs:     docker compose logs -f"
echo "   Stop:          docker compose down"
echo "   Restart:       docker compose restart"
echo "   Backup DB:     docker compose exec postgres pg_dump -U postgres roots_configurator > backup.sql"
echo ""
