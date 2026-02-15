import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/services/mongodb';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fen, pgn, tags } = body;

    if (!fen) {
      return NextResponse.json(
        { error: 'FEN position is required' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const puzzlesCollection = db.collection('puzzles');

    const puzzle = {
      fen,
      pgn: pgn || '',
      tags: tags || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await puzzlesCollection.insertOne(puzzle);

    return NextResponse.json(
      {
        success: true,
        id: result.insertedId,
        message: 'Puzzle saved successfully'
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error saving puzzle:', error);
    return NextResponse.json(
      { error: 'Failed to save puzzle' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const puzzlesCollection = db.collection('puzzles');

    const searchParams = request.nextUrl.searchParams;
    const tag = searchParams.get('tag');

    const query = tag ? { tags: tag } : {};
    const puzzles = await puzzlesCollection
      .find(query)
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray();

    return NextResponse.json({ success: true, puzzles }, { status: 200 });
  } catch (error) {
    console.error('Error fetching puzzles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch puzzles' },
      { status: 500 }
    );
  }
}
