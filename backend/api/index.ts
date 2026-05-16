/**
 * Entry point Vercel serverless.
 * Wrappe l'app Express en handler. La connexion Mongo est initialisée lazy au 1er hit.
 */
import { buildApp } from '../src/app.js';
import { connectMongo } from '../src/db/mongo.js';

let appPromise: Promise<ReturnType<typeof buildApp>> | null = null;

async function getApp() {
  if (!appPromise) {
    appPromise = (async () => {
      await connectMongo().catch((e) => {
        console.warn('Mongo init failed (non bloquant):', e?.message);
      });
      return buildApp();
    })();
  }
  return appPromise;
}

export default async function handler(req: any, res: any) {
  const app = await getApp();
  return app(req, res);
}
