import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import { connectMongo } from './db/mongo.js';
import { errorHandler } from './middleware/errorHandler.js';

import authRoutes from './routes/auth.routes.js';
import menuRoutes from './routes/menu.routes.js';
import platRoutes from './routes/plat.routes.js';
import commandeRoutes from './routes/commande.routes.js';
import userRoutes from './routes/user.routes.js';
import adminRoutes from './routes/admin.routes.js';
import contactRoutes from './routes/contact.routes.js';

const app = express();

/* ====== Sécurité ====== */
app.disable('x-powered-by');
app.use(helmet());
app.use(cors({ origin: env.APP_URL, credentials: true }));
app.use(express.json({ limit: '1mb' }));

/* ====== Rate limit (anti brute-force) ====== */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Trop de tentatives, réessayez dans 15 minutes' },
});
const globalLimiter = rateLimit({ windowMs: 60 * 1000, max: 120 });
app.use(globalLimiter);

/* ====== Healthcheck ====== */
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'vite-et-gourmand-api', timestamp: new Date().toISOString() });
});

/* ====== Routes ====== */
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/menus', menuRoutes);
app.use('/api/plats', platRoutes);
app.use('/api/commandes', commandeRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/contact', contactRoutes);

/* ====== 404 ====== */
app.use((_req, res) => res.status(404).json({ error: 'Route inconnue' }));

/* ====== Error handler global ====== */
app.use(errorHandler);

/* ====== Boot ====== */
async function start() {
  await connectMongo();
  app.listen(env.PORT, () => {
    console.log(`🚀 API Vite & Gourmand sur http://localhost:${env.PORT}`);
    console.log(`   ENV: ${env.NODE_ENV}`);
    console.log(`   Frontend autorisé: ${env.APP_URL}`);
  });
}

start().catch((err) => {
  console.error('❌ Échec démarrage:', err);
  process.exit(1);
});
