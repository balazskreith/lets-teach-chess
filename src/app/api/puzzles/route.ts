import { NextRequest, NextResponse } from 'next/server';
import { findPuzzles, getDistinctThemes, insertPuzzle } from '@/components/common/puzzleRepository';

// FEN: piece placement / active color / castling / en passant / halfmove / fullmove
const FEN_REGEX = /^[rnbqkpRNBQKP1-8\/]{1,71}\s[bw]\s[KQkq\-]{1,4}\s[a-h1-8\-]{1,2}\s\d{1,3}\s\d{1,4}$/;
// Allow only plain alphanumeric tag strings (no operators, no special chars)
const TAG_REGEX = /^[a-zA-Z0-9_\-]{1,50}$/;

const MAX_PGN_LENGTH = 10_000;
const MAX_TAGS = 20;
const MAX_BODY_BYTES = 50_000;
const MAX_LIMIT = 50;
const DEFAULT_LIMIT = 6;

function isPlainString(value: unknown): value is string {
  return typeof value === 'string';
}

/** Reject any string that starts with $ (MongoDB operator injection guard) */
function isSafeString(value: string): boolean {
  return !value.trimStart().startsWith('$');
}

export async function POST(request: NextRequest) {
  try {
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength, 10) > MAX_BODY_BYTES) {
      return NextResponse.json({ error: 'Payload too large' }, { status: 413 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    if (typeof body !== 'object' || body === null || Array.isArray(body)) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { fen, pgn, tags } = body as Record<string, unknown>;

    if (!isPlainString(fen) || !isSafeString(fen) || !FEN_REGEX.test(fen)) {
      return NextResponse.json({ error: 'Invalid or missing FEN position' }, { status: 400 });
    }

    const safePgn = pgn === undefined ? '' : pgn;
    if (!isPlainString(safePgn) || !isSafeString(safePgn) || safePgn.length > MAX_PGN_LENGTH) {
      return NextResponse.json({ error: 'Invalid PGN value' }, { status: 400 });
    }

    const rawTags = tags === undefined ? [] : tags;
    if (!Array.isArray(rawTags) || rawTags.length > MAX_TAGS) {
      return NextResponse.json({ error: 'Tags must be an array with at most 20 entries' }, { status: 400 });
    }
    for (const t of rawTags) {
      if (!isPlainString(t) || !TAG_REGEX.test(t)) {
        return NextResponse.json(
          { error: 'Each tag must be a plain alphanumeric string (max 50 chars)' },
          { status: 400 }
        );
      }
    }

    const result = await insertPuzzle({
      fen: fen.trim(),
      pgn: safePgn.trim(),
      tags: rawTags as string[],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json(
      { success: true, id: result.insertedId, message: 'Puzzle saved successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error saving puzzle:', error);
    return NextResponse.json({ error: 'Failed to save puzzle' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    if (searchParams.get('distinctThemes') === 'true') {
      const themes = await getDistinctThemes();
      return NextResponse.json({ success: true, themes }, { status: 200 });
    }

    const tag = searchParams.get('tag');
    const themes = searchParams.getAll('theme').filter(Boolean);
    console.log('[GET /api/puzzles] url:', request.url, 'themes raw:', searchParams.getAll('theme'), 'themes filtered:', themes);

    if (tag !== null && !TAG_REGEX.test(tag)) {
      return NextResponse.json({ error: 'Invalid tag parameter' }, { status: 400 });
    }
    for (const t of themes) {
      if (!TAG_REGEX.test(t)) {
        return NextResponse.json({ error: 'Invalid theme parameter' }, { status: 400 });
      }
    }

    const rawMinRating = searchParams.get('minRating');
    const rawMaxRating = searchParams.get('maxRating');
    const minRating = rawMinRating !== null ? parseInt(rawMinRating, 10) : null;
    const maxRating = rawMaxRating !== null ? parseInt(rawMaxRating, 10) : null;

    if (minRating !== null && !Number.isFinite(minRating)) {
      return NextResponse.json({ error: 'Invalid minRating parameter' }, { status: 400 });
    }
    if (maxRating !== null && !Number.isFinite(maxRating)) {
      return NextResponse.json({ error: 'Invalid maxRating parameter' }, { status: 400 });
    }

    const rawPage = parseInt(searchParams.get('page') ?? '0', 10);
    const rawLimit = parseInt(searchParams.get('limit') ?? String(DEFAULT_LIMIT), 10);
    const page = Number.isFinite(rawPage) && rawPage >= 0 ? rawPage : 0;
    const limit = Number.isFinite(rawLimit) && rawLimit >= 1 ? Math.min(rawLimit, MAX_LIMIT) : DEFAULT_LIMIT;

    const { puzzles, total } = await findPuzzles(
      { tag: tag ?? undefined, themes: themes.length > 0 ? themes : undefined, minRating, maxRating },
      page,
      limit
    );

    return NextResponse.json({ success: true, puzzles, total, page, limit }, { status: 200 });
  } catch (error) {
    console.error('Error fetching puzzles:', error);
    return NextResponse.json({ error: 'Failed to fetch puzzles' }, { status: 500 });
  }
}
