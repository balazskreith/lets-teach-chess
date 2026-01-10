import { Chess } from "chess.js";

/**
 * Chess game controller for common chess operations
 */
export class ChessController {
  private game: Chess;

  constructor(fen?: string) {
    this.game = new Chess(fen);
  }

  /**
   * Get current game instance
   */
  getGame(): Chess {
    return this.game;
  }

  /**
   * Get current FEN string
   */
  getFen(): string {
    return this.game.fen();
  }

  /**
   * Make a move
   */
  makeMove(from: string, to: string, promotion?: string): boolean {
    try {
      const move = this.game.move({
        from,
        to,
        promotion: promotion || "q",
      });
      return move !== null;
    } catch {
      return false;
    }
  }

  /**
   * Make a move in SAN notation
   */
  makeMoveSan(san: string): boolean {
    try {
      const move = this.game.move(san);
      return move !== null;
    } catch {
      return false;
    }
  }

  /**
   * Get move history
   */
  getHistory(): string[] {
    return this.game.history();
  }

  /**
   * Undo last move
   */
  undo(): boolean {
    const move = this.game.undo();
    return move !== null;
  }

  /**
   * Reset to a specific FEN position
   */
  reset(fen?: string): void {
    this.game = new Chess(fen);
  }

  /**
   * Check if game is over
   */
  isGameOver(): boolean {
    return this.game.isGameOver();
  }

  /**
   * Check if in check
   */
  inCheck(): boolean {
    return this.game.inCheck();
  }

  /**
   * Check if in checkmate
   */
  isCheckmate(): boolean {
    return this.game.isCheckmate();
  }

  /**
   * Check if in stalemate
   */
  isStalemate(): boolean {
    return this.game.isStalemate();
  }

  /**
   * Get whose turn it is
   */
  getTurn(): "w" | "b" {
    return this.game.turn();
  }

  /**
   * Load PGN
   */
  loadPgn(pgn: string): boolean {
    try {
      this.game.loadPgn(pgn);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get PGN
   */
  getPgn(): string {
    return this.game.pgn();
  }

  /**
   * Get legal moves for a square
   */
  getLegalMoves(square: string): string[] {
    return this.game.moves({ square: square as any, verbose: true }).map(m => m.to);
  }

  /**
   * Clone the controller with current position
   */
  clone(): ChessController {
    return new ChessController(this.getFen());
  }
}
