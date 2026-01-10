import { Chess } from "chess.js";

/**
 * Extract FEN string from PGN text
 */
export function extractFenFromPgn(pgnText: string): string | undefined {
  const fenMatch = pgnText.match(/\[FEN\s+"([^"]+)"\]/);
  return fenMatch ? fenMatch[1] : undefined;
}

/**
 * Extract a specific header value from PGN
 */
export function extractPgnHeader(pgnText: string, headerName: string): string | undefined {
  const regex = new RegExp(`\\[${headerName}\\s+"([^"]+)"\\]`);
  const match = pgnText.match(regex);
  return match ? match[1] : undefined;
}

/**
 * Load a PGN and return chess instance with move history
 */
export function loadPgn(pgnText: string): {
  game: Chess;
  moves: string[];
  startFen: string;
} {
  const startFen = extractFenFromPgn(pgnText);
  const game = new Chess(startFen);
  game.loadPgn(pgnText);
  const moves = game.history();

  return {
    game,
    moves,
    startFen: startFen || "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  };
}

/**
 * Split a multi-game PGN file into individual games
 */
export function splitPgnFile(pgnText: string): string[] {
  return pgnText.split(/(?=\[Event)/g).filter(g => g.trim());
}

/**
 * Determine board orientation from FEN string
 */
export function getBoardOrientationFromFen(fen: string): "white" | "black" {
  const turnToMove = fen.split(" ")[1]; // 'w' or 'b'
  return turnToMove === "b" ? "black" : "white";
}

/**
 * Parse PGN file into structured game data
 */
export interface ParsedGame {
  pgn: string;
  id: string;
  title?: string;
  event?: string;
  date?: string;
}

export function parsePgnFile(pgnText: string): ParsedGame[] {
  const games = splitPgnFile(pgnText);

  return games.map((gameText, index) => {
    const title = extractPgnHeader(gameText, "ChapterName");
    const event = extractPgnHeader(gameText, "Event");
    const date = extractPgnHeader(gameText, "Date");

    return {
      pgn: gameText.trim(),
      id: `game-${index}`,
      title,
      event,
      date,
    };
  });
}

/**
 * Fetch PGN file from URL
 */
export async function fetchPgnFile(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
  }
  return response.text();
}
