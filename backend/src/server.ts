import { buildApp } from './app.js';
import { env } from './config/env.js';
import { connectMongo } from './db/mongo.js';

async function start() {
  await connectMongo();
  const app = buildApp();
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
