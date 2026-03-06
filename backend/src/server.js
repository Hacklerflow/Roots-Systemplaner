import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import projectsRoutes from './routes/projects.js';
import catalogsRoutes from './routes/catalogs.js';
import adminRoutes from './routes/admin.js';
import pool from './config/database.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

// Middleware
app.use(cors({
  origin: CORS_ORIGIN,
  credentials: true,
}));
app.use(express.json({ limit: '10mb' })); // For large configurations
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/catalogs', catalogsRoutes);
app.use('/api/admin', adminRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  await pool.end();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...');
  await pool.end();
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  console.log('╔════════════════════════════════════════════════╗');
  console.log('║  🚀 Roots Configurator Backend Server         ║');
  console.log('╠════════════════════════════════════════════════╣');
  console.log(`║  Port:        ${PORT.toString().padEnd(33)}║`);
  console.log(`║  Environment: ${(process.env.NODE_ENV || 'development').padEnd(33)}║`);
  console.log(`║  CORS Origin: ${CORS_ORIGIN.padEnd(33)}║`);
  console.log('╠════════════════════════════════════════════════╣');
  console.log('║  Endpoints:                                    ║');
  console.log('║  • GET  /health                                ║');
  console.log('║  • POST /api/auth/register                     ║');
  console.log('║  • POST /api/auth/login                        ║');
  console.log('║  • GET  /api/projects                          ║');
  console.log('║  • GET  /api/projects/:id                      ║');
  console.log('║  • POST /api/projects                          ║');
  console.log('║  • PUT  /api/projects/:id                      ║');
  console.log('║  • DEL  /api/projects/:id                      ║');
  console.log('║  • GET  /api/catalogs/*                        ║');
  console.log('╚════════════════════════════════════════════════╝');
});
