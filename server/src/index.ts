import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';
import { config } from './config';
import authRoutes from './routes/authRoutes';
import academicRoutes from './routes/academicRoutes';
import resourceRoutes from './routes/resourceRoutes';
import pastPaperRoutes from './routes/pastPaperRoutes';
import requestRoutes from './routes/requestRoutes';
import adminRoutes from './routes/adminRoutes';
import settingsRoutes from './routes/settingsRoutes';
import { apiLimiter } from './middleware/rateLimiter';
import { storageService } from './services/storageService';

const app = express();

// Security and middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allow streaming PDF & assets
  })
);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps or curl) and configured origins
      if (!origin || origin === config.corsOrigin || origin.startsWith('http://localhost:')) {
        callback(null, true);
      } else {
        callback(null, true); // Dev-permissive or fallback
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (config.nodeEnv !== 'test') {
  app.use(morgan('dev'));
}

// Ensure vault directory initialized
storageService.getVaultDir();

// General API Rate Limiting
app.use('/api', apiLimiter);

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    platform: 'KIT Helping Hand API',
    institution: 'Khanpur Institute of Technology',
    timestamp: new Date().toISOString(),
  });
});

// Mount modular API routes
app.use('/api/auth', authRoutes);
app.use('/api/academic', academicRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/past-papers', pastPaperRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/settings', settingsRoutes);

// 404 handler for API routes
app.use('/api/*', (req: Request, res: Response) => {
  res.status(404).json({ error: 'Endpoint not found.' });
});

// Production SPA Static Serving (e.g. Render, Railway, Docker, or Monorepo single-host)
const clientDistPath = path.resolve(__dirname, '../../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Centralized error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled Server Error:', err);
  const status = err.status || 500;
  const message = err.message || 'An unexpected internal server error occurred.';
  res.status(status).json({
    error: message,
    ...(config.nodeEnv === 'development' ? { stack: err.stack } : {}),
  });
});

// Start server
if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  app.listen(config.port, () => {
    console.log(`====================================================`);
    console.log(`KIT Helping Hand API is running on port ${config.port}`);
    console.log(`Environment: ${config.nodeEnv}`);
    console.log(`Storage Vault: ${storageService.getVaultDir()}`);
    console.log(`====================================================`);
  });
}

export default app;
