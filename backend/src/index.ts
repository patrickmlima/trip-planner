/**
 * Main Express Application
 * 
 * SDUI Trip Planner Backend
 */

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { screenController } from './controllers/screen.controller';
import { parseCapabilities } from './middlewares/capability-parser';

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================================================
// MIDDLEWARE
// ============================================================================

// Security headers
app.use(helmet());

// CORS for frontend
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

// JSON parsing
app.use(express.json());

// Request logging
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.path} ${res.statusCode} - ${duration}ms`
    );
  });
  
  next();
});

// ============================================================================
// ROUTES
// ============================================================================

/**
 * Health check
 */
app.get('/api/health', screenController.getHealth.bind(screenController));

/**
 * Capabilities endpoint
 */
app.get('/api/capabilities', screenController.getCapabilities.bind(screenController));

/**
 * Screen endpoints - all use capability parsing middleware
 */
app.get(
  '/api/screens/dashboard',
  parseCapabilities,
  screenController.getDashboard.bind(screenController)
);

app.get(
  '/api/screens/trip-details/:tripId',
  parseCapabilities,
  screenController.getTripDetails.bind(screenController)
);

/**
 * Root endpoint
 */
app.get('/', (_req: Request, res: Response) => {
  res.json({
    name: 'SDUI Trip Planner API',
    version: '1.0.0',
    documentation: '/api/capabilities',
    endpoints: {
      health: '/api/health',
      capabilities: '/api/capabilities',
      dashboard: '/api/screens/dashboard',
      tripDetails: '/api/screens/trip-details/:tripId',
    },
    queryParameters: {
      user_id: 'User identifier (optional)',
      user_type: 'User type: basic, premium, admin (optional)',
      app_version: 'Client version (semantic versioning)',
      capabilities: 'Comma-separated list of client capabilities',
      platform: 'Platform: ios, android, web (optional)',
    },
    exampleRequests: {
      basicClient: '/api/screens/dashboard?user_id=user_basic&app_version=1.0.0',
      premiumClient: '/api/screens/dashboard?user_id=user_premium&user_type=premium&app_version=2.0.0&capabilities=carousel,maps,weather_widget',
      tripDetails: '/api/screens/trip-details/argentina?user_id=user_premium&user_type=premium&capabilities=maps,weather_widget',
    },
  });
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

/**
 * 404 handler
 */
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
    availableEndpoints: [
      '/api/health',
      '/api/capabilities',
      '/api/screens/dashboard',
      '/api/screens/trip-details/:tripId',
    ],
  });
});

/**
 * Global error handler
 */
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled error:', err);
  
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' 
      ? err.message 
      : 'An unexpected error occurred',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ============================================================================
// START SERVER
// ============================================================================

app.listen(PORT, () => {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║                                                            ║');
  console.log('║           SDUI Trip Planner Backend - RUNNING              ║');
  console.log('║                                                            ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`Server:      http://localhost:${PORT}`);
  console.log(`Health:      http://localhost:${PORT}/api/health`);
  console.log(`Docs:        http://localhost:${PORT}/api/capabilities`);
  console.log('');
  console.log('Example requests:');
  console.log(`  Dashboard (basic):   curl "http://localhost:${PORT}/api/screens/dashboard?user_id=user_basic"`);
  console.log(`  Dashboard (premium): curl "http://localhost:${PORT}/api/screens/dashboard?user_id=user_premium&user_type=premium&capabilities=carousel,maps"`);
  console.log(`  Trip Details:        curl "http://localhost:${PORT}/api/screens/trip-details/argentina?user_id=user_premium&user_type=premium&capabilities=maps,weather_widget"`);
  console.log('');
  console.log('Press Ctrl+C to stop');
  console.log('');
});

export default app;
