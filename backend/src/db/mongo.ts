import { MongoClient, Db } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { env } from '../config/env.js';

/**
 * Client MongoDB (BDD NoSQL).
 * Sert pour :
 *   - Audit trail des changements de statut de commande (collection `order_events`)
 *   - Données agrégées du dashboard administrateur (collection `dashboard_snapshots`)
 *
 * Dev local : mongodb-memory-server (ephemeral, in-process).
 * Prod : MongoDB Atlas (URI dans MONGODB_URI).
 */

let client: MongoClient | null = null;
let memoryServer: MongoMemoryServer | null = null;
let db: Db | null = null;

export async function connectMongo(): Promise<Db> {
  if (db) return db;

  let uri = env.MONGODB_URI;
  if (!uri) {
    console.log('🌱 MONGODB_URI vide — démarrage de mongodb-memory-server (dev)');
    memoryServer = await MongoMemoryServer.create();
    uri = memoryServer.getUri();
  }

  client = new MongoClient(uri);
  await client.connect();
  db = client.db('vite_et_gourmand');

  // Indexes
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

export async function closeMongo(): Promise<void> {
  if (client) await client.close();
  if (memoryServer) await memoryServer.stop();
  client = null;
  memoryServer = null;
  db = null;
}
