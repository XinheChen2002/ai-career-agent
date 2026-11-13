import { MongoClient, type Db } from 'mongodb';

let client: MongoClient | null = null;
let db: Db | null = null;

// The server, the seed script and the tests each call this once with their
// own URI and database name, so tests never touch the development database.
export async function connectDb(uri: string, name: string): Promise<Db> {
  if (client) {
    throw new Error('Database is already connected. Call closeDb() first.');
  }
  client = await MongoClient.connect(uri);
  db = client.db(name);
  return db;
}

export function getDb(): Db {
  if (!db) {
    throw new Error('Database is not connected. Call connectDb() first.');
  }
  return db;
}

export async function closeDb(): Promise<void> {
  await client?.close();
  client = null;
  db = null;
}
