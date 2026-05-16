import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';

import authRoutes from './routes/auth.routes.js';
import menuRoutes from './routes/menu.routes.js';
import platRoutes from './routes/plat.routes.js';
import commandeRoutes from './routes/commande.routes.js';
import userRoutes from './routes/user.routes.js';
import adminRoutes from './routes/admin.routes.js';
import contactRoutes from './routes/contact.routes.js';

export function buildApp() {
  const app = express();

  app.disable('x-powered-by');
  app.use(helmet());

  // CORS : accepte l'URL frontend configurée OU sous-domaines vercel.app
  const allowedOrigins = [env.APP_URL];
  app.use(cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      if (/^https:\/\/vite-et-gourmand.*\.vercel\.app$/.test(origin)) return cb(null, true);
      if (/^http:\/\/localhost:\d+$/.test(origin)) return cb(null, true);
      cb(new Error('CORS bloqué'));
    },
    credentials: true,
  }));
  app.use(express.json({ limit: '1mb' }));

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, max: 10,
    standardHeaders: true, legacyHeaders: false,
    message: { error: 'Trop de tentatives, réessayez dans 15 minutes' },
  });
  const globalLimiter = rateLimit({ windowMs: 60 * 1000, max: 120 });
  app.use(globalLimiter);

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'vite-et-gourmand-api', timestamp: new Date().toISOString() });
  });
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'vite-et-gourmand-api', timestamp: new Date().toISOString() });
  });

  app.use('/api/auth', authLimiter, authRoutes);
  app.use('/api/menus', menuRoutes);
  app.use('/api/plats', platRoutes);
  app.use('/api/commandes', commandeRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/contact', contactRoutes);

  app.use((_req, res) => res.status(404).json({ error: 'Route inconnue' }));
  app.use(errorHandler);

  return app;
}
