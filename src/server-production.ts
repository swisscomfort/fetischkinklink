// Production-Ready Express Server for SpiegelMatch
// Built with security, monitoring, and best practices

import express, { Application } from 'express';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import dotenv from 'dotenv';

// Middleware
import {
  helmetConfig,
  corsOptions,
  requestId,
  requestTiming,
  sanitizeInput,
  generalLimiter,
} from './middleware/security.js';
import {
  errorHandler,
  notFoundHandler,
} from './middleware/errorHandler.js';

// Config
import logger from './config/logger.js';
import { swaggerSpec } from './config/swagger.js';

// Routes
import characterRoutes from './routes/character.routes.js';
import matchingRoutes from './routes/matching.routes.js';
import taxonomyRoutes from './routes/taxonomy.routes.js';

// Health checks
import {
  healthCheck,
  readinessProbe,
  livenessProbe,
  metricsEndpoint,
} from './health/checks.js';

// Load environment variables
dotenv.config();

// ============================================================================
// APPLICATION SETUP
// ============================================================================

const app: Application = express();
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ============================================================================
// SECURITY MIDDLEWARE
// ============================================================================

app.use(helmetConfig);
app.use(cors(corsOptions));
app.use(requestId);
app.use(sanitizeInput);

// ============================================================================
// GENERAL MIDDLEWARE
// ============================================================================

app.use(compression()); // Gzip compression
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(requestTiming);

// HTTP request logging
const morganFormat = NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(
  morgan(morganFormat, {
    stream: {
      write: (message: string) => logger.http(message.trim()),
    },
  })
);

// ============================================================================
// RATE LIMITING
// ============================================================================

app.use('/api/', generalLimiter);

// ============================================================================
// API DOCUMENTATION
// ============================================================================

app.use('/api-docs', swaggerUi.serve);
app.get('/api-docs', swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'SpiegelMatch API Documentation',
}));

// OpenAPI JSON endpoint
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// ============================================================================
// HEALTH & MONITORING ENDPOINTS
// ============================================================================

/**
 * @swagger
 * /health:
 *   get:
 *     tags: [Health]
 *     summary: Comprehensive health check
 *     description: Returns detailed health status including database and memory checks
 *     responses:
 *       200:
 *         description: System is healthy
 *       503:
 *         description: System is unhealthy or degraded
 */
app.get('/health', healthCheck);

/**
 * @swagger
 * /health/ready:
 *   get:
 *     tags: [Health]
 *     summary: Readiness probe for Kubernetes
 *     description: Checks if service is ready to accept traffic
 *     responses:
 *       200:
 *         description: Service is ready
 *       503:
 *         description: Service is not ready
 */
app.get('/health/ready', readinessProbe);

/**
 * @swagger
 * /health/live:
 *   get:
 *     tags: [Health]
 *     summary: Liveness probe for Kubernetes
 *     description: Checks if service process is alive
 *     responses:
 *       200:
 *         description: Service is alive
 */
app.get('/health/live', livenessProbe);

/**
 * @swagger
 * /metrics:
 *   get:
 *     tags: [Health]
 *     summary: Prometheus metrics endpoint
 *     description: Returns metrics in Prometheus format
 *     responses:
 *       200:
 *         description: Metrics data
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 */
app.get('/metrics', metricsEndpoint);

// ============================================================================
// API ROUTES
// ============================================================================

app.use('/api/character', characterRoutes);
app.use('/api/matching', matchingRoutes);
app.use('/api/taxonomy', taxonomyRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'SpiegelMatch API',
    version: process.env.npm_package_version || '1.0.0',
    status: 'running',
    documentation: '/api-docs',
    health: '/health',
    timestamp: new Date().toISOString(),
  });
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// ============================================================================
// GRACEFUL SHUTDOWN
// ============================================================================

function gracefulShutdown(signal: string) {
  logger.info(`${signal} received, starting graceful shutdown...`);
  
  server.close(() => {
    logger.info('HTTP server closed');
    
    // Close database connections, etc.
    process.exit(0);
  });

  // Force shutdown after 30 seconds
  setTimeout(() => {
    logger.error('Forcefully shutting down after timeout');
    process.exit(1);
  }, 30000);
}

// ============================================================================
// START SERVER
// ============================================================================

const server = app.listen(PORT, () => {
  logger.info(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   🎭 SpiegelMatch API - Production Server                    ║
║                                                               ║
║   Environment:    ${NODE_ENV.padEnd(43)}║
║   Port:           ${PORT.toString().padEnd(43)}║
║   Documentation:  http://localhost:${PORT}/api-docs${' '.repeat(19)}║
║   Health Check:   http://localhost:${PORT}/health${' '.repeat(22)}║
║                                                               ║
║   ✓ Security:     Helmet, CORS, Rate Limiting                ║
║   ✓ Logging:      Winston + Morgan                           ║
║   ✓ Validation:   Zod schemas                                ║
║   ✓ Monitoring:   Health checks + Metrics                    ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
  `);
});

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught errors
process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception:', error);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason: any) => {
  logger.error('Unhandled Rejection:', reason);
  gracefulShutdown('unhandledRejection');
});

export default app;
