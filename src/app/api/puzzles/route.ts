import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/services/mongodb';

// FEN: piece placement / active color / castling / en passant / halfmove / fullmove
const FEN_REGEX = /^[rnbqkpRNBQKP1-8\/]{1,71}\s[bw]\s[KQkq\-]{1,4}\s[a-h1-8\-]{1,2}\s\d{1,3}\s\d{1,4}$/;
// Allow only plain alphanumeric tag strings (no operators, no special chars)
const TAG_REGEX = /^[a-zA-Z0-9_\-]{1,50}$/;

const MAX_PGN_LENGTH = 10_000;
const MAX_TAGS = 20;
const MAX_BODY_BYTES = 50_000;

function isPlainString(value: unknown): value is string {
  return typeof value === 'string';
}

/** Reject any string that starts with $ (MongoDB operator injection guard) */
function isSafeString(value: string): boolean {
  return !value.trimStart().startsWith('$');
}

export async function POST(request: NextRequest) {
  try {
    // Guard against oversized payloads
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

    // Validate FEN
    if (!isPlainString(fen) || !isSafeString(fen) || !FEN_REGEX.test(fen)) {
      return NextResponse.json({ error: 'Invalid or missing FEN position' }, { status: 400 });
    }

    // Validate PGN
    const safePgn = pgn === undefined ? '' : pgn;
    if (!isPlainString(safePgn) || !isSafeString(safePgn) || safePgn.length > MAX_PGN_LENGTH) {
      return NextResponse.json({ error: 'Invalid PGN value' }, { status: 400 });
    }

    // Validate tags — must be an array of safe plain strings matching TAG_REGEX
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

    const { db } = await connectToDatabase();
    const puzzlesCollection = db.collection('puzzles');

    // Build document from validated, typed values only — never spread raw user input
    const puzzle = {
      fen: fen.trim(),
      pgn: safePgn.trim(),
      tags: rawTags as string[],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await puzzlesCollection.insertOne(puzzle);

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
    const { db } = await connectToDatabase();
    const puzzlesCollection = db.collection('puzzles');

    const searchParams = request.nextUrl.searchParams;
    const tag = searchParams.get('tag');

    // Validate tag query param — reject operator injection attempts
    if (tag !== null && !TAG_REGEX.test(tag)) {
      return NextResponse.json({ error: 'Invalid tag parameter' }, { status: 400 });
    }

    // Use explicit typed query — never pass raw user input directly as a MongoDB operator value
    const query = tag ? { tags: tag as string } : {};
    const puzzles = await puzzlesCollection
      .find(query)
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray();

    return NextResponse.json({ success: true, puzzles }, { status: 200 });
  } catch (error) {
    console.error('Error fetching puzzles:', error);
    return NextResponse.json({ error: 'Failed to fetch puzzles' }, { status: 500 });
  }
}
