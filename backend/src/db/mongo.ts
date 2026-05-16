import { MongoClient, type Db } from 'mongodb';
import { env } from '../config/env.js';

/**
 * Client MongoDB (BDD NoSQL).
 *
 * Collections :
 *   - order_events : un document par changement d'état de commande
 *   - contact_logs : log des messages de contact reçus
 *
 * Dev local : mongodb-memory-server (dynamic import → exclu du bundle prod)
 * Prod      : MongoDB Atlas (URI dans MONGODB_URI)
 *
 * Si MONGODB_URI vide en prod, l'audit Mongo est silencieusement no-op (logs uniquement).
 */

let client: MongoClient | null = null;
let memoryServerStop: (() => Promise<void>) | null = null;
let db: Db | null = null;
let disabled = false;

export async function connectMongo(): Promise<Db | null> {
  if (db) return db;
  if (disabled) return null;

  let uri = env.MONGODB_URI;
  if (!uri) {
    if (env.NODE_ENV === 'production') {
      console.warn('⚠️ MONGODB_URI vide en production — audit/dashboard Mongo désactivés.');
      disabled = true;
      return null;
    }
    // Dev : import dynamique pour ne pas bundler en prod
    console.log('🌱 MONGODB_URI vide — démarrage de mongodb-memory-server (dev)');
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    const mem = await MongoMemoryServer.create();
    memoryServerStop = async () => { await mem.stop(); };
    uri = mem.getUri();
  }

  client = new MongoClient(uri);
  await client.connect();
  db = client.db('vite_et_gourmand');

  await db.collection('order_events').createIndex({ commande_id: 1, created_at: -1 });
  await db.collection('order_events').createIndex({ menu_id: 1 });
  await db.collection('contact_logs').createIndex({ created_at: -1 });

  console.log('✅ MongoDB connecté');
  return db;
}

export function getDb(): Db {
  if (!db) throw new Error('MongoDB pas encore initialisé. Appelle connectMongo() au boot.');
  return db;
}

/** Variante safe : retourne null si non disponible (utilisé par audit pour ne pas planter en prod sans Mongo). */
export function tryGetDb(): Db | null {
  return db;
}

export async function closeMongo(): Promise<void> {
  if (client) await client.close();
  if (memoryServerStop) await memoryServerStop();
  client = null;
  memoryServerStop = null;
  db = null;
}
