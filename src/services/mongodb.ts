import { MongoClient, Db, MongoClientOptions } from 'mongodb';

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

interface MongoDBConnection {
  client: MongoClient;
  db: Db;
}

export async function connectToDatabase(): Promise<MongoDBConnection> {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  //todo make it production ready
  const uri = 'mongodb://admin:admin123@localhost:27017/'; //process.env.MONGODB_URI;
  const dbName = 'chessmongo';//process.env.MONGODB_DB;

  if (!uri) {
    throw new Error('Please define the MONGODB_URI environment variable');
  }

  if (!dbName) {
    throw new Error('Please define the MONGODB_DB environment variable');
  }

  const options: MongoClientOptions = {
    maxPoolSize: 10,
    minPoolSize: 5,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  };

  try {
    const client = await MongoClient.connect(uri, options);
    const db = client.db(dbName);

    cachedClient = client;
    cachedDb = db;

    return { client, db };
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
}

export async function disconnectFromDatabase(): Promise<void> {
  if (cachedClient) {
    await cachedClient.close();
    cachedClient = null;
    cachedDb = null;
  }
}

export function getDatabase(): Db {
  if (!cachedDb) {
    throw new Error('Database not connected. Call connectToDatabase first.');
  }
  return cachedDb;
}
