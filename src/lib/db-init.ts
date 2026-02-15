import { connectToDatabase } from '../services/mongodb';

let isInitialized = false;

export async function initializeDatabase() {
  if (isInitialized) {
    return;
  }

  try {
    const { client, db } = await connectToDatabase();
    console.log('MongoDB connected successfully');

    // Ensure database exists by listing databases and creating if needed
    const adminDb = client.db().admin();
    const databases = await adminDb.listDatabases();
    const dbExists = databases.databases.some((database: any) => database.name === 'chessmongo');

    if (!dbExists) {
      // Creating a collection will automatically create the database
      console.log('Creating "chessmongo" database...');
    }

    // Ensure collections exist (this will also create the database if it doesn't exist)
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);

    // Create puzzles collection if it doesn't exist
    if (!collectionNames.includes('puzzles')) {
      await db.createCollection('puzzles');
      console.log('Created "puzzles" collection');
    }

    // Create famousgames collection if it doesn't exist
    if (!collectionNames.includes('famousgames')) {
      await db.createCollection('famousgames');
      console.log('Created "famousgames" collection');
    }

    console.log('Database "chessmongo" and collections initialized successfully');
    isInitialized = true;
  } catch (error) {
    console.error('Failed to initialize MongoDB connection:', error);
    // Don't throw - allow app to start even if DB connection fails
  }
}

// Initialize on module load (server-side only)
if (typeof window === 'undefined') {
  initializeDatabase();
}
