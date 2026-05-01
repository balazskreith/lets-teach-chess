import { connectToDatabase } from '@/services/mongodb';

export interface PuzzleQuery {
  tag?: string;
  theme?: string;
  minRating?: number | null;
  maxRating?: number | null;
}

export interface PuzzleDocument {
  fen: string;
  pgn: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

function buildMongoQuery(filter: PuzzleQuery): Record<string, unknown> {
  const query: Record<string, unknown> = {};
  if (filter.tag) query.tags = filter.tag;
  if (filter.theme) query['themes.label'] = filter.theme;
  if (filter.minRating != null || filter.maxRating != null) {
    const ratingFilter: Record<string, number> = {};
    if (filter.minRating != null) ratingFilter.$gte = filter.minRating;
    if (filter.maxRating != null) ratingFilter.$lte = filter.maxRating;
    query.rating = ratingFilter;
  }
  return query;
}

export async function findPuzzles(filter: PuzzleQuery, page: number, limit: number) {
  const { db } = await connectToDatabase();
  const collection = db.collection('puzzles');
  const query = buildMongoQuery(filter);
  const [puzzles, total] = await Promise.all([
    collection.find(query).sort({ createdAt: -1 }).skip(page * limit).limit(limit).toArray(),
    collection.countDocuments(query),
  ]);
  return { puzzles, total };
}

export async function getDistinctThemes(): Promise<string[]> {
  const { db } = await connectToDatabase();
  const collection = db.collection('puzzles');
  const themes = await collection.distinct('themes.label');
  return (themes as string[]).filter(Boolean).sort();
}

export async function insertPuzzle(doc: PuzzleDocument) {
  const { db } = await connectToDatabase();
  const collection = db.collection('puzzles');
  return collection.insertOne(doc);
}
