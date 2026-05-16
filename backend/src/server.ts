import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env.js';
import { connectMongo } from './db/mongo.js';

const app = express();

// Sécurité
app.use(helmet());
app.use(cors({ origin: env.APP_URL, credentials: true }));
app.use(express.json({ limit: '1mb' }));

// Healthcheck
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler global
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Erreur serveur' });
});

async function start() {
  await connectMongo();
  app.listen(env.PORT, () => {
    console.log(`🚀 API Vite & Gourmand sur http://localhost:${env.PORT}`);
  });
}

start().catch((err) => {
  console.error('❌ Échec démarrage:', err);
  process.exit(1);
});
