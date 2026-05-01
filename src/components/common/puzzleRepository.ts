import {connectToDatabase} from '@/services/mongodb';

export interface PuzzleQuery {
  tag?: string;
  themes?: string[];
  minRating?: number | null;
  maxRating?: number | null;
}

export interface ThemeOption {
  slug: string;
  label: string;
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
  if (filter.themes && filter.themes.length > 0) {
    query['themes.slug'] = { $all: filter.themes };
  }
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
  const skip = page * limit;
  console.log(`[mongo] db.puzzles.find(${JSON.stringify(query)}).sort({createdAt:-1}).skip(${skip}).limit(${limit})`);
  console.log(`[mongo] db.puzzles.countDocuments(${JSON.stringify(query)})`);
  const [puzzles, total] = await Promise.all([
    collection.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
    collection.countDocuments(query),
  ]);
  console.log(`[mongo] => ${total} total documents`);
  return { puzzles, total };
}

// Store on global so the cache and in-flight fetch survive Next.js hot reloads in dev mode.
declare global {
  // eslint-disable-next-line no-var
  var _themesCache: Map<string, ThemeOption> | undefined;
  // eslint-disable-next-line no-var
  var _themesFetch: Promise<ThemeOption[]> | undefined;
}

export function getDistinctThemes(): Promise<ThemeOption[]> {
  if (global._themesCache) {
    console.log('[mongo] getDistinctThemes: cache hit');
    return Promise.resolve(Array.from(global._themesCache.values()));
  }

  if (global._themesFetch) {
    console.log('[mongo] getDistinctThemes: awaiting in-flight fetch');
    return global._themesFetch;
  }

  global._themesFetch = (async () => {
    const pipeline = [
      { $unwind: '$themes' },
      { $group: { _id: '$themes.slug', label: { $first: '$themes.label' } } },
      { $match: { _id: { $ne: null } } },
      { $project: { _id: 0, slug: '$_id', label: 1 } },
      { $sort: { slug: 1 } },
    ];
    const { db } = await connectToDatabase();
    const collection = db.collection('puzzles');
    console.log(`[mongo] db.puzzles.aggregate(${JSON.stringify(pipeline)})`);
    const result = await collection.aggregate(pipeline).toArray();
    console.log(`[mongo] => ${result.length} themes`);
    global._themesCache = new Map((result as ThemeOption[]).map((t) => [t.slug, t]));
    global._themesFetch = undefined;
    return result as ThemeOption[];
  })();

  return global._themesFetch;
}

export async function insertPuzzle(doc: PuzzleDocument) {
  const { db } = await connectToDatabase();
  const collection = db.collection('puzzles');
  console.log(`[mongo] db.puzzles.insertOne(${JSON.stringify(doc)})`);
  return collection.insertOne(doc);
}
