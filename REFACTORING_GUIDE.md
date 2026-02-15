# Chess Application Refactoring Guide

## Extracted Common Code

I've created two utility modules to extract common chess-related code:

### 1. `/src/utils/pgnParser.ts`

**Purpose:** Handle all PGN parsing and file operations

**Functions:**
- `extractFenFromPgn(pgnText)` - Extract FEN from PGN headers
- `extractPgnHeader(pgnText, headerName)` - Extract any PGN header value
- `loadPgn(pgnText)` - Load PGN and return game, moves, and starting FEN
- `splitPgnFile(pgnText)` - Split multi-game PGN into individual games
- `getBoardOrientationFromFen(fen)` - Determine board orientation from FEN
- `parsePgnFile(pgnText)` - Parse PGN file into structured game data
- `fetchPgnFile(url)` - Fetch PGN file from URL

### 2. `/src/utils/chessController.ts`

**Purpose:** Unified chess game state management

**Class: ChessController**
- Wraps chess.js with common operations
- Methods for move making, game state queries, history management
- Provides consistent interface across all components

## Usage Examples

### Before (PuzzleBoard.tsx):
```typescript
// Old scattered code
const fenMatch = puzzle.pgn.match(/\[FEN\s+"([^"]+)"\]/);
const startFen = fenMatch ? fenMatch[1] : undefined;
const game = new Chess(startFen);
game.loadPgn(puzzle.pgn);
const moves = game.history();
```

### After (PuzzleBoard.tsx):
```typescript
import { loadPgn, parsePgnFile, fetchPgnFile, getBoardOrientationFromFen } from '@/utils/pgnParser';

// Clean and readable
const { game, moves, startFen } = loadPgn(puzzle.pgn);
const boardOrientation = getBoardOrientationFromFen(startFen);
```

### Before (ChessGameBot.tsx):
```typescript
// Scattered Chess operations
const game = new Chess();
const move = game.move({ from, to, promotion: 'q' });
const fen = game.fen();
```

### After (ChessGameBot.tsx):
```typescript
import { ChessController } from '@/utils/chessController';

const controller = new ChessController();
controller.makeMove(from, to);
const fen = controller.getFen();
```

## Benefits

1. **Reusability** - Common logic in one place, used by multiple components
2. **Maintainability** - Changes to chess logic only need to be made once
3. **Testability** - Utility functions are easy to unit test
4. **Consistency** - Same logic produces same results everywhere
5. **Readability** - Descriptive function names make code self-documenting

## Components That Can Be Refactored

1. ✅ **PuzzleBoard.tsx** - Can use `pgnParser` utilities for loading puzzles
2. ✅ **GameViewer.tsx** - Can use `pgnParser.loadPgn()` and `extractFenFromPgn()`
3. ✅ **ChessGameBot.tsx** - Can use `ChessController` for game state management
4. ✅ **ChessLobby.tsx** - Can benefit from standardized chess operations

## Next Steps

If you'd like to proceed with refactoring, I can:

1. **Refactor PuzzleBoard** to use the new utilities (recommended first step)
2. **Refactor GameViewer** to use pgnParser utilities
3. **Refactor ChessGameBot** to use ChessController
4. **Add unit tests** for the utility modules
5. **Create additional utilities** for other common patterns

Would you like me to proceed with any of these refactorings?
